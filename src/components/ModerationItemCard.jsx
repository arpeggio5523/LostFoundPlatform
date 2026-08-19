import React from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle,
  FileText,
  MapPin,
  UserRound,
  XCircle,
} from "lucide-react";
import StatusBadge from "../components/StatusBadge";

function ModerationItemCard({ item, onApprove, onReject, onViewDetails, moderationStatus }) {
  const openDetails = () => onViewDetails(item.id);
  const isModerating = Boolean(moderationStatus);

  const handleKeyDown = (event) => {
    if (event.target !== event.currentTarget) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openDetails();
    }
  };

  return (
    <div
      role="link"
      tabIndex={0}
      aria-label={`View details for ${item.title}`}
      onClick={openDetails}
      onKeyDown={handleKeyDown}
      className="group flex flex-col sm:flex-row gap-5 border border-[var(--color-border)] rounded-2xl p-4 sm:p-5 bg-[var(--color-bg-surface)] cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-[var(--color-brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2"
    >
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
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <h4 className="min-w-0 truncate text-lg font-bold text-[var(--color-text-primary)]">
                {item.title}
              </h4>
              <StatusBadge status={item.type} />
            </div>
          </div>
          <StatusBadge status={item.status} />
        </div>

        <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)] line-clamp-2">
          {item.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[var(--color-text-secondary)]">
          <span className="flex items-center gap-1.5">
            <UserRound size={14} />
            {item.author}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin size={14} />
            {item.location}
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays size={14} />
            {item.date}
          </span>
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-[var(--color-border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-brand)]">
            Click to review
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </span>

          {!(["Approved", "Rejected"].includes(item.status)) && (
            <div className="flex gap-2">
              <button
                type="button"
                disabled={isModerating}
                onClick={(event) => {
                  event.stopPropagation();
                  onReject(item.id);
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
              >
                <XCircle size={17} />
                {moderationStatus === "Rejected" ? "Rejecting..." : "Reject"}
              </button>
              <button
                type="button"
                disabled={isModerating}
                onClick={(event) => {
                  event.stopPropagation();
                  onApprove(item.id);
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-100 px-4 py-2 text-sm font-semibold text-green-700 transition-colors hover:bg-green-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
              >
                <CheckCircle size={17} />
                {moderationStatus === "Approved" ? "Approving..." : "Approve"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ModerationItemCard;
