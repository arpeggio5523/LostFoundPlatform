import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ItemCard from "../components/ItemCard";
import Navbar2 from "../components/NavBar2";
import { Search, ChevronDown, Funnel } from "lucide-react";

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

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("All Status");

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/items");
      const text = await response.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        throw new Error(`Invalid JSON response from /api/items: ${parseError.message}`);
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch items");
      }

      const normalizedItems = data.map((item) => ({
        ...item,
        title: item.title || item.item_name || "",
        description: item.description || item.item_description || "",
        status: item.status || item.item_status || "",
        category: item.category || "Other",
        location: item.location || "",
        date: item.date || "",
        user: item.user || "",
        distMark: item.distMark || item.dist_mark || "",
        color: item.color || "",
      }));

      console.log("Fetched items:", normalizedItems);
      setItems(normalizedItems);
    } catch (error) {
      console.error("Error fetching items:", error);
      setError(error.message || "Failed to fetch items");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (itemId, newStatus) => {
    try {
      const response = await fetch(`/api/items/${itemId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update status");
      }

      setItems((prev) =>
        prev.map((item) =>
          item._id === itemId ? { ...item, status: newStatus } : item
        )
      );

      alert("Status updated successfully!");
    } catch (error) {
      console.error("Error updating status:", error);
      alert(error.message);
    }
  };

  const filtered = items.filter((item) => {
    const text = search.toLowerCase();

    const matchSearch =
      item.title?.toLowerCase().includes(text) ||
      item.description?.toLowerCase().includes(text) ||
      item.distMark?.toLowerCase().includes(text) ||
      item.color?.toLowerCase().includes(text);

    const matchCategory =
      category === "All Categories" ||
      item.category === category;

    const matchStatus =
      status === "All Status" ||
      item.status === status;

    return matchSearch && matchCategory && matchStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar2 />

      <div className="flex">
        <Sidebar />

        <main className="ml-72 mr-5 flex-1 px-3 py-10">
          {/* HEADER */}
          <div className="flex items-start justify-between mb-7">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Lost Items
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Browse items that community members have lost
              </p>
            </div>

            <button
              onClick={() => navigate("/report-lost")}
              className="flex items-center gap-2 bg-gray-900 text-white rounded-xl px-5 py-3 font-bold text-sm hover:bg-gray-800"
            >
              + Report Lost Item
            </button>
          </div>

          {/* FILTER BAR */}
          <div className="bg-white rounded-xl border p-4 mb-7 shadow-sm">
            <div className="flex gap-3 flex-wrap items-center">
              {/* SEARCH */}
              <div className="relative flex-1 min-w-[180px]">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  placeholder="Search items..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm"
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