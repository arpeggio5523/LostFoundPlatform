import { userEffect, useState } from 'react';
import { Link } from "react-router-dom";

function SignupPage() {
  const [data, setData] = userState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/users")
      .then(res => res.json())
      .then(json => setData(json));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900">Sign Up Page</h1>

        <p className="mt-4 text-gray-600">
          This is a temporary signup page.
        </p>

        <Link
          to="/login"
          className="mt-6 inline-block font-semibold text-blue-600 hover:text-blue-700"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}

// const handleSignUp = async (userData) =>
//   const response = await fetch("http://localhost:3000/api/users", {
//     method: "POST",
//     headers: { "Content-Tpye": "application/json"},
//     boyd: JSON.stringify(userData),
//   });
//   const data = await response.json();
//   console.log("Saved to MongoDB:", data);
// };

export default SignupPage;