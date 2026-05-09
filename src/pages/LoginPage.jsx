import { useState } from "react";
import { Link } from "react-router-dom";
import AuthInput from "../components/AuthInput";
import AuthButton from "../components/AuthButton";
import NavBar from "../components/NavBar";

function LoginPage(){
    const [formData, setFormData] = useState({
            email: "",
            password: ""
        });

    const handleLogin = async (e) => {
            e.preventDefault();
            console.log("Attempting Login with:", formData);

            try {
                const response = await fetch("http://localhost:3000/api/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });

                const result = await response.json();

                if (response.ok) {
                    alert("Success! User saved to MongoDB");
                    console.log("Saved:", result);
                } else {
                    alert("Error: " + result.error);
                }
            } catch (err) {
                console.error("Failed to connect to server:", err);
                alert("Is your backend server running on port 3000?");
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
                            <form onSubmit={handleLogin} className = "mt-8 space-y-5">
                            <AuthInput
                                label = "Email"
                                type = "email"
                                placeholder="your.email@university.edu"
                                value = {email}
                                onChange = {(event) => setEmail(event.target.value)}
                                required
                            />
                            <AuthInput
                                label = "Password"
                                type = "password"
                                placeholder={"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
                                value = {password}
                                onChange = {(event) => setPassword(event.target.value)}
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
