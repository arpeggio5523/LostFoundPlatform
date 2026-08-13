import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Send, MessageSquare, ArrowLeft, Paperclip } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar2 from "../components/Navbar2";
import { getAuthUser, getCurrentUserId } from "../services/authState";
import { fetchConversations, fetchMessages, sendMessage } from "../services/messagesApi";
import { useSocket } from "../context/SocketContext";
import { useToast } from "../context/ToastContext";

function Avatar({ initials }) {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-active-bg)] text-sm font-semibold text-[var(--color-brand)]">
      {initials}
    </div>
  );
}

const initialsFor = (name = "?") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("") || "?";

const formatTime = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const isToday = date.toDateString() === new Date().toDateString();
  return isToday
    ? date.toLocaleTimeString("en-MY", { hour: "numeric", minute: "2-digit" })
    : date.toLocaleDateString("en-MY", { day: "numeric", month: "short" });
};

export default function MessagesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentUserId = getCurrentUserId();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");

  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const scrollRef = useRef(null);
  const socket = useSocket();
  const { showToast } = useToast();

  // Auth guard, same pattern as ProfilePage
  useEffect(() => {
    const user = getAuthUser();
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // Load conversation list
  useEffect(() => {
    fetchConversations()
      .then((data) => setConversations(Array.isArray(data.data) ? data.data : []))
      .catch(() => setConversations([]))
      .finally(() => setLoadingConvos(false));
  }, []);

  // Auto-select conversation from query param
  useEffect(() => {
    const convId = searchParams.get("conversationId");
    if (convId && !loadingConvos) {
      const exists = conversations.find((c) => c._id === convId);
      if (exists) {
        setSelectedId(convId);
        // Clear the param so refreshing doesn't force re-selection
        setSearchParams({}, { replace: true });
      }
    }
  }, [searchParams, conversations, loadingConvos, setSearchParams]);

  // Load messages when a conversation is selected
  useEffect(() => {
    if (!selectedId) return;

    // Mark as read immediately when opened using exact server timestamp to avoid clock skew
    const convo = conversations.find(c => c._id === selectedId);
    if (convo && convo.lastMessageAt) {
      localStorage.setItem(`lastRead_${selectedId}`, convo.lastMessageAt);
    } else {
      localStorage.setItem(`lastRead_${selectedId}`, new Date().toISOString());
    }
    window.dispatchEvent(new Event("updateUnread"));

    setLoadingMessages(true);
    fetchMessages(selectedId)
      .then((data) => setMessages(Array.isArray(data.data) ? data.data : []))
      .catch(() => setMessages([]))
      .finally(() => setLoadingMessages(false));

    if (socket) {
      socket.emit("join_conversation", selectedId);
    }
    
    return () => {
      if (socket) {
        socket.emit("leave_conversation", selectedId);
      }
    };
  }, [selectedId, socket]);

  // Fallback Polling Mechanism to ensure messages arrive even if Socket.IO fails
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchConversations().then((res) => {
        if (res.data && Array.isArray(res.data)) {
          setConversations((prev) => {
            if (prev.length !== res.data.length || (prev[0] && res.data[0] && prev[0].lastMessageAt !== res.data[0].lastMessageAt)) {
              
              // If we are actively viewing a conversation, ensure its exact new server timestamp is marked read
              const activeConvo = res.data.find(c => c._id === selectedId);
              if (activeConvo && activeConvo.lastMessageAt) {
                localStorage.setItem(`lastRead_${selectedId}`, activeConvo.lastMessageAt);
              }
              
              window.dispatchEvent(new Event("updateUnread"));
              return res.data;
            }
            return prev;
          });
        }
      });

      if (selectedId) {
        fetchMessages(selectedId).then((res) => {
          if (res.data && Array.isArray(res.data)) {
            setMessages((prev) => {
              if (prev.length !== res.data.length) {
                // The conversation polling will handle marking it read, but just in case:
                const convo = conversations.find(c => c._id === selectedId);
                if (convo && convo.lastMessageAt) {
                  localStorage.setItem(`lastRead_${selectedId}`, convo.lastMessageAt);
                }
                window.dispatchEvent(new Event("updateUnread"));
                return res.data;
              }
              return prev;
            });
          }
        });
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(intervalId);
  }, [selectedId]);

  useEffect(() => {
    if (!socket) return;

    const handleMessageReceived = ({ data }) => {
      const convIdStr = String(data.conversation?._id || data.conversation);

      setMessages((prev) => {
        if (selectedId && String(selectedId) === convIdStr) {
          if (prev.some((m) => String(m._id) === String(data._id))) return prev;
          
          // We are actively viewing this conversation, mark it read using server timestamp
          localStorage.setItem(`lastRead_${selectedId}`, data.createdAt || new Date().toISOString());
          return [...prev, data];
        }
        return prev;
      });

      setConversations((prev) => {
        const exists = prev.some((c) => String(c._id) === convIdStr);
        window.dispatchEvent(new Event("updateUnread"));
        
        if (!exists) {
          fetchConversations().then((res) => setConversations(Array.isArray(res.data) ? res.data : []));
          return prev;
        }
        const next = prev.map((c) =>
          String(c._id) === convIdStr
            ? { ...c, lastMessage: data.text, lastMessageAt: data.createdAt }
            : c
        );
        return next.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
      });
    };

    const handleMessageSent = ({ data }) => {
      setSending(false);
      setDraft("");
      
      const convIdStr = String(data.conversation?._id || data.conversation);

      setMessages((prev) => {
        if (selectedId && String(selectedId) === convIdStr) {
          if (prev.some((m) => String(m._id) === String(data._id))) return prev;
          
          // Update read timestamp to include our own sent message
          localStorage.setItem(`lastRead_${selectedId}`, data.createdAt || new Date().toISOString());
          return [...prev, data];
        }
        return prev;
      });

      setConversations((prev) => {
        const exists = prev.some((c) => String(c._id) === convIdStr);
        window.dispatchEvent(new Event("updateUnread"));
        if (!exists) {
          fetchConversations().then((res) => setConversations(Array.isArray(res.data) ? res.data : []));
          return prev;
        }
        const next = prev.map((c) =>
          String(c._id) === convIdStr
            ? { ...c, lastMessage: data.text, lastMessageAt: data.createdAt }
            : c
        );
        return next.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
      });
    };

    const handleMessageError = ({ message }) => {
      setSending(false);
      showToast(message || "Failed to send message", "error");
    };

    socket.on("message_received", handleMessageReceived);
    socket.on("message_sent", handleMessageSent);
    socket.on("message_error", handleMessageError);

    return () => {
      socket.off("message_received", handleMessageReceived);
      socket.off("message_sent", handleMessageSent);
      socket.off("message_error", handleMessageError);
    };
  }, [socket, selectedId]);

  useEffect(() => {
    if (scrollRef.current) {
      // Use setTimeout to ensure the DOM has fully painted the new messages before scrolling
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 10);
    }
  }, [messages, selectedId, loadingMessages]);

  const selectedConvo = conversations.find((c) => c._id === selectedId) || null;

  const otherParticipant = (convo) =>
    convo?.participants?.find((p) => String(p._id) !== String(currentUserId));

  const filteredConversations = conversations.filter((c) => {
    const other = otherParticipant(c);
    const haystack = `${other?.fullName || ""} ${c.item?.title || ""}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !selectedId || sending) return;

    if (socket && socket.connected) {
      setSending(true);
      socket.emit("send_message", { conversationId: selectedId, text });
    } else {
      // Fallback to HTTP if socket is disconnected
      setSending(true);
      try {
        const data = await sendMessage(selectedId, text);
        if (data.data) {
          const sentDate = data.data.createdAt || new Date().toISOString();
          localStorage.setItem(`lastRead_${selectedId}`, sentDate);
          window.dispatchEvent(new Event("updateUnread"));

          setMessages((prev) => [...prev, data.data]);
          setDraft("");
          setConversations((prev) => {
            const next = prev.map((c) =>
              c._id === selectedId
                ? { ...c, lastMessage: text, lastMessageAt: sentDate }
                : c
            );
            return next.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
          });
        }
      } catch (err) {
        showToast("Failed to send message", "error");
      } finally {
        setSending(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-[var(--color-bg)]">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div
        className="flex flex-1 flex-col transition-[margin] duration-300"
        style={{ marginLeft: isCollapsed ? 70 : 220 }}
      >
        <Navbar2 />

        <div className="flex flex-1 overflow-hidden">
          {/* Conversation list */}
          <aside
            className={`w-[320px] shrink-0 border-r border-gray-200 dark:border-[var(--color-border-subtle)] bg-white dark:bg-[var(--color-bg-surface)] flex flex-col ${
              selectedId ? "hidden md:flex" : "flex"
            }`}
          >
            <div className="px-5 pt-5 pb-4">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-[var(--color-text-primary)]">
                Messages
              </h1>
              <div className="relative mt-3">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[var(--color-text-muted)]"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full rounded-lg border border-gray-200 dark:border-[var(--color-border)] bg-gray-50 dark:bg-[var(--color-bg-raised)] py-2 pl-9 pr-3 text-sm text-gray-900 dark:text-[var(--color-text-primary)] placeholder:text-gray-400 dark:placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/40"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingConvos ? (
                <div className="flex flex-1 items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-brand)] border-t-transparent"></div>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                  <MessageSquare size={32} className="mb-3 text-gray-300 dark:text-[var(--color-text-muted)]" />
                  <p className="text-sm font-medium text-gray-500 dark:text-[var(--color-text-secondary)]">No conversations found</p>
                </div>
              ) : (
                filteredConversations.map((c) => {
                  const isActive = selectedId === c._id;
                  const other = otherParticipant(c);
                  
                  const lastReadStr = localStorage.getItem(`lastRead_${c._id}`);
                  const lastRead = lastReadStr ? new Date(lastReadStr).getTime() : new Date(c.lastMessageAt).getTime();
                  const isUnread = !isActive && new Date(c.lastMessageAt).getTime() > lastRead;

                  return (
                    <button
                      key={c._id}
                      onClick={() => {
                        setSelectedId(c._id);
                        localStorage.setItem(`lastRead_${c._id}`, c.lastMessageAt || new Date().toISOString());
                        window.dispatchEvent(new Event("updateUnread"));
                      }}
                      className={`flex w-full items-start gap-3 px-5 py-3 text-left transition-colors ${
                        isActive
                          ? "bg-gray-100 dark:bg-[var(--color-bg-raised)]"
                          : isUnread
                          ? "bg-[var(--color-brand-active-bg)] dark:bg-[var(--color-brand-active-bg)] hover:bg-[var(--color-brand-hover-bg)]"
                          : "hover:bg-gray-50 dark:hover:bg-[var(--color-bg-hover)]"
                      }`}
                    >
                      <Avatar initials={initialsFor(other?.fullName)} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`truncate text-sm ${isUnread ? "font-bold text-[var(--color-brand)]" : "font-semibold text-gray-900 dark:text-[var(--color-text-primary)]"}`}>
                            {other?.fullName || "Unknown user"}
                          </span>
                          <span className={`shrink-0 text-xs ${isUnread ? "font-bold text-[var(--color-brand)]" : "text-gray-400 dark:text-[var(--color-text-muted)]"}`}>
                            {formatTime(c.lastMessageAt)}
                          </span>
                        </div>
                        {c.item?.title && (
                          <p className="truncate text-xs text-[var(--color-brand)]">{c.item.title}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <p className={`truncate text-xs ${isUnread ? "font-semibold text-gray-900 dark:text-[var(--color-text-primary)]" : "text-gray-500 dark:text-[var(--color-text-secondary)]"}`}>
                            {c.lastMessage || "No messages yet"}
                          </p>
                          {isUnread && (
                            <div className="ml-2 flex h-2 w-2 shrink-0 rounded-full bg-[var(--color-brand)]" />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* Chat panel */}
          <section
            className={`flex-1 flex-col bg-gray-50 dark:bg-[var(--color-bg)] ${
              selectedId ? "flex" : "hidden md:flex"
            }`}
          >
            {!selectedConvo ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2">
                <MessageSquare size={28} className="text-gray-300 dark:text-[var(--color-text-muted)]" />
                <p className="text-sm font-medium text-gray-500 dark:text-[var(--color-text-secondary)]">
                  Select a conversation to start messaging
                </p>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="flex items-center gap-3 border-b border-gray-200 dark:border-[var(--color-border-subtle)] bg-white dark:bg-[var(--color-bg-surface)] px-5 py-3">
                  <button
                    onClick={() => setSelectedId(null)}
                    className="mr-1 flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-[var(--color-text-secondary)] dark:hover:bg-[var(--color-bg-raised)] md:hidden"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <Avatar initials={initialsFor(otherParticipant(selectedConvo)?.fullName)} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-[var(--color-text-primary)]">
                      {otherParticipant(selectedConvo)?.fullName || "Unknown user"}
                    </p>
                    {selectedConvo.item?.title && (
                      <p className="truncate text-xs text-[var(--color-brand)]">
                        {selectedConvo.item.title}
                      </p>
                    )}
                  </div>
                </div>

                {/* Message list */}
                <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
                  {loadingMessages ? (
                    <p className="text-center text-sm text-gray-400 dark:text-[var(--color-text-muted)]">
                      Loading messages…
                    </p>
                  ) : (
                    messages.map((m) => {
                      const isMine = String(m.sender?._id || m.sender) === String(currentUserId);
                      return (
                        <div key={m._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                              isMine
                                ? "rounded-br-md bg-[var(--color-brand)] text-[var(--color-brand-text)]"
                                : "rounded-bl-md bg-white text-gray-800 dark:bg-[var(--color-bg-surface)] dark:text-[var(--color-text-primary)] border border-gray-200 dark:border-[var(--color-border-subtle)]"
                            }`}
                          >
                            <p>{m.text}</p>
                            <p
                              className={`mt-1 text-[10px] ${
                                isMine
                                  ? "text-[var(--color-brand-text)]/70"
                                  : "text-gray-400 dark:text-[var(--color-text-muted)]"
                              }`}
                            >
                              {formatTime(m.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Composer */}
                <div className="border-t border-gray-200 dark:border-[var(--color-border-subtle)] bg-white dark:bg-[var(--color-bg-surface)] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-[var(--color-text-secondary)] dark:hover:bg-[var(--color-bg-raised)]">
                      <Paperclip size={18} />
                    </button>
                    <input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder="Type a message..."
                      className="flex-1 rounded-full border border-gray-200 dark:border-[var(--color-border)] bg-gray-50 dark:bg-[var(--color-bg-raised)] px-4 py-2 text-sm text-gray-900 dark:text-[var(--color-text-primary)] placeholder:text-gray-400 dark:placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/40"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!draft.trim() || sending}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand)] text-[var(--color-brand-text)] transition-opacity disabled:opacity-40"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}