import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-[--color-bg-base]">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        
        {/* Heading */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold">
            Welcome to Your LostFound MY Dashboard
          </h1>

          <p className="text-gray-600 mt-2">
            Connecting you to your lost property and helping others find theirs.
          </p>
        </div>

        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="bg-white border rounded-2xl shadow-sm p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Report Lost Item
            </h2>

            <p className="text-gray-600 mb-8">
              Post details about what you've lost so the community can help you
              find it.
            </p>

            <button
              onClick={() => navigate("/report-lost")}
              className="flex items-center justify-center gap-2 mx-auto bg-[var(--color-brand)] text-[var(--color-brand-text)] rounded-xl px-5 py-3 font-bold text-sm hover:bg-[var(--color-brand-hover)] transition"
            >
              <span className="text-lg leading-none">+</span>
              Report Lost Item
            </button>
          </div>

          {/* Card 2 */}
          <div className="bg-white border rounded-2xl shadow-sm p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Found an Item?
            </h2>

            <p className="text-gray-600 mb-8">
              Found something on campus? Report it to help it get back to its
              owner.
            </p>

            <button
              onClick={() => navigate("/report-found")}
              className="flex items-center justify-center gap-2 mx-auto bg-[var(--color-brand)] text-[var(--color-brand-text)] rounded-xl px-5 py-3 font-bold text-sm hover:bg-[var(--color-brand-hover)] transition"
            >
              <span className="text-lg leading-none">+</span>
              Report Found Item
            </button>
          </div>

          {/* Card 3 */}
          <div className="bg-white border rounded-2xl shadow-sm p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Browse Found Listings
            </h2>

            <p className="text-gray-600 mb-8">
              Search the latest community reports for items matching what you've
              lost.
            </p>

            <button
              onClick={() => navigate("/found-items")}
              className="bg-[var(--color-brand)] text-[var(--color-brand-text)] rounded-xl px-5 py-3 font-bold text-sm hover:bg-[var(--color-brand-hover)] transition"
            >
              Go to Found Item List
            </button>
          </div>
        </div>

        {/* How It Works */}
        <section className="mt-12 bg-white border rounded-2xl shadow-sm p-10 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">
            How LostFound MY Works
          </h2>

          <div className="flex flex-col md:flex-row items-center pt-6 justify-center gap-6">
            
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
                1
              </div>

              <p className="font-semibold text-lg">Report</p>
            </div>

            <div className="hidden md:flex items-center text-gray-300 text-4xl">
              →
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
                2
              </div>

              <p className="font-semibold text-lg">Match</p>
            </div>

            <div className="hidden md:flex items-center text-gray-300 text-4xl">
              →
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
                3
              </div>

              <p className="font-semibold text-lg">Connect</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}