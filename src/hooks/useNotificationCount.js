import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";
import { apiFetch } from "../services/apiClient";
import { getAuthUser } from "../services/authState";

export default function useNotificationCount() {
  const socket = useSocket();
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!getAuthUser()) return;
    let active = true;
    const refresh = async () => {
      try {
        const response = await apiFetch("/api/notifications?limit=1");
        if (!response.ok) return;
        const feed = await response.json();
        if (active) setCount(feed.unreadCount);
      } catch { /* Keep the last count during connection failures. */ }
    };
    refresh();
    socket?.on("notification_received", refresh);
    socket?.on("notifications_updated", refresh);
    socket?.on("connect", refresh);
    return () => {
      active = false;
      socket?.off("notification_received", refresh);
      socket?.off("notifications_updated", refresh);
      socket?.off("connect", refresh);
    };
  }, [socket]);
  return count;
}
