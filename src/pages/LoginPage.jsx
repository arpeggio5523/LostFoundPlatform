import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthInput from "../components/AuthInput";
import AuthButton from "../components/AuthButton";
import NavBar from "../components/NavBar";
import { buildApiUrl } from "../config/api";

function LoginPage(){
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({
            email: "",
            password: ""
        });
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [resendMessage, setResendMessage] = useState("");
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        const email = searchParams.get("email") || "";
        const verificationPending = searchParams.get("verificationPending");

        if (email) {
            setFormData((currentData) => ({
                ...currentData,
                email,
            }));
        }

        if (verificationPending) {
            setFeedbackMessage("Registration successful. Please check your email to verify your account before logging in.");
        }
    }, [searchParams]);

    // A helper to update the state object dynamically
    const handleChange = (e, field) => {
        setFormData({ ...formData, [field]: e.target.value });
    };

    const handleLogin = async (e) => {
            e.preventDefault();
            console.log("Attempting Login with:", formData);

            try {
                const response = await fetch(buildApiUrl("/api/auth/login"), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });

                const result = await response.json();

                if (response.ok) {
                    if (result.token) {
                        localStorage.setItem("token", result.token);
                    }
                    setFeedbackMessage("");
                    alert("Login successful!");
                    navigate("/found-items");
                    // console.log("Saved:", result);
                } else {
                    const nextMessage = result.message || result.error || "Invalid credentials";
                    setFeedbackMessage(nextMessage);
                    alert("Error: " + nextMessage);
                }
            } catch (err) {
                console.error("Failed to connect to server:", err);
                setFeedbackMessage("Server connection failed");
                alert("Server connection failed");
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
        <div className = "min-h-screen bg-gray-50">
            <NavBar />
            <div className = "mx-auto flex min-h-[80vh] max-w-lg items-center justify-center">
                <div className = "grid w-full overflow-hidden rounded-3xl bg-white shadow-xl">
                        <div className = "p-8 md:p-10">
                            <h2 className = "text-2xl font-semibold text-black"> Welcome Back </h2>
                            <p className = "mt-2 text-sm text-gray-500">
                                Enter your credentials to access your account
                            </p>
                            {feedbackMessage && (
                                <div className = "mt-6 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-sm text-gray-700">
                                    {feedbackMessage}
                                </div>
                            )}
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
                                <label className = "flex items-center gap-2 text-black">
                                    <input type="checkbox" className = "h6 w6 rounded accent-gray-950"/>
                                    Remember Me
                                </label>
                            </div>
                            <AuthButton type = "submit">Sign In</AuthButton>
                            </form>
                            {feedbackMessage === "Please verify your email before logging in." && (
                                <div className = "mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
                                    <p>Need another verification email?</p>
                                    <button
                                        type = "button"
                                        onClick = {handleResendVerification}
                                        className = "mt-3 font-semibold text-amber-900 hover:text-amber-700"
                                    >
                                        {isResending ? "Sending..." : "Resend verification email"}
                                    </button>
                                    {resendMessage && (
                                        <p className = "mt-3 text-amber-900">{resendMessage}</p>
                                    )}
                                </div>
                            )}
                            <p className = "mt-6 text-center text-sm text-gray-600">
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
