import React, { useState } from "react";
import {
  BookOpen,
  Thermometer,
  Droplets,
  AlertTriangle,
  ShieldCheck,
  Search,
  Sparkles,
  Info,
  CheckCircle,
} from "lucide-react";
import { CROP_PROFILES } from "../data/cropProfiles";
import { CropType } from "../types";
import { Language, TRANSLATIONS } from "../utils/translations";

interface CropGuideViewProps {
  currentLang: Language;
}

export const CropGuideView: React.FC<CropGuideViewProps> = ({ currentLang }) => {
  const t = TRANSLATIONS[currentLang];
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCrop, setSelectedCrop] = useState<CropType>("Tomato");

  const crops = Object.keys(CROP_PROFILES) as CropType[];

  const filteredCrops = crops.filter((c) =>
    c.toLowerCase().includes(searchTerm.toLowerCase()) ||
    CROP_PROFILES[c].tamilName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeProfile = CROP_PROFILES[selectedCrop];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              ICAR & NHB Knowledge Base
            </span>
            <span className="text-xs font-semibold text-stone-500">
              Post-Harvest Loss Prevention Protocols
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            {t.nav.cropGuide}
          </h1>
          <p className="text-sm text-stone-500 mt-1 max-w-2xl">
            {currentLang === "en"
              ? "Scientifically validated thermal thresholds, chilling sensitivities, humidity requirements, and low-cost farm-gate preservation methods."
              : "அறிவியல் ரீதியான சேமிப்பு வெப்பநிலை, ஈரப்பதம், மற்றும் அழுகல் தடுப்பு முறைகள்."}
          </p>
        </div>
      </div>

      {/* Crop Pills Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {crops.map((c) => {
          const isSelected = selectedCrop === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedCrop(c)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                isSelected
                  ? "bg-emerald-800 text-white shadow-xs"
                  : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50"
              }`}
            >
              <span>{c}</span>
              <span className={`text-[10px] ${isSelected ? "text-emerald-200" : "text-stone-400"}`}>
                ({CROP_PROFILES[c].typicalNationalLossRate}% loss)
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Selected Crop Guide Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Key Parameters (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="border-b border-stone-100 pb-3">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                {activeProfile.tamilName}
              </span>
              <h2 className="text-2xl font-black text-stone-900 tracking-tight mt-0.5">
                {activeProfile.name} Preservation Guide
              </h2>
            </div>

            {/* Thermal & Chilling Parameters */}
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-emerald-950">
                  <Thermometer className="w-4 h-4 text-emerald-700" />
                  <span>Optimal Storage Temp</span>
                </div>
                <span className="text-base font-black text-emerald-800">
                  {activeProfile.optimalTempMin}°C – {activeProfile.optimalTempMax}°C
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-cyan-50/70 border border-cyan-200 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-cyan-950">
                  <Droplets className="w-4 h-4 text-cyan-700" />
                  <span>Optimal Relative Humidity</span>
                </div>
                <span className="text-base font-black text-cyan-800">
                  {activeProfile.optimalHumidityMin}% – {activeProfile.optimalHumidityMax}%
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-rose-950">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Chilling Injury Critical Limit</span>
                </div>
                <span className="text-base font-black text-rose-700">
                  Below {activeProfile.chillingInjuryThreshold}°C
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
                <div className="font-bold text-amber-950">
                  Ethylene Sensitivity
                </div>
                <span className="text-sm font-extrabold text-amber-800">
                  {activeProfile.ethyleneSensitivity}
                </span>
              </div>
            </div>

            {/* National Loss Benchmark */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-600 uppercase text-[10px]">
                  Estimated National Supply Chain Loss
                </span>
                <span className="font-black text-rose-600 text-sm">
                  ~{activeProfile.typicalNationalLossRate}%
                </span>
              </div>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Reported by ICAR-CIPHET and NABARD studies across Indian mandi channels before reaching consumer retail.
              </p>
            </div>

            {/* Shelf-Life Comparison */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="text-[10px] font-bold text-emerald-800 uppercase">
                  At Optimal Temp
                </div>
                <div className="font-extrabold text-emerald-950 mt-1">
                  {activeProfile.shelfLifeAtOptimal}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-stone-100 border border-stone-200">
                <div className="text-[10px] font-bold text-stone-600 uppercase">
                  At Ambient Heat (32°C+)
                </div>
                <div className="font-extrabold text-stone-900 mt-1">
                  {activeProfile.shelfLifeAtAmbient}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Protocols & Hazards (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Scientific Storage Protocols */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Standard Operating Protocols for Loss Prevention
            </h3>
            <ul className="space-y-2.5 text-xs text-stone-700">
              {activeProfile.storageProtocols.map((protocol, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-100 leading-relaxed font-medium"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{protocol}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Key Physiological Deterioration Risks */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Major Physiological Breakdown Vectors
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              {activeProfile.keyRisks.map((risk, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 font-medium text-amber-950 space-y-1"
                >
                  <div className="font-bold text-[11px] text-amber-900">Risk #{i + 1}</div>
                  <p className="leading-snug">{risk}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Zero Energy Cool Chamber (ZECC) Spotlight */}
          <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-6 rounded-2xl shadow-md space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <h3 className="text-base font-bold text-white tracking-tight">
                Spotlight: Zero Energy Cool Chamber (ZECC)
              </h3>
            </div>
            <p className="text-xs text-emerald-100 leading-relaxed font-medium">
              Developed by ICAR-IARI, the ZECC is a double-brick-walled on-farm evaporative cool chamber filled with coarse river sand kept continuously moist with water. It requires <strong>zero electricity</strong>, lowers interior temperature by <strong>8°C to 12°C</strong> compared to ambient, and maintains &gt;90% relative humidity. It doubles the shelf-life of tomatoes and fruits at negligible farm investment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
