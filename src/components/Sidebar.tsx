import React from "react";
import {
  LayoutDashboard,
  Camera,
  ShieldAlert,
  TrendingUp,
  Boxes,
  Bot,
  BookOpen,
  Info,
  Layers,
  ChevronRight,
} from "lucide-react";
import { Language, TRANSLATIONS } from "../utils/translations";

export type TabType =
  | "dashboard"
  | "scanner"
  | "assessment"
  | "market"
  | "batches"
  | "assistant"
  | "cropGuide";

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  currentLang: Language;
  totalBatches: number;
  highRiskCount: number;
  totalQuantityKg: number;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentLang,
  totalBatches,
  highRiskCount,
  totalQuantityKg,
  onCloseMobile,
}) => {
  const t = TRANSLATIONS[currentLang];

  const navItems = [
    {
      id: "dashboard" as TabType,
      label: t.nav.dashboard,
      icon: LayoutDashboard,
      badge: `${totalBatches}`,
    },
    {
      id: "scanner" as TabType,
      label: t.nav.imageScanner,
      icon: Camera,
      tag: "Gemini Vision",
    },
    {
      id: "assessment" as TabType,
      label: t.nav.riskAssessment,
      icon: ShieldAlert,
      tag: "Rules Engine",
    },
    {
      id: "market" as TabType,
      label: t.nav.marketIntelligence,
      icon: TrendingUp,
    },
    {
      id: "batches" as TabType,
      label: t.nav.batches,
      icon: Boxes,
      badge: `${totalBatches}`,
    },
    {
      id: "assistant" as TabType,
      label: t.nav.assistant,
      icon: Bot,
      tag: "AI Chatbot",
    },
    {
      id: "cropGuide" as TabType,
      label: t.nav.cropGuide,
      icon: BookOpen,
    },
  ];

  const handleSelect = (tab: TabType) => {
    onSelectTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className="w-full md:w-64 bg-white border-r border-stone-200/80 flex flex-col justify-between shrink-0 no-print">
      {/* Navigation list */}
      <div className="p-3 sm:p-4 space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
          {currentLang === "en" ? "Post-Harvest Modules" : "அறுவடை தொகுதிகள்"}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                isActive
                  ? "bg-emerald-800 text-white shadow-sm shadow-emerald-900/20"
                  : "text-stone-700 hover:bg-stone-100 hover:text-stone-900"
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? "text-emerald-300" : "text-stone-500"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {item.tag && (
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded tracking-wide ${
                      isActive
                        ? "bg-emerald-900/60 text-emerald-200 border border-emerald-700/50"
                        : "bg-stone-100 text-stone-600 border border-stone-200"
                    }`}
                  >
                    {item.tag}
                  </span>
                )}
                {item.badge && (
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? "bg-emerald-700 text-emerald-100"
                        : "bg-stone-200/80 text-stone-700"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Sidebar Quick Stats Card & Hackathon Info */}
      <div className="p-4 space-y-3 border-t border-stone-200/80 bg-stone-50/70">
        <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-600">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-700" />
              {currentLang === "en" ? "Inventory Monitored" : "கண்காணிக்கப்படும் இருப்பு"}
            </span>
            <span className="font-bold text-stone-900">
              {(totalQuantityKg / 1000).toFixed(1)} MT
            </span>
          </div>

          {highRiskCount > 0 ? (
            <div className="bg-rose-50 border border-rose-200 p-2 rounded-lg text-rose-800 text-[11px] font-medium flex items-center justify-between">
              <span>{currentLang === "en" ? "High Risk Batches:" : "அதி தீவிர அபாயம்:"}</span>
              <span className="font-bold bg-rose-200 text-rose-900 px-1.5 py-0.5 rounded">
                {highRiskCount}
              </span>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-lg text-emerald-800 text-[11px] font-medium flex items-center justify-between">
              <span>{currentLang === "en" ? "Risk Status:" : "அபாய நிலை:"}</span>
              <span className="font-bold text-emerald-700">
                {currentLang === "en" ? "Stable" : "சீரானது"}
              </span>
            </div>
          )}
        </div>

        <div className="text-[11px] text-stone-500 leading-relaxed px-1">
          <div className="font-semibold text-stone-700 flex items-center gap-1">
            <Info className="w-3 h-3 text-stone-500" />
            <span>NABARD MABIF Hackathon</span>
          </div>
          <p className="mt-0.5 text-[10px] text-stone-500">
            Decision-support software prototype. No physical IoT required.
          </p>
        </div>
      </div>
    </aside>
  );
};
