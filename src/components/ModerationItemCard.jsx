import React from "react";
import { FileText, CheckCircle, XCircle, Trash2 } from "lucide-react";
import StatusBadge from "../components/StatusBadge";

function ModerationItemCard({ item, onApprove, onReject, onViewDetails, onDelete }) {

  return (
    <div className="flex gap-6 border border-[var(--color-border)] rounded-2xl p-6 bg-white">
      {/* Image */}
      <div className="h-24 w-24 rounded-2xl bg-gray-100 flex items-center justify-center shrink-0">
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="h-full w-full object-cover rounded-2xl"
          />
        ) : (
          <FileText size={34} className="text-gray-400" />
        )}
      </div>

      {/* Item Content */}
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <StatusBadge status={item.type} />
          <StatusBadge status={item.status} />
        </div>

        <h4 className="text-m font-bold text-[var(--color-text-primary)] mb-2">
          {item.title}
        </h4>

        <p className="text-sm text-[var(--color-text-secondary)] mb-3">
          {item.description}
        </p>

        <p className="text-xs text-[var(--color-text-secondary)] mb-4">
          By {item.author} &nbsp;&nbsp; {item.location} &nbsp;&nbsp; {item.date}
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => onApprove(item.id)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-1 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            <CheckCircle size={18} />
            Approve
          </button>

          <button
            onClick={() => onReject(item.id)}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-1 rounded-lg font-semibold hover:bg-red-700 transition"
          >
            <XCircle size={18} />
            Reject
          </button>

          <button
            onClick={() => onViewDetails(item.id)}
            className="border border-gray-300 px-4 py-1 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            View Details
          </button>

          <button
            onClick={() => onDelete(item)}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-1 rounded-lg font-semibold hover:bg-red-700 transition"
          >
            <Trash2 size={18} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModerationItemCard;
