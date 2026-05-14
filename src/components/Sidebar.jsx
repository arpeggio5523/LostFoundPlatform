import { useNavigate, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { label: "Home",        path: "/",            icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
  { label: "Lost Items",  path: "/lost-items",  icon: "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" },
  { label: "Found Items", path: "/found-items", icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" },
  { label: "Messages",    path: "/messages",    icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" },
  { label: "Profile",     path: "/profile",     icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside style={{
      width: 220, minHeight: "100vh", background: "#fff",
      borderRight: "1px solid #f0f0f0", display: "flex", flexDirection: "column",
      padding: "20px 0", position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 20px 24px" }}>
        <div style={{
          background: "#006058", borderRadius: 10, width: 36, height: 36,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <span style={{ fontWeight: 800, fontSize: 18, color: "#006058", letterSpacing: "-0.02em" }}>FindIt</span>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: "0 10px" }}>
        {NAV_ITEMS.map(({ label, path, icon }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={label}
              onClick={() => navigate(path)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%", padding: "10px 12px", borderRadius: 8, border: "none",
                background: isActive ? "#f3f4f6" : "transparent",
                color: isActive ? "#006058" : "#666",
                fontWeight: isActive ? 600 : 400,
                fontSize: 14, cursor: "pointer", marginBottom: 2, textAlign: "left",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#f9fafb"; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={icon} />
              </svg>
              {label}
            </button>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div style={{ padding: "0 10px", borderTop: "1px solid #f0f0f0", paddingTop: 16 }}>
        <button
          onClick={() => navigate("/report-lost")}
          style={{
            display: "flex", alignItems: "center", gap: 8, width: "100%",
            padding: "10px 12px", borderRadius: 8, border: "none",
            background: "#006058", color: "#fff",
            fontWeight: 600, fontSize: 13.5, cursor: "pointer", marginBottom: 4, textAlign: "left",
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Report Lost Item
        </button>
        <button
          onClick={() => navigate("/report-found")}
          style={{
            display: "flex", alignItems: "center", gap: 8, width: "100%",
            padding: "10px 12px", borderRadius: 8, border: "none",
            background: "transparent", color: "#444",
            fontWeight: 600, fontSize: 13.5, cursor: "pointer", marginBottom: 4, textAlign: "left",
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Report Found Item
        </button>
      </div>
    </aside>
  );
}