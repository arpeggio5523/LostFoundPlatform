import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Send, MessageSquare, ArrowLeft, Paperclip, X, Flag } from "lucide-react";
import Sidebar from "../components/Sidebar";
import ReportUserPanel from "../components/ReportUserPanel";
import NavBar2 from "../components/NavBar2";
import { getAuthUser, getCurrentUserId } from "../services/authState";
import { fetchConversations, fetchMessages, sendMessage } from "../services/messagesApi";
import { useSocket } from "../context/SocketContext";
import { useToast } from "../context/ToastContext";
import { MAX_MESSAGE_IMAGE_BYTES, MESSAGE_IMAGE_TYPES } from "../utils/messageAttachments";
import MessageTranslation from "../components/MessageTranslation";

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
  const conversationStorageKey = `messages:selectedConversation:${currentUserId}`;
  const restoredConversationRef = useRef(false);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [conversationsError, setConversationsError] = useState("");
  const [messagesError, setMessagesError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");

  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const draftsStorageKey = `messages:drafts:${currentUserId}`;
  const [drafts, setDrafts] = useState(() => {
    try {
      // Retain existing session drafts when upgrading to persistent storage.
      const saved = JSON.parse(localStorage.getItem(draftsStorageKey) ?? sessionStorage.getItem(draftsStorageKey) ?? "{}");
      if (!saved || Array.isArray(saved) || typeof saved !== "object") return {};
      return Object.fromEntries(Object.entries(saved).filter(([, value]) => typeof value === "string"));
    } catch { return {}; }
  });
  const draft = drafts[selectedId] || "";

  useEffect(() => {
    try {
      if (Object.keys(drafts).length) localStorage.setItem(draftsStorageKey, JSON.stringify(drafts));
      else localStorage.removeItem(draftsStorageKey);
      sessionStorage.removeItem(draftsStorageKey);
    } catch { /* Drafts still work in memory when browser storage is unavailable. */ }
  }, [drafts, draftsStorageKey]);

  const updateDraft = (conversationId, value) => {
    setDrafts((previous) => {
      const next = { ...previous };
      if (value) next[conversationId] = value;
      else delete next[conversationId];
      return next;
    });
  };

  const clearSentDraft = (conversationId, sentDraft) => {
    setDrafts((previous) => {
      // A delayed response must not erase text typed while the send was pending.
      if ((previous[conversationId] || "") !== sentDraft) return previous;
      const next = { ...previous };
      delete next[conversationId];
      return next;
    });
  };
  const [sending, setSending] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [readingImage, setReadingImage] = useState(false);
  const fileInputRef = useRef(null);
  const imageReaderRef = useRef(null);
  const activeConversationRef = useRef(selectedId);
  activeConversationRef.current = selectedId;

  useEffect(() => {
    setReportOpen(false);
    setAttachment(null);
    setReadingImage(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    return () => imageReaderRef.current?.abort();
  }, [selectedId]);

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
      .catch((error) => setConversationsError(error.message || "Unable to load conversations."))
      .finally(() => setLoadingConvos(false));
  }, []);

  // Explicit links take priority; otherwise restore this user's last open chat.
  useEffect(() => {
    if (loadingConvos || conversationsError) return;
    const convId = searchParams.get("conversationId");
    if (convId || !restoredConversationRef.current) {
      let rememberedId = null;
      try {
        rememberedId = sessionStorage.getItem(conversationStorageKey);
      } catch { /* Chat still works when browser storage is unavailable. */ }
      const candidateId = convId || rememberedId;
      const exists = conversations.find((c) => c._id === candidateId);
      if (exists) {
        setSelectedId(candidateId);
      } else if (rememberedId && !convId) {
        try { sessionStorage.removeItem(conversationStorageKey); } catch { /* Storage is optional. */ }
      }
      restoredConversationRef.current = true;
      if (convId) setSearchParams({}, { replace: true });
    }
  }, [searchParams, conversations, loadingConvos, conversationsError, conversationStorageKey, setSearchParams]);

  useEffect(() => {
    if (!selectedId) return;
    try { sessionStorage.setItem(conversationStorageKey, selectedId); } catch { /* Storage is optional. */ }
  }, [selectedId, conversationStorageKey]);

  const closeConversation = () => {
    setSelectedId(null);
    try { sessionStorage.removeItem(conversationStorageKey); } catch { /* Storage is optional. */ }
  };

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

    let active = true;
    setMessages([]);
    setMessagesError("");
    setLoadingMessages(true);
    fetchMessages(selectedId)
      .then((data) => { if (active) setMessages(Array.isArray(data.data) ? data.data : []); })
      .catch((error) => { if (active) setMessagesError(error.message || "Unable to load messages."); })
      .finally(() => { if (active) setLoadingMessages(false); });

    if (socket) {
      socket.emit("join_conversation", selectedId);
    }
    
    return () => {
      active = false;
      if (socket) {
        socket.emit("leave_conversation", selectedId);
      }
    };
  }, [selectedId, socket]);

  // Fallback Polling Mechanism to ensure messages arrive even if Socket.IO fails
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchConversations().then((res) => {
        setConversationsError("");
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
      }).catch((error) => setConversationsError(error.message || "Unable to refresh conversations."));

      if (selectedId) {
        fetchMessages(selectedId).then((res) => {
          if (activeConversationRef.current !== selectedId) return;
          setMessagesError("");
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
        }).catch((error) => { if (activeConversationRef.current === selectedId) setMessagesError(error.message || "Unable to refresh messages."); });
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
          fetchConversations().then((res) => setConversations(Array.isArray(res.data) ? res.data : [])).catch((error) => setConversationsError(error.message));
          return prev;
        }
        const next = prev.map((c) =>
          String(c._id) === convIdStr
            ? { ...c, lastMessage: data.text || (data.image ? "Photo" : ""), lastMessageAt: data.createdAt }
            : c
        );
        return next.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
      });
    };

    const handleMessageSent = ({ data }) => {
      setSending(false);
      
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
          fetchConversations().then((res) => setConversations(Array.isArray(res.data) ? res.data : [])).catch((error) => setConversationsError(error.message));
          return prev;
        }
        const next = prev.map((c) =>
          String(c._id) === convIdStr
            ? { ...c, lastMessage: data.text || (data.image ? "Photo" : ""), lastMessageAt: data.createdAt }
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

  const handleImageSelected = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!MESSAGE_IMAGE_TYPES.includes(file.type)) {
      showToast("Choose a JPEG, PNG, GIF or WebP image.", "error");
      return;
    }
    if (!file.size || file.size > MAX_MESSAGE_IMAGE_BYTES) {
      showToast("Choose an image no larger than 2 MB.", "error");
      return;
    }
    imageReaderRef.current?.abort();
    const reader = new FileReader();
    imageReaderRef.current = reader;
    setReadingImage(true);
    reader.onload = () => {
      setAttachment({ name: file.name, data: reader.result });
      setReadingImage(false);
    };
    reader.onerror = () => {
      setReadingImage(false);
      showToast("Could not read this image. Please try again.", "error");
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async () => {
    const text = draft.trim();
    if ((!text && !attachment) || !selectedId || sending || readingImage) return;

    {
      // HTTP gives sends a bounded response; sockets still deliver live updates.
      // Send images over HTTP; the server broadcasts them to live participants.
      setSending(true);
      try {
        const data = await sendMessage(selectedId, text, attachment?.data);
        if (data.data) {
          clearSentDraft(selectedId, draft);
          const sentDate = data.data.createdAt || new Date().toISOString();
          localStorage.setItem(`lastRead_${selectedId}`, sentDate);
          window.dispatchEvent(new Event("updateUnread"));

          if (activeConversationRef.current === selectedId) {
            setMessages((prev) => prev.some((m) => String(m._id) === String(data.data._id)) ? prev : [...prev, data.data]);
            setAttachment(null);
          }
          setConversations((prev) => {
            const next = prev.map((c) =>
              c._id === selectedId
                ? { ...c, lastMessage: text || "Photo", lastMessageAt: sentDate }
                : c
            );
            return next.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
          });
        }
      } catch (err) {
        showToast(err.message || "Failed to send message", "error");
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
        <NavBar2 />

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
              {conversationsError && <p role="alert" className="p-4 text-sm text-red-600">{conversationsError} Reconnecting automatically.</p>}
              {loadingConvos ? (
                <div className="flex flex-1 items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-brand)] border-t-transparent"></div>
                </div>
              ) : conversationsError && conversations.length === 0 ? null : filteredConversations.length === 0 ? (
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
                            {drafts[c._id]?.trim() ? (
                              <>
                                <span className="font-semibold text-green-700 dark:text-green-400">Draft: </span>
                                {drafts[c._id]}
                              </>
                            ) : (c.lastMessage || "No messages yet")}
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
                {messagesError && <p role="alert" className="p-4 text-sm text-red-600">{messagesError} Reconnecting automatically.</p>}
                {/* Chat header */}
                <div className="flex items-center gap-3 border-b border-gray-200 dark:border-[var(--color-border-subtle)] bg-white dark:bg-[var(--color-bg-surface)] px-5 py-3">
                  <button
                    onClick={closeConversation}
                    className="mr-1 flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-[var(--color-text-secondary)] dark:hover:bg-[var(--color-bg-raised)] md:hidden"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <Avatar initials={initialsFor(otherParticipant(selectedConvo)?.fullName)} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-[var(--color-text-primary)]">
                      {otherParticipant(selectedConvo)?.fullName || "Unknown user"}
                    </p>
                    {selectedConvo.item?.title && (
                      <p className="truncate text-xs text-[var(--color-brand)]">
                        {selectedConvo.item.title}
                      </p>
                    )}
                  </div>
                  {getAuthUser()?.role !== "Admin" && (
                    <button
                      type="button"
                      onClick={() => setReportOpen(true)}
                      className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      <Flag size={14} />
                      Report
                    </button>
                  )}
                </div>

                {/* Message list */}
                <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
                  {loadingMessages ? (
                    <p className="text-center text-sm text-gray-400 dark:text-[var(--color-text-muted)]">
                      Loading messages…
                    </p>
                  ) : (
                    [...messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map((m) => {
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
                            {m.image && (
                              <img
                                src={m.image}
                                alt="Image attachment"
                                className="mb-1 max-h-72 max-w-full rounded-lg object-contain"
                                onLoad={() => {
                                  if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                                }}
                              />
                            )}
                            {m.text && <MessageTranslation message={m} conversationId={selectedId} isMine={isMine} />}
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
                  {attachment && (
                    <div className="mb-3 flex items-center gap-3 text-sm text-gray-600 dark:text-[var(--color-text-secondary)]">
                      <img src={attachment.data} alt="Selected attachment" className="h-20 w-20 rounded-lg object-cover" />
                      <span className="min-w-0 truncate">{attachment.name}</span>
                      <button type="button" aria-label="Remove attachment" disabled={sending} onClick={() => setAttachment(null)} className="rounded-lg p-2 disabled:opacity-40">
                        <X size={18} />
                      </button>
                    </div>
                  )}
                  {readingImage && <p role="status" className="mb-2 text-sm text-gray-500">Reading image...</p>}
                  <input ref={fileInputRef} type="file" accept={MESSAGE_IMAGE_TYPES.join(",")} onChange={handleImageSelected} className="hidden" aria-label="Choose image attachment" />
                  <div className="flex items-center gap-2">
                    <button type="button" aria-label="Attach image" title="Attach image (up to 2 MB)" onClick={() => fileInputRef.current?.click()} disabled={sending || readingImage} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-[var(--color-text-secondary)] dark:hover:bg-[var(--color-bg-raised)] disabled:opacity-40">
                      <Paperclip size={18} />
                    </button>
                    <input
                      value={draft}
                      disabled={sending}
                      onChange={(e) => updateDraft(selectedId, e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder="Type a message..."
                      className="flex-1 rounded-full border border-gray-200 dark:border-[var(--color-border)] bg-gray-50 dark:bg-[var(--color-bg-raised)] px-4 py-2 text-sm text-gray-900 dark:text-[var(--color-text-primary)] placeholder:text-gray-400 dark:placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/40"
                    />
                    <button
                      onClick={handleSend}
                      aria-label="Send message"
                      disabled={(!draft.trim() && !attachment) || sending || readingImage}
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

      {reportOpen && selectedConvo && (
        <ReportUserPanel
          conversationId={selectedConvo._id}
          reportedUserName={otherParticipant(selectedConvo)?.fullName}
          onClose={() => setReportOpen(false)}
        />
      )}
    </div>
  );
}
