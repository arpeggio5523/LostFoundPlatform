import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ItemCard from "../components/ItemCard";
import { Funnel } from "lucide-react";
import { MOCK_ITEMS } from "../data/itemsData";

const CATEGORIES = [
  "All Categories",
  "Electronics",
  "Accessories",
  "Bag & Backpacks",
  "Documents",
  "Keys",
  "Clothing",
  "Books",
  "Sports Equipment",
  "Jewelry",
  "Other",
];

const STATUSES = ["All Status", "Pending", "Approved", "Matched", "Returned"];

export default function LostItemsPage() {
  const navigate = useNavigate();
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState("All Categories");
  const [location, setLocation] = useState("All Locations");
  const [status, setStatus]     = useState("All Status");
  const [loading]               = useState(false);
  const [error]                 = useState(null);
  const [items, setItems]       = useState(MOCK_ITEMS);

  const lostItems = items.filter(item => item.type === "lost");

  const updateStatus = (id, newStatus) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item._id === id ? { ...item, status: newStatus } : item
      )
    );
  };

  const filtered = lostItems.filter(item => {
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                        item.description.toLowerCase().includes(search.toLowerCase());
    const matchCat    = category === "All Categories" || item.category === category;
    const matchLoc    = location === "All Locations"  || item.location.toLowerCase().includes(location.toLowerCase());
    const matchStatus = status   === "All Status"     || item.status === status;
    return matchSearch && matchCat && matchLoc && matchStatus;
  });

  /* ── shared inline-style helpers ── */
  const inputStyle = {
    borderRadius: 8, border: "1px solid var(--color-border)",
    background: "var(--color-bg-raised)", fontSize: 14,
    color: "var(--color-text-primary)", outline: "none",
    transition: "background 0.2s ease, border-color 0.2s ease",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-bg-base)", fontFamily: "system-ui, sans-serif", transition: "background 0.2s ease" }}>
      <Sidebar />

      <main style={{ marginLeft: 220, flex: 1, padding: "36px 40px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "var(--color-brand)", letterSpacing: "-0.02em" }}>
              Lost Items
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "var(--color-text-secondary)" }}>
              Browse items that have been lost by the community
            </p>
          </div>
          <button
            onClick={() => navigate("/report-lost")}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "var(--color-brand)", color: "var(--color-brand-text)",
              border: "none", borderRadius: 10,
              padding: "11px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--color-brand-hover)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--color-brand)"; }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Report Lost Item
          </button>
        </div>

        {/* Filter bar */}
        <div style={{
          background: "var(--color-bg-surface)", borderRadius: 12,
          border: "1px solid var(--color-border)",
          padding: "16px 20px", marginBottom: 28,
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          transition: "background 0.2s ease, border-color 0.2s ease",
        }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            {/* Search */}
            <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
              <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }}
                width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text" placeholder="Search items..." value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ ...inputStyle, width: "100%", padding: "9px 14px 9px 36px", boxSizing: "border-box" }}
              />
            </div>

            {/* Category */}
            <select value={category} onChange={e => setCategory(e.target.value)}
              style={{ ...inputStyle, padding: "9px 36px 9px 14px", appearance: "none", cursor: "pointer", minWidth: 150 }}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>

            {/* Status */}
            <select value={status} onChange={e => setStatus(e.target.value)}
              style={{ ...inputStyle, padding: "9px 36px 9px 14px", appearance: "none", cursor: "pointer", minWidth: 150 }}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--color-text-muted)" }}>
            <Funnel size={14} /> {filtered.length} items found
          </div>
        </div>

        {error && (
          <div style={{ marginBottom: 16, borderRadius: 8, background: "#fef2f2", border: "1px solid #fee2e2", padding: "12px 16px", fontSize: 14, color: "#b91c1c" }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "64px 0", color: "var(--color-text-muted)" }}>
            Loading items...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 0", color: "var(--color-text-muted)" }}>
            No items match your filters.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
            {filtered.map(item => (
              <div key={item._id} style={{ display: "flex", flexDirection: "column" }}>
                <ItemCard item={item} dateLabel="Lost On" />

                <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                  {[
                    { label: "Pending",  active: "bg-gray-200 text-gray-800",    inactive: "bg-gray-100 text-gray-700" },
                    { label: "Approved", active: "bg-blue-200 text-blue-800",    inactive: "bg-blue-100 text-blue-700" },
                    { label: "Matched",  active: "bg-yellow-200 text-yellow-800",inactive: "bg-yellow-100 text-yellow-700" },
                    { label: "Returned", active: "bg-green-200 text-green-800",  inactive: "bg-green-100 text-green-700" },
                  ].map(({ label, active, inactive }) => (
                    <button
                      key={label}
                      onClick={() => updateStatus(item._id, label)}
                      className={`flex-1 py-2 rounded-lg text-sm transition-colors ${item.status === label ? active : inactive}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}