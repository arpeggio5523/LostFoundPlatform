import React from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useNotificationCount from "../hooks/useNotificationCount";

export default function NotificationButton({ className = "", style, iconSize = 20 }) {
  const navigate = useNavigate();
  const notificationCount = useNotificationCount();

  return (
    <button
      type="button"
      aria-label={
        notificationCount > 0
          ? `${notificationCount} unread notifications`
          : "Notifications"
      }
      title="Notifications"
      onClick={() => navigate("/notifications")}
      className={`relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] shadow-sm transition hover:bg-[var(--color-bg-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)] ${className}`}
      style={style}
    >
      <Bell size={iconSize} strokeWidth={2} aria-hidden="true" />
      {notificationCount > 0 && (
        <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-[var(--color-brand)] px-1.5 text-[10px] font-bold leading-5 text-[var(--color-brand-text)]">
          {notificationCount > 99 ? "99+" : notificationCount}
        </span>
      )}
    </button>
  );
}
