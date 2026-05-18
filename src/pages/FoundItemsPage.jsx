import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ItemCard from "../components/ItemCard";

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
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState("All Categories");
  const [location, setLocation] = useState("All Locations");
  const [status, setStatus]     = useState("All Status");

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3000/api/found-items");
        if (!response.ok) throw new Error("Failed to fetch items");
        const data = await response.json();
        
        // Transform the API response to match the ItemCard component expectations
        const transformedItems = (data.foundItems || []).map(item => ({
          id: item._id,
          title: item.title,
          description: item.description,
          location: item.location,
          date: new Date(item.dateFound).toLocaleDateString(),
          category: item.category,
          status: item.status,
          image: item.images && item.images.length > 0 ? item.images[0].url : null,
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
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />

      <main className="ml-[220px] flex-1 p-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-7">
          <div>
            <h1 className="text-3xl font-extrabold text-[#006058] tracking-tight m-0">Found Items</h1>
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
        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm m-0">Loading items...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-400">
            <p className="text-sm m-0">Error: {error}</p>
          </div>
        ) : filtered.length === 0 ? (
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