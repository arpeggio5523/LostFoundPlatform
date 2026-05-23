import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { MapPin, Calendar, Tag, Palette, ArrowLeft, QrCode } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentUserId } from "../services/authState";
import { buildApiUrl, authHeaders } from "../services/apiClient";


export default function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await fetch(buildApiUrl(`/api/items/${id}`));
        if (!response.ok) throw new Error("Item not found");
        const data = await response.json();
        setItem(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleDelete = async () => {
    const confirmed = window.confirm("Delete this item? This action cannot be undone.");

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(buildApiUrl(`/api/items/${item._id}`), {
        method: "DELETE",
        headers: authHeaders(),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || "Failed to delete item");
      }

      alert("Item deleted successfully.");
      navigate(item.type === "Lost" ? "/lost-items" : "/found-items");
    } catch (err) {
      alert(err.message || "Failed to delete item.");
    }
  };

  if (loading) return <div className="p-10 text-[var(--color-text-muted)]">Loading...</div>;
  if (error || !item) return <div className="p-10 text-red-400">Item not found.</div>;

  const isLost = item.type === "Lost";

  return (
    <div className="flex min-h-screen bg-[var(--color-bg-base)]">
      <Sidebar />

      <main className="ml-[280px] flex-1 p-10">

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-8 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] text-sm font-semibold transition-colors"
        >
          <ArrowLeft size={16} />
          Back to {isLost ? "Lost" : "Found"} Items
        </button>

        {/* Two Column Layout */}
        <div className="grid gap-8 max-w-[1100px]" style={{ gridTemplateColumns: "1fr 350px" }}>

          {/* LEFT COLUMN */}
          <div>
            <div className="bg-[var(--color-bg-surface)] rounded-3xl shadow-sm border border-[var(--color-border)] overflow-hidden">

              {/* Image */}
              <div className="w-full h-[400px] bg-[var(--color-bg-raised)] flex items-center justify-center">
                {item.images?.[0] ? (
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.2 }}>
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                )}
              </div>

              <div className="p-10">
                {/* Badges */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Badge type={item.type} label={item.type} />
                    <Badge type={item.status} label={item.status} isStatus />
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-extrabold text-[var(--color-text-primary)] mb-5">
                  {item.title}
                </h1>

                {/* Description */}
                <div className="mb-8">
                  <div className="text-[11px] font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-2">
                    Description
                  </div>
                  <p className="text-base text-[var(--color-text-secondary)] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-8 border-t border-[var(--color-border)] pt-8 mb-12">
                  <InfoBlock label="Category" icon={<Tag size={16} />} value={item.category} />
                  <InfoBlock label="Colour"   icon={<Palette size={16} />} value={item.color} />
                  <InfoBlock label="Location" icon={<MapPin size={16} />} value={item.location} />
                  <InfoBlock label="Date" icon={<Calendar size={16} />} value={item.date ? new Date(item.date).toLocaleDateString() : "N/A"} />
                </div>


                {/* Actions */}
                {String(item.reportedBy?._id || item.reportedBy) === String(getCurrentUserId()) && (
                  <div className="mt-6 border border-[var(--color-border)] rounded-2xl p-6">
                    <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-4">Actions</h3>
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate(item.type === "Lost" ? `/report-lost?edit=${item._id}` : `/report-found?edit=${item._id}`)}
                        className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={handleDelete}
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
            <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-md">
              <h3 className="text-lg font-extrabold text-[var(--color-text-primary)] mb-5">Posted By</h3>

              {/* User Info */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-[60px] h-[60px] rounded-full bg-blue-50 flex items-center justify-center text-2xl font-bold text-blue-600 shrink-0">
                  {item.user ? item.user.charAt(0) : "U"}
                </div>
                <div>
                  <div className="text-lg font-bold text-[var(--color-text-primary)]">
                    {item.user || "Anonymous User"}
                  </div>
                  <div className="text-sm text-[var(--color-text-secondary)]">
                    Posted {item.date}
                  </div>
                </div>
              </div>

              {/* QR Button */}
              <button className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl text-[15px] font-bold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-raised)] transition-colors">
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
        ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800"
        : "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
      }`}>
      {label}
    </div>
  );
}

// InfoBlock Component
function InfoBlock({ label, icon, value }) {
  return (
    <div>
      <div className="text-[10px] font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-2">
        {label}
      </div>
      <div className="flex items-center gap-2.5 text-[15px] font-semibold text-[var(--color-text-primary)]">
        <span className="text-[var(--color-text-muted)]">{icon}</span>
        {value || "N/A"}
      </div>
    </div>
  );
}