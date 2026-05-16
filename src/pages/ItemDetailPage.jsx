// import { useParams, useNavigate } from "react-router-dom";
// import Sidebar from "../components/Sidebar";
// import { MOCK_ITEMS } from "../data/itemsData";
// import { MapPin, Calendar, Tag, Palette, ArrowLeft, QrCode } from "lucide-react"; 

// export default function ItemDetailPage() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const item = MOCK_ITEMS.find((i) => i.id === Number(id));

//   if (!item) return <div style={{ padding: 40 }}>Item not found!</div>;

//   const isApproved = item.status === "approved";
//   const isLost = item.type === 'lost'; 

//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       <Sidebar />

//       {/* Main Content Container */}
//       <main style={{ marginLeft: 280, flex: 1, padding: "40px" }}>
        
//         {/* Back Button */}
//         <button 
//           onClick={() => navigate(-1)} 
//           className="flex items-center gap-2 mb-8 text-gray-400 hover:text-gray-700 text-sm font-semibold transition-colors"
//         >
//           <ArrowLeft size={16} />
//           Back to {isLost ? 'Lost' : 'Found'} Items
//         </button>

//         {/* --- TWO COLUMN LAYOUT START --- */}
//         <div style={{ 
//           display: "grid", 
//           gridTemplateColumns: "1fr 350px", // Left is flexible, Right is fixed at 350px
//           gap: "32px",
//           maxWidth: "1100px" // Keeps the content from stretching too wide on big screens
//         }}>
          
//           {/* LEFT COLUMN: Item Main Info */}
//           <div>
//             <div style={{ 
//               background: "#fff", 
//               borderRadius: 24, 
//               boxShadow: "0 4px 20px rgba(0,0,0,0.04)", 
//               border: "1px solid #e5e7eb",
//               overflow: "hidden" 
//             }}>
//               <div style={{ width: "100%", height: "400px" }}>
//                 <img 
//                   src={item.image || "https://via.placeholder.com/800x400"} 
//                   alt={item.title}
//                   style={{ width: "100%", height: "100%", objectFit: "cover" }} 
//                 />
//               </div>

//               <div style={{ padding: "40px" }}>
//                 <div style={{ 
//                   display: "flex", 
//                   justifyContent: "space-between", 
//                   alignItems: "center",
//                   marginBottom: 16
//                 }}>
//                     <Badge type={item.type} label={item.type} />
//                     <Badge type={item.status} label={item.status} isStatus />
//                 </div>


//                 <h1 style={{ fontSize: 32, fontVariationSettings: '"wght" 850', color: "#111", marginBottom: 20 }}>
//                   {item.title}
//                 </h1>

//                 <div style={{ marginBottom: 32 }}>
//                   <div style={{ fontSize: 12, fontWeight: 700, color: "#111", textTransform: "uppercase", marginBottom: 8 }}>
//                     Description 
//                   </div>
//                   <p style={{ fontSize: 16, color: "#4b5563", lineHeight: 1.6 }}>
//                     {item.description}
//                   </p>
                  
//                 </div> 

//                 <div style={{ 
//                   display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", 
//                   borderTop: "1px solid #f3f4f6", paddingTop: 32, marginBottom: "48px" 
//                 }}>
//                   <InfoBlock label="Category" icon={<Tag size={16}/>} value={item.category} />
//                   <InfoBlock label="Colour" icon={<Palette size={16}/>} value={item.color} />
//                   <InfoBlock label="Location" icon={<MapPin size={16}/>} value={item.location} />
//                   <InfoBlock label="Date" icon={<Calendar size={16}/>} value={item.date} />
//                 </div>
//                 <button className="w-full py-4 bg-black text-white rounded-xl font-bold text-base hover:bg-gray-800 transition-all active:scale-[0.98]">
//                   {isLost ? "I found this item" : "Claim Item"}
//                 </button>
//               </div>
                
//             </div>
            
//           </div>

//           {/* RIGHT COLUMN: Profile & Action Card */}
//           <aside style={{ position: "sticky", top: "40px", alignSelf: "start" }}>
//             <div style={{
//               background: "#fff",
//               border: "1px solid #e5e7eb",
//               borderRadius: "20px",
//               padding: "24px",
//               boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)"
//             }}>
//               <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "20px", color: "#111" }}>
//                 Posted By
//               </h3>

//               <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
//                 <div style={{
//                   width: "60px", height: "60px", borderRadius: "50%",
//                   background: "#eff6ff", display: "flex", alignItems: "center",
//                   justifyContent: "center", fontSize: "22px", fontWeight: "700", color: "#2563eb"
//                 }}>
//                   {item.user ? item.user.charAt(0) : "U"}
//                 </div> 

//                 <div>
//                   <div style={{ fontSize: "18px", fontWeight: "700", color: "#111" }}>
//                     {item.user || "Anonymous User"}
//                   </div>
//                   <div style={{ fontSize: "14px", color: "#6b7280" }}>
//                     Posted {item.date}
//                   </div>
//                 </div> 
//               </div>
              
//               <button style={{
//                 width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
//                 gap: "10px", padding: "14px", background: "#fff", border: "1.5px solid #e5e7eb",
//                 borderRadius: "12px", fontSize: "15px", fontWeight: "700", color: "#111",
//                 cursor: "pointer", marginBottom: "16px", transition: "all 0.2s"
//               }} onMouseOver={(e) => e.target.style.background = "#f9fafb"} 
//                  onMouseOut={(e) => e.target.style.background = "#fff"}>
//                 <QrCode size={20} />
//                 View QR Code
//               </button>

//             </div>
//           </aside>

//         </div>
//         {/* --- TWO COLUMN LAYOUT END --- */}

//       </main>
//     </div>
//   );
// }

// // Helper for Badges
// function Badge({ type, label, isStatus }) {
//   const normalizedType = type ? type.toLowerCase() : "";
//   const isGreen = type === 'found' || type === 'approved';
  
//   return (
//     <div style={{
//       padding: "6px 12px",
//       borderRadius: 8,
//       background: isGreen ? "#ecfdf5" : "#eff6ff",
//       color: isGreen ? "#059669" : "#2563eb",
//       fontSize: 10,
//       fontWeight: 800,
//       textTransform: "uppercase",
//       letterSpacing: "0.05em",
//       border: `1px solid ${isGreen ? "#d1fae5" : "#dbeafe"}`
//     }}>
//       {label}
//     </div>
//   );
// }

// function InfoBlock({ label, icon, value }) {
//   return (
//     <div>
//       <div style={{ fontSize: 10, fontWeight: 700, color: "#111", textTransform: "uppercase", marginBottom: 8 }}>
//         {label}
//       </div>
//       <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: 15, fontWeight: 600, color: "#1f2937" }}>
//         <span style={{ color: "#9ca3af" }}>{icon}</span>
//         {value || "N/A"}
//       </div>
//     </div>
//   );
// }




import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { MOCK_ITEMS } from "../data/itemsData";
import { MapPin, Calendar, Tag, Palette, ArrowLeft, QrCode } from "lucide-react";

export default function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const item = MOCK_ITEMS.find((i) => i.id === Number(id));

  if (!item) return <div className="p-10">Item not found!</div>;

  const isLost = item.type === "lost";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="ml-[280px] flex-1 p-10">

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-8 text-gray-400 hover:text-gray-700 text-sm font-semibold transition-colors"
        >
          <ArrowLeft size={16} />
          Back to {isLost ? "Lost" : "Found"} Items
        </button>

        {/* Two Column Layout */}
        <div className="grid gap-8 max-w-[1100px]" style={{ gridTemplateColumns: "1fr 350px" }}>

          {/* LEFT COLUMN */}
          <div>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">

              {/* Image */}
              <div className="w-full h-[400px]">
                <img
                  src={item.image || "https://via.placeholder.com/800x400"}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-10">
                {/* Badges */}
                <div className="flex items-center justify-between mb-4">
                  <Badge type={item.type} label={item.type} />
                  <Badge type={item.status} label={item.status} isStatus />
                </div>

                {/* Title */}
                <h1 className="text-3xl font-extrabold text-gray-900 mb-5">
                  {item.title}
                </h1>

                {/* Description */}
                <div className="mb-8">
                  <div className="text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-2">
                    Description
                  </div>
                  <p className="text-base text-gray-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-8 border-t border-gray-100 pt-8 mb-12">
                  <InfoBlock label="Category" icon={<Tag size={16} />} value={item.category} />
                  <InfoBlock label="Colour"   icon={<Palette size={16} />} value={item.color} />
                  <InfoBlock label="Location" icon={<MapPin size={16} />} value={item.location} />
                  <InfoBlock label="Date"     icon={<Calendar size={16} />} value={item.date} />
                </div>

                {/* CTA Button */}
                <button className="w-full py-4 bg-black text-white rounded-xl font-bold text-base hover:bg-gray-800 transition-all active:scale-[0.98]">
                  {isLost ? "I found this item" : "Claim Item"}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <aside className="sticky top-10 self-start">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md">
              <h3 className="text-lg font-extrabold text-gray-900 mb-5">Posted By</h3>

              {/* User Info */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-[60px] h-[60px] rounded-full bg-blue-50 flex items-center justify-center text-2xl font-bold text-blue-600 shrink-0">
                  {item.user ? item.user.charAt(0) : "U"}
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {item.user || "Anonymous User"}
                  </div>
                  <div className="text-sm text-gray-500">
                    Posted {item.date}
                  </div>
                </div>
              </div>

              {/* QR Button */}
              <button className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-white border border-gray-200 rounded-xl text-[15px] font-bold text-gray-900 hover:bg-gray-50 transition-colors">
                <QrCode size={20} />
                View QR Code
              </button>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}

// Badge Component
function Badge({ type, label, isStatus }) {
  const isGreen = type === "found" || type === "approved";

  return (
    <div className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide border
      ${isGreen
        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
        : "bg-blue-50 text-blue-600 border-blue-100"
      }`}>
      {label}
    </div>
  );
}

// InfoBlock Component
function InfoBlock({ label, icon, value }) {
  return (
    <div>
      <div className="text-[10px] font-bold text-gray-900 uppercase tracking-wider mb-2">
        {label}
      </div>
      <div className="flex items-center gap-2.5 text-[15px] font-semibold text-gray-800">
        <span className="text-gray-400">{icon}</span>
        {value || "N/A"}
      </div>
    </div>
  );
}