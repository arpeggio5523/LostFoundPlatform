import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ItemCard from "../components/ItemCard";
import Navbar2 from "../components/NavBar2";
import {Search, ChevronDown, Funnel} from "lucide-react";
import { MOCK_ITEMS } from "../data/itemsData";

// const MOCK_ITEMS = [
//   {
//     id: 1,
//     title: "Black Leather Wallet",
//     description: "Lost my black leather wallet with several cards inside.",
//     distMark: "Has a small scratch on the front.",
//     color: "Black",
//     location: "Universiti Malaya (UM)",
//     date: "Apr 1, 2026",
//     category: "Accessories",
//     status: "Matched",
//     user: "John Doe",
//     image: null,
//   },
//   {
//     id: 2,
//     title: "Blue Backpack",
//     description: "Lost my blue backpack containing textbooks and a laptop. Has a Nike logo on it.",
//     distMark: "Nike logo, worn straps",
//     color: "Blue",
//     location: "Sunway University Campus",
//     date: "Mar 30, 2026",
//     category: "Bag & Backpacks",
//     status: "Approved",
//     user: "Mike Johnson",
//     image: null,
//   },
//   {
//     id: 3,
//     title: "Silver Laptop - Macbook Pro",
//     description: "Lost my MacBook Pro 16 inch with stickers on the lid. Contains important work files.",
//     distMark: "Multiple stickers on lid (React, Node.js logos)",
//     color: "Silver",
//     location: "Multimedia University (MMU) Library",
//     date: "Mar 28, 2026",
//     category: "Electronics",
//     status: "Pending",
//     user: "David Chen",
//     image: null,
//   },
// ];

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
  "Universiti Putra Malaysia (UPM)",
  "Universiti Teknologi Malaysia (UTM)",
  "Universiti Teknologi MARA (UiTM)",
  "Universiti Islam Antarabangsa Malaysia (UIAM)",
  "Universiti Utara Malaysia (UUM)",
  "Multimedia University (MMU)",
  "Taylor's University",
  "Sunway University",
  "INTI International University",
  "Other"
];

const STATUSES = [
    "All Status",
    "Approved",
    "Pending",
    "Matched",
    "Returned"];

export default function LostItemsPage() {
  const lostItems = MOCK_ITEMS.filter(item => item.type === "lost");

  const navigate = useNavigate();
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState("All Categories");
  const [location, setLocation] = useState("All Locations");
  const [status, setStatus]     = useState("All Status");

  const filtered = lostItems.filter(item => {
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

              <div className="relative min-w-[150px]">
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value)}
                  className="py-2 pl-3 pr-9 rounded-lg border border-gray-200 text-sm text-black bg-white cursor-pointer outline-none focus:border-gray-400 min-w-[150px] appearance-none"
                >{CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <ChevronDown
                  size={16}
                  strokeWidth={2}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>

              <div className="relative min-w-[150px]">
                <select value={location} onChange={e => setLocation(e.target.value)}
                  className="py-2 pl-3 pr-9 rounded-lg border border-gray-200 text-sm text-black bg-white cursor-pointer outline-none focus:border-gray-400 min-w-[150px] appearance-none">
                  {LOCATIONS.map(l => <option key={l}>{l}</option>)}
                </select>
                <ChevronDown
                    size={16}
                    strokeWidth={2}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
              </div>

              <div className="relative min-w-[150px]">
                <select value={status} onChange={e => setStatus(e.target.value)}
                  className="py-2 pl-3 pr-9 rounded-lg border border-gray-200 text-sm text-black bg-white cursor-pointer outline-none focus:border-gray-400 min-w-[150px] appearance-none">
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
                <ChevronDown
                    size={16}
                    strokeWidth={2}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
              </div>
            </div>

            {/* Result count */}
            <div className="mt-3 flex items-center gap-1.5 text-gray-600 text-xs">
              <Funnel size={17} strokeWidth={1.5}/>
              {filtered.length} item{filtered.length !== 1 ? "s" : ""} found
            </div>
          </div>

          {/* Cards grid */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 text-gray-300">
              <Search 
                size={20} 
                strokeWidth={2} 
                className="mb-3" />
              <p className="text-sm m-0">No items match your filters.</p>
            </div>
          ) : (
            <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
              {filtered.map(item => <ItemCard key={item.id} item={item} dateLabel="Lost On" />)}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}