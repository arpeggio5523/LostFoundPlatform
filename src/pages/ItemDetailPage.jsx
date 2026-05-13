import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { MOCK_ITEMS } from "../data/itemsData";
import { MapPin, Calendar, Tag, Palette, ArrowLeft } from "lucide-react"; 

export default function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const item = MOCK_ITEMS.find((i) => i.id === Number(id));

  if (!item) return <div style={{ padding: 40 }}>Item not found!</div>;

  const isApproved = item.status === "approved";
  const isLost = item.type === 'lost'; // Helper boolean

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main style={{ marginLeft: 220, flex: 1, padding: "30px" }}>
        {/* Dynamic Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 mb-6 text-gray-400 hover:text-gray-700 text-sm font-semibold transition-colors"
        >
          <ArrowLeft size={16} />
          Back to {isLost ? 'Lost' : 'Found'} Items
        </button>
        
        <div style={{ 
          maxWidth: "550px", 
          background: "#fff", 
          borderRadius: 20, 
          boxShadow: "0 4px 20px rgba(0,0,0,0.04)", 
          border: "1px solid #eee",
          overflow: "hidden" 
        }}>
          
          <div style={{ width: "100%", height: "280px" }}>
            <img 
              src={item.image || "https://via.placeholder.com/550x280"} 
              alt={item.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }} 
            />
          </div>

          <div style={{ padding: "30px" }}>
            {/* Dynamic Header Tags */}
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: 'center',
              marginBottom: 12
            }}>
              <div style={{
                padding: "4px 10px",
                borderRadius: 6,
                background: item.type === 'lost' ? "#eff6ff" : "#ecfdf5", // Blue for lost, Green for found
                color: isLost ? "#2563eb" : "#059669",
                fontSize: 11,
                fontWeight: 800,
                textTransform: "uppercase",
              }}>
                {item.type === 'lost' ? 'Lost' : 'Found'}
              </div>

              <div style={{
                padding: "4px 10px",
                borderRadius: 6,
                background: isApproved ? "#ecfdf5" : "#fffbeb", 
                color: isApproved ? "#059669" : "#d97706", 
                fontSize: 11, 
                fontWeight: 800, 
                textTransform: "uppercase", 
              }}>
                {item.status}
              </div>
            </div>

            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111", margin: "0 0 16px 0" }}>
              {item.title}
            </h1>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#111", textTransform: "uppercase", marginBottom: 4 }}>
                Description 
              </div>
              <p style={{ fontSize: 15, color: "#666", lineHeight: 1.5, margin: 0 }}>
                {item.description}
              </p>
            </div> 

            {/* Info Grid */}
            <div style={{ 
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", 
              borderTop: "1px solid #f0f0f0", paddingTop: 24 
            }}>
              
              <InfoBlock label="Category" icon={<Tag size={14}/>} value={item.category} />
              <InfoBlock label="Colour" icon={<Palette size={14}/>} value={item.color} />
              <InfoBlock label="Location" icon={<MapPin size={14}/>} value={item.location} />
              <InfoBlock label="Date" icon={<Calendar size={14}/>} value={item.date} />

            </div>

            <button className="mt-10 w-full py-4 bg-black text-white rounded-xl font-bold text-base hover:bg-gray-800 transition-all active:scale-[0.98]">
              {isLost ? "I found this item" : "Claim Item"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

// Reusable Helper for the Grid items to ensure perfect alignment
function InfoBlock({ label, icon, value }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#aaa", textTransform: "uppercase", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ 
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        fontSize: 14, 
        fontWeight: 600, 
        color: "#333",
      }}>
        <span style={{ color: "#9ca3af" }}>{icon}</span>
        {value || "N/A"}
      </div>
    </div>
  );
}