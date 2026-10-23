import React from "react";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  PackageCheck,
  TrendingDown,
  Layers,
  ArrowUpRight,
  Clock,
  Sparkles,
  PlusCircle,
  RefreshCw,
  FileText,
  Thermometer,
  ExternalLink,
} from "lucide-react";
import { ProduceBatch } from "../types";
import { Language, TRANSLATIONS } from "../utils/translations";
import { TabType } from "./Sidebar";

interface DashboardViewProps {
  batches: ProduceBatch[];
  onSelectTab: (tab: TabType) => void;
  onOpenNewBatchModal: () => void;
  onResetDemoData: () => void;
  onViewReport: (batch: ProduceBatch) => void;
  onOpenDemoWalkthrough: () => void;
  currentLang: Language;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  batches,
  onSelectTab,
  onOpenNewBatchModal,
  onResetDemoData,
  onViewReport,
  onOpenDemoWalkthrough,
  currentLang,
}) => {
  const t = TRANSLATIONS[currentLang];

  // Aggregated calculations
  const totalBatches = batches.length;
  const totalQuantityKg = batches.reduce((sum, b) => sum + b.quantityKg, 0);

  const lowRiskBatches = batches.filter((b) => b.assessment.riskLevel === "Low");
  const mediumRiskBatches = batches.filter((b) => b.assessment.riskLevel === "Medium");
  const highRiskBatches = batches.filter((b) => b.assessment.riskLevel === "High");

  const totalAtRiskKg = batches.reduce((sum, b) => {
    const atRiskFraction = b.assessment.estimatedLossPercentage / 100;
    return sum + b.quantityKg * atRiskFraction;
  }, 0);

  const totalAtRiskPercentage = totalQuantityKg > 0 ? (totalAtRiskKg / totalQuantityKg) * 100 : 0;

  // Approximate monetary loss prevention calculation based on ₹25/kg average farm gate price
  const avgPricePerKg = 28;
  const estimatedValueAtRisk = Math.round(totalAtRiskKg * avgPricePerKg);

  // Group by crop
  const cropCounts: Record<string, { count: number; kg: number }> = {};
  batches.forEach((b) => {
    if (!cropCounts[b.crop]) cropCounts[b.crop] = { count: 0, kg: 0 };
    cropCounts[b.crop].count += 1;
    cropCounts[b.crop].kg += b.quantityKg;
  });

  return (
    <div className="space-y-6">
      {/* Top Welcome / Title row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
              {currentLang === "en" ? "Active Decision Engine" : "செயலில் உள்ள முடிவெடுக்கும் தளம்"}
            </span>
            <span className="bg-stone-100 text-stone-600 text-xs font-semibold px-2 py-0.5 rounded border border-stone-200">
              Demo Mode Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            {t.dashboard.title}
          </h1>
          <p className="text-sm text-stone-500 mt-1 max-w-2xl">
            {t.dashboard.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onResetDemoData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-all cursor-pointer border border-stone-200"
            title="Reset to default 5 demonstration batches"
          >
            <RefreshCw className="w-3.5 h-3.5 text-stone-500" />
            <span>{t.dashboard.loadDemoData}</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewBatchModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-all shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-emerald-200" />
            <span>{t.dashboard.newBatch}</span>
          </button>
        </div>
      </div>

      {/* Demo Data Disclaimer notice banner */}
      <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-3 sm:px-4 text-xs text-amber-900 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-bold uppercase tracking-wider text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
            Transparency Note
          </span>
          <span className="text-amber-800">
            {t.common.demoDataNotice}. All baseline deterioration calculations use transparent ICAR rules. You can add or edit your own batches anytime.
          </span>
        </div>
        <button
          type="button"
          onClick={onOpenDemoWalkthrough}
          className="shrink-0 text-emerald-800 hover:text-emerald-950 font-bold underline cursor-pointer text-xs"
        >
          {currentLang === "en" ? "Guided Walkthrough →" : "வழிகாட்டி டெமோ →"}
        </button>
      </div>

      {/* 4 Primary KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Produce Monitored */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {t.dashboard.totalProduce}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <PackageCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              {(totalQuantityKg / 1000).toFixed(1)}{" "}
              <span className="text-base font-semibold text-stone-500">MT</span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5 font-medium">
              {totalQuantityKg.toLocaleString()} kg across {totalBatches} active batches
            </p>
          </div>
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-emerald-700 font-semibold">
            <span>Harvest Yield Monitored</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* High Risk Batches */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {t.dashboard.highRiskBatches}
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">
              {highRiskBatches.length}{" "}
              <span className="text-base font-semibold text-stone-500">
                / {totalBatches}
              </span>
            </div>
            <p className="text-xs text-rose-700/90 mt-0.5 font-medium">
              Require priority dispatch within 8–18 hrs
            </p>
          </div>
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-rose-700 font-semibold">
            <span>Urgent Dispatch Needed</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          </div>
        </div>

        {/* Quantity at Risk */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {t.dashboard.quantityAtRisk}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight">
              {Math.round(totalAtRiskKg).toLocaleString()}{" "}
              <span className="text-base font-semibold text-stone-500">kg</span>
            </div>
            <p className="text-xs text-amber-700 mt-0.5 font-medium">
              ~{totalAtRiskPercentage.toFixed(1)}% of monitored produce volume
            </p>
          </div>
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>Est. Value: ~₹{estimatedValueAtRisk.toLocaleString()}</span>
            <span className="text-[10px] text-stone-400">@₹{avgPricePerKg}/kg</span>
          </div>
        </div>

        {/* Stable / Low Risk Produce */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {currentLang === "en" ? "Safely Preserved" : "பாதுகாப்பான பயிர்"}
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-teal-700 tracking-tight">
              {lowRiskBatches.length}{" "}
              <span className="text-base font-semibold text-stone-500">Batches</span>
            </div>
            <p className="text-xs text-teal-800 mt-0.5 font-medium">
              In optimal cold store or ZECC conditions
            </p>
          </div>
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-teal-700 font-semibold">
            <span>Safe Window &gt; 48 hrs</span>
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Middle Section: Visual Risk Distribution Meter & Crop Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Chart Card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-stone-900">
                {t.dashboard.riskBreakdown}
              </h2>
              <p className="text-xs text-stone-500">
                Proportion of batches categorized by botanical deterioration vulnerability
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSelectTab("assessment")}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
            >
              <span>{currentLang === "en" ? "Risk Rules Engine" : "விதிகள் எஞ்சின்"}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Segmented Horizontal Progress Bar */}
          <div className="space-y-2">
            <div className="h-6 w-full rounded-xl bg-stone-100 overflow-hidden flex shadow-inner">
              {lowRiskBatches.length > 0 && (
                <div
                  style={{ width: `${(lowRiskBatches.length / totalBatches) * 100}%` }}
                  className="bg-emerald-500 flex items-center justify-center text-[11px] font-bold text-white transition-all duration-500"
                  title={`Low Risk: ${lowRiskBatches.length} batches`}
                >
                  {lowRiskBatches.length} Low
                </div>
              )}
              {mediumRiskBatches.length > 0 && (
                <div
                  style={{ width: `${(mediumRiskBatches.length / totalBatches) * 100}%` }}
                  className="bg-amber-500 flex items-center justify-center text-[11px] font-bold text-stone-950 transition-all duration-500"
                  title={`Medium Risk: ${mediumRiskBatches.length} batches`}
                >
                  {mediumRiskBatches.length} Med
                </div>
              )}
              {highRiskBatches.length > 0 && (
                <div
                  style={{ width: `${(highRiskBatches.length / totalBatches) * 100}%` }}
                  className="bg-rose-500 flex items-center justify-center text-[11px] font-bold text-white transition-all duration-500"
                  title={`High Risk: ${highRiskBatches.length} batches`}
                >
                  {highRiskBatches.length} High
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>{t.common.low}</span>
                </div>
                <div className="text-xl font-extrabold text-emerald-900 mt-1">
                  {lowRiskBatches.length}{" "}
                  <span className="text-xs font-normal text-emerald-700">
                    ({totalBatches ? Math.round((lowRiskBatches.length / totalBatches) * 100) : 0}%)
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Optimal thermal zone, minimal loss
                </p>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span>{t.common.medium}</span>
                </div>
                <div className="text-xl font-extrabold text-amber-900 mt-1">
                  {mediumRiskBatches.length}{" "}
                  <span className="text-xs font-normal text-amber-700">
                    ({totalBatches ? Math.round((mediumRiskBatches.length / totalBatches) * 100) : 0}%)
                  </span>
                </div>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Pre-cool and dispatch within 24–36 hrs
                </p>
              </div>

              <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span>{t.common.high}</span>
                </div>
                <div className="text-xl font-extrabold text-rose-900 mt-1">
                  {highRiskBatches.length}{" "}
                  <span className="text-xs font-normal text-rose-700">
                    ({totalBatches ? Math.round((highRiskBatches.length / totalBatches) * 100) : 0}%)
                  </span>
                </div>
                <p className="text-[11px] text-rose-700 mt-0.5">
                  Segregate immediately; avoid delay
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Prompt for AI scanner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span className="font-bold text-sm">
                  {currentLang === "en" ? "Scan Fresh Produce with Gemini AI" : "ஜெமினி AI மூலம் பயிரை ஸ்கேன் செய்க"}
                </span>
              </div>
              <p className="text-xs text-emerald-200">
                Capture optical cues of bruising, mold, and maturity to instantly update batch risk.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSelectTab("scanner")}
              className="bg-amber-400 hover:bg-amber-500 text-stone-950 font-bold px-3.5 py-1.5 rounded-lg text-xs shadow-xs transition-all shrink-0 cursor-pointer"
            >
              {currentLang === "en" ? "Launch Scanner →" : "ஸ்கேனர் திறக்க →"}
            </button>
          </div>
        </div>

        {/* Crop Breakdown Card */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900">
              {currentLang === "en" ? "Crops Under Monitoring" : "கண்காணிக்கப்படும் பயிர்கள்"}
            </h2>
            <span className="text-xs font-semibold text-stone-500">
              {Object.keys(cropCounts).length} Varieties
            </span>
          </div>

          <div className="space-y-2.5">
            {Object.entries(cropCounts).map(([crop, data]) => {
              const fraction = totalQuantityKg > 0 ? (data.kg / totalQuantityKg) * 100 : 0;
              return (
                <div key={crop} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="font-bold text-stone-800">{crop}</span>
                    <span className="text-stone-600">
                      {data.kg.toLocaleString()} kg ({data.count} batches)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                    <div
                      style={{ width: `${fraction}%` }}
                      className="h-full bg-emerald-600 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-stone-100 text-[11px] text-stone-500 leading-relaxed">
            <span className="font-semibold text-stone-700">Storage Guidance: </span>
            Perishable crops (Tomato, Banana, Mango) require active temperature control below 15°C to avoid accelerated Q10 respiration.
          </div>
        </div>
      </div>

      {/* Critical Actions Requiring Attention Alert Cards */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">
                {t.dashboard.urgentAlerts}
              </h2>
              <p className="text-xs text-stone-500">
                Operational decisions required within current harvest shift
              </p>
            </div>
          </div>
          <span className="text-xs font-bold bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full">
            {highRiskBatches.length} Urgent Actions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {highRiskBatches.map((batch) => (
            <div
              key={batch.id}
              className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 hover:bg-rose-50/70 transition-all space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-stone-900">
                      {batch.batchCode}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-200 text-rose-900">
                      High Risk ({batch.assessment.riskScore}/100)
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-0.5">
                    {batch.crop} • {batch.quantityKg.toLocaleString()} kg • {batch.location}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-rose-700 flex items-center gap-1 justify-end">
                    <Clock className="w-3.5 h-3.5" />
                    {batch.assessment.safeDispatchHours}h window
                  </span>
                </div>
              </div>

              <div className="text-xs text-stone-700 bg-white/80 p-2.5 rounded-lg border border-rose-200/60 font-medium">
                <span className="font-bold text-rose-900">Immediate Action: </span>
                {batch.assessment.immediateActions[0] || "Segregate and dispatch earliest."}
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-stone-500 flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-stone-400" />
                  Stored at {batch.storageTempC}°C ({batch.storageType})
                </span>
                <button
                  type="button"
                  onClick={() => onViewReport(batch)}
                  className="font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
                >
                  View Details & Report →
                </button>
              </div>
            </div>
          ))}

          {highRiskBatches.length === 0 && (
            <div className="col-span-2 p-6 rounded-xl border border-dashed border-stone-300 text-center text-sm text-stone-500">
              No high-risk produce batches currently detected. All active batches are within safe storage parameters.
            </div>
          )}
        </div>
      </div>

      {/* Recent Produce Assessments Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-stone-900">
              {t.dashboard.recentBatches}
            </h2>
            <p className="text-xs text-stone-500">
              Latest post-harvest assessments and mitigation status
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelectTab("batches")}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
          >
            <span>{currentLang === "en" ? "Manage All Batches" : "அனைத்து தொகுதிகள்"}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-700">
            <thead className="bg-stone-50 text-[11px] font-bold text-stone-500 uppercase tracking-wider border-b border-stone-200">
              <tr>
                <th className="px-5 py-3">Batch Code & Crop</th>
                <th className="px-5 py-3">Quantity</th>
                <th className="px-5 py-3">Storage Env</th>
                <th className="px-5 py-3">Visible Condition</th>
                <th className="px-5 py-3">Deterioration Risk</th>
                <th className="px-5 py-3">Safe Window</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {batches.map((batch) => {
                const isHigh = batch.assessment.riskLevel === "High";
                const isMed = batch.assessment.riskLevel === "Medium";

                return (
                  <tr key={batch.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-stone-900">{batch.batchCode}</div>
                      <div className="text-xs text-stone-500">{batch.crop} • {batch.farmerName}</div>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-stone-800">
                      {batch.quantityKg.toLocaleString()} kg
                    </td>
                    <td className="px-5 py-3.5 text-xs text-stone-600">
                      <div>{batch.storageTempC}°C • {batch.storageHumidityPercent}% RH</div>
                      <div className="text-stone-400 text-[11px]">{batch.storageType}</div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-stone-700">
                      <span className="font-medium">{batch.visibleCondition}</span>
                      <div className="text-[11px] text-stone-400">{batch.packaging}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          isHigh
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : isMed
                            ? "bg-amber-100 text-amber-900 border border-amber-200"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isHigh ? "bg-rose-600" : isMed ? "bg-amber-600" : "bg-emerald-600"
                          }`}
                        />
                        {batch.assessment.riskLevel} ({batch.assessment.riskScore}/100)
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-bold text-stone-800">
                      {batch.assessment.safeDispatchHours} hours
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => onViewReport(batch)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer border border-emerald-200"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Report</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
