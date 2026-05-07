import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import ItemCard from "../../components/ItemCard";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_ITEMS = [
  {
    id: 1,
    title: "Set of Keys with Blue Keychain",
    description: "Found a set of keys with a blue keychain near the cafeteria.",
    location: "Universiti Malaya (UM)",
    date: "2025-05-01",
    category: "Accessories",
    status: "approved",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    title: "iPhone 15 Pro",
    description: "Found a black iPhone 15 Pro in the lecture hall. Has a cracked screen protector.",
    location: "Universiti Kebangsaan Malaysia (UKM)",
    date: "2025-05-03",
    category: "Electronics",
    status: "approved",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    title: "Student ID Card",
    description: "Found a student ID card for Emily Watson.",
    location: "Universiti Putra Malaysia (UPM) Central Library",
    date: "2025-05-04",
    category: "Documents",
    status: "pending",
    image: null,
  },
  {
    id: 4,
    title: "Blue Umbrella",
    description: "Left behind near the main entrance after the rain.",
    location: "Universiti Sains Malaysia (USM)",
    date: "2025-05-05",
    category: "Accessories",
    status: "approved",
    image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&h=300&fit=crop",
  },
  {
    id: 5,
    title: "Leather Wallet",
    description: "Brown leather wallet found at the parking lot. Contains some cards.",
    location: "Taylor's University",
    date: "2025-05-06",
    category: "Accessories",
    status: "returned",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=300&fit=crop",
  },
  {
    id: 6,
    title: "Scientific Calculator",
    description: "Casio fx-570EX found in Engineering lab room 3.",
    location: "Universiti Teknologi Malaysia (UTM)",
    date: "2025-05-07",
    category: "Electronics",
    status: "pending",
    image: null,
  },
];

const CATEGORIES = ["All Categories", "Electronics", "Accessories", "Documents", "Clothing", "Others"];
const LOCATIONS = [
  "All Locations",
  "Universiti Malaya (UM)",
  "Universiti Kebangsaan Malaysia (UKM)",
  "Universiti Sains Malaysia (USM)",
  "Universiti Putra Malaysia (UPM) Central Library",
  "Universiti Teknologi Malaysia (UTM)",
  "Taylor's University",
  "Sunway University",
];
const STATUSES = ["All Status", "approved", "pending", "returned"];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function FoundItemsPage() {
  const navigate = useNavigate();
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState("All Categories");
  const [location, setLocation] = useState("All Locations");
  const [status, setStatus]     = useState("All Status");

  const filtered = MOCK_ITEMS.filter(item => {
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                        item.description.toLowerCase().includes(search.toLowerCase());
    const matchCat    = category === "All Categories" || item.category === category;
    const matchLoc    = location === "All Locations"  || item.location === location;
    const matchStatus = status   === "All Status"     || item.status === status;
    return matchSearch && matchCat && matchLoc && matchStatus;
  });

  const selectStyle = {
    padding: "9px 36px 9px 14px", borderRadius: 8,
    border: "1px solid #e5e7eb", background: "#fff",
    fontSize: 14, color: "#333", appearance: "none", cursor: "pointer",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "calc(100% - 10px) center",
    minWidth: 150,
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f9fafb", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <Sidebar />

      <main style={{ marginLeft: 220, flex: 1, padding: "36px 40px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#111", letterSpacing: "-0.02em" }}>Found Items</h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#888" }}>Browse items that have been found by the community</p>
          </div>
          <button
            onClick={() => navigate("/report-found")}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "#111", color: "#fff", border: "none", borderRadius: 10,
              padding: "11px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Report Found Item
          </button>
        </div>

        {/* Filter bar */}
        <div style={{
          background: "#fff", borderRadius: 12, border: "1px solid #f0f0f0",
          padding: "16px 20px", marginBottom: 28, boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            {/* Search */}
            <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
              <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#aaa" }}
                width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text" placeholder="Search items..." value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: "100%", padding: "9px 14px 9px 36px",
                  borderRadius: 8, border: "1px solid #e5e7eb",
                  fontSize: 14, color: "#333", outline: "none", boxSizing: "border-box",
                }}
              />
            </div>

            <select value={category} onChange={e => setCategory(e.target.value)} style={selectStyle}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={location} onChange={e => setLocation(e.target.value)} style={selectStyle}>
              {LOCATIONS.map(l => <option key={l}>{l}</option>)}
            </select>
            <select value={status} onChange={e => setStatus(e.target.value)} style={selectStyle}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Result count */}
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6, color: "#888", fontSize: 13 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            {filtered.length} item{filtered.length !== 1 ? "s" : ""} found
          </div>
        </div>

        {/* Cards grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#aaa" }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12 }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <p style={{ margin: 0, fontSize: 15 }}>No items match your filters.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 22 }}>
            {filtered.map(item => <ItemCard key={item.id} item={item} />)}
          </div>
        )}
      </main>
    </div>
  );
}