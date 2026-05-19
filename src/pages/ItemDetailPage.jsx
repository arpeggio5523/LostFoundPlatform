import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { MOCK_ITEMS } from "../data/itemsData";
import { MapPin, Calendar, Tag, Palette, ArrowLeft, QrCode } from "lucide-react";
import { useEffect, useState } from "react";
import { isOwner } from "../services/authState";
import { buildApiUrl } from "../services/apiClient";


export default function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await fetch(buildApiUrl(`/api/found-items/${id}`));
        if (!response.ok) throw new Error("Item not found");
        const data = await response.json();
        setItem(data.foundItem);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  if (loading) return <div className="p-10 text-gray-400">Loading...</div>;
  if (error || !item) return <div className="p-10 text-red-400">Item not found.</div>;

  const isLost = item.type === "lost";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="ml-[280px] flex-1 p-10">

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-8 text-gray-400 hover:text-gray-700 text-sm font-semibold transition-colors"
        >
          <ArrowLeft size={16} />
          Back to {isLost ? "Lost" : "Found"} Items
        </button>

        {/* Two Column Layout */}
        <div className="grid gap-8 max-w-[1100px]" style={{ gridTemplateColumns: "1fr 350px" }}>

          {/* LEFT COLUMN */}
          <div>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">

              {/* Image */}
              <div className="w-full h-[400px]">
                <img
                src={item.images?.[0]?.url || "https://via.placeholder.com/800x400"}
                alt={item.title}
                className="w-full h-full object-cover"
                />
              </div>

              <div className="p-10">
                {/* Badges */}
                <div className="flex items-center justify-between mb-4">
                  <Badge type={item.type} label={item.type} />
                  <Badge type={item.status} label={item.status} isStatus />
                </div>

                {/* Title */}
                <h1 className="text-3xl font-extrabold text-gray-900 mb-5">
                  {item.title}
                </h1>

                {/* Description */}
                <div className="mb-8">
                  <div className="text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-2">
                    Description
                  </div>
                  <p className="text-base text-gray-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-8 border-t border-gray-100 pt-8 mb-12">
                  <InfoBlock label="Category" icon={<Tag size={16} />} value={item.category} />
                  <InfoBlock label="Colour"   icon={<Palette size={16} />} value={item.color} />
                  <InfoBlock label="Location" icon={<MapPin size={16} />} value={item.location} />
                  <InfoBlock label="Date" icon={<Calendar size={16} />} value={item.dateFound ? new Date(item.dateFound).toLocaleDateString() : "N/A"} />
                </div>


                {/* Actions */}
                {isOwner(item) && (
                  <div className="mt-6 border border-gray-200 rounded-2xl p-6">
                    <h3 className="text-base font-bold text-gray-900 mb-4">Actions</h3>
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate(`/report-found?edit=${item._id}`)}
                        className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all"
                      >
                        Edit
                      </button>
                      <button
                        className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>



          {/* RIGHT COLUMN */}
          <aside className="sticky top-10 self-start">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md">
              <h3 className="text-lg font-extrabold text-gray-900 mb-5">Posted By</h3>

              {/* User Info */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-[60px] h-[60px] rounded-full bg-blue-50 flex items-center justify-center text-2xl font-bold text-blue-600 shrink-0">
                  {item.user ? item.user.charAt(0) : "U"}
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {item.user || "Anonymous User"}
                  </div>
                  <div className="text-sm text-gray-500">
                    Posted {item.date}
                  </div>
                </div>
              </div>

              {/* QR Button */}
              <button className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-white border border-gray-200 rounded-xl text-[15px] font-bold text-gray-900 hover:bg-gray-50 transition-colors">
                <QrCode size={20} />
                View QR Code
              </button>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}

// Badge Component
function Badge({ type, label, isStatus }) {
  const isGreen = type === "found" || type === "approved";

  return (
    <div className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide border
      ${isGreen
        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
        : "bg-blue-50 text-blue-600 border-blue-100"
      }`}>
      {label}
    </div>
  );
}

// InfoBlock Component
function InfoBlock({ label, icon, value }) {
  return (
    <div>
      <div className="text-[10px] font-bold text-gray-900 uppercase tracking-wider mb-2">
        {label}
      </div>
      <div className="flex items-center gap-2.5 text-[15px] font-semibold text-gray-800">
        <span className="text-gray-400">{icon}</span>
        {value || "N/A"}
      </div>
    </div>
  );
}