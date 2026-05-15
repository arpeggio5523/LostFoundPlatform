export default function StatusBadge({ status }) {
  const styles = {
    Approved: "bg-green-100 text-green-800",
    Pending:  "bg-yellow-100 text-yellow-800",
    Returned: "bg-blue-100 text-blue-800",
    Matched: "bg-purple-100 text-purple-800",
  };
  return (
    <span className={`${styles[status] || styles.Pending} text-xs font-semibold px-3 py-0.5 rounded-full whitespace-nowrap`}>
      {status}
    </span>
  );
}