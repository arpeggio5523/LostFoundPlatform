export default function StatusBadge({ status }) {
  const styles = {
    approved: "bg-green-100 text-green-800",
    pending:  "bg-yellow-100 text-yellow-800",
    returned: "bg-blue-100 text-blue-800",
  };
  return (
    <span className={`${styles[status] || styles.pending} text-xs font-semibold px-3 py-0.5 rounded-full whitespace-nowrap`}>
      {status}
    </span>
  );
}