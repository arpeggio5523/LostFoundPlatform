import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ItemCard from "../components/ItemCard";
import { Funnel, LogOut, X } from "lucide-react";
import { buildApiUrl, apiFetch } from "../services/apiClient";
import { useTheme } from "../context/ThemeContext";
import { getAuthUser, clearAuth, isAdmin } from "../services/authState";

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

const LOCATIONS = [
  "All Locations",
  "Universiti Malaya (UM)",
  "Universiti Kebangsaan Malaysia (UKM)",
  "Universiti Sains Malaysia (USM)",
  "Universiti Putra Malaysia (UPM) Central Library",
  "Universiti Teknologi Malaysia (UTM)",
  "Universiti Teknologi MARA (UiTM)",
  "Taylor's University",
  "Sunway University",
  "Multimedia University (MMU)",
];

export default function LostItemsPage() {
  const navigate = useNavigate();
  const { resetTheme } = useTheme();
  const statusOptions = isAdmin()
    ? STATUSES
    : STATUSES.filter(option => option !== "Pending");

  const handleLogout = () => {
    resetTheme();
    clearAuth();
    navigate("/login", { replace: true });
  };
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState("All Categories");
  const [location, setLocation] = useState("All Locations");
  const [status, setStatus]     = useState("All Status");
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [items, setItems]       = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const hasActiveFilters = search !== "" || category !== "All Categories" ||
    location !== "All Locations" || status !== "All Status";

  const clearFilters = () => {
    setSearch("");
    setCategory("All Categories");
    setLocation("All Locations");
    setStatus("All Status");
  };

  useEffect(() => {
    const user = getAuthUser();

    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await apiFetch("/api/items?type=Lost");
        if (!response.ok) throw new Error("Failed to fetch lost items");
        const data = await response.json();

        const transformed = (data.data || []).map(item => ({
          _id:         item._id,
          title:       item.title,
          description: item.description,
          location:    item.location,
          date:        new Date(item.date).toLocaleDateString(),
          category:    item.category,
          status:      item.status,
          image:       item.images && item.images.length > 0 ? item.images[0] : null,
          user:        item.user || "Anonymous",
          reportedBy:  item.reportedBy,
          type:        item.type,
        }));

        setItems(transformed);
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
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                        item.description.toLowerCase().includes(search.toLowerCase());
    const matchCat    = category === "All Categories" || item.category === category;
    const matchLoc    = location === "All Locations" || item.location === location;
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
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
      />

      <main style={{ marginLeft: isCollapsed ? 70 : 220, transition: "margin-left 0.3s ease", flex: 1, padding: "36px 40px" }}>
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
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
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
                style={{ ...inputStyle, width: "100%", padding: "9px 14px 9px 36px", boxSizing: "border-box" }}
              />
            </div>

            {/* Category */}
            <select value={category} onChange={e => setCategory(e.target.value)}
              style={{ ...inputStyle, padding: "9px 36px 9px 14px", appearance: "none", cursor: "pointer", minWidth: 150 }}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>

            {/* Location */}
            <select value={location} onChange={e => setLocation(e.target.value)}
              style={{ ...inputStyle, padding: "9px 36px 9px 14px", appearance: "none", cursor: "pointer", minWidth: 150 }}>
              {LOCATIONS.map(l => <option key={l}>{l}</option>)}
            </select>

            {/* Status */}
            <select value={status} onChange={e => setStatus(e.target.value)}
              style={{ ...inputStyle, padding: "9px 36px 9px 14px", appearance: "none", cursor: "pointer", minWidth: 150 }}>
              {statusOptions.map(s => <option key={s}>{s}</option>)}
            </select>

          </div>

          <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--color-text-muted)" }}>
              <Funnel size={14} /> {filtered.length} item{filtered.length !== 1 ? "s" : ""} found
            </div>
            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              aria-hidden={!hasActiveFilters}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "4px 8px", borderRadius: 6,
                border: "1px solid var(--color-border)",
                background: "transparent", color: "var(--color-text-secondary)",
                fontSize: 12, fontWeight: 600,
                cursor: hasActiveFilters ? "pointer" : "default",
                visibility: hasActiveFilters ? "visible" : "hidden",
              }}
            >
              <X size={12} /> Clear
            </button>
          </div>
        </div>

        {error && (
          <div style={{ marginBottom: 16, borderRadius: 8, background: "#fef2f2", border: "1px solid #fee2e2", padding: "12px 16px", fontSize: 14, color: "#b91c1c" }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "64px 0", color: "var(--color-text-muted)" }}>
            <p style={{ margin: 0, fontSize: 14 }}>Loading items...</p>
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
            {filtered.map(item => (
              <ItemCard key={item._id} item={item} dateLabel="Lost On" returnTo="/lost-items" />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
