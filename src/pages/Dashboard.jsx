import { useLanguage } from "../context/LanguageContext";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { LogOut, Search, PlusCircle, List, ArrowRight } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { getAuthUser, clearAuth } from "../services/authState";

export default function Dashboard() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { resetTheme } = useTheme();

  const handleLogout = () => {
    resetTheme();
    clearAuth();
    navigate("/login", { replace: true });
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
              >{t("Dashboard")}</h1>

              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: 14,
                  color: "var(--color-text-secondary)",
                }}
              >{t("Manage your reports, help the community, and find what you've lost.")}</p>
            </div>
            
            <button
              onClick={handleLogout}
              className="group flex items-center gap-2 bg-[#064e3b] hover:bg-[#022c22] text-white rounded-xl px-6 py-3 font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <LogOut size={18} className="text-white/80 group-hover:text-white transition-colors" />{t("Logout")}</button>
          </div>

          {/* Primary Actions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Card 1: Report Lost */}
            <div 
              onClick={() => navigate("/report-lost")}
              className="group relative overflow-hidden bg-gradient-to-br from-[var(--color-bg-surface)] to-[var(--color-bg-raised)] border border-[var(--color-border)] rounded-3xl p-8 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-[var(--color-brand)]/5 hover:-translate-y-1"
            >
              <div className="absolute -top-6 -right-6 p-8 opacity-[0.03] dark:opacity-5 group-hover:opacity-[0.06] dark:group-hover:opacity-10 transition-all group-hover:scale-110 duration-500 text-[var(--color-text-primary)]">
                <Search size={180} />
              </div>
              <div className="relative z-10">
                <div className="h-14 w-14 rounded-2xl bg-[var(--color-brand-active-bg)] text-[var(--color-brand)] flex items-center justify-center mb-6 shadow-sm">
                  <Search size={28} strokeWidth={2.5} />
                </div>
                <h2 className="text-2xl font-bold mb-3 text-[var(--color-text-primary)]">{t("I lost something")}</h2>
                <p className="text-[var(--color-text-secondary)] mb-8 max-w-sm">{t("Create a report with details of your missing item so the community can keep an eye out for it.")}</p>
                <div className="flex items-center text-[var(--color-brand)] font-semibold gap-2 group-hover:gap-4 transition-all bg-[var(--color-brand)]/10 w-max px-4 py-2 rounded-lg">{t("Report Lost Item ")}<ArrowRight size={18} />
                </div>
              </div>
            </div>

            {/* Card 2: Report Found */}
            <div 
              onClick={() => navigate("/report-found")}
              className="group relative overflow-hidden bg-gradient-to-br from-[var(--color-bg-surface)] to-[var(--color-bg-raised)] border border-[var(--color-border)] rounded-3xl p-8 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-[var(--color-brand)]/5 hover:-translate-y-1"
            >
              <div className="absolute -top-6 -right-6 p-8 opacity-[0.03] dark:opacity-5 group-hover:opacity-[0.06] dark:group-hover:opacity-10 transition-all group-hover:scale-110 duration-500 text-[var(--color-text-primary)]">
                <PlusCircle size={180} />
              </div>
              <div className="relative z-10">
                <div className="h-14 w-14 rounded-2xl bg-[var(--color-brand-active-bg)] text-[var(--color-brand)] flex items-center justify-center mb-6 shadow-sm">
                  <PlusCircle size={28} strokeWidth={2.5} />
                </div>
                <h2 className="text-2xl font-bold mb-3 text-[var(--color-text-primary)]">{t("I found something")}</h2>
                <p className="text-[var(--color-text-secondary)] mb-8 max-w-sm">{t("Report an item you discovered on campus to help reunite it with its rightful owner safely.")}</p>
                <div className="flex items-center text-[var(--color-brand)] font-semibold gap-2 group-hover:gap-4 transition-all bg-[var(--color-brand)]/10 w-max px-4 py-2 rounded-lg">{t("Report Found Item ")}<ArrowRight size={18} />
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Action: Browse */}
          <div 
            onClick={() => navigate("/found-items")}
            className="group flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-3xl p-6 sm:p-8 cursor-pointer transition-all duration-300 hover:border-[var(--color-brand)] hover:shadow-md"
          >
            <div className="flex items-center gap-6 mb-6 sm:mb-0">
              <div className="h-14 w-14 rounded-full bg-[var(--color-bg-raised)] text-[var(--color-text-primary)] flex items-center justify-center shrink-0 group-hover:bg-[var(--color-brand)] group-hover:text-white transition-colors duration-300">
                <List size={26} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--color-text-primary)]">{t("Browse all found listings")}</h3>
                <p className="text-[var(--color-text-secondary)] mt-1">{t("Search through recent community discoveries to see if your item was found.")}</p>
              </div>
            </div>
            <button className="w-full sm:w-auto bg-[var(--color-brand)] text-[var(--color-brand-text)] px-8 py-3.5 rounded-xl font-bold hover:opacity-90 transition-opacity whitespace-nowrap">{t("View Database")}</button>
          </div>

          {/* How It Works (Minimal Version) */}
          <div className="pt-10 pb-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px bg-[var(--color-border)] flex-1"></div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] text-center">{t("How the process works")}</h3>
              <div className="h-px bg-[var(--color-border)] flex-1"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Decorative line behind steps (visible only on md+) */}
              <div className="hidden md:block absolute top-6 left-1/6 right-1/6 h-[2px] bg-[var(--color-border)] -z-10 opacity-50"></div>

              <div className="flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-[var(--color-bg-surface)] border-2 border-[var(--color-border)] text-[var(--color-text-primary)] flex items-center justify-center font-bold text-lg mb-5 shadow-sm transition-transform hover:scale-110 duration-200">
                  1
                </div>
                <h4 className="font-bold text-lg text-[var(--color-text-primary)] mb-2">{t("Report")}</h4>
                <p className="text-sm text-[var(--color-text-secondary)] max-w-[220px]">{t("Submit a detailed report of the item you lost or found.")}</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-[var(--color-bg-surface)] border-2 border-[var(--color-brand)] text-[var(--color-brand)] flex items-center justify-center font-bold text-lg mb-5 shadow-md shadow-[var(--color-brand)]/20 transition-transform hover:scale-110 duration-200">
                  2
                </div>
                <h4 className="font-bold text-lg text-[var(--color-text-primary)] mb-2">{t("Match")}</h4>
                <p className="text-sm text-[var(--color-text-secondary)] max-w-[220px]">{t("Our community browses the database to find matching items.")}</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-[var(--color-bg-surface)] border-2 border-[var(--color-border)] text-[var(--color-text-primary)] flex items-center justify-center font-bold text-lg mb-5 shadow-sm transition-transform hover:scale-110 duration-200">
                  3
                </div>
                <h4 className="font-bold text-lg text-[var(--color-text-primary)] mb-2">{t("Connect")}</h4>
                <p className="text-sm text-[var(--color-text-secondary)] max-w-[220px]">{t("Contact the owner directly via email to arrange a safe return.")}</p>
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}