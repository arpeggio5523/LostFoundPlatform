import { useNavigate, useLocation } from "react-router-dom";
import {Home, Search, FileText, MessageSquare, User} from "lucide-react";

const NAV_ITEMS = [
  { label: "Home",        path: "/",            icon: Home },
  { label: "Lost Items",  path: "/lost-items",  icon: Search },
  { label: "Found Items", path: "/found-items", icon: FileText },
  { label: "Messages",    path: "/messages",    icon: MessageSquare },
  { label: "Profile",     path: "/profile",     icon: User },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="fixed bottom-0 left-0 top-20 z-40 flex min-h-screen w-[250px] flex-col border-r border-gray-100 bg-white py-5">

    {/* Nav links */}
    <nav className="px-3">
      {NAV_ITEMS.map(({ label, path, icon: Icon }) => {
        const isActive = location.pathname === path;
        return (
          <button
            key={label}
            onClick={() => navigate(path)}
            className={`mb-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${
                isActive
                  ? "bg-gray-100 font-semibold text-black"
                  : "text-gray-600 hover:bg-gray-50"
            }`}
          >
              <Icon size={22} strokeWidth={2} />
              {label}
          </button>
        );
      })}
    </nav>

    {/* Bottom actions */}
    <div className="mt-1 px-3 pt-4">
      <div className="mb-4 border-t border-gray-200"></div>
      <button
        onClick={() => navigate("/report-lost")}
        className = "mb-2 flex w-full items-center gap-3 rounded-lg bg-gray-950 px-3 py-2 text-left text-sm font-semibold text-white transition hover:bg-gray-800"
      >
        <span className="text-base leading-none">+</span>
        Report Lost Item
      </button>
      <button
        onClick={() => navigate("/report-found")}
        className = "mb-2 flex w-full border border-gray-300 items-center gap-3 rounded-lg bg-transparent px-3 py-2 text-left text-sm font-semibold text-blacke transition hover:bg-gray-100"
      >
        <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Report Found Item
      </button>
      </div>
    </aside>
  );
}