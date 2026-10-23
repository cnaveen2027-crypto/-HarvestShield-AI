import React from "react";
import {
  X,
  Printer,
  Shield,
  Download,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  MapPin,
  Thermometer,
  Droplets,
  Package,
  Layers,
  Clock,
  Info,
} from "lucide-react";
import { ProduceBatch } from "../types";
import { Language, TRANSLATIONS } from "../utils/translations";

interface ReportModalProps {
  batch: ProduceBatch | null;
  onClose: () => void;
  currentLang: Language;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  batch,
  onClose,
  currentLang,
}) => {
  const t = TRANSLATIONS[currentLang];

  if (!batch) return null;

  const handlePrint = () => {
    window.print();
  };

  const isHigh = batch.assessment.riskLevel === "High";
  const isMed = batch.assessment.riskLevel === "Medium";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      {/* Modal Container */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-stone-200 overflow-hidden flex flex-col my-auto max-h-[95vh]">
        {/* Top Action Bar (hidden when printing) */}
        <div className="bg-stone-900 text-white p-4 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight">
              Assessment Report Preview
            </span>
            <span className="text-xs bg-emerald-700 text-emerald-100 font-bold px-2 py-0.5 rounded">
              {batch.batchCode}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{t.common.print}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div className="p-6 sm:p-10 overflow-y-auto space-y-6 print:p-0 print:space-y-4 text-stone-900">
          {/* Official Document Header */}
          <div className="border-b-2 border-emerald-900 pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-900 text-white flex items-center justify-center font-bold">
                  <Shield className="w-5 h-5 text-emerald-200" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-emerald-950">
                    HarvestShield AI
                  </h1>
                  <p className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
                    Post-Harvest Loss Prevention & Decision Support Platform
                  </p>
                </div>
              </div>
              <p className="text-xs text-stone-500 font-medium">
                NABARD MABIF • JALLIKATTU 5.0 Agricultural Innovation Hackathon
              </p>
            </div>

            <div className="sm:text-right text-xs text-stone-600 space-y-1">
              <div className="font-extrabold text-sm text-stone-900">
                OFFICIAL BATCH ASSESSMENT
              </div>
              <div>
                <strong>Batch ID: </strong>
                <span className="font-mono font-bold text-stone-900">{batch.batchCode}</span>
              </div>
              <div>
                <strong>Report Generated: </strong>
                <span>{new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}</span>
              </div>
              <div className="text-[11px] text-stone-500">
                Verified Decision Model: ICAR-CIPHET Baseline v2.4
              </div>
            </div>
          </div>

          {/* Farmer & Batch Overview Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs">
            <div>
              <span className="text-[10px] font-bold text-stone-500 uppercase">
                Farmer / FPO
              </span>
              <div className="font-bold text-stone-900 text-sm mt-0.5">
                {batch.farmerName}
              </div>
              <div className="text-stone-500 text-[11px]">{batch.location}</div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-stone-500 uppercase">
                Crop & Quantity
              </span>
              <div className="font-bold text-emerald-900 text-sm mt-0.5">
                {batch.crop} {batch.variety ? `(${batch.variety})` : ""}
              </div>
              <div className="text-stone-600 font-semibold">
                {batch.quantityKg.toLocaleString()} kg ({(batch.quantityKg / 1000).toFixed(2)} MT)
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-stone-500 uppercase">
                Harvest Date
              </span>
              <div className="font-bold text-stone-900 mt-0.5">
                {new Date(batch.harvestDateTime).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </div>
              <div className="text-stone-500 text-[11px]">
                Transit Delay: {batch.transitDelayHours} hrs
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-stone-500 uppercase">
                Deterioration Risk
              </span>
              <div
                className={`text-sm font-black mt-0.5 flex items-center gap-1.5 ${
                  isHigh ? "text-rose-700" : isMed ? "text-amber-700" : "text-emerald-700"
                }`}
              >
                <span>{batch.assessment.riskLevel}</span>
                <span className="text-xs font-bold text-stone-500">
                  ({batch.assessment.riskScore}/100)
                </span>
              </div>
              <div className="text-stone-600 font-semibold text-[11px]">
                Safe Window: {batch.assessment.safeDispatchHours} hrs
              </div>
            </div>
          </div>

          {/* Storage & Environmental Conditions */}
          <div className="border border-stone-200 rounded-xl p-4 space-y-2">
            <h2 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-emerald-800" />
              Storage Environment Parameters
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-stone-500">Temperature:</span>{" "}
                <strong className="text-stone-900">{batch.storageTempC}°C</strong>
              </div>
              <div>
                <span className="text-stone-500">Relative Humidity:</span>{" "}
                <strong className="text-stone-900">{batch.storageHumidityPercent}%</strong>
              </div>
              <div>
                <span className="text-stone-500">Storage Facility:</span>{" "}
                <strong className="text-stone-900">{batch.storageType}</strong>
              </div>
              <div>
                <span className="text-stone-500">Packaging:</span>{" "}
                <strong className="text-stone-900">{batch.packaging}</strong>
              </div>
            </div>
          </div>

          {/* Optical AI Image Scan findings if available */}
          {batch.scanResult && (
            <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  Gemini Optical Visual Inspection
                </h2>
                <span className="text-[11px] font-bold text-emerald-800">
                  Freshness Score: {batch.scanResult.freshnessScore}/100 ({batch.scanResult.freshnessGrade})
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {batch.scanResult.imageUrl && (
                  <div className="w-32 h-24 rounded-lg overflow-hidden bg-white border border-stone-200 shrink-0">
                    <img
                      src={batch.scanResult.imageUrl}
                      alt="Crop Scan"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="space-y-1.5 text-xs text-stone-700 flex-1">
                  <p className="font-medium leading-relaxed">
                    {batch.scanResult.visibleConditionSummary}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {batch.scanResult.defectTags.map((d, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-white border border-stone-200 text-[10px] font-semibold text-stone-700">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Identified Contributing Factors Breakdown */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              Identified Contributing Deterioration Factors
            </h2>
            <div className="space-y-1.5">
              {batch.assessment.contributingFactors.map((f, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between gap-3 p-2.5 rounded-lg border border-stone-200 text-xs bg-stone-50/50"
                >
                  <div>
                    <span className="font-bold text-stone-900">{f.factor}: </span>
                    <span className="text-stone-600">{f.description}</span>
                  </div>
                  <span
                    className={`font-black shrink-0 px-2 py-0.5 rounded text-[11px] ${
                      f.impactScore > 0 ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {f.impactScore > 0 ? `+${f.impactScore}` : `${f.impactScore}`} pts
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Immediate Action Recommendations */}
          <div className="bg-emerald-900 text-white rounded-xl p-4 space-y-2">
            <h2 className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
              Mandatory Action Plan to Prevent Post-Harvest Loss
            </h2>
            <ol className="space-y-1.5 text-xs text-emerald-50 list-decimal list-inside font-medium leading-relaxed">
              {batch.assessment.immediateActions.map((act, i) => (
                <li key={i}>{act}</li>
              ))}
            </ol>
          </div>

          {/* Market Comparison Summary if entered */}
          {batch.marketOptions && batch.marketOptions.length > 0 && (
            <div className="border border-stone-200 rounded-xl p-4 space-y-2">
              <h2 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Assessed Market Destinations & Net Realization
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {batch.marketOptions.map((opt, i) => {
                  const gross = batch.quantityKg * opt.pricePerKg;
                  const net = gross - opt.transportCost - opt.otherCosts;
                  const netPerKg = net / batch.quantityKg;
                  return (
                    <div key={i} className="p-3 rounded-lg bg-stone-50 border border-stone-200 space-y-1">
                      <div className="font-bold text-stone-900">{opt.marketName}</div>
                      <div className="text-stone-500">
                        Offered: ₹{opt.pricePerKg}/kg • Transit: {opt.transitHours}h
                      </div>
                      <div className="pt-1 flex items-center justify-between font-bold text-emerald-900">
                        <span>Net In-Hand Revenue:</span>
                        <span>₹{net.toLocaleString()} (₹{netPerKg.toFixed(2)}/kg)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Official Signatures & Disclaimers Footer */}
          <div className="pt-6 border-t border-stone-300 space-y-4 text-xs text-stone-500">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-2">
              <div>
                <div className="h-10 border-b border-stone-400"></div>
                <div className="text-[11px] font-semibold text-stone-700 mt-1">
                  Farmer / FPO Representative Sign
                </div>
              </div>
              <div>
                <div className="h-10 border-b border-stone-400"></div>
                <div className="text-[11px] font-semibold text-stone-700 mt-1">
                  Field Quality Inspector Sign
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="h-10 border-b border-stone-400"></div>
                <div className="text-[11px] font-semibold text-stone-700 mt-1">
                  NABARD MABIF Hackathon Seal
                </div>
              </div>
            </div>

            <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 text-[10px] text-stone-500 leading-relaxed">
              <strong className="text-stone-700">Official Disclaimer: </strong>
              HarvestShield AI is a software prototype developed for the JALLIKATTU 5.0 Agri-Tech Hackathon organized by NABARD MABIF. Spoilage risk estimates and visual quality indices are decision-support heuristics based on ICAR-CIPHET and National Horticulture Board post-harvest guidelines. They do not constitute certified biological warranties. Always physically verify produce prior to auction or dispatch.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
