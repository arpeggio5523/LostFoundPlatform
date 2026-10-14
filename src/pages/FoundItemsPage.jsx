import { useLanguage } from "../context/LanguageContext";
import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ItemCard from "../components/ItemCard";
import ImageSearchPanel from "../components/ImageSearchPanel";
import { buildApiUrl, apiFetch } from "../services/apiClient";
import { LogOut, X } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { getAuthUser, clearAuth, isAdmin } from "../services/authState";
import DetectedLanguageBadge from "../components/DetectedLanguageBadge";

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
const STATUSES = ["All Status", "Approved", "Pending", "Returned"];

export default function FoundItemsPage() {
  const { t } = useLanguage();

  const navigate = useNavigate();
  const { resetTheme } = useTheme();
  const statusOptions = STATUSES;

  const handleLogout = () => {
    resetTheme();
    clearAuth();
    navigate("/login", { replace: true });
  };
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch]     = useState("");
  const [translatedSearch, setTranslatedSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [location, setLocation] = useState("All Locations");
  const [status, setStatus]     = useState("All Status");
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Image search state: when set, overrides the normal filtered list
  const [imageSearchResults, setImageSearchResults] = useState(null);

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
        const response = await apiFetch("/api/items?type=Found");
        if (!response.ok) throw new Error("Failed to fetch items");
        const data = await response.json();

        const transformedItems = (data.data || []).map(item => ({
          id: item._id,
          _id: item._id,
          title: item.title,
          description: item.description,
          location: item.location,
          date: item.date ? new Date(item.date).toLocaleDateString() : "",
          dateValue: item.date,
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

  useEffect(() => {
    const query = search.trim();
    setTranslatedSearch("");
    if (query.length < 2) return undefined;

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const response = await apiFetch("/api/language/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: query }),
        });
        if (!response.ok) return;
        const result = await response.json();
        if (!cancelled) setTranslatedSearch(result.translatedText || query);
      } catch {
        if (!cancelled) setTranslatedSearch(query);
      }
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search]);


  const filtered = items.filter(item => {
    const searchTerm = (translatedSearch || search).toLowerCase();
    const matchSearch =
      item.title.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm);
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
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "var(--color-brand)", letterSpacing: "-0.02em" }}>{t("Found Items")}</h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "var(--color-text-secondary)" }}>{t("Browse items that have been found by the community")}</p>
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
              <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>{t(" Report Found Item")}</button>

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
              <LogOut size={18} />{t("Logout")}</button>
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
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ position: "relative" }}>
                <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }}
                  width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text" placeholder={t("Search items...")} value={search}
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
              <DetectedLanguageBadge text={search} />
            </div>

            {[
              { value: category, onChange: setCategory, options: CATEGORIES },
              { value: location, onChange: setLocation, options: LOCATIONS },
              { value: status,   onChange: setStatus,   options: statusOptions },
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
                {options.map(o => <option key={o} value={o}>{t(o)}</option>)}
              </select>
            ))}

          </div>

          {/* Result count */}
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--color-text-muted)" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              {imageSearchResults
                ? t(imageSearchResults.length === 1 ? "{{count}} image match found" : "{{count}} image matches found", { count: imageSearchResults.length })
                : t(filtered.length === 1 ? "{{count}} item found" : "{{count}} items found", { count: filtered.length })
              }
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
              <X size={12} />{t(" Clear")}</button>
          </div>
        </div>

        {/* Image search panel — shown above the items grid */}
        <ImageSearchPanel
          type="Found"
          onResults={(results) => setImageSearchResults(results)}
          onClear={() => setImageSearchResults(null)}
        />

        {/* Cards grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "64px 0", color: "var(--color-text-muted)" }}>
            <p style={{ margin: 0, fontSize: 14 }}>{t("Loading items...")}</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "64px 0", color: "#f87171" }}>
            <p style={{ margin: 0, fontSize: 14 }}>{t("Error: ")}{t(error)}</p>
          </div>
        ) : imageSearchResults !== null ? (
          // Image search results mode
          imageSearchResults.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 0", color: "var(--color-text-muted)" }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 12px", display: "block" }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <p style={{ margin: 0, fontSize: 14 }}>{t("No visually similar found items for your image.")}</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
              {imageSearchResults.map(item => (
                <div key={item._id} style={{ position: "relative" }}>
                  {item.similarityScore != null && (
                    <div style={{
                      position: "absolute", top: 8, right: 8, zIndex: 1,
                      background: "var(--color-brand)", color: "var(--color-brand-text)",
                      borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}>
                      {Math.round(item.similarityScore * 100)}{t("% match")}</div>
                  )}
                  <ItemCard item={{
                    ...item,
                    image: item.images?.[0] || null,
                    date: item.date ? new Date(item.date).toLocaleDateString() : "",
          dateValue: item.date,
                  }} />
                </div>
              ))}
            </div>
          )
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 0", color: "var(--color-text-muted)" }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 12px", display: "block" }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <p style={{ margin: 0, fontSize: 14 }}>{t("No items match your filters.")}</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
            {filtered.map(item => <ItemCard key={item.id} item={item} returnTo="/found-items" />)}
          </div>
        )}
      </main>
    </div>
  );
}
