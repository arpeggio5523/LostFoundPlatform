import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, CheckCircle2, Clock3, FileText, RefreshCw, Trash2, XCircle } from "lucide-react";
import Sidebar from "../components/Sidebar";
// import { apiFetch } from "../services/apiClient";/
import { clearAuth, getAuthUser } from "../services/authState";
import { useTheme } from "../context/ThemeContext";

const STATUS_CARDS = [
  { key: "pending", label: "Pending", icon: Clock3, color: "#b45309", background: "#fef3c7" },
  { key: "approved", label: "Approved", icon: CheckCircle2, color: "#047857", background: "#d1fae5" },
  { key: "rejected", label: "Rejected", icon: XCircle, color: "#b91c1c", background: "#fee2e2" },
  { key: "deleted", label: "Deleted", icon: Trash2, color: "#6b7280", background: "#f3f4f6" },
];

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const { resetTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const user = getAuthUser();
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (user.role !== "Admin") navigate("/dashboard", { replace: true });
  }, [navigate]);



  const handleLogout = () => {
    resetTheme();
    clearAuth();
    navigate("/login", { replace: true });
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-bg-base)" }}>
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main style={{ marginLeft: isCollapsed ? 70 : 220, transition: "margin-left 0.3s ease", flex: 1, padding: "36px 40px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <header style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "flex-start", marginBottom: 32 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--color-brand)", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}><Activity size={16} /> Platform overview</div>
              <h1 style={{ margin: "8px 0 4px", fontSize: 32, fontWeight: 800, color: "var(--color-text-primary)" }}>Analytics dashboard</h1>
              <p style={{ margin: 0, color: "var(--color-text-secondary)", fontSize: 14 }}>Monitor reporting activity and moderation outcomes.</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {lastUpdated && <span style={{ color: "var(--color-text-muted)", fontSize: 12 }}>Updated {lastUpdated.toLocaleTimeString()}</span>}
              <button onClick={() => window.location.reload()} title="Refresh analytics" aria-label="Refresh analytics" style={{ border: "1px solid var(--color-border)", borderRadius: 10, background: "var(--color-bg-surface)", color: "var(--color-text-primary)", padding: 10, cursor: "pointer" }}><RefreshCw size={17} /></button>
              <button onClick={handleLogout} style={{ border: "none", borderRadius: 10, background: "#064e3b", color: "white", padding: "11px 18px", fontWeight: 700, cursor: "pointer" }}>Logout</button>
            </div>
          </header>

          {error && <div style={{ marginBottom: 24, padding: 16, borderRadius: 12, background: "#fee2e2", color: "#991b1b" }}>{error}</div>}
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 16, marginBottom: 28 }}>
            <MetricCard label="Total posts" value={analytics?.totalPosts} icon={<FileText size={20} />} accent="var(--color-brand)" loading={loading} />
            <MetricCard label="Lost posts" value={analytics?.lostPosts} icon={<FileText size={20} />} accent="#c2410c" loading={loading} />
            <MetricCard label="Found posts" value={analytics?.foundPosts} icon={<CheckCircle2 size={20} />} accent="#047857" loading={loading} />
          </section>

          <section style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border)", borderRadius: 20, padding: 24 }}>
            <h2 style={{ margin: 0, fontSize: 20, color: "var(--color-text-primary)" }}>Post statistics</h2>
            <p style={{ margin: "5px 0 20px", fontSize: 13, color: "var(--color-text-secondary)" }}>Current moderation status across all submitted posts.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12 }}>
              {STATUS_CARDS.map(({ key, label, icon: Icon, color, background }) => (
                <div key={key} style={{ border: "1px solid var(--color-border)", borderRadius: 14, padding: 16, background: "var(--color-bg-raised)" }}>
                  <div style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, color, background, marginBottom: 18 }}><Icon size={19} /></div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "var(--color-text-primary)" }}>{loading ? "-" : analytics?.statuses?.[key] ?? 0}</div>
                  <div style={{ marginTop: 3, fontSize: 13, color: "var(--color-text-secondary)" }}>{label}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function MetricCard({ label, value, icon, accent, loading }) {
  return (
    <div style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border)", borderRadius: 18, padding: 20, boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: accent }}><span style={{ fontSize: 13, fontWeight: 700 }}>{label}</span>{icon}</div>
      <div style={{ marginTop: 18, fontSize: 38, lineHeight: 1, fontWeight: 800, color: "var(--color-text-primary)" }}>{loading ? "-" : value ?? 0}</div>
    </div>
  );
}