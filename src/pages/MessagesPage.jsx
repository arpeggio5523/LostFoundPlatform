import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Send, MessageSquare, ArrowLeft, Paperclip } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar2 from "../components/Navbar2";
import { getAuthUser, getCurrentUserId } from "../services/authState";
import { fetchConversations, fetchMessages, sendMessage } from "../services/messagesApi";

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

  // Load messages when a conversation is selected
  useEffect(() => {
    if (!selectedId) return;

    setLoadingMessages(true);
    fetchMessages(selectedId)
      .then((data) => setMessages(Array.isArray(data.data) ? data.data : []))
      .catch(() => setMessages([]))
      .finally(() => setLoadingMessages(false));
  }, [selectedId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, selectedId]);

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

    setSending(true);
    try {
      const data = await sendMessage(selectedId, text);
      if (data.data) {
        setMessages((prev) => [...prev, data.data]);
        setDraft("");
        setConversations((prev) =>
          prev.map((c) =>
            c._id === selectedId
              ? { ...c, lastMessage: text, lastMessageAt: new Date().toISOString() }
              : c
          )
        );
      }
    } catch {
      // silently ignore for now — could hook into Toast.jsx here
    } finally {
      setSending(false);
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
