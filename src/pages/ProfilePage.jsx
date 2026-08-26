import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { getAuthUser, clearAuth } from "../services/authState";
import { buildApiUrl, authHeaders, apiFetch } from "../services/apiClient";
import { LogOut } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import StatusBadge from "../components/StatusBadge";


function ProfilePage() {
  const navigate = useNavigate();
  const { resetTheme } = useTheme();

  const handleLogout = () => {
    resetTheme();
    clearAuth();
    navigate("/login", { replace: true });
  };
  const currentUser = getAuthUser();
  console.log("currentUser:", currentUser);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const user = getAuthUser();

    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    apiFetch("/api/items/my")
      .then((res) => res.json())
      .then((data) => setUserPosts(Array.isArray(data.data) ? data.data : []))
      .catch(() => setUserPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const lostPosts = userPosts.filter((i) => i.type === "Lost");
  const foundPosts = userPosts.filter((i) => i.type === "Found");
  const returnedPosts = userPosts.filter((i) => i.status === "Returned");

  const userName = currentUser?.fullName || "Unknown User";
  const userInitial = userName.charAt(0).toUpperCase();

  return (

 <div className="flex min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)]">
      <Sidebar />

      <main style={{ marginLeft: 220, flex: 1, padding: "36px 40px" }}>
        {/* Header */}
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
              My Profile
            </h1>

            <p
              style={{
                margin: "4px 0 0",
                fontSize: 14,
                color: "var(--color-text-secondary)",
              }}
            >
              View and manage your account information and activity
            </p>
          </div>
        </div>

        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: "280px minmax(0,1fr)" }}
        >
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-4">

            {/* Profile card */}
            <div className="rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] p-6 text-center">

              {/* Avatar */}
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-brand-active-bg)] text-[var(--color-brand)] text-3xl font-bold mx-auto mb-3">
                {userInitial}
              </div>

              {/* Name */}
              <h2 className="text-base font-medium">
                {userName}
              </h2>

              {/* Email */}
              <p className="text-sm text-[var(--color-text-secondary)] mb-5">
                {currentUser?.email || "—"}
              </p>

              {/* Info list (FIXED KEYS HERE) */}
              <div className="border-t border-[var(--color-border)] pt-4 text-left space-y-3">

                {[
                  {
                    id: "email",
                    icon: "✉",
                    label: currentUser?.email || "—",
                  },
                  {
                    id: "phone",
                    icon: "📞",
                    label: currentUser?.phoneNumber || "—",
                  },
                  {
                    id: "role",
                    icon: "👤",
                    label: currentUser?.role || "Student",
                  },
                  {
                    id: "joined",
                    icon: "📅",
                    label: currentUser?.createdAt
                      ? `Joined ${new Date(
                          currentUser.createdAt
                        ).toLocaleDateString("en-MY", {
                          month: "short",
                          year: "numeric",
                        })}`
                      : "—",
                  },
                ].map(({ id, icon, label }) => (
                  <div
                    key={id}
                    className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]"
                  >
                    <span>{icon}</span>
                    <span className="truncate">{label}</span>
                  </div>
                ))}
              </div>
            </div>


            {/* Settings button */}
            <button
              onClick={() => navigate("/profile/settings")}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition"
            >
              ⚙ Settings
            </button>

            {/* Statistics */}
            <div className="rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] p-6 shadow-sm">
              <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-3">
                Statistics
              </h3>

              {[
                { label: "Total Posts", value: userPosts.length },
                { label: "Lost Items", value: lostPosts.length },
                { label: "Found Items", value: foundPosts.length },
                { label: "Returned", value: returnedPosts.length, highlight: true },
              ].map(({ label, value, highlight }) => (
                <div
                  key={label}
                  className="flex justify-between items-center py-2 border-b border-[var(--color-border)] last:border-0 text-sm"
                >
                  <span className="text-[var(--color-text-secondary)]">
                    {label}
                  </span>
                  <span
                    className={
                      highlight
                        ? "text-[var(--color-brand)] font-medium"
                        : "text-[var(--color-text-primary)] font-medium"
                    }
                  >
                    {loading ? "…" : value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                My Posts
              </h3>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate("/report-lost")}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[var(--color-brand)] text-[var(--color-brand-text)] hover:opacity-90 transition"
                >
                  + Lost Item
                </button>

                <button
                  onClick={() => navigate("/report-found")}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition"
                >
                  + Found Item
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-[#064e3b] text-white hover:bg-[#022c22] transition"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <p className="text-sm text-[var(--color-text-muted)]">
                Loading your posts…
              </p>
            )}

            {/* Empty */}
            {!loading && userPosts.length === 0 && (
              <p className="text-sm text-[var(--color-text-muted)]">
                No posts yet. Report a lost or found item to get started.
              </p>
            )}

            {/* Posts */}
            <div className="flex flex-col gap-3">
              {userPosts.map((item) => (
                <div
                  key={item._id}
                  onClick={() => navigate(`/item/${item._id}`)}
                  className="flex gap-4 items-start p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] cursor-pointer hover:bg-[var(--color-bg-hover)] transition"
                >
                  {/* Thumbnail */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-raised)] text-lg flex-shrink-0">
                    {item.images?.[0] ? (
                      <img
                        src={item.images[0]}
                        alt=""
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      "📦"
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                        {item.title}
                      </span>

                      <StatusBadge status={item.status} />
                    </div>

                    <p className="text-xs text-[var(--color-text-secondary)] truncate mb-2">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                          item.type === "Lost"
                            ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                            : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        }`}
                      >
                        {item.type}
                      </span>

                      <span className="text-xs text-[var(--color-text-muted)] truncate">
                        {item.location}
                      </span>

                      <span className="text-xs text-[var(--color-text-muted)]">
                        {new Date(item.date).toLocaleDateString("en-MY", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;

