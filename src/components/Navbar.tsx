import React from "react";
import { Shield, Sparkles, Globe, AlertTriangle, PlayCircle, Menu, X } from "lucide-react";
import { Language, TRANSLATIONS } from "../utils/translations";

interface NavbarProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenDemoWalkthrough: () => void;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  activeHighRiskCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLang,
  onLanguageChange,
  onOpenDemoWalkthrough,
  mobileMenuOpen,
  onToggleMobileMenu,
  activeHighRiskCount,
}) => {
  const t = TRANSLATIONS[currentLang];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs no-print">
      {/* Top Hackathon Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-emerald-100 text-xs py-1.5 px-4 font-medium flex items-center justify-between border-b border-emerald-700/50">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="inline-flex items-center gap-1 bg-amber-400 text-stone-900 font-bold px-2 py-0.5 rounded text-[11px] tracking-wide uppercase">
            JALLIKATTU 5.0
          </span>
          <span className="hidden sm:inline text-emerald-200">•</span>
          <span className="truncate">{t.hackathonBanner}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden md:inline-flex items-center gap-1.5 text-emerald-300/90 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Gemini 3.8 Flash Vision + Heuristics
          </span>
        </div>
      </div>

      {/* Main Navbar Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 ring-1 ring-emerald-500/30">
              <Shield className="w-6 h-6 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl text-stone-900 tracking-tight">
                  HarvestShield
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-1.5 py-0.5 rounded">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium hidden sm:block leading-none mt-0.5">
                {t.tagline}
              </p>
            </div>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Risk Badge if any */}
          {activeHighRiskCount > 0 && (
            <div className="hidden lg:flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-700 px-2.5 py-1 rounded-full text-xs font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-bounce" />
              <span>{activeHighRiskCount} Batches at High Risk</span>
            </div>
          )}

          {/* Hackathon Demo Walkthrough Button */}
          <button
            type="button"
            onClick={onOpenDemoWalkthrough}
            className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950 font-bold px-3 py-1.5 rounded-lg text-xs sm:text-sm shadow-xs transition-all cursor-pointer border border-amber-600/30"
          >
            <PlayCircle className="w-4 h-4 text-stone-950" />
            <span className="hidden sm:inline">Hackathon Demo Flow</span>
            <span className="sm:hidden">Demo</span>
          </button>

          {/* Language Switcher */}
          <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200">
            <button
              type="button"
              onClick={() => onLanguageChange("en")}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                currentLang === "en"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange("ta")}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer font-tamil ${
                currentLang === "ta"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              தமிழ்
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
