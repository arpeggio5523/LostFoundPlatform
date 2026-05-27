import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ItemCard from "../components/ItemCard";
import { buildApiUrl, apiFetch } from "../services/apiClient";
import { LogOut } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { clearAuth } from "../services/authState";

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
    "Other"];

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

export default function FoundItemsPage() {

  const navigate = useNavigate();
  const { resetTheme } = useTheme();

  const handleLogout = () => {
    resetTheme();
    clearAuth();
    navigate("/");
  };
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState("All Categories");
  const [location, setLocation] = useState("All Locations");
  const [status, setStatus]     = useState("All Status");
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await apiFetch("/api/items?type=Found");
        if (!response.ok) throw new Error("Failed to fetch items");
        const data = await response.json();

        const transformedItems = (data.data || []).map(item => ({
          id: item._id,
          _id: item._id,
          title: item.title,
          description: item.description,
          location: item.location,
          date: new Date(item.date).toLocaleDateString(),
          category: item.category,
          status: item.status,
          image: item.images && item.images.length > 0 ? item.images[0] : null,
          user: item.user || "Anonymous",
          reportedBy: item.reportedBy,
          type: item.type,
        }));

        setItems(transformedItems);
        setError(null);
      } catch (err) {
        setError(err.message);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);


  const filtered = items.filter(item => {
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    const matchCat    = category === "All Categories" || item.category === category;
    const matchLoc    = location === "All Locations"  || item.location === location;
    const matchStatus = status   === "All Status"     || item.status.toLowerCase() === status.toLowerCase();
    return matchSearch && matchCat && matchLoc && matchStatus;
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-bg-base)", fontFamily: "system-ui, sans-serif", transition: "background 0.2s ease" }}>
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
      />

      <main style={{ marginLeft: isCollapsed ? 70 : 220, transition: "margin-left 0.3s ease", flex: 1, padding: "36px 40px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "var(--color-brand)", letterSpacing: "-0.02em" }}>
              Found Items
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "var(--color-text-secondary)" }}>
              Browse items that have been found by the community
            </p>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button
              onClick={() => navigate("/report-found")}
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
              <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Report Found Item
            </button>

            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "#064e3b",
                color: "white",
                border: "none",
                borderRadius: 10,
                padding: "11px 20px",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "#022c22";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "#064e3b";
              }}
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
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
                style={{
                  width: "100%", padding: "9px 14px 9px 36px",
                  borderRadius: 8, border: "1px solid var(--color-border)",
                  background: "var(--color-bg-raised)",
                  fontSize: 14, color: "var(--color-text-primary)", outline: "none", boxSizing: "border-box",
                  transition: "background 0.2s ease, border-color 0.2s ease",
                }}
              />
            </div>

            {[
              { value: category, onChange: setCategory, options: CATEGORIES },
              { value: location, onChange: setLocation, options: LOCATIONS },
              { value: status,   onChange: setStatus,   options: STATUSES },
            ].map(({ value, onChange, options }, i) => (
              <select key={i} value={value} onChange={e => onChange(e.target.value)}
                style={{
                  padding: "9px 36px 9px 14px", borderRadius: 8,
                  border: "1px solid var(--color-border)",
                  background: "var(--color-bg-raised)",
                  fontSize: 14, color: "var(--color-text-primary)",
                  appearance: "none", cursor: "pointer",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat", backgroundPosition: "calc(100% - 10px) center",
                  minWidth: 150, outline: "none",
                  transition: "background 0.2s ease, border-color 0.2s ease",
                }}>
                {options.map(o => <option key={o}>{o}</option>)}
              </select>
            ))}
          </div>

          {/* Result count */}
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--color-text-muted)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            {filtered.length} item{filtered.length !== 1 ? "s" : ""} found
          </div>
        </div>

        {/* Cards grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "64px 0", color: "var(--color-text-muted)" }}>
            <p style={{ margin: 0, fontSize: 14 }}>Loading items...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "64px 0", color: "#f87171" }}>
            <p style={{ margin: 0, fontSize: 14 }}>Error: {error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 0", color: "var(--color-text-muted)" }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 12px", display: "block" }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <p style={{ margin: 0, fontSize: 14 }}>No items match your filters.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
            {filtered.map(item => <ItemCard key={item.id} item={item} />)}
          </div>
        )}
      </main>
    </div>
  );
}