export default function StatusBadge({ status }) {
  const styles = {
    approved: { background: "#dcfce7", color: "#166534" },
    pending:  { background: "#fef9c3", color: "#854d0e" },
    returned: { background: "#dbeafe", color: "#1e40af" },
  };
  const s = styles[status] || styles.pending;
  return (
    <span style={{
      background: s.background, color: s.color,
      padding: "2px 10px", borderRadius: 99,
      fontSize: 12, fontWeight: 600, letterSpacing: "0.02em", whiteSpace: "nowrap",
    }}>
      {status}
    </span>
  );
}