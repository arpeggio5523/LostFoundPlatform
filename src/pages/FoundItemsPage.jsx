import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ItemCard from "../components/ItemCard";

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

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />

      <main className="ml-[220px] flex-1 p-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-7">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight m-0">Found Items</h1>
            <p className="text-sm text-gray-400 mt-1">Browse items that have been found by the community</p>
          </div>
          <button
            onClick={() => navigate("/report-found")}
            className="flex items-center gap-2 bg-gray-900 text-white border-none rounded-xl px-5 py-3 font-bold text-sm cursor-pointer hover:bg-gray-800 transition-colors"
          >
            <span className="text-lg leading-none">+</span> Report Found Item
          </button>
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-7 shadow-sm">
          <div className="flex gap-3 flex-wrap items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Search items..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 outline-none focus:border-gray-400 transition-colors bg-white"
              />
            </div>

            <select value={category} onChange={e => setCategory(e.target.value)}
              className="py-2 pl-3 pr-9 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white cursor-pointer outline-none focus:border-gray-400 min-w-[150px] appearance-none">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>

            <select value={location} onChange={e => setLocation(e.target.value)}
              className="py-2 pl-3 pr-9 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white cursor-pointer outline-none focus:border-gray-400 min-w-[150px] appearance-none">
              {LOCATIONS.map(l => <option key={l}>{l}</option>)}
            </select>

            <select value={status} onChange={e => setStatus(e.target.value)}
              className="py-2 pl-3 pr-9 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white cursor-pointer outline-none focus:border-gray-400 min-w-[150px] appearance-none">
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Result count */}
          <div className="mt-3 flex items-center gap-1.5 text-gray-400 text-xs">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            {filtered.length} item{filtered.length !== 1 ? "s" : ""} found
          </div>
        </div>

        {/* Cards grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-300">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <p className="text-sm m-0">No items match your filters.</p>
          </div>
        ) : (
          <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
            {filtered.map(item => <ItemCard key={item.id} item={item} />)}
          </div>
        )}
      </main>
    </div>
  );
}