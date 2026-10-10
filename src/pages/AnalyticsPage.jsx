import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, CheckCircle2, Clock3, FileText, RefreshCw, Trash2, XCircle } from "lucide-react";
import Sidebar from "../components/Sidebar";
import NotificationButton from "../components/NotificationButton";
import { apiFetch } from "../services/apiClient";
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

  useEffect(() => {
    let active = true;

    const fetchAnalytics = async () => {
      try {
        const response = await apiFetch("/api/analytics");
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(result.message || result.error || "Unable to load analytics.");
        }

        if (active) {
          setAnalytics(result.data);
          setLastUpdated(new Date());
          setError("");
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchAnalytics();
    const refreshTimer = window.setInterval(fetchAnalytics, 30000);

    return () => {
      active = false;
      window.clearInterval(refreshTimer);
    };
  }, []);

  const handleLogout = () => {
    resetTheme();
    clearAuth();
    navigate("/login", { replace: true });
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await apiFetch("/api/analytics");
      const result = await response.json();
      if (response.ok) {
        setAnalytics(result.data);
        setLastUpdated(new Date());
        setError("");
      } else {
        throw new Error(result.message || "Failed to refresh");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-bg-base)" }}>
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main style={{ marginLeft: isCollapsed ? 70 : 220, transition: "margin-left 0.3s ease", flex: 1, padding: "36px 40px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <header style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "flex-start", marginBottom: 32 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--color-brand)", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}><Activity size={16} /> Analytics</div>
              <h1 style={{ margin: "8px 0 4px", fontSize: 32, fontWeight: 800, color: "var(--color-text-primary)" }}>Dashboard</h1>
              <p style={{ margin: 0, color: "var(--color-text-secondary)", fontSize: 14 }}>Monitor reporting activity and moderation status.</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <NotificationButton />
              {lastUpdated && <span style={{ color: "var(--color-text-muted)", fontSize: 12 }}>Updated {lastUpdated.toLocaleTimeString()}</span>}
              <button onClick={handleRefresh} disabled={loading} title="Refresh analytics" style={{ border: "1px solid var(--color-border)", borderRadius: 10, background: "var(--color-bg-surface)", color: "var(--color-text-primary)", padding: 10, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}><RefreshCw size={17} style={{ animation: loading ? "spin 0.6s linear infinite" : "none" }} /></button>
              <button onClick={handleLogout} style={{ border: "none", borderRadius: 10, background: "#064e3b", color: "white", padding: "11px 18px", fontWeight: 700, cursor: "pointer" }}>Logout</button>
            </div>
          </header>

          {error && <div style={{ marginBottom: 24, padding: 16, borderRadius: 12, background: "#fee2e2", color: "#991b1b" }}>{error}</div>}
          <section style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border)", borderRadius: 20, padding: 24, marginTop: 28 }}>
            <h2 style={{ margin: 0, fontSize: 20, color: "var(--color-text-primary)", marginBottom: 4 }}>Posts statistics</h2>
            <p style={{ margin: "0 0 24px", fontSize: 13, color: "var(--color-text-secondary)" }}>Total posts and type breakdown</p>
            <TypeBarChart data={analytics} loading={loading} />
          </section>
          
          <section style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border)", borderRadius: 20, padding: 24, marginTop: 28 }}>
            <h2 style={{ margin: 0, fontSize: 20, color: "var(--color-text-primary)", marginBottom: 4 }}>Moderation status</h2>
            <p style={{ margin: "0 0 24px", fontSize: 13, color: "var(--color-text-secondary)" }}>Current status distribution across all posts</p>
            <StatusBarChart data={analytics?.statuses} loading={loading} />
          </section>

          
        </div>
      </main>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
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

function StatusBarChart({ data, loading }) {
  if (loading) {
    return <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)" }}>Loading chart...</div>;
  }

  if (!data) {
    return <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)" }}>No data available</div>;
  }

  const statuses = [
    { label: "Pending", value: data.pending || 0, color: "#b45309" },
    { label: "Approved", value: data.approved || 0, color: "#047857" },
    { label: "Rejected", value: data.rejected || 0, color: "#b91c1c" },
    { label: "Deleted", value: data.deleted || 0, color: "#6b7280" },
  ];

  const maxValue = Math.max(...statuses.map(s => s.value), 1);

  return (
    <div style={{ width: "100%", minHeight: 300 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, alignItems: "flex-end", height: 240 }}>
        {statuses.map((status) => {
          const percentage = (status.value / maxValue) * 100;
          return (
            <div key={status.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
              <div
                style={{
                  width: "100%",
                  height: `${percentage}%`,
                  minHeight: 10,
                  background: status.color,
                  borderRadius: "6px",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.7";
                  e.currentTarget.style.transform = "scaleY(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.transform = "scaleY(1)";
                }}
              />
            </div>
          );
        })}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginTop: 16 }}>
        {statuses.map((status) => (
          <div key={status.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>{status.label}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)", marginTop: 6 }}>{status.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TypeBarChart({ data, loading }) {
  if (loading) {
    return <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)" }}>Loading chart...</div>;
  }

  if (!data) {
    return <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)" }}>No data available</div>;
  }

  const lostPosts = data.lostPosts || 0;
  const foundPosts = data.foundPosts || 0;
  const totalPosts = lostPosts + foundPosts;

  const types = [
    { label: "Total Posts", value: totalPosts, color: "#3b82f6" },
    { label: "Lost Items", value: lostPosts, color: "#dc2626" },
    { label: "Found Items", value: foundPosts, color: "#10b981" },
  ];

  const maxValue = Math.max(...types.map(t => t.value), 1);

  return (
    <div style={{ width: "100%", minHeight: 300 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 30, alignItems: "flex-end", height: 240, maxWidth: 500, margin: "0 auto" }}>
        {types.map((type) => {
          const percentage = (type.value / maxValue) * 100;
          return (
            <div key={type.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
              <div
                style={{
                  width: "100%",
                  height: `${percentage}%`,
                  minHeight: 10,
                  background: type.color,
                  borderRadius: "6px",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.7";
                  e.currentTarget.style.transform = "scaleY(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.transform = "scaleY(1)";
                }}
              />
            </div>
          );
        })}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 30, marginTop: 16, maxWidth: 500, margin: "16px auto 0" }}>
        {types.map((type) => (
          <div key={type.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)" }}>{type.label}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)", marginTop: 6 }}>{type.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
