import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthInput from "../components/AuthInput";
import AuthButton from "../components/AuthButton";
import NavBar from "../components/NavBar";
import { setAuthUser, getCurrentUserId } from "../services/authState";
import { useTheme } from "../context/ThemeContext";

function LoginPage(){
    const navigate = useNavigate();
    const { loadUserTheme } = useTheme();

    // Login page is always light mode — no dark bleeding in from a previous session
    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove("dark");

        return () => {
            // Restore the logged-in user's theme when navigating away
            const userId = getCurrentUserId();
            if (userId) {
                const saved = localStorage.getItem(`theme_${userId}`);
                if (saved === "dark") root.classList.add("dark");
            }
        };
    }, []);
    const [formData, setFormData] = useState({
            email: "",
            password: ""
        });

    // A helper to update the state object dynamically
    const handleChange = (e, field) => {
        setFormData({ ...formData, [field]: e.target.value });
    };

    const handleLogin = async (e) => {
            e.preventDefault();
            console.log("Attempting Login with:", formData);

            try {
                const response = await fetch("http://localhost:3000/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });

                const result = await response.json();

                if (response.ok) {
                    setAuthUser(result.user, result.token);
                    // Restore this user's saved theme preference
                    if (result.user?.id) {
                        loadUserTheme(result.user.id);
                    }
                    alert("Login successful!");
                    navigate("/found-items");
                    // console.log("Saved:", result);
                } else {
                    alert("Error: " + (result.error || "Invalid credentials"));
                }
            } catch (err) {
                console.error("Failed to connect to server:", err);
                alert("Server connection failed");
            }
        };


    return(
        <div className="min-h-screen bg-[var(--color-bg-base)]">
            <NavBar />
            <div className = "mx-auto flex min-h-[80vh] max-w-lg items-center justify-center">
                <div className="grid w-full overflow-hidden rounded-3xl bg-[var(--color-bg-surface)] dark:shadow-black/40 shadow-xl border border-[var(--color-border)]">
                        <div className = "p-8 md:p-10">
                            <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]"> Welcome Back </h2>
                            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                                Enter your credentials to access your account
                            </p>
                            <form onSubmit={handleLogin} className = "mt-8 space-y-5">
                            <AuthInput
                                label = "Email"
                                type = "email"
                                placeholder="your.email@university.edu"
                                value = {formData.email}
                                onChange={(e) => handleChange(e, "email")}
                                required
                            />
                            <AuthInput
                                label = "Password"
                                type = "password"
                                placeholder={"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
                                value = {formData.password}
                                onChange = {(e) => handleChange(e, "password")}
                                required
                            />
                            <div className = "flex items-center text-sm">
                                <label className="flex items-center gap-2 text-[var(--color-text-primary)]">
                                    <input type="checkbox" className="h6 w6 rounded accent-gray-950 dark:accent-[var(--color-brand)]"/>
                                    Remember Me
                                </label>
                            </div>
                            <AuthButton type = "submit">Sign In</AuthButton>
                            </form>
                            <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
                                Don't have an account?{" "}
                                <Link
                                    to ="/signup"
                                    className = "font-semibold text-blue-600 hover:text-blue-700"
                                >
                                    Sign Up
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
    );
}

export default LoginPage;
