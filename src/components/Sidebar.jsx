import { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useNavigate, useLocation } from "react-router-dom";
import { getAuthUser } from "../services/authState";
import { fetchConversations } from "../services/messagesApi";
import { useSocket } from "../context/SocketContext";
import {
  Home,
  Search,
  FileText,
  MessageSquare,
  User,
  ChevronLeft,
  ChevronRight,
  Plus,
  Shield,
  BarChart3,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Home",        path: "/dashboard",          icon: Home },
  { label: "Found Items", path: "/found-items",   icon: Search },
  { label: "Lost Items",  path: "/lost-items",    icon: FileText },
  { label: "Messages",    path: "/messages",      icon: MessageSquare },
  { label: "Profile",     path: "/profile",       icon: User },
  { label: "Admin",       path: "/admin-dashboard", icon: Shield, adminOnly: true }
];

export default function Sidebar( { isCollapsed, setIsCollapsed } ) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getAuthUser();
  const isAdmin = currentUser?.role === "Admin";
  const visibleNavItems = (
    isAdmin
      ? [...NAV_ITEMS, { label: "Analytics", path: "/analytics", icon: BarChart3 }]
      : NAV_ITEMS
  ).filter((item) => !item.adminOnly || isAdmin);

  const socket = useSocket();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const checkUnread = async () => {
      try {
        const res = await fetchConversations();
        const convos = Array.isArray(res.data) ? res.data : [];
        let count = 0;
        convos.forEach(c => {
          const lastReadStr = localStorage.getItem(`lastRead_${c._id}`);
          // If no lastRead is set, treat it as read until we receive a new message
          const lastRead = lastReadStr ? new Date(lastReadStr).getTime() : new Date(c.lastMessageAt).getTime();
          if (new Date(c.lastMessageAt).getTime() > lastRead) {
            count++;
          }
        });
        if (isMounted) setUnreadCount(count);
      } catch (err) {}
    };

    checkUnread();
    const interval = setInterval(checkUnread, 10000);
    const handleStorage = () => checkUnread();

    window.addEventListener("updateUnread", handleStorage);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener("updateUnread", handleStorage);
    };
  }, []);

  return (
    <aside style={{
      width: isCollapsed ? 70 : 220,
      minHeight: "100vh",
      background: "var(--color-bg-surface)",
      borderRight: "1px solid var(--color-border-subtle)",
      display: "flex",
      flexDirection: "column",
      padding: "20px 0",
      position: "fixed",
      left: 0, top: 0, bottom: 0,
      zIndex: 100,
      transition: "width 0.3s ease, background 0.2s ease, border-color 0.2s ease",
      overflow: "visible",
    }}>
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-label={t(isCollapsed ? "Expand sidebar" : "Collapse sidebar")}
        style={{
          position: "absolute",
          right: -12,
          top: 16,
          width: 24,
          height: 24,
          borderRadius: "50%",
          border: "1px solid var(--color-border)",
          background: "var(--color-bg-surface)",
          color: "var(--color-text-muted)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
          zIndex: 101,
        }}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Logo */}
      {!isCollapsed && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 20px 24px" }}>
          <div style={{
            background: "var(--color-brand-active-bg)", borderRadius: 10, width: 36, height: 36,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="var(--color-brand)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, color: "var(--color-brand)", letterSpacing: "-0.02em" }}>
            LostFound MY
          </span>
        </div>
      )}

      {/* Nav links */}
      <nav style={{ flex: 1, padding: "0 10px" }}>
        {visibleNavItems.map(({ label, path, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={label}
              onClick={() => navigate(path)}
              title={isCollapsed ? t(label) : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: isCollapsed ? 0 : 10,
                justifyContent: isCollapsed ? "center" : "flex-start",
                width: "100%",
                padding: isCollapsed ? "10px 0" : "10px 12px",
                borderRadius: 8,
                border: "none",
                background: isActive ? "var(--color-bg-raised)" : "transparent",
                color: isActive ? "var(--color-brand)" : "var(--color-text-secondary)",
                fontWeight: isActive ? 600 : 400,
                fontSize: 14,
                cursor: "pointer",
                marginBottom: 2,
                textAlign: "left",
                transition: "background 0.15s, color 0.15s",
                position: "relative",
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "var(--color-bg-hover)"; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
            >
              <Icon size={isCollapsed ? 22 : 16} strokeWidth={2} style={{ flexShrink: 0 }} />
              {!isCollapsed && t(label)}

              {label === "Messages" && unreadCount > 0 && !isCollapsed && (
                <div style={{
                  marginLeft: "auto",
                  background: "var(--color-brand)",
                  color: "var(--color-brand-text)",
                  fontSize: 10,
                  fontWeight: 800,
                  height: 18,
                  minWidth: 18,
                  borderRadius: 9,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 5px",
                }}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </div>
              )}
              {label === "Messages" && unreadCount > 0 && isCollapsed && (
                <div style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  background: "var(--color-brand)",
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                }} />
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
