import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ItemCard from "../components/ItemCard";
import Navbar2 from "../components/NavBar2";
import {Search, ChevronDown, Funnel} from "lucide-react";


const MOCK_ITEMS = [
  {
    id: 1,
    title: "Set of Keys with Blue Keychain",
    description: "Found a set of keys with a blue keychain near the cafeteria.",
    distMark: "",
    color: "Blue",
    location: "Universiti Malaya (UM)",
    date: "Apr 2, 2026",
    category: "Accessories",
    status: "Approved",
    user: "Jane Smith",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    title: "iPhone 15 Pro",
    description: "Found a black iPhone 15 Pro in the lecture hall. Has a cracked screen protector.",
    distMark: "Cracked screen protector",
    color: "Black",
    location: "Universiti Kebangsaan Malaysia (UKM)",
    date: "Apr 3, 2026",
    category: "Electronics",
    status: "Approved",
    user: "Sarah Lee",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    title: "Student ID Card",
    description: "Found a student ID card for Emily Watson.",
    distMark: "",
    color: "",
    location: "Universiti Putra Malaysia (UPM) Central Library",
    date: "Apr 4, 2026",
    category: "Documents",
    status: "Pending",
    user: "John Doe",
    image: null,
  },
  {
    id: 4,
    title: "Blue Umbrella",
    description: "Left behind near the main entrance after the rain.",
    distMark: "",
    color: "Blue",
    location: "Universiti Sains Malaysia (USM)",
    date: "Apr 5, 2026",
    category: "Accessories",
    status: "Approved",
    user: "Zhan Lim",
    image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&h=300&fit=crop",
  },
  {
    id: 5,
    title: "Leather Wallet",
    description: "Brown leather wallet found at the parking lot. Contains some cards.",
    distMark: "",
    color: "Brown",
    location: "Taylor's University",
    date: "May 6, 2026",
    category: "Accessories",
    status: "Returned",
    user: "Yao Looi",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=300&fit=crop",
  },
  {
    id: 6,
    title: "Scientific Calculator",
    description: "Casio fx-570EX found in Engineering lab room 3.",
    distMark: "Has a small scratch on the front.",
    color: "Black",
    location: "Universiti Teknologi Malaysia (UTM)",
    date: "Mar 7, 2026",
    category: "Electronics",
    status: "Pending",
    user: "Yu Liew",
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
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight m-0">Found Items</h1>
              <p className="text-sm text-gray-600 mt-1">Browse items that have been found by the community</p>
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
              {filtered.map(item => <ItemCard key={item.id} item={item} dateLabel="Found on" />)}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}