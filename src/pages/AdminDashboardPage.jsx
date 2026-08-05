import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { LogOut, Users, FileText, Search, Trophy, ArrowRight, TrendingUp} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { getAuthUser, clearAuth } from "../services/authState";
import ModerationItemCard from "../components/ModerationItemCard";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [moderationTab, setModerationTab] = useState("pending");
  const { resetTheme } = useTheme();

  const handleLogout = () => {
    resetTheme();
    clearAuth();
    navigate("/login", { replace: true });
  };

  const totalUsers = 7;
  const lostItems = 4;
  const foundItems = 2;
  const totalItems = lostItems + foundItems;
  const returnedItems =5;
  const successRate = totalItems === 0 ? 0 : Math.round((returnedItems / totalItems) * 100);

  const pendingPost = 3;
  const approvedPost = 5;

  {/* Test data */}
  const moderationItems = [
  {
    id: 1,
    type: "Lost",
    status: "Approved",
    title: "Silver Laptop - MacBook Pro",
    description: 'Lost my MacBook Pro 16" with stickers on the lid. Contains important work files.',
    author: "David Chen",
    location: "Multimedia University (MMU) Library",
    date: "Apr 4, 2026",
  },
  {
    id: 2,
    type: "Found",
    status: "Matched",
    title: "Student ID Card",
    description: "Found a student ID card for Emily Watson.",
    author: "John Doe",
    location: "Universiti Putra Malaysia (UPM) Central Library",
    date: "Apr 4, 2026",
  },
  ];

  const displayedItems = moderationItems.filter((item) => {
    if (moderationTab.toLowerCase() === "pending") {
      return item.status === "Pending";
    }

    if (moderationTab.toLowerCase() === "approved") {
      return item.status === "Approved";
    }

    return true;
  });

  const emptyMessage =
    moderationTab === "approved"
      ? "There is no approved post."
      : moderationTab === "pending"
      ? "There is no pending post."
      : "There are no items.";

  const handleApprove = (id) => {
    console.log("Approved item:", id);
  };

  const handleReject = (id) => {
    console.log("Rejected item:", id);
  };

  const handleViewDetails = (id) => {
    console.log("View details:", id);
  };

  useEffect(() => {
    const user = getAuthUser();

    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="flex min-h-screen bg-[var(--color-bg-base)] transition-colors duration-200 font-sans">
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
      />

      {/* Main Content */}
      <main 
        className="flex-1 p-6 md:p-12 overflow-y-auto transition-[margin] duration-300 ease-in-out"
        style={{ marginLeft: isCollapsed ? 70 : 220 }}
      >
        <div className="max-w-6xl mx-auto space-y-10">
          
          {/* Header with Title and Logout */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: 28,
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
            
            <button
              onClick={handleLogout}
              className="group flex items-center gap-2 bg-[#064e3b] hover:bg-[#022c22] text-white rounded-xl px-6 py-3 font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <LogOut size={18} className="text-white/80 group-hover:text-white transition-colors" />
              Logout
            </button>
          </div>

          {/* Primary Actions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            
            {/* Card 1: Report Lost */}
            <div 
              className="group relative overflow-hidden bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-3xl p-8 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-[var(--color-brand)]/5 hover:-translate-y-1 h-[150px]"
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
              className="group relative overflow-hidden bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-3xl p-8 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-[var(--color-brand)]/5 hover:-translate-y-1 h-[150px]"
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
              className="group relative overflow-hidden bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-3xl p-8 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-[var(--color-brand)]/5 hover:-translate-y-1 h-[150px]"
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
              className="group relative overflow-hidden bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-3xl p-8 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-[var(--color-brand)]/5 hover:-translate-y-1 h-[150px]"
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
            className="group bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-3xl p-6 sm:p-8 cursor-pointer transition-all duration-300"
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
        
        </div>
      </main>
    </div>
  );
}