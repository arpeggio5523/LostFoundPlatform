export default function QRIcon() {
  return (
    <button
      title="Show QR Code"
      onClick={(e) => { e.stopPropagation(); alert("QR code feature coming soon!"); }}
      className="absolute top-2.5 right-2.5 bg-white/90 border-none rounded-lg w-9 h-9 flex items-center justify-center cursor-pointer shadow-sm hover:bg-white transition-colors"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
        <line x1="14" y1="14" x2="14" y2="14"/><line x1="17" y1="14" x2="17" y2="14"/>
        <line x1="20" y1="14" x2="20" y2="14"/><line x1="14" y1="17" x2="14" y2="17"/>
        <line x1="17" y1="17" x2="17" y2="17"/><line x1="20" y1="17" x2="20" y2="17"/>
        <line x1="14" y1="20" x2="14" y2="20"/><line x1="17" y1="20" x2="17" y2="20"/>
        <line x1="20" y1="20" x2="20" y2="20"/>
      </svg>
    </button>
  );
}