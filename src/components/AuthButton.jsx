import React from 'react';
function AuthButton({ children, type = "button", ...props }) {
    return (
        <button
            type={type}
            className="w-full rounded-lg bg-[var(--color-brand)] px-4 py-3 font-semibold text-[var(--color-brand-text)] transition hover:opacity-90 border-none"
            {...props}
        >
            {children}
        </button>
    );
}

export default AuthButton;