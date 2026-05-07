export default function NoImagePlaceholder() {
  return (
    <div style={{
      width: "100%", height: 210, background: "#e8fdf2",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    </div>
  );
}