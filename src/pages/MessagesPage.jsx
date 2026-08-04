import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Send, MessageSquare, ArrowLeft, Paperclip } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar2 from "../components/Navbar2";
import { getAuthUser, getCurrentUserId } from "../services/authState";
import { fetchConversations, fetchMessages, sendMessage } from "../services/messagesApi";

function Avatar({ initials }) {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-active-bg)] text-sm font-semibold text-[var(--color-brand)]">
      {initials}
    </div>
  );
}

const initialsFor = (name = "?") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("") || "?";

const formatTime = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const isToday = date.toDateString() === new Date().toDateString();
  return isToday
    ? date.toLocaleTimeString("en-MY", { hour: "numeric", minute: "2-digit" })
    : date.toLocaleDateString("en-MY", { day: "numeric", month: "short" });
};
