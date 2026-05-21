import { useNavigate, useLocation } from "react-router-dom";
import { Home, Search, FileText, MessageSquare, User } from "lucide-react";

const NAV_ITEMS = [
  { label: "Home",        path: "/",            icon: Home },
  { label: "Lost Items",  path: "/lost-items",  icon: Search },
  { label: "Found Items", path: "/found-items", icon: FileText },
  { label: "Messages",    path: "/messages",    icon: MessageSquare },
  { label: "Profile",     path: "/profile",     icon: User },
];

export default function Sidebar() {
  const navigate  = useNavigate();
  const location  = useLocation();

  return (
    <aside style={{
      width: 220, minHeight: "100vh",
      background: "var(--color-bg-surface)",
      borderRight: "1px solid var(--color-border-subtle)",
      display: "flex", flexDirection: "column",
      padding: "20px 0", position: "fixed",
      left: 0, top: 0, bottom: 0, zIndex: 100,
      transition: "background 0.2s ease, border-color 0.2s ease",
    }}>
      {/* Logo */}
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

      {/* Nav links */}
      <nav style={{ flex: 1, padding: "0 10px" }}>
        {NAV_ITEMS.map(({ label, path, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={label}
              onClick={() => navigate(path)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%", padding: "10px 12px", borderRadius: 8, border: "none",
                background: isActive ? "var(--color-bg-raised)" : "transparent",
                color: isActive ? "var(--color-brand)" : "var(--color-text-secondary)",
                fontWeight: isActive ? 600 : 400,
                fontSize: 14, cursor: "pointer", marginBottom: 2, textAlign: "left",
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "var(--color-bg-hover)"; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
            >
              <Icon size={16} strokeWidth={2} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div style={{ padding: "0 10px", borderTop: "1px solid var(--color-border-subtle)", paddingTop: 16 }}>
        <button
          onClick={() => navigate("/report-lost")}
          style={{
            display: "flex", alignItems: "center", gap: 8, width: "100%",
            padding: "10px 12px", borderRadius: 8, border: "none",
            background: "var(--color-brand)", color: "var(--color-brand-text)",
            fontWeight: 600, fontSize: 13.5, cursor: "pointer", marginBottom: 4, textAlign: "left",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "var(--color-brand-hover)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "var(--color-brand)"; }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Report Lost Item
        </button>
        <button
          onClick={() => navigate("/report-found")}
          style={{
            display: "flex", alignItems: "center", gap: 8, width: "100%",
            padding: "10px 12px", borderRadius: 8, border: "none",
            background: "transparent", color: "var(--color-text-secondary)",
            fontWeight: 600, fontSize: 13.5, cursor: "pointer", marginBottom: 4, textAlign: "left",
            transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "var(--color-bg-hover)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Report Found Item
        </button>
      </div>
    </aside>
  );
}