import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, Search, TrendingUp, Shield, FileText, MessageSquare } from "lucide-react";

const stats = [
  { icon: <Users    size={42} />, value: "2,500+", label: "Active Users"    },
  { icon: <Search   size={42} />, value: "1,200+", label: "Items Reported"  },
  { icon: <TrendingUp size={42} />, value: "78%",  label: "Success Rate"    },
  { icon: <Shield   size={42} />, value: "50+",   label: "Universities"     },
];

export default function LostFoundHero() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--color-bg-background)] flex flex-col items-center px-6 py-20 transition-colors duration-200">
      <div className="max-w-4xl text-center">
        <h1 className="text-[72px] leading-[78px] font-extrabold text-[var(--color-text-primary)]">
          Lost Something?
        </h1>

        <h2 className="text-[72px] leading-[78px] font-extrabold text-[var(--color-brand)] mt-1">
          We'll Help You Find It
        </h2>

        <p className="text-[26px] leading-[42px] text-[var(--color-text-secondary)] mt-10 max-w-4xl mx-auto">
          The university community's trusted platform for lost and found
          items. Report, search, and reunite with your belongings quickly
          and securely.
        </p>

        <div className="flex items-center justify-center gap-6 mt-12">
          <button
            onClick={() => navigate("/signup")}
            className="bg-[var(--color-brand)] text-[var(--color-brand-text)] text-xl font-semibold px-10 py-5 rounded-2xl hover:opacity-90 transition-opacity"
          >
            Get Started free
          </button>

          <button
            onClick={() => navigate("/login")}
            className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xl font-semibold px-10 py-5 rounded-2xl hover:bg-[var(--color-bg-raised)] transition-colors"
          >
            Sign in
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mt-24 w-full max-w-7xl">
        {stats.map((item, index) => (
          <div
            key={index}
            className="bg-[var(--color-bg-surface)] rounded-[24px] border border-[var(--color-border)] h-[220px] flex flex-col items-center justify-center transition-colors duration-200"
          >
            <div className="mb-6 text-[var(--color-brand)]">{item.icon}</div>

            <h3 className="text-[42px] font-extrabold text-[var(--color-text-primary)]">
              {item.value}
            </h3>

            <p className="text-[24px] text-[var(--color-text-secondary)] mt-2">
              {item.label}
            </p>
          </div>
        ))}
      </div>

      {/* How It Works */}
      <div className="mt-40 text-center">
        <h2 className="text-[64px] font-extrabold text-[var(--color-text-primary)]">
          How It Works
        </h2>

        <p className="text-[28px] text-[var(--color-text-secondary)] mt-4">
          Simple steps to reunite with your belongings
        </p>
      </div>


      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mt-24 w-full max-w-7xl">

        {/* Step 1 */}
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
            <span className="text-[34px] font-bold text-[var(--color-brand)]">
              1
            </span>
          </div>

          <h3 className="text-[36px] font-bold text-[var(--color-text-primary)] mt-8">
            Create a Post
          </h3>

          <p className="text-[24px] text-[var(--color-text-secondary)] leading-[42px] mt-6">
            Report your lost item with detailed descriptions,
            photos, and location information.
          </p>
        </div>

        {/* Step 2 */}
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
            <span className="text-[34px] font-bold text-[var(--color-brand)]">
              2
            </span>
          </div>

          <h3 className="text-[36px] font-bold text-[var(--color-text-primary)] mt-8">
            Search & Match
          </h3>

          <p className="text-[24px] text-[var(--color-text-secondary)] leading-[42px] mt-6">
            Browse through found items or wait for potential
            matches from our community.
          </p>
        </div>

        {/* Step 3 */}
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
            <span className="text-[34px] font-bold text-[var(--color-brand)]">
              3
            </span>
          </div>

          <h3 className="text-[36px] font-bold text-[var(--color-text-primary)] mt-8">
            Connect Securely
          </h3>

          <p className="text-[24px] text-[var(--color-text-secondary)] leading-[42px] mt-6">
            Use our secure messaging to arrange pickup and
            reunite with your items safely.
          </p>
        </div>
      </div>
    </div>
  );
}