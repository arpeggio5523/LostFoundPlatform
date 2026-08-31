import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { MapPin, Calendar, Tag, Palette, ArrowLeft, QrCode, Trash2, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { isOwner, isAdmin, canEditItem } from "../services/authState";
import { authHeaders, apiFetch, getToken } from "../services/apiClient";
import ConfirmModal from "../components/ConfirmModal";
import LocationMap from "../components/LocationMap";
import { useToast } from "../context/ToastContext";
import StatusBadge from "../components/StatusBadge";
import QRCodeModal from "../components/QRcode";

export default function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const { showToast } = useToast();
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      const redirectTo = `${location.pathname}${location.search}`;
      navigate(`/login?redirect=${encodeURIComponent(redirectTo)}`, { replace: true });
      return;
    }

    const fetchItem = async () => {
      try {
        const response = await apiFetch(`/api/items/${id}`);
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
  }, [id, location.pathname, location.search, navigate]);

  const handleDelete = async () => {
    setShowDeleteModal(false);

    try {
      const response = await apiFetch(`/api/items/${item._id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || "Failed to delete item");
      }

      showToast("Item deleted successfully.", "success");
      navigate(returnTo);
    } catch (err) {
      showToast(err.message || "Failed to delete item.", "error");
    }
  };

  const handleContactOwner = async () => {
    setSendingEmail(true);
    try {
      const response = await apiFetch(`/api/items/${item._id}/contact`, {
        method: "POST",
        headers: authHeaders(),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || "Failed to send email");
      }

      showToast(
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontWeight: "bold" }}>Email Sent!</span>
          <span style={{ fontWeight: "normal", fontSize: "0.9em" }}>
            The owner has been notified. They will contact you directly via email if they wish to proceed.
          </span>
        </div>,
        "success"
      );
    } catch (err) {
      showToast(err.message || "Failed to send email.", "error");
    } finally {
      setSendingEmail(false);
    }
  };

  const updateItemStatus = async (status) => {
    setUpdatingStatus(status);

    try {
      const response = await apiFetch(`/api/items/${item._id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || result.message || "Failed to update item status.");
      }

      setItem(result.data || ((currentItem) => ({ ...currentItem, status })));
      showToast(`Status updated to ${status.toLowerCase()}.`, "success");
    } catch (err) {
      showToast(err.message || "Failed to update item status.", "error");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleMarkAsMatched = () => updateItemStatus("Matched");
  const handleMarkAsReturned = () => updateItemStatus("Returned");

  if (loading) return <div style={{ padding: 40, color: "var(--color-text-muted)" }}>Loading...</div>;
  if (error || !item) return <div style={{ padding: 40, color: "#f87171" }}>Item not found.</div>;

  const userIsOwner = isOwner(item);
  const userIsAdmin = isAdmin();
  const canEdit = canEditItem(item)
  const effectiveStatus = ["Matched", "Returned"].includes(item.status) ? item.status : item.type;
  const requestedReturnTo = searchParams.get("returnTo");
  const allowedReturnPages = ["/admin-dashboard", "/lost-items", "/found-items"];
  const returnTo = allowedReturnPages.includes(requestedReturnTo)
    ? requestedReturnTo
    : item.type === "Lost" ? "/lost-items" : "/found-items";
  const backLabel = returnTo === "/admin-dashboard"
    ? "Admin Dashboard"
    : returnTo === "/lost-items" ? "Lost Items" : "Found Items";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-bg-base)", transition: "background 0.2s ease" }}>
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main style={{ marginLeft: isCollapsed ? 70 : 220, transition: "margin-left 0.3s ease", flex: 1, padding: "40px" }}>
        
        {/* Back Button */}
        <button
          onClick={() => navigate(returnTo)}
          style={{
            display: "flex", alignItems: "center", gap: 8, marginBottom: 32,
            color: "var(--color-text-muted)", fontSize: 14, fontWeight: 600,
            background: "none", border: "none", cursor: "pointer", transition: "color 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--color-text-primary)"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--color-text-muted)"}
        >
          <ArrowLeft size={16} />
          Back to {backLabel}
        </button>

        {/* Two Column Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: 32, maxWidth: 1100 }}>

          {/* LEFT COLUMN */}
          <div>
            {/* Item Card Details */}
            <div style={{
              background: "var(--color-bg-surface)",
              borderRadius: 24,
              boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
              border: "1px solid var(--color-border)",
              overflow: "hidden",
              transition: "background 0.2s ease, border-color 0.2s ease",
            }}>

              {/* Image */}
              <div style={{ width: "100%", height: 400, background: "var(--color-bg-raised)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {item.images?.[0] ? (
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.2 }}>
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                )}
              </div>

              <div style={{ padding: 40 }}>
                {/* Badges */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <StatusBadge status={effectiveStatus} />
                  </div>
                </div>

                {/* Title */}
                <h1 style={{ fontSize: 32, fontWeight: 850, color: "var(--color-text-primary)", marginBottom: 20 }}>
                  {item.title}
                </h1>

                {/* Description */}
                <div style={{ marginBottom: 32 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-primary)", textTransform: "uppercase", marginBottom: 8 }}>
                    Description
                  </div>
                  <p style={{ fontSize: 16, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
                    {item.description}
                  </p>
                </div>

                {/* Info Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, borderTop: "1px solid var(--color-border)", paddingTop: 32, marginBottom: 48 }}>
                  <InfoBlock label="Category" icon={<Tag size={16} />} value={item.category} />
                  <InfoBlock label="Colour" icon={<Palette size={16} />} value={item.color} />
                  <InfoBlock label="Location" icon={<MapPin size={16} />} value={item.location} />
                  <InfoBlock label="Exact Location" icon={<MapPin size={16} />} value={item.exactLocation || "Not specified"} />
                  <InfoBlock label="Date" icon={<Calendar size={16} />} value={item.date ? new Date(item.date).toLocaleDateString() : "N/A"} />
                </div>

                {/* Contact Owner CTA */}
                {!userIsOwner && (
                  <button 
                    onClick={handleContactOwner}
                    disabled={sendingEmail}
                    style={{
                      width: "100%", padding: "16px", background: "var(--color-brand)",
                      color: "var(--color-brand-text)", border: "none", borderRadius: 12,
                      fontSize: 15, fontWeight: 700, cursor: sendingEmail ? "not-allowed" : "pointer", 
                      transition: "background 0.15s", opacity: sendingEmail ? 0.7 : 1,
                    }}
                    onMouseEnter={e => !sendingEmail && (e.currentTarget.style.background = "var(--color-brand-hover)")}
                    onMouseLeave={e => !sendingEmail && (e.currentTarget.style.background = "var(--color-brand)")}
                  >
                    {sendingEmail ? "Sending..." : "Contact owner"}
                  </button>
                )}

                {canEdit && (
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-none bg-red-600 p-4 text-[15px] font-bold text-white transition hover:bg-red-700"
                  >
                    <Trash2 size={18} />
                    Delete item
                  </button>
                )}
              </div>
            </div>

            {/* Actions Block for Owner/Admin */}
            {canEdit && !["Pending", "Rejected"].includes(item.status) &&
              (userIsAdmin || ["Approved", "Matched"].includes(item.status)) && (
              <div className="mt-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 sm:p-6 transition-all duration-300">
                <div className="mb-4 text-xl font-bold text-[var(--color-text-primary)]">
                  Actions
                </div>

                <div className={`grid grid-cols-1 gap-3 ${userIsAdmin ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
                  {userIsAdmin && (
                    <button
                      onClick={() =>
                        navigate(
                          item.type === "Lost"
                            ? `/report-lost?edit=${item._id}&returnTo=${encodeURIComponent(returnTo)}`
                            : `/report-found?edit=${item._id}&returnTo=${encodeURIComponent(returnTo)}`
                        )
                      }
                      className="flex min-h-11 w-full items-center justify-center whitespace-nowrap rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text-primary)] transition hover:bg-[var(--color-bg-hover)]"
                    >
                      Edit
                    </button>
                  )}

                  {item.status === "Approved" && (
                    <button
                      onClick={handleMarkAsMatched}
                      disabled={Boolean(updatingStatus)}
                      className="flex min-h-11 w-full items-center justify-center whitespace-nowrap rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text-primary)] transition hover:bg-[var(--color-bg-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {updatingStatus === "Matched" ? "Updating..." : "Mark as matched"}
                    </button>
                  )}

                  {["Approved", "Matched"].includes(item.status) && (
                    <button
                      onClick={handleMarkAsReturned}
                      disabled={Boolean(updatingStatus)}
                      className="flex min-h-11 w-full items-center justify-center whitespace-nowrap rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text-primary)] transition hover:bg-[var(--color-bg-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {updatingStatus === "Returned" ? "Updating..." : "Mark as returned"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <aside style={{ position: "sticky", top: 40, alignSelf: "start" }}>
            <div style={{ marginBottom: 20, background: "var(--color-bg-surface)", border: "1px solid var(--color-border)", borderRadius: 20, overflow: "hidden" }}>
              <div style={{ padding: "20px 20px 14px" }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)" }}>Reported location</h3>
                <p style={{ margin: "5px 0 0", fontSize: 13, color: "var(--color-text-secondary)" }}>
                  {item.reportLocation?.formattedAddress || item.location}
                </p>
              </div>
              <LocationMap location={item.reportLocation} itemType={item.type} title={item.title} />
              {item.reportLocation?.coordinates?.length === 2 && (
                <button
                  onClick={() => {
                    const mapUrl = `/item/${item._id}/map`;
                    window.open(mapUrl, "_blank", "noopener,noreferrer");
                  }}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, background: "var(--color-bg-surface)", border: "none", borderTop: "1px solid var(--color-border)", color: "var(--color-brand)", fontWeight: 700, cursor: "pointer" }}
                >
                  <ExternalLink size={16} /> View full map
                </button>
              )}
            </div>

            <div style={{
              background: "var(--color-bg-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 20,
              padding: 24,
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)",
              transition: "background 0.2s ease, border-color 0.2s ease",
            }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, color: "var(--color-text-primary)" }}>
                Posted By
              </h3>

              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                <div style={{
                  width: 60, height: 60, borderRadius: "50%",
                  background: "var(--color-bg-raised)", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 22, fontWeight: 700, color: "var(--color-brand)",
                }}>
                  {item.user ? item.user.charAt(0).toUpperCase() : "U"}
                </div>

                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "var(--color-text-primary)" }}>
                    {item.user || "Anonymous User"}
                  </div>
                  <div style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>
                    Posted {item.date ? new Date(item.date).toLocaleDateString() : ""}
                  </div>
                </div>
              </div>

              {/* QR Button */}
              <button 
                onClick={() => setShowQRModal(true)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 10, padding: 14, background: "var(--color-bg-surface)",
                  border: "1.5px solid var(--color-border)", borderRadius: 12,
                  fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)",
                  cursor: "pointer", transition: "background 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--color-bg-hover)"}
                onMouseLeave={e => e.currentTarget.style.background = "var(--color-bg-surface)"}
              >
                <QrCode size={20} />
                View QR Code
              </button>
            </div>
          </aside>

        </div>
      </main>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        item={item}
      />
    </div>
  );
}

// InfoBlock Component
function InfoBlock({ label, icon, value }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-primary)", textTransform: "uppercase", marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, fontWeight: 600, color: "var(--color-text-primary)" }}>
        <span style={{ color: "var(--color-text-muted)" }}>{icon}</span>
        {value || "N/A"}
      </div>
    </div>
  );
}
