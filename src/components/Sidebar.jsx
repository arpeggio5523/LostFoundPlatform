import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Home, 
  Search, 
  FileText, 
  MessageSquare, 
  User, 
  ChevronLeft, 
  ChevronRight, 
  Plus 
} from "lucide-react";

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
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside 
      className={`fixed bottom-0 left-0 top-20 z-40 flex h-[calc(100vh-5rem)] flex-col justify-between border-r border-gray-100 bg-white py-5 transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-[70px]" : "w-[250px]"
      }`}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-2 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm hover:bg-gray-50"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Top half: Nav links */}
      <nav className="px-3 flex-1 overflow-y-auto">
        {NAV_ITEMS.map(({ label, path, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={label}
              onClick={() => navigate(path)}
              title={isCollapsed ? label : undefined}
              className={`mb-2 flex w-full items-center rounded-xl py-3 transition text-sm ${
                isCollapsed ? "justify-center px-0" : "px-4 gap-3 text-left"
              } ${
                isActive
                  ? "bg-gray-100 font-semibold text-black"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon size={22} strokeWidth={2} className="shrink-0" />
              <span className={`transition-opacity duration-200 whitespace-nowrap ${
                isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
              }`}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Bottom half: Action buttons */}
      <div className="mt-auto px-3 pt-4 shrink-0 bg-white">
        <div className="mb-4 border-t border-gray-200"></div>
        
        {/* Report Lost Button */}
        <button
          onClick={() => navigate("/report-lost")}
          title={isCollapsed ? "Report Lost Item" : undefined}
          className={`mb-2 flex items-center bg-gray-950 font-semibold text-white transition hover:bg-gray-800 ${
            isCollapsed ? "h-11 w-11 justify-center rounded-full mx-auto" : "w-full gap-3 rounded-lg px-3 py-2 text-left text-sm"
          }`}
        >
          <Plus size={20} className="shrink-0" />
          <span className={`whitespace-nowrap ${isCollapsed ? "hidden" : "block"}`}>
            Report Lost Item
          </span>
        </button>

        {/* Report Found Button */}
        <button
          onClick={() => navigate("/report-found")}
          title={isCollapsed ? "Report Found Item" : undefined}
          className={`mb-2 flex items-center border border-gray-300 bg-transparent font-semibold text-black transition hover:bg-gray-100 ${
            isCollapsed ? "h-11 w-11 justify-center rounded-full mx-auto" : "w-full gap-3 rounded-lg px-3 py-2 text-left text-sm"
          }`}
        >
          <Plus size={20} className="shrink-0" />
          <span className={`whitespace-nowrap ${isCollapsed ? "hidden" : "block"}`}>
            Report Found Item
          </span>
        </button>
      </div>
    </aside>
  );
}