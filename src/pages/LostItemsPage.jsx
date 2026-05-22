import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ItemCard from "../components/ItemCard";
import Navbar2 from "../components/NavBar2";
import {Search, ChevronDown, Funnel} from "lucide-react";

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
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [items, setItems]       = useState([]);

  useEffect(() => {
    const fetchLostItems = async () => {
      try {
        setLoading(true);

        const response = await fetch("http://localhost:3000/api/items/lost-items");

        if (!response.ok) {
          throw new Error("Failed to fetch lost items");
        }

        const data = await response.json();
        setItems(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLostItems();
  }, []);

  const updateStatus = (id, newStatus) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item._id === id ? { ...item, status: newStatus } : item
      )
    );
  };

  const filtered = items.filter(item => {
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                        item.description.toLowerCase().includes(search.toLowerCase());
    const matchCat    = category === "All Categories" || item.category === category;
    const matchLoc    = location === "All Locations"  || item.location.toLowerCase().includes(location.toLowerCase());
    const matchStatus = status   === "All Status"     || item.status === status;
    return matchSearch && matchCat && matchLoc && matchStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar2 />

      <div className="flex">
        <Sidebar />

        <main style={{ marginLeft: 220, flex: 1, padding: "36px 40px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#111", letterSpacing: "-0.02em" }}>Lost Items</h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#888" }}>Browse items that have been lost by the community</p>
          </div>
          <button
            onClick={() => navigate("/report-lost")}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "#111", color: "#fff", border: "none", borderRadius: 10,
              padding: "11px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Report Lost Item
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

              {/* CATEGORY */}
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="py-2 px-3 rounded-lg border text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>

              {/* STATUS */}
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="py-2 px-3 rounded-lg border text-sm"
              >
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="mt-3 text-xs text-gray-600">
              <Funnel size={14} /> {filtered.length} items found
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-16 text-gray-500">
              Loading items...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              No items match your filters.
            </div>
          ) : (
            <div className="grid gap-5 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
              {filtered.map((item) => (
                <div key={item._id} className="flex flex-col">
                  <ItemCard
                    item={item}
                    dateLabel="Lost On"
                  />

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => updateStatus(item._id, "Pending")}
                      className={`flex-1 py-2 rounded-lg text-sm transition-colors ${
                        item.status === "Pending"
                        ? "bg-gray-200 text-gray-800 font-bold"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Pending
                    </button>

                    <button
                      onClick={() => updateStatus(item._id, "Approved")}
                      className={`flex-1 py-2 rounded-lg text-sm transition-colors ${
                        item.status === "Approved"
                        ? "bg-blue-200 text-blue-800 font-bold"
                        : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      }`}
                    >
                      Approved
                    </button>

                    <button
                      onClick={() => updateStatus(item._id, "Matched")}
                      className={`flex-1 py-2 rounded-lg text-sm transition-colors ${
                        item.status === "Matched"
                        ? "bg-yellow-200 text-yellow-800 font-bold"
                        : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                      }`}
                    >
                      Matched
                    </button>

                    <button
                      onClick={() => updateStatus(item._id, "Returned")}
                      className={`flex-1 py-2 rounded-lg text-sm transition-colors ${
                        item.status === "Returned"
                        ? "bg-green-200 text-green-800 font-bold"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      Returned
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}