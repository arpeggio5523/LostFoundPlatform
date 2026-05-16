export default function StatusBadge({ status }) {
  const normalizedStatus = status ? status.toLowerCase() : "";

  const styles = {
    approved: "bg-green-100 text-green-800",
    pending:  "bg-yellow-100 text-yellow-800",
    returned: "bg-blue-100 text-blue-800",
    matched:  "bg-purple-100 text-purple-800",
  };

  const currentStyle = styles[normalizedStatus] || "bg-gray-100 text-gray-800";

  return (
    <span className={`${currentStyle} text-xs font-semibold px-3 py-0.5 rounded-full whitespace-nowrap`}>
      {status}
    </span>
  );
}