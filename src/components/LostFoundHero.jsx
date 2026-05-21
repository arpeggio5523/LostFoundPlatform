import React from "react";
import {
  Users,
  Search,
  TrendingUp,
  Shield,
} from "lucide-react";

const stats = [
  {
    icon: <Users size={42} className="text-[#006058]" />,
    value: "2,500+",
    label: "Active Users",
  },
  {
    icon: <Search size={42} className="text-[#006058]" />,
    value: "1,200+",
    label: "Items Reported",
  },
  {
    icon: <TrendingUp size={42} className="text-[#006058]" />,
    value: "78%",
    label: "Success Rate",
  },
  {
    icon: <Shield size={42} className="text-[#006058]" />,
    value: "50+",
    label: "Universities",
  },
];

export default function LostFoundHero() {
  return (
    <div className="min-h-screen bg-[#f3f7fc] flex flex-col items-center px-6 py-20">
      <div className="max-w-4xl text-center">
        <h1 className="text-[72px] leading-[78px] font-extrabold text-[#071133]">
          Lost Something?
        </h1>

        <h2 className="text-[72px] leading-[78px] font-extrabold text-[#006058] mt-1">
          We'll Help You Find It
        </h2>

        <p className="text-[26px] leading-[42px] text-gray-600 mt-10 max-w-4xl mx-auto">
          The university community's trusted platform for lost and found
          items. Report, search, and reunite with your belongings quickly
          and securely.
        </p>

        <div className="flex items-center justify-center gap-6 mt-12">
          <button className="bg-[#006058] text-white text-xl font-semibold px-10 py-5 rounded-2xl">
            Browse Lost Items
          </button>

          <button className="bg-white border border-gray-200 text-[#02042b] text-xl font-semibold px-10 py-5 rounded-2xl">
            Browse Found Items
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mt-24 w-full max-w-7xl">
        {stats.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-[24px] border border-gray-200 h-[220px] flex flex-col items-center justify-center"
          >
            <div className="mb-6">{item.icon}</div>

            <h3 className="text-[42px] font-extrabold text-[#071133]">
              {item.value}
            </h3>

            <p className="text-[24px] text-gray-500 mt-2">
              {item.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-40 text-center">
        <h2 className="text-[64px] font-extrabold text-[#071133]">
          How It Works
        </h2>

        <p className="text-[28px] text-gray-600 mt-4">
          Simple steps to reunite with your belongings
        </p>
      </div>
    </div>
  );
}