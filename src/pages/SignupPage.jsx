import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthInput from "../components/AuthInput";
import AuthButton from "../components/AuthButton";
import NavBar from "../components/NavBar";

function SignupPage(){
    const navigate = useNavigate();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [occupation, setOccupation] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    async function handleSignup(event){
        event.preventDefault(); // prevent refresh

        if (password.length < 8){
            alert("Password must be at least 8 characters long.");
            return
        }

        if (password != confirmPassword){
            alert("Confirm password is not same with password.");
            return
        }

        if (!/[A-Z]/.test(password)){
            alert("Password must contain at least 1 capital letter.")
            return
        }

        if (!/[a-z]/.test(password)){
            alert("Password must contain at least 1 small letter.")
            return
        }

        if(!/[^A-Za-z0-9]/.test(password)){
            alert("Password must contain at least 1 special character.")
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
            const response = await fetch("http://localhost:3000/api/users/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(signupData),
            });

            const result = await response.json();

            if (response.ok) {
                alert("Account created successfully! Please log in.");
                navigate("/login");
            } else {
                alert("Signup failed: " + result.message);
            }
        } catch (err) {
            console.error("Connection error:", err);
            alert("Could not connect to the server.");
        }
    }

    return(
        <div className = "min-h-screen bg-gray-50">
          <NavBar />
            <div className = "mx-auto flex min-h-[80vh] max-w-lg items-center justify-center px-4 pt-12 pb-10">
                <div className = "grid w-full overflow-hidden rounded-3xl bg-white shadow-xl">
                        <div className = "p-8 md:p-10">
                            <h2 className = "text-2xl font-semibold text-black"> Create An Account </h2>
                            <p className = "mt-2 text-sm text-gray-500">
                                Join the university lost and found community
                            </p>
                            <form onSubmit={handleSignup} className = "mt-8 space-y-3">
                            <AuthInput
                                label = "Full Name *"
                                type = "text"
                                placeholder="John Doe"
                                value = {fullName}
                                onChange = {(event) => setFullName(event.target.value)}
                                required
                            />
                            <AuthInput
                                label = "Email *"
                                type = "email"
                                placeholder="your.email@university.edu"
                                value = {email}
                                onChange = {(event) => setEmail(event.target.value)}
                                required
                            />
                            <AuthInput
                                label = "Phone Number (Optional)"
                                type = "tel"
                                placeholder="+ 1 234 567 8900"
                                value = {phoneNumber}
                                onChange = {(event) => setPhoneNumber(event.target.value)}
                            />
                            <AuthInput
                                label = "Occupation (Optional)"
                                type = "text"
                                placeholder="eg. Student, Faculty, Staff"
                                value = {occupation}
                                onChange = {(event) => setOccupation(event.target.value)}
                            />
                            <AuthInput
                                label = "Password *"
                                type = "password"
                                placeholder={"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
                                value = {password}
                                onChange = {(event) => setPassword(event.target.value)}
                                required
                                minLength = {8}
                            />
                            <AuthInput
                                label = "Confirm Password *"
                                type = "password"
                                placeholder={"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
                                value = {confirmPassword}
                                onChange = {(event) => setConfirmPassword(event.target.value)}
                                required
                                minLength = {8}
                            />
                            <AuthButton type = "submit">Create Account</AuthButton>
                            </form>
                            <p className = "mt-6 text-center text-sm text-gray-600">
                                Already have an account?{" "}
                                <span
                                    onClick={() => navigate("/login")}
                                    className = "font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                                >
                                    Sign In
                                </span>
                                {/* <Link
                                    to ="/login"
                                    className = "font-semibold text-blue-600 hover:text-blue-700"
                                >
                                    Sign In
                                </Link> */}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
    );
}

export default SignupPage;
