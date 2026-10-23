import React, { useState } from "react";
import {
  TrendingUp,
  Scale,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Info,
  DollarSign,
  Truck,
  Building2,
  ShieldAlert,
} from "lucide-react";
import { MarketOption, ProduceBatch } from "../types";
import { Language, TRANSLATIONS } from "../utils/translations";

interface MarketIntelligenceViewProps {
  batches: ProduceBatch[];
  currentLang: Language;
}

export const MarketIntelligenceView: React.FC<MarketIntelligenceViewProps> = ({
  batches,
  currentLang,
}) => {
  const t = TRANSLATIONS[currentLang];

  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    batches[0]?.id || "custom"
  );
  const [customCrop, setCustomCrop] = useState<string>("Tomato");
  const [quantityKg, setQuantityKg] = useState<number>(
    batches[0]?.quantityKg || 2400
  );

  // Initial user-provided market options
  const [options, setOptions] = useState<MarketOption[]>([
    {
      id: "opt-1",
      marketName: "Koyambedu Wholesale Terminal (Chennai)",
      buyerType: "Wholesale APMC Mandi",
      pricePerKg: 34,
      distanceKm: 280,
      transitHours: 7.5,
      transportCost: 9500,
      otherCosts: 3200,
      notes: "High nominal rate, but 7.5h hot transit risks juice leakage for bruised stock.",
    },
    {
      id: "opt-2",
      marketName: "Dindigul Local APMC / Uzhavar Sandhai",
      buyerType: "Farmer Market (Uzhavar Sandhai)",
      pricePerKg: 27,
      distanceKm: 45,
      transitHours: 1.5,
      transportCost: 2200,
      otherCosts: 600,
      notes: "Quick 1.5h delivery preserves current grade with zero transit deterioration.",
    },
    {
      id: "opt-3",
      marketName: "Local Farm-Gate Village Trader (Middleman)",
      buyerType: "Local Trader / Middleman",
      pricePerKg: 22,
      distanceKm: 0,
      transitHours: 0,
      transportCost: 0,
      otherCosts: 0,
      notes: "Immediate cash at farm-gate, zero transport, but lowest price realization.",
    },
  ]);

  // When a batch is selected from the dropdown
  const handleBatchSelect = (batchId: string) => {
    setSelectedBatchId(batchId);
    if (batchId !== "custom") {
      const b = batches.find((x) => x.id === batchId);
      if (b) {
        setQuantityKg(b.quantityKg);
        setCustomCrop(b.crop);
      }
    }
  };

  // Calculations for each option
  const calculatedOptions = options.map((opt) => {
    const grossRevenue = Math.round(quantityKg * opt.pricePerKg);
    const totalDeductions = opt.transportCost + opt.otherCosts;
    const netRevenue = grossRevenue - totalDeductions;
    const netPerKg = quantityKg > 0 ? netRevenue / quantityKg : 0;
    return {
      ...opt,
      grossRevenue,
      totalDeductions,
      netRevenue,
      netPerKg,
    };
  });

  // Find highest net revenue
  const maxNetRevenue = Math.max(...calculatedOptions.map((o) => o.netRevenue));
  const minNetRevenue = Math.min(...calculatedOptions.map((o) => o.netRevenue));
  const bestOption = calculatedOptions.find((o) => o.netRevenue === maxNetRevenue);

  const handleAddOption = () => {
    const newOpt: MarketOption = {
      id: `opt-${Date.now()}`,
      marketName: "New Market / Buyer Destination",
      buyerType: "Wholesale APMC Mandi",
      pricePerKg: 28,
      distanceKm: 50,
      transitHours: 2,
      transportCost: 2500,
      otherCosts: 800,
      notes: "User-entered candidate buyer",
    };
    setOptions([...options, newOpt]);
  };

  const handleUpdateOption = (id: string, field: keyof MarketOption, value: any) => {
    setOptions(
      options.map((opt) => (opt.id === id ? { ...opt, [field]: value } : opt))
    );
  };

  const handleRemoveOption = (id: string) => {
    if (options.length <= 1) return;
    setOptions(options.filter((opt) => opt.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" />
              Net Farmer Realization
            </span>
            <span className="text-xs font-semibold text-stone-500">
              Transport & Loss Adjusted
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            {t.market.title}
          </h1>
          <p className="text-sm text-stone-500 mt-1 max-w-2xl">
            {t.market.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddOption}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-all shadow-xs cursor-pointer self-start md:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>{t.market.addOption}</span>
        </button>
      </div>

      {/* Mandatory User-Data Label Notice */}
      <div className="bg-stone-100 border border-stone-300 rounded-xl p-3.5 text-xs text-stone-700 flex items-center gap-2.5">
        <Info className="w-4 h-4 text-stone-500 shrink-0" />
        <div>
          <strong className="font-bold text-stone-900">
            {t.market.userEnteredNotice}:{" "}
          </strong>
          <span>
            These market prices and transport costs are entered directly by the farmer/FPO for decision comparison. HarvestShield does not fabricate live ticker rates.
          </span>
        </div>
      </div>

      {/* Produce Volume Selection Bar */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div>
          <label className="text-xs font-bold text-stone-600 block mb-1">
            Select Active Batch or Custom
          </label>
          <select
            value={selectedBatchId}
            onChange={(e) => handleBatchSelect(e.target.value)}
            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="custom">Custom Produce Quantity</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.batchCode} ({b.crop} - {b.quantityKg} kg - {b.assessment.riskLevel} Risk)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-stone-600 block mb-1">
            Quantity to Sell (kg)
          </label>
          <input
            type="number"
            min="100"
            step="100"
            value={quantityKg}
            onChange={(e) => setQuantityKg(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-extrabold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200">
          <div className="text-[11px] font-bold text-emerald-900 uppercase">
            Produce Summary
          </div>
          <div className="text-xs text-emerald-800 font-semibold mt-0.5">
            {customCrop} • {quantityKg.toLocaleString()} kg ({(quantityKg / 1000).toFixed(2)} MT)
          </div>
          <div className="text-[11px] text-emerald-700">
            Comparing net revenue after all transport & handling costs.
          </div>
        </div>
      </div>

      {/* Comparison Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {calculatedOptions.map((opt, idx) => {
          const isBest = opt.netRevenue === maxNetRevenue && calculatedOptions.length > 1;

          return (
            <div
              key={opt.id}
              className={`bg-white rounded-2xl border p-5 space-y-4 transition-all relative flex flex-col justify-between ${
                isBest
                  ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
                  : "border-stone-200 shadow-xs"
              }`}
            >
              {isBest && (
                <div className="absolute -top-3 right-4 bg-emerald-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1 uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t.market.recommended}
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                      Option {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={opt.marketName}
                      onChange={(e) =>
                        handleUpdateOption(opt.id, "marketName", e.target.value)
                      }
                      className="font-extrabold text-base text-stone-900 w-full bg-transparent border-b border-dashed border-stone-300 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  {options.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(opt.id)}
                      className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer"
                      title="Remove option"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Input Fields */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-stone-500 block mb-0.5">
                      Offered Price (₹/kg)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1.5 text-xs text-stone-400">
                        ₹
                      </span>
                      <input
                        type="number"
                        step="0.5"
                        value={opt.pricePerKg}
                        onChange={(e) =>
                          handleUpdateOption(
                            opt.id,
                            "pricePerKg",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full pl-6 pr-2 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs font-black text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-500 block mb-0.5">
                      Transit Delay (Hours)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={opt.transitHours}
                      onChange={(e) =>
                        handleUpdateOption(
                          opt.id,
                          "transitHours",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full px-2.5 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-500 block mb-0.5">
                      Transport Cost (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1.5 text-xs text-stone-400">
                        ₹
                      </span>
                      <input
                        type="number"
                        step="100"
                        value={opt.transportCost}
                        onChange={(e) =>
                          handleUpdateOption(
                            opt.id,
                            "transportCost",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full pl-6 pr-2 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs font-semibold text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-500 block mb-0.5">
                      Other Costs (Cess/Labor)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1.5 text-xs text-stone-400">
                        ₹
                      </span>
                      <input
                        type="number"
                        step="100"
                        value={opt.otherCosts}
                        onChange={(e) =>
                          handleUpdateOption(
                            opt.id,
                            "otherCosts",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full pl-6 pr-2 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs font-semibold text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Calculated Results Block */}
                <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500 font-medium">Gross Revenue:</span>
                    <span className="font-bold text-stone-900">
                      ₹{opt.grossRevenue.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-rose-700">
                    <span className="font-medium">Total Deductions:</span>
                    <span className="font-bold">
                      -₹{opt.totalDeductions.toLocaleString()}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-stone-500 uppercase">
                        Net Revenue
                      </div>
                      <div className="text-xl font-black text-emerald-800">
                        ₹{opt.netRevenue.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-stone-500 uppercase">
                        Net / kg
                      </div>
                      <div className="text-base font-extrabold text-stone-900">
                        ₹{opt.netPerKg.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes Input */}
                <div>
                  <input
                    type="text"
                    placeholder="Notes (e.g. mandi commission or buyer terms)"
                    value={opt.notes || ""}
                    onChange={(e) =>
                      handleUpdateOption(opt.id, "notes", e.target.value)
                    }
                    className="w-full text-[11px] text-stone-500 italic bg-transparent border-none focus:ring-0 p-0"
                  />
                </div>
              </div>

              {/* Transit Risk Note */}
              {opt.transitHours > 6 && (
                <div className="bg-amber-50 border border-amber-200 p-2 rounded-lg text-[11px] text-amber-900 flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>{opt.transitHours}h transit delay risks deterioration on warm days.</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Difference Analysis & Recommendation Card */}
      {calculatedOptions.length > 1 && bestOption && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">
                {currentLang === "en" ? "Market Revenue Difference Analysis" : "வருவாய் ஒப்பீட்டு ஆய்வு"}
              </h2>
              <p className="text-xs text-stone-500">
                Net in-hand difference between highest and lowest yielding market channels
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="text-xs font-bold text-emerald-900">
                Highest Net In-Hand Realization:
              </div>
              <div className="text-xl font-black text-emerald-800 mt-1">
                {bestOption.marketName}
              </div>
              <p className="text-xs text-emerald-700 mt-1">
                Net: ₹{bestOption.netRevenue.toLocaleString()} (₹{bestOption.netPerKg.toFixed(2)}/kg).
                Yields <strong className="font-extrabold">+₹{(maxNetRevenue - minNetRevenue).toLocaleString()}</strong> more than the lowest option.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-950">
                <ShieldAlert className="w-4 h-4 text-amber-700" />
                Deterioration-Adjusted Decision Rule:
              </div>
              <p className="leading-relaxed">
                If the produce batch already has <strong>High Deterioration Risk</strong> (cracked skin or softening), long-haul transit to distant terminal markets risks 10–25% in-transit juice leakage or fungal rot. In such scenarios, selling quickly at a local mandi at ₹{bestOption.pricePerKg - 5}/kg often yields higher safe net income than risking full rejection at distant mandis.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
