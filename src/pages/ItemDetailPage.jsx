import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { MapPin, Calendar, Tag, Palette, ArrowLeft, QrCode } from "lucide-react"; 
import Navbar2 from "../components/NavBar2";

export default function ItemDetailPage() {
  const { itemId } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/items/${itemId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch item");
        }

        const data = await response.json();
        setItem(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId]);

  if (loading) {
    return <div style={{ padding: 40 }}>Loading item...</div>;
  }

  if (error) {
    return <div style={{ padding: 40 }}>{error}</div>;
  }

  if (!item) {
    return <div style={{ padding: 40 }}>Item not found!</div>;
  }

  const isApproved = item.status === "Approved";
  const isLost = item.itemType === 'Lost'; 

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar2 />
      <div className="flex">
        <Sidebar />

      {/* Main Content Container */}
      <main style={{ marginLeft: 280, flex: 1, padding: "40px" }}>
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 mb-8 text-gray-400 hover:text-gray-700 text-sm font-semibold transition-colors"
        >
          <ArrowLeft size={16} />
          Back to {isLost ? 'Lost' : 'Found'} Items
        </button>

        {/* --- TWO COLUMN LAYOUT START --- */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 350px", // Left is flexible, Right is fixed at 350px
          gap: "32px",
          maxWidth: "1100px" // Keeps the content from stretching too wide on big screens
        }}>
          
          {/* LEFT COLUMN: Item Main Info */}
          <div>
            <div style={{ 
              background: "#fff", 
              borderRadius: 24, 
              boxShadow: "0 4px 20px rgba(0,0,0,0.04)", 
              border: "1px solid #e5e7eb",
              overflow: "hidden" 
            }}>
              <div style={{ width: "100%", height: "400px" }}>
                <img 
                  src={item.images && item.images.length > 0 ? item.images[0] : "https://via.placeholder.com/800x400"} 
                  alt={item.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                />
              </div>

              <div style={{ padding: "40px" }}>
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  marginBottom: 16
                }}>
                    <Badge type={item.itemType} label={item.itemType} />
                    <Badge type={item.status} label={item.status} isStatus />
                </div>


                <h1 style={{ fontSize: 32, fontVariationSettings: '"wght" 850', color: "#111", marginBottom: 20 }}>
                  {item.title}
                </h1>

                <div style={{ marginBottom: 32 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#111", textTransform: "uppercase", marginBottom: 8 }}>
                    Description 
                  </div>
                  <p style={{ fontSize: 16, color: "#4b5563", lineHeight: 1.6 }}>
                    {item.description}
                  </p>
                  
                </div> 

                <div style={{ 
                  display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", 
                  borderTop: "1px solid #f3f4f6", paddingTop: 32, marginBottom: "48px" 
                }}>
                  <InfoBlock label="Category" icon={<Tag size={16}/>} value={item.category} />
                  <InfoBlock label="Colour" icon={<Palette size={16}/>} value={item.color} />
                  <InfoBlock label="Location" icon={<MapPin size={16}/>} value={item.location} />
                  <InfoBlock label="Date" icon={<Calendar size={16}/>} value={item.date} />
                </div>
                <button className="w-full py-4 bg-black text-white rounded-xl font-bold text-base hover:bg-gray-800 transition-all active:scale-[0.98]">
                  {isLost ? "I found this item" : "Claim Item"}
                </button>
              </div>
                
            </div>
            
          </div>

          {/* RIGHT COLUMN: Profile & Action Card */}
          <aside style={{ position: "sticky", top: "40px", alignSelf: "start" }}>
            <div style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "20px",
              padding: "24px",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)"
            }}>
              <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "20px", color: "#111" }}>
                Posted By
              </h3>

              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                <div style={{
                  width: "60px", height: "60px", borderRadius: "50%",
                  background: "#eff6ff", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "22px", fontWeight: "700", color: "#2563eb"
                }}>
                  {item.user ? item.user?.fullName?.charAt(0) : "U"}
                </div> 

                <div>
                  <div style={{ fontSize: "18px", fontWeight: "700", color: "#111" }}>
                    {item.user?.fullName || "Anonymous User"}
                  </div>
                  <div style={{ fontSize: "14px", color: "#6b7280" }}>
                    Posted {item.date}
                  </div>
                </div> 
              </div>
              
              <button style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                gap: "10px", padding: "14px", background: "#fff", border: "1.5px solid #e5e7eb",
                borderRadius: "12px", fontSize: "15px", fontWeight: "700", color: "#111",
                cursor: "pointer", marginBottom: "16px", transition: "all 0.2s"
              }} onMouseOver={(e) => e.target.style.background = "#f9fafb"} 
                 onMouseOut={(e) => e.target.style.background = "#fff"}>
                <QrCode size={20} />
                View QR Code
              </button>

            </div>
          </aside>

        </div>
        {/* --- TWO COLUMN LAYOUT END --- */}

      </main>
      </div>
    </div>
  );
}

// Helper for Badges
function Badge({ type, label, isStatus }) {
  const normalizedType = type ? type.toLowerCase() : "";
  const isGreen = type === 'found' || type === 'approved';
  
  return (
    <div style={{
      padding: "6px 12px",
      borderRadius: 8,
      background: isGreen ? "#ecfdf5" : "#eff6ff",
      color: isGreen ? "#059669" : "#2563eb",
      fontSize: 10,
      fontWeight: 800,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      border: `1px solid ${isGreen ? "#d1fae5" : "#dbeafe"}`
    }}>
      {label}
    </div>
  );
}

function InfoBlock({ label, icon, value }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#111", textTransform: "uppercase", marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: 15, fontWeight: 600, color: "#1f2937" }}>
        <span style={{ color: "#9ca3af" }}>{icon}</span>
        {value || "N/A"}
      </div>
    </div>
  );
}