import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ItemCard from "../components/ItemCard";
import { MOCK_ITEMS } from "../data/itemsData"; 
import Navbar2 from "../components/NavBar2";

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
const STATUSES = ["All Status", "Approved", "Pending", "Returned"];

export default function FoundItemsPage() {
  const navigate = useNavigate();
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState("All Categories");
  const [location, setLocation] = useState("All Locations");
  const [status, setStatus]     = useState("All Status");
  const [foundItems, setFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const filtered = foundItems.filter(item => {
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

  useEffect(() => {
    const fetchApprovedFoundItems = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/items/found-items");

        if (!response.ok) {
          throw new Error("Failed to fetch approved found items");
        }

        const data = await response.json();
        setFoundItems(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedFoundItems();
  }, []);

  if (loading) {
    return <p>Loading approved found items...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar2 />
      <div className="flex">
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
            {filtered.map(item => <ItemCard key={item._id} item={item} />)}
          </div>
        )}
      </main>
    </div>
    </div>
  );
}