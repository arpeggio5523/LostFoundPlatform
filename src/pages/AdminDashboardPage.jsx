import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import NotificationButton from "../components/NotificationButton";
import { LogOut, Users, FileText, Search, Trophy, ArrowRight, TrendingUp} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { getAuthUser, clearAuth } from "../services/authState";
import ModerationItemCard from "../components/ModerationItemCard";
import { apiFetch } from "../services/apiClient";
import { useToast } from "../context/ToastContext";

const formatModerationItem = (item) => ({
  ...item,
  id: item._id,
  author: item.reportedBy?.fullName || item.user || "Unknown user",
  image: item.images?.[0],
  date: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "",
});

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [moderationTab, setModerationTab] = useState("pending");
  const [moderationItems, setModerationItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [moderatingItem, setModeratingItem] = useState(null);
  const { resetTheme } = useTheme();
  const { showToast } = useToast();

  const handleLogout = () => {
    resetTheme();
    clearAuth();
    navigate("/login", { replace: true });
  };

  const totalUsers = 7;
  const lostItems = moderationItems.filter((item) => item.type === "Lost").length;
  const foundItems = moderationItems.filter((item) => item.type === "Found").length;
  const totalItems = lostItems + foundItems;
  const returnedItems = moderationItems.filter((item) => item.status === "Returned").length;
  const successRate = totalItems === 0 ? 0 : Math.round((returnedItems / totalItems) * 100);

  const pendingPost = moderationItems.filter((item) => item.status === "Pending").length;
  const approvedPost = moderationItems.filter((item) => item.status === "Approved").length;
  const rejectedPost = moderationItems.filter((item) => item.status === "Rejected").length;

  const displayedItems = moderationItems.filter((item) => {
    if (moderationTab.toLowerCase() === "pending") {
      return item.status === "Pending";
    }

    if (moderationTab.toLowerCase() === "approved") {
      return item.status === "Approved";
    }

    if (moderationTab.toLowerCase() === "rejected") {
      return item.status === "Rejected";
    }

    return true;
  });

  const emptyMessage =
    moderationTab === "approved"
      ? "There is no approved post."
      : moderationTab === "rejected"
      ? "There is no rejected post."
      : moderationTab === "pending"
      ? "There is no pending post."
      : "There are no items.";

  const fetchModerationItems = useCallback(async () => {
    const response = await apiFetch("/api/items");
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to load posts.");

    setModerationItems(result.data.map(formatModerationItem));
  }, []);

  const updateModerationStatus = async (id, status) => {
    setModeratingItem({ id, status });

    try {
      const response = await apiFetch(`/api/items/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || result.message || `Failed to ${status.toLowerCase()} post.`);
      }

      await fetchModerationItems();
      showToast(`Post ${status.toLowerCase()} successfully.`, "success");
    } catch (error) {
      showToast(error.message || `Failed to ${status.toLowerCase()} post.`, "error");
    } finally {
      setModeratingItem(null);
    }
  };

  const handleApprove = async (id) => {
    await updateModerationStatus(id, "Approved");
  };

  const handleReject = async (id) => {
    await updateModerationStatus(id, "Rejected");
  };

  const handleViewDetails = (id) => {
    navigate(`/item/${id}?returnTo=${encodeURIComponent("/admin-dashboard")}`);
  };

  useEffect(() => {
    const user = getAuthUser();

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (user.role !== "Admin") {
      navigate("/dashboard", { replace: true });
      return;
    }

    const loadItems = async () => {
      try {
        await fetchModerationItems();
      } catch (error) {
        showToast(error.message || "Failed to load posts.", "error");
      } finally {
        setLoadingItems(false);
      }
    };

    loadItems();
  }, [fetchModerationItems, navigate, showToast]);

  return (
    <div className="flex min-h-screen bg-[var(--color-bg-base)] transition-colors duration-200 font-sans">
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
      />

      {/* Main Content */}
      <main 
        className="flex-1 overflow-y-auto transition-[margin] duration-300 ease-in-out"
        style={{ marginLeft: isCollapsed ? 70 : 220, padding: "36px 40px" }}
      >
        <div className="space-y-7">
          
          {/* Header with Title and Logout */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 28,
                  fontWeight: 800,
                  color: "var(--color-brand)",
                  letterSpacing: "-0.02em",
                }}
              >
                Admin Dashboard
              </h1>

              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: 14,
                  color: "var(--color-text-secondary)",
                }}
              >
                Manage and moderate the plaftorm.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <NotificationButton />
              <button
                onClick={handleLogout}
                className="group flex items-center gap-2 bg-[#064e3b] hover:bg-[#022c22] text-white rounded-xl px-6 py-3 font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <LogOut size={18} className="text-white/80 group-hover:text-white transition-colors" />
                Logout
              </button>
            </div>
          </div>

          {/* Primary Actions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            
            {/* Card 1: Report Lost */}
            <div 
              className="group relative overflow-hidden bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:shadow-[var(--color-brand)]/5 hover:-translate-y-1 h-[150px]"
            >
              <div className="absolute -top-6 -right-6 p-8 opacity-[0.03] dark:opacity-5 group-hover:opacity-[0.06] dark:group-hover:opacity-10 transition-all group-hover:scale-110 duration-500 text-[var(--color-text-primary)]">
                <Users size={100} />
              </div>
              <div className="relative z-10">
                <h2 className="text-m  mb-3 text-[var(--color-text-secondary)]">Total Users</h2>
                <p className="text-2xl font-bold mb-8 max-w-sm">
                  {totalUsers}
                </p>
              </div>
            </div>

            {/* Card 2: Report Found */}
            <div 
              className="group relative overflow-hidden bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:shadow-[var(--color-brand)]/5 hover:-translate-y-1 h-[150px]"
            >
              <div className="absolute -top-6 -right-6 p-8 opacity-[0.03] dark:opacity-5 group-hover:opacity-[0.06] dark:group-hover:opacity-10 transition-all group-hover:scale-110 duration-500 text-[var(--color-text-primary)]">
                <Search size={100} />
              </div>
              <div className="relative z-10">
                <h2 className="text-m  mb-3 text-[var(--color-text-secondary)]">Lost Items</h2>
                <p className="text-2xl font-bold mb-8 max-w-sm">
                  {lostItems}
                </p>
              </div>
            </div>

            {/* Card 3: Found items */}
            <div 
              className="group relative overflow-hidden bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:shadow-[var(--color-brand)]/5 hover:-translate-y-1 h-[150px]"
            >
              <div className="absolute -top-6 -right-6 p-8 opacity-[0.03] dark:opacity-5 group-hover:opacity-[0.06] dark:group-hover:opacity-10 transition-all group-hover:scale-110 duration-500 text-[var(--color-text-primary)]">
                <FileText size={100} />
              </div>
              <div className="relative z-10">
                <h2 className="text-m  mb-3 text-[var(--color-text-secondary)]">Found Items</h2>
                <p className="text-2xl font-bold mb-8 max-w-sm">
                  {foundItems}
                </p>
              </div>
            </div>

            {/* Card 4: Returned Items */}
            <div 
              className="group relative overflow-hidden bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:shadow-[var(--color-brand)]/5 hover:-translate-y-1 h-[150px]"
            >
              <div className="absolute -top-6 -right-6 p-8 opacity-[0.03] dark:opacity-5 group-hover:opacity-[0.06] dark:group-hover:opacity-10 transition-all group-hover:scale-110 duration-500 text-[var(--color-text-primary)]">
                <TrendingUp size={100} />
              </div>
              <div className="relative z-10">
                <h2 className="text-m  mb-3 text-[var(--color-text-secondary)]">Returned Items</h2>
                <p className="text-2xl font-bold mb-8 max-w-sm">
                  {returnedItems}
                </p>
              </div>
            </div>
          </div>

          {/* Secondary Action: Success Rate */}
          <div 
            className="group bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 transition-all duration-300"
          >
            <div className="flex items-center gap-6 mb-6">
              <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 duration-300">
                <Trophy size={26} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--color-text-primary)]">Success Rate</h3>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#2f6658] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${successRate}%` }}
                />
              </div>
              <p className="text-2xl leading-none font-bold text-[var(--color-text-primary)] shrink-0 -translate-y-[2px]">
                {successRate}%
              </p>
            </div>

            <p className="text-sm text-[var(--color-text-secondary)] mt-3">
              {returnedItems} out of {totalItems} items successfully returned to owners
            </p>
          </div>
        {/* Third Action: Content Moderation */}
          <div 
            className="group bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 transition-all duration-300"
          >
            <div className="flex items-center gap-6 mb-6">
              <div>
                <h3 className="text-xl font-bold text-[var(--color-text-primary)]">Content Moderation</h3>
              </div>
            </div>

            <div className="grid grid-cols-4 bg-gray-200 rounded-2xl p-1 mb-6">
              <button
                type="button"
                onClick={() => setModerationTab("pending")}
                className={`py-1 rounded-xl text-m font-semibold transition-all duration-200 ${
                  moderationTab === "pending"
                    ? "bg-white shadow-sm text-[var(--color-text-primary)]"
                    : "text-[var(--color-text-secondary)]"
                }`}
              >
                Pending ({pendingPost})
              </button>

              <button
                type="button"
                onClick={() => setModerationTab("approved")}
                className={`py-1 rounded-xl font-semibold transition-all duration-200 ${
                  moderationTab === "approved"
                    ? "bg-white shadow-sm text-[var(--color-text-primary)]"
                    : "text-[var(--color-text-secondary)]"
                }`}
              >
                Approved ({approvedPost})
              </button>

              <button
                type="button"
                onClick={() => setModerationTab("rejected")}
                className={`py-1 rounded-xl font-semibold transition-all duration-200 ${
                  moderationTab === "rejected"
                    ? "bg-white shadow-sm text-[var(--color-text-primary)]"
                    : "text-[var(--color-text-secondary)]"
                }`}
              >
                Rejected ({rejectedPost})
              </button>

              <button
                type="button"
                onClick={() => setModerationTab("all")}
                className={`py-1 rounded-xl font-semibold transition-all duration-200 ${
                  moderationTab === "all"
                    ? "bg-white shadow-sm text-[var(--color-text-primary)]"
                    : "text-[var(--color-text-secondary)]"
                }`}
              >
                All Items ({totalItems})
              </button>
            </div>

            <div className="space-y-4">
              {loadingItems ? (
                <div className="text-center py-10 text-[var(--color-text-secondary)] font-medium">
                  Loading posts...
                </div>
              ) : displayedItems.length === 0 ? (
                <div className="text-center py-10 text-[var(--color-text-secondary)] font-medium">
                  {emptyMessage}
                </div>
              ) : (
                displayedItems.map((item) => (
                  <ModerationItemCard
                    key={item.id}
                    item={item}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onViewDetails={handleViewDetails}
                    moderationStatus={
                      moderatingItem?.id === item.id ? moderatingItem.status : null
                    }
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
