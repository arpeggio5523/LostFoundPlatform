import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, CheckCircle2, XCircle, CheckCheck, ChevronLeft, ChevronRight, ArrowUpRight, RefreshCw, Inbox } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { useSocket } from "../context/SocketContext";
import { getAuthUser } from "../services/authState";
import { apiFetch } from "../services/apiClient";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "messages", label: "Messages" },
  { id: "moderation", label: "Report updates" },
];
const TYPES = {
  message: { icon: MessageSquare, label: "Message", action: "Open conversation", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  approved: { icon: CheckCircle2, label: "Report approved", action: "View report", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
  rejected: { icon: XCircle, label: "Report rejected", action: "Review report", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
  edited: { icon: RefreshCw, label: "Report edited", action: "View report", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  deleted: { icon: XCircle, label: "Report deleted", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
  matched: { icon: CheckCircle2, label: "Report matched", action: "View report", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
  returned: { icon: CheckCheck, label: "Report returned", action: "View report", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
};
function friendlyTime(value) {
  const date = new Date(value);
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} hr ago`;
  return date.toLocaleDateString("en-MY", { day: "numeric", month: "short", ...(date.getFullYear() !== new Date().getFullYear() ? { year: "numeric" } : {}) });
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const socket = useSocket();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [feed, setFeed] = useState({ data: [], total: 0, unreadCount: 0 });
  const [filter, setFilter] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);
  const [busy, setBusy] = useState(null);
  const [notice, setNotice] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const cache = useRef(new Map());
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (!getAuthUser()) { navigate("/login", { replace: true }); return; }
    let active = true;
    let inFlight = false;
    let refreshPending = false;
    const key = `${filter}:${page}`;
    let cached = cache.current.get(key);
    const all = cache.current.get("all:1");
    // A complete All feed can satisfy any filter without another request.
    if (!cached && all && all.total === all.data.length) {
      const matching = all.data.filter((entry) =>
        filter === "unread" ? !entry.readAt :
        filter === "messages" ? entry.type === "message" :
        filter === "moderation" ? ["approved", "rejected", "edited", "deleted", "matched", "returned"].includes(entry.type) : true
      );
      cached = { ...all, data: matching.slice((page - 1) * 25, page * 25), total: matching.length, page };
      cache.current.set(key, cached);
    }
    if (cached) { setFeed(cached); setLoading(false); setError(""); }
    const load = async () => {
      if (inFlight) return;
      inFlight = true;
      try {
        const response = await apiFetch(`/api/notifications?page=${page}&filter=${filter}`);
        if (!response.ok) throw new Error("Unable to load notifications. Please try again.");
        const data = await response.json();
        if (active) {
          cache.current.set(key, data);
          hasLoaded.current = true;
          setFeed(data);
          setError("");
        }
      } catch (err) { if (active) setError(err.message); }
      finally {
        inFlight = false;
        if (active) {
          setLoading(false);
          if (refreshPending) { refreshPending = false; load(); }
        }
      }
    };
    if (!cached) { setLoading(!hasLoaded.current); load(); }
    const refresh = () => {
      cache.current.clear();
      if (inFlight) refreshPending = true;
      else load();
    };
    socket?.on("notification_received", refresh);
    socket?.on("notifications_updated", refresh);
    socket?.on("connect", refresh);
    return () => {
      active = false;
      socket?.off("notification_received", refresh);
      socket?.off("notifications_updated", refresh);
      socket?.off("connect", refresh);
    };
  }, [navigate, socket, page, filter, refreshKey]);

  function refreshFeed() {
    cache.current.clear();
    setRefreshKey((key) => key + 1);
  }

  async function markRead(notification, open = false) {
    if (busy) return;
    if (notification?.readAt && open) {
      navigate(notification.type === "message" ? `/messages?conversationId=${notification.conversation}` : `/item/${notification.item}`);
      return;
    }
    setBusy(notification?._id || "all");
    setError("");
    try {
      const response = await apiFetch(notification ? `/api/notifications/${notification._id}/read` : "/api/notifications/read-all", { method: "PATCH" });
      if (!response.ok) throw new Error("Unable to mark notifications as read. Please try again.");
      cache.current.clear();
      setFeed((current) => ({ ...current,
        unreadCount: notification ? Math.max(0, current.unreadCount - (notification.readAt ? 0 : 1)) : 0,
        data: current.data.map((entry) => !notification || entry._id === notification._id ? { ...entry, readAt: new Date().toISOString() } : entry),
      }));
      setNotice(notification ? "Notification marked as read." : "All notifications marked as read.");
      if (notification && open) navigate(notification.type === "message" ? `/messages?conversationId=${notification.conversation}` : `/item/${notification.item}`);
      else {
        setPage(1);
        setRefreshKey((key) => key + 1);
      }
    } catch (err) { setError(err.message); }
    finally { setBusy(null); }
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-bg-base)] font-[system-ui,sans-serif] text-[var(--color-text-primary)] transition-colors duration-200">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className="min-w-0 flex-1 px-4 py-9 sm:px-10" style={{ marginLeft: isCollapsed ? 70 : 220, transition: "margin-left 0.3s ease" }}>
        <div>
          <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="m-0 text-[28px] font-extrabold tracking-[-0.02em] text-[var(--color-brand)]">Notifications</h1>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Messages and updates about your lost and found reports, all in one place.</p>
            </div>
            <button disabled={!feed.unreadCount || !!busy || loading} onClick={() => markRead(null)} className="inline-flex items-center gap-2 rounded-[10px] border-0 bg-[var(--color-brand)] px-5 py-[11px] text-sm font-bold text-[var(--color-brand-text)] transition-colors hover:bg-[var(--color-brand-hover)] disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]">
              <CheckCheck size={17} aria-hidden="true" />{busy === "all" ? "Marking as read..." : "Mark all as read"}
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] p-4">
              <div role="group" aria-label="Filter notifications" className="flex flex-wrap gap-1">
                {FILTERS.map((option) => (
                  <button key={option.id} aria-pressed={filter === option.id} onClick={() => { setFilter(option.id); setPage(1); setNotice(""); }} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-brand)] ${filter === option.id ? "bg-[var(--color-brand-active-bg)] text-[var(--color-brand)]" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"}`}>
                    {option.label}{option.id === "unread" && feed.unreadCount > 0 && <span className="rounded-full bg-[var(--color-brand)] px-1.5 text-xs text-[var(--color-brand-text)]">{feed.unreadCount}</span>}
                  </button>
                ))}
              </div>
              <button aria-label="Refresh notifications" title="Refresh notifications" disabled={loading} onClick={refreshFeed} className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] disabled:opacity-40"><RefreshCw size={17} aria-hidden="true" /></button>
            </div>
            {error && <div role="alert" className="m-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-red-100 p-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-300"><span>{error}</span><button onClick={refreshFeed} className="font-semibold underline">Try again</button></div>}
            <p role="status" className="sr-only">{notice}</p>
            {loading ? (
              <div role="status" aria-label="Loading notifications" className="space-y-6 p-6">
                {[1, 2, 3].map((key) => <div key={key} className="flex animate-pulse gap-4"><div className="h-11 w-11 shrink-0 rounded-xl bg-[var(--color-bg-raised)]" /><div className="flex-1 space-y-3"><div className="h-4 w-1/3 rounded bg-[var(--color-bg-raised)]" /><div className="h-3 w-3/4 rounded bg-[var(--color-bg-raised)]" /><div className="h-3 w-1/5 rounded bg-[var(--color-bg-raised)]" /></div></div>)}
              </div>
            ) : !feed.data.length && !error ? (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-brand-active-bg)] text-[var(--color-brand)]">{filter === "unread" ? <CheckCheck size={28} /> : <Inbox size={28} />}</div>
                <h2 className="text-lg font-semibold">{filter === "unread" ? "You're all caught up" : filter === "messages" ? "No message notifications yet" : filter === "moderation" ? "No report updates yet" : "You're up to date"}</h2>
                <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--color-text-secondary)]">{filter === "unread" ? "You've read all your notifications. You can still find them in All." : filter === "messages" ? "When someone sends you a message, you'll see it here." : filter === "moderation" ? "When an admin edits, deletes, or changes your report's status, you'll see the update here." : "New messages and admin decisions will appear here when they arrive."}</p>
                {filter !== "all" && <button onClick={() => { setFilter("all"); setPage(1); }} className="mt-5 text-sm font-semibold text-[var(--color-brand)]">View all notifications</button>}
              </div>
            ) : (
              <ul className="divide-y divide-[var(--color-border)]">
                {feed.data.map((notification) => {
                  const style = TYPES[notification.type] || TYPES.message;
                  const Icon = style.icon;
                  return (
                    <li key={notification._id} className={`flex gap-3 p-4 sm:gap-4 sm:p-5 ${!notification.readAt ? "bg-[var(--color-brand-active-bg)]" : ""}`}>
                      <div className={`mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.color}`}><Icon size={21} aria-hidden="true" /></div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-medium text-[var(--color-text-muted)]">{style.label}</span>
                          <time title={new Date(notification.createdAt).toLocaleString("en-MY")} dateTime={notification.createdAt} className="text-xs text-[var(--color-text-muted)]">{friendlyTime(notification.createdAt)}</time>
                        </div>
                        <div className="mt-1 flex items-center gap-2"><h2 className={`break-words text-sm ${notification.readAt ? "font-medium" : "font-bold"}`}>{notification.title}</h2>{!notification.readAt && <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-[var(--color-brand)]"><span className="h-1.5 w-1.5 rounded-full bg-[var(--color-brand)]" />New</span>}</div>
                        <p className="mt-1 break-words text-sm leading-relaxed text-[var(--color-text-secondary)]">{notification.body}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                          {style.action && <button disabled={!!busy} onClick={() => markRead(notification, true)} className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-brand)] hover:underline disabled:opacity-50">{style.action}<ArrowUpRight size={15} aria-hidden="true" /></button>}
                          {!notification.readAt && <button disabled={!!busy} onClick={() => markRead(notification)} className="inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-brand)] disabled:opacity-50"><CheckCheck size={14} aria-hidden="true" />{busy === notification._id ? "Marking..." : "Mark as read"}</button>}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            {!loading && feed.total > 25 && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] p-4 text-sm text-[var(--color-text-secondary)]">
              <span>{(page - 1) * 25 + 1} to {Math.min(page * 25, feed.total)} of {feed.total} notifications</span>
              <div className="flex items-center gap-3"><button aria-label="Previous page" disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded-lg border border-[var(--color-border)] p-2 disabled:opacity-30"><ChevronLeft size={16} /></button><span>Page {page}</span><button aria-label="Next page" disabled={page * 25 >= feed.total} onClick={() => setPage(page + 1)} className="rounded-lg border border-[var(--color-border)] p-2 disabled:opacity-30"><ChevronRight size={16} /></button></div>
            </div>}
          </div>
        </div>
      </main>
    </div>
  );
}
