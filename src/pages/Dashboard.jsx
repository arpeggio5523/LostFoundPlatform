import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { LogOut } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { clearAuth } from "../services/authState";

export default function Dashboard() {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { resetTheme } = useTheme();

  const handleLogout = () => {
    resetTheme();
    clearAuth();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-bg-base)] transition-colors duration-200 font-sans">
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
      />

      {/* Main Content */}
      <main 
        className="flex-1 p-8 overflow-y-auto transition-[margin] duration-300 ease-in-out"
        style={{ marginLeft: isCollapsed ? 70 : 220 }}
      >
        
        {/* Header with Title and Logout */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold text-[var(--color-text-primary)]">
              Welcome to Your LostFound MY Dashboard
            </h1>
            <p className="text-[var(--color-text-secondary)] mt-2">
              Connecting you to your lost property and helping others find theirs.
            </p>
          </div>
          
          <div className="flex gap-3 items-center">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-[#064e3b] hover:bg-[#022c22] text-white border-none rounded-xl px-5 py-3 font-bold text-sm cursor-pointer transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>

        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm p-8 text-center transition-colors duration-200">
            <h2 className="text-2xl font-bold mb-4 text-[var(--color-text-primary)]">
              Report Lost Item
            </h2>

            <p className="text-[var(--color-text-secondary)] mb-8">
              Post details about what you've lost so the community can help you
              find it.
            </p>

            <button
              onClick={() => navigate("/report-lost")}
              className="flex items-center justify-center gap-2 mx-auto bg-[var(--color-brand)] text-[var(--color-brand-text)] rounded-xl px-5 py-3 font-bold text-sm hover:opacity-90 cursor-pointer transition-opacity"
            >
              <span className="text-lg leading-none">+</span>
              Report Lost Item
            </button>
          </div>

          {/* Card 2 */}
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm p-8 text-center transition-colors duration-200">
            <h2 className="text-2xl font-bold mb-4 text-[var(--color-text-primary)]">
              Found an Item?
            </h2>

            <p className="text-[var(--color-text-secondary)] mb-8">
              Found something on campus? Report it to help it get back to its
              owner.
            </p>

            <button
              onClick={() => navigate("/report-found")}
              className="flex items-center justify-center gap-2 mx-auto bg-[var(--color-brand)] text-[var(--color-brand-text)] rounded-xl px-5 py-3 font-bold text-sm hover:opacity-90 cursor-pointer transition-opacity"
            >
              <span className="text-lg leading-none">+</span>
              Report Found Item
            </button>
          </div>

          {/* Card 3 */}
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm p-8 text-center transition-colors duration-200">
            <h2 className="text-2xl font-bold mb-4 text-[var(--color-text-primary)]">
              Browse Found Listings
            </h2>

            <p className="text-[var(--color-text-secondary)] mb-8">
              Search the latest community reports for items matching what you've
              lost.
            </p>

            <button
              onClick={() => navigate("/found-items")}
              className="bg-[var(--color-brand)] text-[var(--color-brand-text)] rounded-xl px-5 py-3 font-bold text-sm hover:opacity-90 cursor-pointer transition-opacity border-none"
            >
              Go to Found Item List
            </button>
          </div>
        </div>

        {/* How It Works */}
        <section className="mt-12 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm p-10 max-w-4xl mx-auto transition-colors duration-200">
          <h2 className="text-3xl font-bold text-center mb-10 text-[var(--color-text-primary)]">
            How LostFound MY Works
          </h2>

          <div className="flex flex-col md:flex-row items-center pt-6 justify-center gap-6">
            
            <div className="text-center">
              <div className="w-20 h-20 bg-[var(--color-brand-active-bg)] text-[var(--color-brand)] rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>

              <p className="font-semibold text-lg text-[var(--color-text-primary)]">Report</p>
            </div>

            <div className="hidden md:flex items-center text-[var(--color-border)] text-4xl">
              →
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-[var(--color-brand-active-bg)] text-[var(--color-brand)] rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>

              <p className="font-semibold text-lg text-[var(--color-text-primary)]">Match</p>
            </div>

            <div className="hidden md:flex items-center text-[var(--color-border)] text-4xl">
              →
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-[var(--color-brand-active-bg)] text-[var(--color-brand)] rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>

              <p className="font-semibold text-lg text-[var(--color-text-primary)]">Connect</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}