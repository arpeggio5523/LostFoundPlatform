import { Link } from "react-router-dom";

function Navbar(){
    return(
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-[var(--color-border)] bg-white dark:bg-[var(--color-bg-surface)] transition-colors duration-200">
            <div className="flex w-full items-center justify-between px-8 py-5">
            {/* left logo*/}
            <Link to="/login" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 dark:bg-[var(--color-brand-active-bg)] text-white">
                    <div className="flex h-15 w-12 items-center justify-center rounded-xl bg-teal-700 dark:bg-[var(--color-brand-active-bg)] text-white">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-8 w-8"
                        >
                            <circle cx="11" cy= "11" r="6" />
                            <line x1="16" y1="16.5" x2="19" y2="19" />
                        </svg>
                        </div>
                </div>
                <span className="text-xl font-semibold text-gray-900 dark:text-[var(--color-text-primary)]">
                    LostFound MY
                </span>
            </Link>

            {/* right nav*/}
            <nav className="flex items-center gap-6">
                <Link to="/login" className="rounded-lg bg-white dark:bg-transparent px-5 py-2 text-sm font-semibold text-gray-900 dark:text-[var(--color-text-primary)] hover:bg-gray-100 dark:hover:bg-[var(--color-bg-raised)]">
                    Login
                </Link>
                <Link to="/signup" className="rounded-lg bg-gray-950 dark:bg-[var(--color-brand-active-bg)] px-5 py-2 text-sm font-semibold text-white dark:text-[var(--color-brand)] hover:bg-gray-800 dark:hover:bg-[var(--color-bg-raised)]">
                    Sign Up
                </Link>
            </nav>
            </div>
        </header>
    );
}

export default Navbar;