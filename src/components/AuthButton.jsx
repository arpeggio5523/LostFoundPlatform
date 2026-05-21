function AuthButton({ children, type = "button", ...props }) {
    return (
        <button
            type={type}
            className="w-full rounded-lg bg-black dark:bg-[var(--color-bg-raised)] dark:border dark:border-[var(--color-border)] px-4 py-3 font-semibold text-white dark:text-[var(--color-text-primary)] transition hover:bg-gray-900 dark:hover:bg-[var(--color-border)]"
            {...props}
        >
            {children}
        </button>
    );
}

export default AuthButton;