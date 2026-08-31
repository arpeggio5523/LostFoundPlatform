import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthInput from "../components/AuthInput";
import AuthButton from "../components/AuthButton";
import NavBar from "../components/NavBar";
import { buildApiUrl } from "../services/apiClient";
import { useForceLightMode } from "../hooks/useForceLightMode";
import { useTheme } from "../context/ThemeContext";

const REMEMBERED_EMAIL_KEY = "rememberedEmail";
const REMEMBERED_PASSWORD_KEY = "rememberedPassword";
const ACCESS_TOKEN_STORAGE_KEY = "accessToken";

const getSafeRedirectPath = (redirectPath) => {
    if (!redirectPath || !redirectPath.startsWith("/") || redirectPath.startsWith("//")) {
        return "/dashboard";
    }

    return redirectPath;
};

function LoginPage(){
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { loadUserTheme } = useTheme();
    useForceLightMode();
    const [formData, setFormData] = useState({
            email: "",
            password: "",
            rememberMe: false,
        });
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [resendMessage, setResendMessage] = useState("");
    const [isResending, setIsResending] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const redirectPath = getSafeRedirectPath(searchParams.get("redirect"));

    useEffect(() => {
        const email = searchParams.get("email") || "";
        const verificationPending = searchParams.get("verificationPending");
        const redirect = searchParams.get("redirect");
        const rememberedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY) || "";
        const rememberedPassword = localStorage.getItem(REMEMBERED_PASSWORD_KEY) || "";

        if (email || rememberedEmail || rememberedPassword) {
            setFormData((currentData) => ({
                ...currentData,
                email: email || rememberedEmail,
                password: rememberedPassword,
                rememberMe: !email && Boolean(rememberedEmail),
            }));
        }

        if (verificationPending) {
            setFeedbackMessage(
                "Registration successful. Please check your email to verify your account before logging in."
            );

            searchParams.delete("verificationPending");

            const nextParams = new URLSearchParams();
            if (email) nextParams.set("email", email);
            if (redirect) nextParams.set("redirect", redirect);

            navigate(`/login${nextParams.toString() ? `?${nextParams}` : ""}`, { replace: true });
        }
    }, [navigate, searchParams]);

    // A helper to update the state object dynamically
    const handleChange = (e, field) => {
        setFormData({ ...formData, [field]: e.target.value });
    };

    const handleLogin = async (e) => {
            e.preventDefault();
            try {
                const response = await fetch(buildApiUrl("/api/auth/login"), {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });

                const result = await response.json();

                if (response.ok) {
                    if (result.accessToken) {
                        localStorage.setItem("user", JSON.stringify(result.user));
                        loadUserTheme(result.user._id || result.user.id);
                        if (formData.rememberMe) {
                            localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, result.accessToken);
                            localStorage.setItem(REMEMBERED_EMAIL_KEY, formData.email.trim());
                            localStorage.setItem(REMEMBERED_PASSWORD_KEY, formData.password);
                            sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
                        } else {
                            sessionStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, result.accessToken);
                            localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
                            localStorage.removeItem(REMEMBERED_EMAIL_KEY);
                            localStorage.removeItem(REMEMBERED_PASSWORD_KEY);
                        }
                    }
                    setFeedbackMessage("");
                    navigate(redirectPath, { replace: true });
                } else {
                    const nextMessage = result.message || result.error || "Invalid credentials";
                    setFeedbackMessage(nextMessage);
                    setPopupMessage(result.message || "Login failed.");
                    setShowPopup(true);
                }
            } catch (err) {
                console.error("Failed to connect to server:", err);
                setFeedbackMessage("Server connection failed");
            }
        };

    const handleResendVerification = async () => {
            if (!formData.email) {
                setResendMessage("Enter your email first.");
                return;
            }

            setIsResending(true);

            try {
                const response = await fetch(buildApiUrl("/api/auth/resend-verification"), {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: formData.email }),
                });

                const result = await response.json();
                setResendMessage(
                    result.message ||
                    "If an account with that email exists and is not yet verified, a verification email will be sent."
                );
            } catch (err) {
                console.error("Failed to resend verification email:", err);
                setResendMessage("Could not connect to the server.");
            } finally {
                setIsResending(false);
            }
        };


    return(
        <div className="min-h-screen bg-[var(--color-bg-base)]">
            <NavBar />
            {showPopup && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                <div className="w-full max-w-md rounded-2xl bg-[var(--color-bg-surface)] p-6 shadow-2xl border border-[var(--color-border)]">
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                        Login Failed
                    </h3>

                    <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
                        {popupMessage}
                    </p>

                    <button
                        onClick={() => setShowPopup(false)}
                        className="mt-6 w-full rounded-lg bg-[var(--color-brand)] px-4 py-3 font-semibold text-[var(--color-brand-text)] transition hover:opacity-90"
                    >
                        OK
                    </button>
                </div>
            </div>
            )}
            <div className="mx-auto flex min-h-[80vh] max-w-lg items-center justify-center">
                <div className="grid w-full overflow-hidden rounded-3xl bg-[var(--color-bg-surface)] shadow-xl border border-[var(--color-border)]">
                        <div className="p-8 md:p-10">
                            <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]"> Welcome Back </h2>
                            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                                Enter your credentials to access your account
                            </p>
                            {feedbackMessage && (
                                <div className="mt-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-raised)] px-4 py-4 text-sm text-[var(--color-text-secondary)]">
                                    {feedbackMessage}
                                </div>
                            )}
                            <form onSubmit={handleLogin} className="mt-8 space-y-5">
                            <AuthInput
                                label="Email"
                                type="email"
                                placeholder="your.email@university.edu"
                                value={formData.email}
                                onChange={(e) => handleChange(e, "email")}
                                required
                            />
                            <AuthInput
                                label="Password"
                                type="password"
                                placeholder={"••••••••"}
                                value={formData.password}
                                onChange={(e) => handleChange(e, "password")}
                                required
                            />
                            <div className="flex items-center text-sm">
                                <label className="flex items-center gap-2 text-[var(--color-text-primary)]">
                                    <input
                                        type="checkbox"
                                        className="h6 w6 rounded accent-gray-950 dark:accent-[var(--color-brand)]"
                                        checked={formData.rememberMe}
                                        onChange={(e) =>
                                            setFormData((currentData) => ({
                                                ...currentData,
                                                rememberMe: e.target.checked,
                                            }))
                                        }
                                    />
                                    Remember Me
                                </label>
                            </div>
                            <AuthButton type="submit">Sign In</AuthButton>
                            </form>
                            {feedbackMessage === "Please verify your email before logging in." && (
                                <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                                    <p>Need another verification email?</p>
                                    <button
                                        type="button"
                                        onClick={handleResendVerification}
                                        className="mt-3 font-semibold text-amber-900 hover:text-amber-700 dark:text-amber-200"
                                    >
                                        {isResending ? "Sending..." : "Resend verification email"}
                                    </button>
                                    {resendMessage && (
                                        <p className="mt-3 text-amber-900 dark:text-amber-300">{resendMessage}</p>
                                    )}
                                </div>
                            )}
                            <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
                                Don't have an account?{" "}
                                <Link
                                    to="/signup"
                                    className="font-semibold text-[var(--color-brand)] hover:opacity-80"
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
