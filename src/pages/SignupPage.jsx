import { useLanguage } from "../context/LanguageContext";
import React from 'react';
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthInput from "../components/AuthInput";
import AuthButton from "../components/AuthButton";
import NavBar from "../components/NavBar";
import { buildApiUrl, apiFetch } from "../services/apiClient";
import { getCurrentUserId } from "../services/authState";
import { useForceLightMode } from "../hooks/useForceLightMode";
import { useToast } from "../context/ToastContext";
import {Eye, EyeOff} from "lucide-react";

function SignupPage(){
  const { t } = useLanguage();
    const navigate = useNavigate();
    const { showToast } = useToast();

    useForceLightMode();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [occupation, setOccupation] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    async function handleSignup(event){
        event.preventDefault(); // prevent refresh

        if (password.length < 8){
            showToast("Password must be at least 8 characters long.", "error");
            return
        }

        if (password != confirmPassword){
            showToast("Confirm password is not same with password.", "error");
            return
        }

        if (!/[A-Z]/.test(password)){
            showToast("Password must contain at least 1 capital letter.", "error")
            return
        }

        if (!/[a-z]/.test(password)){
            showToast("Password must contain at least 1 small letter.", "error")
            return
        }

        if(!/[^A-Za-z0-9]/.test(password)){
            showToast("Password must contain at least 1 special character.", "error")
            return
        }

        console.log("Signup data:", {
            fullName,
            email,
            phoneNumber,
            occupation,
            password,
            confirmPassword
        }); //for testing

        // alert("Signup button clicked"); //for testing

        const signupData = {
            fullName,
            email,
            phoneNumber,
            occupation,
            password,
        };

        try {
            const response = await apiFetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(signupData),
            });

            const result = await response.json();

            if (response.ok) {
                showToast(
                    result.message || "Account created successfully. Please verify your email.",
                    "success"
                );
                navigate(`/verify-email?email=${encodeURIComponent(email.trim())}`);
            } else {
                showToast(t("Signup failed: {{message}}", { message: t(result.message || "Could not connect to the server.") }), "error");
            }
        } catch (err) {
            console.error("Connection error:", err);
            showToast("Could not connect to the server.", "error");
        }
    }

    return(
        <div className="min-h-screen bg-[var(--color-bg-base)]">
          <NavBar />
            <div className = "mx-auto flex min-h-[80vh] max-w-lg items-center justify-center px-4 pt-12 pb-10">
                <div className="grid w-full overflow-hidden rounded-3xl bg-[var(--color-bg-surface)] dark:shadow-black/40 shadow-xl border border-[var(--color-border)]">
                        <div className = "p-8 md:p-10">
                            <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">{t(" Create An Account ")}</h2>
                            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{t("Join the university lost and found community")}</p>
                            <form onSubmit={handleSignup} className = "mt-8 space-y-3">
                            <AuthInput
                                label = {t("Full Name *")}
                                type = "text"
                                placeholder="John Doe"
                                value = {fullName}
                                onChange = {(event) => setFullName(event.target.value)}
                                required
                            />
                            <AuthInput
                                label = {t("Email *")}
                                type = "email"
                                placeholder="your.email@university.edu"
                                value = {email}
                                onChange = {(event) => setEmail(event.target.value)}
                                required
                            />
                            <AuthInput
                                label = {t("Phone Number (Optional)")}
                                type = "tel"
                                placeholder="+ 1 234 567 8900"
                                value = {phoneNumber}
                                onChange = {(event) => setPhoneNumber(event.target.value)}
                            />
                            <AuthInput
                                label = {t("Occupation (Optional)")}
                                type = "text"
                                placeholder={t("eg. Student, Faculty, Staff")}
                                value = {occupation}
                                onChange = {(event) => setOccupation(event.target.value)}
                            />
                            <div className="relative">
                                <AuthInput
                                label={t("Password *")}
                                type = {showPassword ? "text" : "password"}
                                placeholder={"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
                                value = {password}
                                onChange = {(event) => setPassword(event.target.value)}
                                required
                                minLength = {8}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(prev => !prev)}
                                    className="absolute right-4 top-10 text-gray-400 hover:text-gray-700"
                                    aria-label={showPassword ? t("Hide password") : t("Show password")}
                                >
                                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                                </button>
                            </div>
                            <div className="relative">
                                <AuthInput
                                label={t("Confirm Password *")}
                                type = {showConfirmPassword ? "text" : "password"}
                                placeholder={"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
                                value = {confirmPassword}
                                onChange = {(event) => setConfirmPassword(event.target.value)}
                                required
                                minLength = {8}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(prev => !prev)}
                                    className="absolute right-4 top-10 text-gray-400 hover:text-gray-700"
                                    aria-label={showConfirmPassword ? t("Hide password") : t("Show password")}
                                >
                                    {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                                </button>
                            </div>
                            <AuthButton type = "submit">{t("Create Account")}</AuthButton>
                            </form>
                            <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">{t("Already have an account?")}{" "}
                                <span
                                    onClick={() => navigate("/login")}
                                    className = "font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                                >{t("Sign In")}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
    );
}

export default SignupPage;
