
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Sidebar from "../components/Sidebar";
// import { getAuthUser } from "../services/authState";
// import { buildApiUrl, authHeaders } from "../services/apiClient";

// function ProfilePage() {
//   const navigate = useNavigate();
//   const currentUser = getAuthUser();
//   const [userPosts, setUserPosts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetch(buildApiUrl("/api/items/my"), { headers: authHeaders() })
//       .then((res) => res.json())
//       .then((data) => setUserPosts(Array.isArray(data.data) ? data.data : []))
//       .catch(() => setUserPosts([]))
//       .finally(() => setLoading(false));
//   }, []);

//   const lostPosts     = userPosts.filter((i) => i.type === "Lost");
//   const foundPosts    = userPosts.filter((i) => i.type === "Found");
//   const returnedPosts = userPosts.filter((i) => i.status === "Returned");

//   const statusStyle = (status) => {
//     switch (status) {
//       case "Approved": return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
//       case "Pending":  return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
//       case "Matched":  return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
//       case "Returned": return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
//       default:         return "bg-gray-100 text-gray-500";
//     }
//   };

//   return (
//     <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
//       <Sidebar />

//       <main style={{ marginLeft: 220, flex: 1, padding: "36px 40px" }}>
//         <h1 className="mb-8 text-3xl font-semibold text-gray-900 dark:text-white">
//           My Profile
//         </h1>

//         <div className="grid gap-6" style={{ gridTemplateColumns: "280px minmax(0,1fr)" }}>

//           {/* ── Left column ── */}
//           <div className="flex flex-col gap-4">

//             {/* Profile card */}
//             <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-sm text-center">
//               <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-3xl font-semibold text-blue-600 dark:text-blue-300 mx-auto mb-3">
//                 {currentUser?.name?.[0]?.toUpperCase() ?? "?"}
//               </div>
//               <h2 className="text-base font-medium text-gray-900 dark:text-white">
//                 {currentUser?.name ?? "—"}
//               </h2>
//               <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
//                 {currentUser?.email ?? "—"}
//               </p>

//               <div className="border-t border-gray-200 dark:border-gray-700 pt-4 text-left space-y-3">
//                 {[
//                   { icon: "✉", label: currentUser?.email ?? "—" },
//                   { icon: "📞", label: currentUser?.phone ?? "—" },
//                   { icon: "👤", label: currentUser?.role ?? "Student" },
//                   { icon: "📅", label: currentUser?.joinedDate
//                       ? `Joined ${currentUser.joinedDate}`
//                       : currentUser?.createdAt
//                       ? `Joined ${new Date(currentUser.createdAt).toLocaleDateString("en-MY", { month: "short", year: "numeric" })}`
//                       : "—"
//                   },
//                 ].map(({ icon, label }) => (
//                   <div key={label} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
//                     <span>{icon}</span>
//                     <span className="truncate">{label}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Settings button */}
//             <button
//               onClick={() => navigate("/profile/settings")}
//               className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
//             >
//               ⚙ Settings
//             </button>

//             {/* Statistics card */}
//             <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
//               <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
//                 Statistics
//               </h3>
//               {[
//                 { label: "Total Posts",  value: userPosts.length },
//                 { label: "Lost Items",   value: lostPosts.length },
//                 { label: "Found Items",  value: foundPosts.length },
//                 { label: "Returned",     value: returnedPosts.length, green: true },
//               ].map(({ label, value, green }) => (
//                 <div
//                   key={label}
//                   className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0 text-sm"
//                 >
//                   <span className="text-gray-500 dark:text-gray-400">{label}</span>
//                   <span className={`font-medium ${green ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-white"}`}>
//                     {loading ? "…" : value}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* ── Right column — My Posts ── */}
//           <div>
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-sm font-medium text-gray-900 dark:text-white">My Posts</h3>
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => navigate("/report-lost")}
//                   className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 transition"
//                 >
//                   + Lost Item
//                 </button>
//                 <button
//                   onClick={() => navigate("/report-found")}
//                   className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
//                 >
//                   + Found Item
//                 </button>
//               </div>
//             </div>

//             {loading && (
//               <p className="text-sm text-gray-400 dark:text-gray-500">Loading your posts…</p>
//             )}

//             {!loading && userPosts.length === 0 && (
//               <p className="text-sm text-gray-400 dark:text-gray-500">
//                 No posts yet. Report a lost or found item to get started.
//               </p>
//             )}

//             <div className="flex flex-col gap-3">
//               {userPosts.map((item) => (
//                 <div
//                   key={item._id}
//                   // onClick={() => navigate(`/items/${item._id}`)}
//                   onClick={() => navigate(`/item/${item._id}`)}
//                   className="flex gap-4 items-start p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition"
//                 >
//                   {/* Thumbnail or placeholder */}
//                   <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 text-lg flex-shrink-0">
//                     {item.images?.[0]
//                       ? <img src={item.images[0]} alt="" className="h-10 w-10 rounded-full object-cover" />
//                       : "📦"
//                     }
//                   </div>

//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-center justify-between gap-2 mb-1">
//                       <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
//                         {item.title}
//                       </span>
//                       <span className={`text-xs px-2 py-0.5 rounded-md font-medium flex-shrink-0 ${statusStyle(item.status)}`}>
//                         {item.status}
//                       </span>
//                     </div>

//                     <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-2">
//                       {item.description}
//                     </p>

//                     <div className="flex items-center gap-2 flex-wrap">
//                       <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${
//                         item.type === "Lost"
//                           ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
//                           : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
//                       }`}>
//                         {item.type}
//                       </span>
//                       <span className="text-xs text-gray-400 dark:text-gray-500 truncate">
//                         {item.location}
//                       </span>
//                       <span className="text-xs text-gray-400 dark:text-gray-500">
//                         {new Date(item.date).toLocaleDateString("en-MY", {
//                           day: "numeric", month: "short", year: "numeric"
//                         })}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//         </div>
//       </main>
//     </div>
//   );
// }

// export default ProfilePage;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { getAuthUser } from "../services/authState";
import { buildApiUrl, authHeaders } from "../services/apiClient";


function ProfilePage() {
  const navigate = useNavigate();
  const currentUser = getAuthUser();

  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch(buildApiUrl("/api/items/my"), { headers: authHeaders() })
      .then((res) => res.json())
      .then((data) => setUserPosts(Array.isArray(data.data) ? data.data : []))
      .catch(() => setUserPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const lostPosts = userPosts.filter((i) => i.type === "Lost");
  const foundPosts = userPosts.filter((i) => i.type === "Found");
  const returnedPosts = userPosts.filter((i) => i.status === "Returned");

  const statusStyle = (status) => {
    switch (status) {
      case "Approved":
        return "bg-[var(--color-bg-raised)] text-[var(--color-text-primary)]";
      case "Pending":
        return "bg-[var(--color-bg-raised)] text-[var(--color-text-secondary)]";
      case "Matched":
        return "bg-[var(--color-bg-raised)] text-[var(--color-brand)]";
      case "Returned":
        return "bg-[var(--color-bg-raised)] text-[var(--color-text-muted)]";
      default:
        return "bg-[var(--color-bg-raised)] text-[var(--color-text-secondary)]";
    }
  };

  const userName = currentUser?.fullName || "Unknown User";
  const userInitial = userName.charAt(0).toUpperCase();

  return (

 <div className="flex min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)]">
      <Sidebar />

      <main style={{ marginLeft: 220, flex: 1, padding: "36px 40px" }}>
        {/* Header */}
        <h1 className="mb-8 text-3xl font-semibold">My Profile</h1>

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
                    label: currentUser?.phone || "—",
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

                      <span
                        className={`text-xs px-2 py-0.5 rounded-md font-medium ${statusStyle(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
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

