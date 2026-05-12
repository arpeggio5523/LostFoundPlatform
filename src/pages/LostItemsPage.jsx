import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ItemCard from "../components/ItemCard";
import Navbar2 from "../components/NavBar2";
import {Search, ChevronDown, Funnel} from "lucide-react";


const MOCK_ITEMS = [
  {
    id: 1,
    title: "Black Leather Wallet",
    description: "Lost my black leather wallet with several cards inside.",
    distMark: "Has a small scratch on the front.",
    color: "Black",
    location: "Universiti Malaya (UM)",
    date: "Apr 1, 2026",
    category: "Accessories",
    status: "Matched",
    user: "John Doe",
    image: null,
  },
  {
    id: 2,
    title: "Blue Backpack",
    description: "Lost my blue backpack containing textbooks and a laptop. Has a Nike logo on it.",
    distMark: "Nike logo, worn straps",
    color: "Blue",
    location: "Sunway University Campus",
    date: "Mar 30, 2026",
    category: "Bag & Backpacks",
    status: "Approved",
    user: "Mike Johnson",
    image: null,
  },
  {
    id: 3,
    title: "Silver Laptop - Macbook Pro",
    description: "Lost my MacBook Pro 16 inch with stickers on the lid. Contains important work files.",
    distMark: "Multiple stickers on lid (React, Node.js logos)",
    color: "Silver",
    location: "Multimedia University (MMU) Library",
    date: "Mar 28, 2026",
    category: "Electronics",
    status: "Pending",
    user: "David Chen",
    image: null,
  },
];

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
  const navigate = useNavigate();
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState("All Categories");
  const [location, setLocation] = useState("All Locations");
  const [status, setStatus]     = useState("All Status");

  const filtered = MOCK_ITEMS.filter(item => {
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

        <main className="ml-72 mr-5 flex-1 px-3 py-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-7">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight m-0">Lost Items</h1>
              <p className="text-sm text-gray-600 mt-1">Browse items that community members have lost</p>
            </div>
            <button
              onClick={() => navigate("/report-lost")}
              className="flex items-center gap-2 bg-gray-900 text-white border-none rounded-xl px-5 py-3 font-bold text-sm cursor-pointer hover:bg-gray-800 transition-colors"
            >
              <span className="text-lg leading-none">+</span> Report Lost Item
            </button>
          </div>

          {/* Filter bar */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-7 shadow-sm">
            <div className="flex gap-3 flex-wrap items-center">
              {/* Search */}
              <div className="relative flex-1 min-w-[180px]">
                <Search
                  size={16}
                  strokeWidth={2}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 outline-none focus:border-gray-400 transition-colors bg-white"
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
              {filtered.map(item => <ItemCard key={item.id} item={item} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}