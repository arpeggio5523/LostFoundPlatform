import { useLanguage } from "../context/LanguageContext";
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
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--color-bg-background)] flex flex-col items-center px-6 py-20 transition-colors duration-200">
      <div className="max-w-4xl text-center">
        <h1 className="text-[72px] leading-[78px] font-extrabold text-[var(--color-text-primary)]">{t("Lost Something?")}</h1>

        <h2 className="text-[72px] leading-[78px] font-extrabold text-[var(--color-brand)] mt-1">{t("We'll Help You Find It")}</h2>

        <p className="text-[26px] leading-[42px] text-[var(--color-text-secondary)] mt-10 max-w-4xl mx-auto">{t("The university community's trusted platform for lost and found items. Report, search, and reunite with your belongings quickly and securely.")}</p>

        <div className="flex items-center justify-center gap-6 mt-12">
          <button
            onClick={() => navigate("/signup")}
            className="bg-[var(--color-brand)] text-[var(--color-brand-text)] text-xl font-semibold px-10 py-5 rounded-2xl hover:opacity-90 transition-opacity"
          >{t("Get Started free")}</button>

          <button
            onClick={() => navigate("/login")}
            className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xl font-semibold px-10 py-5 rounded-2xl hover:bg-[var(--color-bg-raised)] transition-colors"
          >{t("Sign in")}</button>
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
              {t(item.label)}
            </p>
          </div>
        ))}
      </div>

      {/* How It Works */}
      <div className="mt-40 text-center">
        <h2 className="text-[64px] font-extrabold text-[var(--color-text-primary)]">{t("How It Works")}</h2>

        <p className="text-[28px] text-[var(--color-text-secondary)] mt-4">{t("Simple steps to reunite with your belongings")}</p>
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

          <h3 className="text-[36px] font-bold text-[var(--color-text-primary)] mt-8">{t("Create a Post")}</h3>

          <p className="text-[24px] text-[var(--color-text-secondary)] leading-[42px] mt-6">{t("Report your lost item with detailed descriptions, photos, and location information.")}</p>
        </div>

        {/* Step 2 */}
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
            <span className="text-[34px] font-bold text-[var(--color-brand)]">
              2
            </span>
          </div>

          <h3 className="text-[36px] font-bold text-[var(--color-text-primary)] mt-8">{t("Search & Match")}</h3>

          <p className="text-[24px] text-[var(--color-text-secondary)] leading-[42px] mt-6">{t("Browse through found items or wait for potential matches from our community.")}</p>
        </div>

        {/* Step 3 */}
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
            <span className="text-[34px] font-bold text-[var(--color-brand)]">
              3
            </span>
          </div>

          <h3 className="text-[36px] font-bold text-[var(--color-text-primary)] mt-8">{t("Connect Securely")}</h3>

          <p className="text-[24px] text-[var(--color-text-secondary)] leading-[42px] mt-6">{t("Use our secure messaging to arrange pickup and reunite with your items safely.")}</p>
        </div>
      </div>

      {/* Key Features */}
      <div className="w-full mt-40 bg-[var(--color-bg-background)] py-28 px-6 transition-colors duration-200">
        
        <div className="text-center">
          <h2 className="text-[64px] font-extrabold text-[var(--color-text-primary)]">{t("Key Features")}</h2>

          <p className="text-[28px] text-[var(--color-text-secondary)] mt-4">{t("Everything you need to find your lost items")}</p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-24 w-full max-w-7xl mx-auto">

          {/* Card 1 */}
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[28px] p-10 flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
              <Search size={40} className="text-[var(--color-brand)]" />
            </div>

            <div>
              <h3 className="text-[34px] font-bold text-[var(--color-text-primary)]">{t("Report Lost Items")}</h3>

              <p className="text-[24px] leading-[40px] text-[var(--color-text-secondary)] mt-4">{t("Easily create detailed posts about your lost items with descriptions and images.")}</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[28px] p-10 flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
              <FileText size={40} className="text-[var(--color-brand)]" />
            </div>

            <div>
              <h3 className="text-[34px] font-bold text-[var(--color-text-primary)]">{t("Post Found Items")}</h3>

              <p className="text-[24px] leading-[40px] text-[var(--color-text-secondary)] mt-4">{t("Help others by posting items you've found with location and date information.")}</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[28px] p-10 flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
              <MessageSquare size={40} className="text-[var(--color-brand)]" />
            </div>

            <div>
              <h3 className="text-[34px] font-bold text-[var(--color-text-primary)]">{t("Secure Messaging")}</h3>

              <p className="text-[24px] leading-[40px] text-[var(--color-text-secondary)] mt-4">{t("Communicate privately with other users while keeping your contact details safe.")}</p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[28px] p-10 flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
              <Shield size={40} className="text-[var(--color-brand)]" />
            </div>

            <div>
              <h3 className="text-[34px] font-bold text-[var(--color-text-primary)]">{t("Admin Moderation")}</h3>

              <p className="text-[24px] leading-[40px] text-[var(--color-text-secondary)] mt-4">{t("All posts are reviewed by admins to ensure quality and prevent spam.")}</p>
            </div>
          </div>
        </div>
      </div>

    {/* Testimonials */}
    <div className="w-full py-32 px-6 bg-[var(--color-bg-background)] transition-colors duration-200">

      {/* Heading */}
      <div className="text-center">
        <h2 className="text-[64px] font-extrabold text-[var(--color-text-primary)]">{t("What Users Say")}</h2>

        <p className="text-[28px] text-[var(--color-text-secondary)] mt-4">{t("Real stories from our community")}</p>
      </div>

      {/* Testimonial Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full max-w-7xl mx-auto">

        {/* Card 1 */}
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[24px] p-8">
          
          <div className="flex text-yellow-400 text-3xl">
            ★★★★★
          </div>

          <p className="text-[22px] italic leading-[40px] text-[var(--color-text-secondary)] mt-8">{t("\"I found my lost laptop within 2 days! The platform made it so easy to connect with the person who found it.\"")}</p>

          <div className="border-t border-[var(--color-border)] mt-8 pt-6">
            <h4 className="text-[28px] font-bold text-[var(--color-text-primary)]">
              Sarah Johnson
            </h4>

            <p className="text-[22px] text-[var(--color-text-secondary)] mt-1">
              Stanford University
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[24px] p-8">
          
          <div className="flex text-yellow-400 text-3xl">
            ★★★★★
          </div>

          <p className="text-[22px] italic leading-[40px] text-[var(--color-text-secondary)] mt-8">{t("\"Great service! I was able to return a wallet I found to its rightful owner. The secure messaging feature is excellent.\"")}</p>

          <div className="border-t border-[var(--color-border)] mt-8 pt-6">
            <h4 className="text-[28px] font-bold text-[var(--color-text-primary)]">
              Mike Chen
            </h4>

            <p className="text-[22px] text-[var(--color-text-secondary)] mt-1">
              MIT
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[24px] p-8">
          
          <div className="flex text-yellow-400 text-3xl">
            ★★★★★
          </div>

          <p className="text-[22px] italic leading-[40px] text-[var(--color-text-secondary)] mt-8">{t("\"Simple and effective platform! I was able to post my lost item report and someone found it within days.\"")}</p>

          <div className="border-t border-[var(--color-border)] mt-8 pt-6">
            <h4 className="text-[28px] font-bold text-[var(--color-text-primary)]">
              Emily Watson
            </h4>

            <p className="text-[22px] text-[var(--color-text-secondary)] mt-1">
              UC Berkeley
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* CTA Section */}
      <div className="w-screen bg-[var(--color-brand)] py-32 px-6 text-center flex flex-col items-center justify-center">

        <h2 className="text-[72px] font-extrabold text-white">{t("Ready to Find Your Items?")}</h2>

        <p className="text-[28px] text-[var(--color-brand-text)] mt-8 max-w-5xl mx-auto leading-[44px]">{t("Join thousands of university students who have successfully reunited with their belongings.")}</p>

        <button
          onClick={() => navigate("/signup")}
          className="mt-14 bg-white text-[var(--color-text-primary)] text-[24px] font-semibold px-12 py-5 rounded-2xl hover:scale-105 transition-transform"
        >{t("Create Free Account")}</button>
      </div>
    </div>
  );
}