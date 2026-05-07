import StatusBadge from "./StatusBadge";
import QRIcon from "./QRIcon";
import NoImagePlaceholder from "./NoImagePlaceholder";

export default function ItemCard({ item }) {
  return (
    <div
      style={{
        background: "#fff", borderRadius: 14, overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,0.07)", border: "1px solid #f0f0f0",
        cursor: "pointer", transition: "box-shadow 0.18s, transform 0.18s",
        display: "flex", flexDirection: "column",
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.13)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.07)"; e.currentTarget.style.transform = "none"; }}
    >
      {/* Image */}
      <div style={{ position: "relative" }}>
        {item.image
          ? <img src={item.image} alt={item.title} style={{ width: "100%", height: 210, objectFit: "cover", display: "block" }} />
          : <NoImagePlaceholder />
        }
        <QRIcon />
      </div>

      {/* Content */}
      <div style={{ padding: "14px 16px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111", lineHeight: 1.3, flex: 1, paddingRight: 8 }}>
            {item.title}
          </h3>
          <StatusBadge status={item.status} />
        </div>

        <p style={{ margin: "0 0 10px", fontSize: 13.5, color: "#555", lineHeight: 1.5 }}>
          {item.description}
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#888", fontSize: 12.5 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.location}</span>
        </div>
      </div>
    </div>
  );
}