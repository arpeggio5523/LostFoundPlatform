import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Home, 
  Search, 
  FileText, 
  MessageSquare, 
  User, 
  ChevronLeft, 
  ChevronRight, 
  Plus 
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Home",        path: "/home",          icon: Home },
  { label: "Found Items", path: "/found-items",   icon: Search },
  { label: "Lost Items",  path: "/lost-items",    icon: FileText },
  { label: "Messages",    path: "/messages",      icon: MessageSquare },
  { label: "Profile",     path: "/profile",       icon: User },
];

export default function Sidebar( { isCollapsed, setIsCollapsed } ) {
  const navigate = useNavigate();
  const location = useLocation();

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
            FindIt
          </span>
        </div>
      )}

      {/* Nav links */}
      <nav style={{ flex: 1, padding: "0 10px" }}>
        {NAV_ITEMS.map(({ label, path, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={label}
              onClick={() => navigate(path)}
              title={isCollapsed ? label : undefined}
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
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "var(--color-bg-hover)"; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
            >
              <Icon size={isCollapsed ? 22 : 16} strokeWidth={2} style={{ flexShrink: 0 }} />
              {!isCollapsed && label}
            </button>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div style={{ padding: "0 10px", borderTop: "1px solid var(--color-border-subtle)", paddingTop: 16 }}>
        <button
          onClick={() => navigate("/report-lost")}
          title={isCollapsed ? "Report Lost Item" : undefined}
          style={{
            display: "flex",
            alignItems: "center",
            gap: isCollapsed ? 0 : 8,
            justifyContent: isCollapsed ? "center" : "flex-start",
            width: isCollapsed ? 46 : "100%",
            height: isCollapsed ? 46 : "auto",
            padding: isCollapsed ? 0 : "10px 12px",
            borderRadius: isCollapsed ? "50%" : 8,
            border: "none",
            background: "var(--color-brand)",
            color: "var(--color-brand-text)",
            fontWeight: 600,
            fontSize: 13.5,
            cursor: "pointer",
            marginBottom: 4,
            transition: "background 0.15s",
            margin: isCollapsed ? "0 auto 4px" : "0 0 4px",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "var(--color-brand-hover)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "var(--color-brand)"; }}
        >
          <Plus size={isCollapsed ? 20 : 16} style={{ flexShrink: 0 }} />
          {!isCollapsed && " Report Lost Item"}
        </button>
        <button
          onClick={() => navigate("/report-found")}
          title={isCollapsed ? "Report Found Item" : undefined}
          style={{
            display: "flex",
            alignItems: "center",
            gap: isCollapsed ? 0 : 8,
            justifyContent: isCollapsed ? "center" : "flex-start",
            width: isCollapsed ? 46 : "100%",
            height: isCollapsed ? 46 : "auto",
            padding: isCollapsed ? 0 : "10px 12px",
            borderRadius: isCollapsed ? "50%" : 8,
            border: "none",
            background: "transparent",
            color: "var(--color-text-secondary)",
            fontWeight: 600,
            fontSize: 13.5,
            cursor: "pointer",
            marginBottom: 4,
            transition: "background 0.15s, color 0.15s",
            margin: isCollapsed ? "0 auto 4px" : "0 0 4px",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "var(--color-bg-hover)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
        >
          <Plus size={isCollapsed ? 20 : 16} style={{ flexShrink: 0 }} />
          {!isCollapsed && " Report Found Item"}
        </button>
      </div>
    </aside>
  );
}