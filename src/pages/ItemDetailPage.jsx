import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { MapPin, Calendar, Tag, Palette, ArrowLeft, QrCode, MessageSquare, Search, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentUserId } from "../services/authState";
import { buildApiUrl, authHeaders, apiFetch } from "../services/apiClient";
import ConfirmModal from "../components/ConfirmModal";
import { useToast } from "../context/ToastContext";
import { startConversation } from "../services/messagesApi";


export default function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const { showToast } = useToast();

  // Possible matches
  const [matchesChecked, setMatchesChecked] = useState(false);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
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
  }, [id]);

  useEffect(() => {
    if (!item) return;
    setSelectedStatus(item.status === "Returned" ? "Returned" : item.type);
  }, [item]);

  // Reset match results whenever we land on a different item
  useEffect(() => {
    setMatchesChecked(false);
    setMatchesLoading(false);
    setMatches([]);
  }, [id]);

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
      navigate(item.type === "Lost" ? "/lost-items" : "/found-items");
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

  const handleStartChat = async () => {
    if (!item) return;
    const ownerId = item.reportedBy?._id || item.reportedBy;
    if (!ownerId) {
      showToast("Cannot start chat: unknown owner.", "error");
      return;
    }
    
    setStartingChat(true);
    try {
      const res = await startConversation(ownerId, item._id);
      if (res.data) {
        navigate(`/messages?conversationId=${res.data._id}`);
      }
    } catch (err) {
      showToast("Failed to start conversation.", "error");
    } finally {
      setStartingChat(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!item || selectedStatus === "" || selectedStatus === (item.status === "Returned" ? "Returned" : item.type)) {
      return;
    }

    setSavingStatus(true);
    try {
      const response = await apiFetch(`/api/items/${item._id}/status`, {
        method: "PUT",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ status: selectedStatus }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to update item status.");
      }

      setItem(result.data);
      setSelectedStatus(result.data.status === "Returned" ? "Returned" : result.data.type);
      showToast("Item status updated successfully.", "success");
    } catch (err) {
      showToast(err.message || "Failed to update item status.", "error");
    } finally {
      setSavingStatus(false);
    }
  };

  // TODO: replace with a real API call once the matching backend exists,
  // e.g. GET /api/items/${item._id}/matches
  const handleViewPossibleMatches = async () => {
    setMatchesLoading(true);
    try {
      // Placeholder: no backend endpoint yet, so we just simulate a lookup
      // and always come back empty for now.
      await new Promise((resolve) => setTimeout(resolve, 400));
      setMatches([]);
    } finally {
      setMatchesLoading(false);
      setMatchesChecked(true);
    }
  };

  const handleMatchClick = (matchId) => {
    navigate(`/items/${matchId}`);
  };

  if (loading) return <div style={{ padding: 40, color: "var(--color-text-muted)" }}>Loading...</div>;
  if (error || !item) return <div style={{ padding: 40, color: "#f87171" }}>Item not found.</div>;

  const isLost = item.type === "Lost";
  const isOwner = String(item.reportedBy?._id || item.reportedBy) === String(getCurrentUserId());
  const effectiveStatus = item.status === "Returned" ? "Returned" : item.type;
  const statusOptions = isLost ? ["Lost", "Returned"] : ["Found", "Returned"];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-bg-base)", transition: "background 0.2s ease" }}>
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
      />

      <main style={{ marginLeft: isCollapsed ? 70 : 220, transition: "margin-left 0.3s ease", flex: 1, padding: "40px" }}>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "flex", alignItems: "center", gap: 8, marginBottom: 32,
            color: "var(--color-text-muted)", fontSize: 14, fontWeight: 600,
            background: "none", border: "none", cursor: "pointer", transition: "color 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--color-text-primary)"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--color-text-muted)"}
        >
          <ArrowLeft size={16} />
          Back to {isLost ? "Lost" : "Found"} Items
        </button>

        {/* Two Column Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: 32, maxWidth: 1100 }}>

          {/* LEFT COLUMN */}
          <div>
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
                    {/* <Badge type={item.type} label={item.type} /> */}
                    <Badge type={effectiveStatus} label={effectiveStatus} isStatus />
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
                  <InfoBlock label="Colour"   icon={<Palette size={16} />} value={item.color} />
                  <InfoBlock label="Location" icon={<MapPin size={16} />} value={item.location} />
                  <InfoBlock label="Exact Location" icon={<MapPin size={16} />} value={item.exactLocation || "Not specified"} />
                  <InfoBlock label="Date"     icon={<Calendar size={16} />} value={item.date ? new Date(item.date).toLocaleDateString() : "N/A"} />
                </div>

                {/* Contact Owner CTA */}
                {!isOwner && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
                      {sendingEmail ? "Sending..." : "Email owner"}
                    </button>

                    <button 
                      onClick={handleStartChat}
                      disabled={startingChat}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        width: "100%", padding: "16px", background: "var(--color-bg-raised)",
                        color: "var(--color-text-primary)", border: "1px solid var(--color-border)", borderRadius: 12,
                        fontSize: 15, fontWeight: 700, cursor: startingChat ? "not-allowed" : "pointer", 
                        transition: "background 0.15s", opacity: startingChat ? 0.7 : 1,
                      }}
                      onMouseEnter={e => !startingChat && (e.currentTarget.style.background = "var(--color-bg-hover)")}
                      onMouseLeave={e => !startingChat && (e.currentTarget.style.background = "var(--color-bg-raised)")}
                    >
                      <MessageSquare size={18} />
                      {startingChat ? "Starting chat..." : `Chat with ${item.user || "owner"}`}
                    </button>
                  </div>
                )}

                {/* Owner Actions (Edit / Delete / Status Update) */}
                {isOwner && (
                  <div style={{ marginTop: 24, border: "1px solid var(--color-border)", borderRadius: 16, padding: 24 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 16 }}>Actions</h3>

                    <div style={{ display: "grid", gap: 16 }}>
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        <button
                          onClick={() => navigate(item.type === "Lost" ? `/report-lost?edit=${item._id}` : `/report-found?edit=${item._id}`)}
                          style={{
                            flex: 1, minWidth: 120, padding: "12px", background: "#2563eb", color: "#fff",
                            border: "none", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = "#1d4ed8"}
                          onMouseLeave={e => e.currentTarget.style.background = "#2563eb"}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setShowDeleteModal(true)}
                          style={{
                            flex: 1, minWidth: 120, padding: "12px", background: "#dc2626", color: "#fff",
                            border: "none", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = "#b91c1c"}
                          onMouseLeave={e => e.currentTarget.style.background = "#dc2626"}
                        >
                          Delete
                        </button>
                      </div>

                      <div style={{ display: "grid", gap: 12 }}>
                        <div>
                          <label htmlFor="status-select" style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 8 }}>Item Status</label>
                          <select
                            id="status-select"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            disabled={item.status === "Returned"}
                            style={{
                              width: "100%", padding: "12px 14px", borderRadius: 12,
                              border: "1px solid var(--color-border)", background: "var(--color-bg-raised)",
                              color: "var(--color-text-primary)", fontSize: 14, cursor: item.status === "Returned" ? "not-allowed" : "pointer",
                            }}
                          >
                            {statusOptions.map((statusOption) => (
                              <option key={statusOption} value={statusOption}>{statusOption}</option>
                            ))}
                          </select>
                        </div>

                        <button
                          onClick={handleStatusUpdate}
                          disabled={savingStatus || item.status === "Returned" || selectedStatus === effectiveStatus}
                          style={{
                            width: "100%", padding: "12px", background: "#10b981", color: "#fff",
                            border: "none", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: savingStatus || item.status === "Returned" || selectedStatus === effectiveStatus ? "not-allowed" : "pointer",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={e => {
                            if (!savingStatus && item.status !== "Returned" && selectedStatus !== effectiveStatus) {
                              e.currentTarget.style.background = "#059669";
                            }
                          }}
                          onMouseLeave={e => {
                            if (!savingStatus && item.status !== "Returned" && selectedStatus !== effectiveStatus) {
                              e.currentTarget.style.background = "#10b981";
                            }
                          }}
                        >
                          {savingStatus ? "Saving..." : "Update status"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <aside style={{ position: "sticky", top: 40, alignSelf: "start", display: "flex", flexDirection: "column", gap: 20 }}>
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
              <button style={{
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

            {/* View Possible Matches Button */}
            <button
              onClick={handleViewPossibleMatches}
              disabled={matchesLoading}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                gap: 10, padding: 14, background: "var(--color-bg-surface)",
                border: "1.5px solid var(--color-border)", borderRadius: 12,
                fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)",
                cursor: matchesLoading ? "not-allowed" : "pointer", transition: "background 0.2s",
                opacity: matchesLoading ? 0.7 : 1,
              }}
              onMouseEnter={e => !matchesLoading && (e.currentTarget.style.background = "var(--color-bg-hover)")}
              onMouseLeave={e => !matchesLoading && (e.currentTarget.style.background = "var(--color-bg-surface)")}
            >
              {matchesLoading ? (
                <Loader2 size={18} className="spin" style={{ animation: "spin 1s linear infinite" }} />
              ) : (
                <Search size={18} />
              )}
              {matchesLoading ? "Searching..." : "View possible matches"}
            </button>

            {/* Possible Matches Panel */}
            {matchesChecked && (
              <div style={{
                background: "var(--color-bg-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 20,
                padding: 24,
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)",
              }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, color: "var(--color-text-primary)" }}>
                  Possible Matches
                </h3>

                {matches.length === 0 ? (
                  <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "center", gap: 10, padding: "24px 8px",
                    color: "var(--color-text-muted)", textAlign: "center",
                  }}>
                    <Search size={28} style={{ opacity: 0.4 }} />
                    <div style={{ fontSize: 14, fontWeight: 600 }}>No matches found</div>
                    <div style={{ fontSize: 12, lineHeight: 1.5 }}>
                      We couldn't find any potential matches for this item yet. Check back later.
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: 12 }}>
                    {matches.map((match) => (
                      <button
                        key={match._id}
                        onClick={() => handleMatchClick(match._id)}
                        style={{
                          display: "flex", alignItems: "center", gap: 12, width: "100%",
                          padding: 12, background: "var(--color-bg-raised)",
                          border: "1px solid var(--color-border)", borderRadius: 12,
                          cursor: "pointer", textAlign: "left", transition: "background 0.15s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--color-bg-hover)"}
                        onMouseLeave={e => e.currentTarget.style.background = "var(--color-bg-raised)"}
                      >
                        {match.images?.[0] ? (
                          <img
                            src={match.images[0]}
                            alt={match.title}
                            style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
                          />
                        ) : (
                          <div style={{
                            width: 48, height: 48, borderRadius: 8, flexShrink: 0,
                            background: "var(--color-bg-surface)", display: "flex",
                            alignItems: "center", justifyContent: "center",
                          }}>
                            <Tag size={18} style={{ opacity: 0.3 }} />
                          </div>
                        )}
                        <div style={{ minWidth: 0 }}>
                          <div style={{
                            fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)",
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                          }}>
                            {match.title}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                            {match.matchScore ? `${Math.round(match.matchScore * 100)}% match` : "Possible match"}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
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
    </div>
  );
}

// Badge Component
function Badge({ type, label, isStatus }) {
  const normalizedType = type ? type.toLowerCase() : "";
  const isGreen = normalizedType === "found" || normalizedType === "approved";

  return (
    <div style={{
      padding: "6px 12px", borderRadius: 8,
      background: isGreen ? "var(--color-success-bg, #ecfdf5)" : "var(--color-info-bg, #eff6ff)",
      color: isGreen ? "var(--color-success, #059669)" : "var(--color-info, #2563eb)",
      fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em",
      border: `1px solid ${isGreen ? "var(--color-success-border, #d1fae5)" : "var(--color-info-border, #dbeafe)"}`,
    }}>
      {label}
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