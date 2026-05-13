import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { MOCK_ITEMS } from "../data/itemsData";
import { MapPin, Calendar, Tag, Palette } from "lucide-react";

export default function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const item = MOCK_ITEMS.find((i) => i.id === Number(id));

  if (!item) return <div style={{ padding: 40 }}>Item not found!</div>;

  const isApproved = item.status === "approved";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main style={{ marginLeft: 220, flex: 1, padding: "30px" }}>
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          style={{ 
            marginBottom: 20, cursor: "pointer", border: "none", 
            background: "none", color: "#888", fontSize: 13, fontWeight: 600 
          }}
        >
          ← Back
        </button>
        
        {/* Centered Compact Card */}
        <div style={{ 
          maxWidth: "550px", // Reduced width to make it feel less "big"
          margin: "0", // Centers the card on the page
          background: "#fff", 
          borderRadius: 20, 
          boxShadow: "0 4px 20px rgba(0,0,0,0.04)", 
          border: "1px solid #eee",
          overflow: "hidden" 
        }}>
          
          {/* Shorter Image Section */}
          <div style={{ width: "100%", height: "280px" }}> {/* Reduced from 450px */}
            <img 
              src={item.image || "https://via.placeholder.com/550x280"} 
              alt={item.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }} 
            />
          </div>

          {/* Details Section with tighter padding */}
          <div style={{ padding: "30px" }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: 'center',
              marginBottom: 12
            }}>
              <div style={{
                padding: "4px 10px",
                borderRadius: 6,
                background: "#ecfdf5",
                color: "#059669",
                fontSize: 11,
                fontWeight: 800,
                textTransform: "uppercase",
              }}>
                Found
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

          {/* Item Title */}    
          <h1 style={{ 
            fontSize: 24, 
            fontWeight: 800, 
            color: "#111", 
            margin: "0 0 8px 0" }}>
              {item.title}
          </h1>

          {/* Description */}   
          <div style={{marginBottom: 24 }}>
            <div style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#111",
              marginBotton: 4
            }}>
              Description 
            </div>
            <p style={{ 
              fontSize: 15, 
              color: "#666", 
              lineHeight: 1.5, 
              marginBottom: 24 }}>
                {item.description}
            </p>
          </div> 

            {/* Tighter Info Grid */}
            <div style={{ 
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", 
              borderTop: "1px solid #f0f0f0", paddingTop: 24 
            }}>
              <div>
                <div style={{ 
                  fontSize: 18, 
                  fontWeight: 700, 
                  color: "#111",
                  marginBottom: "6px" 
                }}>
                  Category
                </div>
                <div style={{ 
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  background: "#f3f4f6", 
                  fontSize: 14, 
                  fontWeight: 600, 
                  color: "#333",
                  lineHeight: "1" 
                }}>
                  {item.category}
                </div>
              </div>

              <div>
                <div style={{ 
                  fontSize: 18, 
                  fontWeight: 700, 
                  color: "#111", 
                  marginBottom: "6px" 
                }}>
                  Colour
                </div>
                
                <div style={{ 
                  display: "inline-flex",
                  alignItems: "center",
                  fontSize: 14, 
                  fontWeight: 600, 
                  color: "#333" 
                }}>
                  {item.color}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#111" }}>Location</div>
                <div style={{ 
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontSize: 14, 
                  fontWeight: 600, 
                  color: "#333",
                  marginLeft: "-12px"
                }}>
                  <MapPin size={14} color='#666' strokeWidth={2.5} />
                  <span>{item.location}</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#111" }}>Date</div>
                <div style={{ 
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontSize: 14, 
                  fontWeight: 600, 
                  color: "#333",
                  marginLeft: "-12px"
                }}>
                  <Calendar size={14} />
                  <span>{item.date}</span>
                </div>
              </div>
            </div>

            <button className="mt-8 w-full py-3.5 bg-black text-white rounded-xl font-bold text-base hover:bg-gray-800 transition-colors">
              Claim Item
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}