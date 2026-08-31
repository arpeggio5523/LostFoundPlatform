import React from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Bell, LogOut } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { clearAuth } from "../services/authState";

function Navbar2(){
    const navigate = useNavigate();
    const { resetTheme } = useTheme();

    const handleLogout = () => {
        resetTheme();   // revert to light before navigating away
        clearAuth();    // clear stored token + user
        navigate("/");
    };

    return(
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-[var(--color-border)] bg-white dark:bg-[var(--color-bg-surface)] transition-colors duration-200">
            <div className="flex w-full items-center justify-between px-8 py-5">
            {/* left logo*/}
            <Link to="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 dark:bg-[var(--color-brand-active-bg)] text-white shadow-sm">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6"
                    >
                        <circle cx="11" cy="11" r="6" />
                        <line x1="16" y1="16.5" x2="19" y2="19" />
                    </svg>
                </div>
                <span className="text-xl font-semibold text-[var(--color-brand)]">
                    LostFound MY
                </span>
            </Link>

            {/* right nav*/}
            <nav className="flex items-center gap-6">
                <button className="flex h-10 w-10 items-center justify-center rounded-2xl text-gray-900 dark:text-[var(--color-text-primary)] hover:bg-gray-100 dark:hover:bg-[var(--color-bg-raised)]">
                    <Bell size={20} strokeWidth={2} />
                </button>
                <button
                    onClick={handleLogout}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl text-gray-900 dark:text-[var(--color-text-primary)] hover:bg-gray-100 dark:hover:bg-[var(--color-bg-raised)]"
                >
                    <LogOut size={20} strokeWidth={2} />
                </button>
            </nav>
            </div>
        </header>
    );
}

export default Navbar2;