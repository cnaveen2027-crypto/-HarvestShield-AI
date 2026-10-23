import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Gauge,
  Thermometer,
  Droplets,
  Clock,
  Package,
  Layers,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Save,
  PlusCircle,
  CloudSun,
  Sun,
  CloudRain,
  Wind,
  Flame,
  Search,
  RefreshCw,
  Compass,
} from "lucide-react";
import {
  AssessmentDetails,
  CropType,
  PackagingType,
  ProduceBatch,
  ScanResult,
  StorageType,
  VisibleConditionGrade,
  WeatherForecastDay,
  WeatherForecastResponse,
} from "../types";
import { calculateDeteriorationRisk } from "../utils/riskCalculator";
import { CROP_PROFILES } from "../data/cropProfiles";
import { Language, TRANSLATIONS } from "../utils/translations";
import { fetchWeatherForecast } from "../services/weatherService";
import { generateCropWeatherAdvisories } from "../utils/cropWeatherAdvisor";

interface RiskAssessmentViewProps {
  initialCrop?: CropType;
  initialCondition?: VisibleConditionGrade;
  initialScanResult?: ScanResult | null;
  onSaveAsBatch: (batchData: Partial<ProduceBatch>) => void;
  currentLang: Language;
}

export const RiskAssessmentView: React.FC<RiskAssessmentViewProps> = ({
  initialCrop = "Tomato",
  initialCondition = "Grade B (Minor Blemishes)",
  initialScanResult = null,
  onSaveAsBatch,
  currentLang,
}) => {
  const t = TRANSLATIONS[currentLang];

  // Form states with sensible agricultural defaults
  const [crop, setCrop] = useState<CropType>(initialCrop);
  const [quantityKg, setQuantityKg] = useState<number>(1500);
  const [harvestDateTime, setHarvestDateTime] = useState<string>(
    new Date(Date.now() - 12 * 3600 * 1000).toISOString().slice(0, 16)
  );
  const [storageTempC, setStorageTempC] = useState<number>(28);
  const [storageHumidityPercent, setStorageHumidityPercent] = useState<number>(75);
  const [storageType, setStorageType] = useState<StorageType>("Ambient Ventilated Room");
  const [transitDelayHours, setTransitDelayHours] = useState<number>(12);
  const [visibleCondition, setVisibleCondition] = useState<VisibleConditionGrade>(
    initialCondition
  );
  const [packaging, setPackaging] = useState<PackagingType>("Ventilated Plastic Crates");
  const [farmerName, setFarmerName] = useState<string>("S. Marimuthu (Farmer)");
  const [location, setLocation] = useState<string>("Dharmapuri, Tamil Nadu");

  // Weather API states
  const [weatherLocation, setWeatherLocation] = useState<string>("Dharmapuri, Tamil Nadu");
  const [weatherForecast, setWeatherForecast] = useState<WeatherForecastResponse | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(false);
  const [selectedWeatherDayIndex, setSelectedWeatherDayIndex] = useState<number | null>(null);
  const [weatherAppliedMessage, setWeatherAppliedMessage] = useState<string | null>(null);

  // Dynamic assessment calculation
  const [assessment, setAssessment] = useState<AssessmentDetails>(() =>
    calculateDeteriorationRisk({
      crop: initialCrop,
      quantityKg: 1500,
      harvestDateTime: new Date().toISOString(),
      storageTempC: 28,
      storageHumidityPercent: 75,
      storageType: "Ambient Ventilated Room",
      transitDelayHours: 12,
      visibleCondition: initialCondition,
      packaging: "Ventilated Plastic Crates",
    })
  );

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Fetch initial weather forecast on mount
  useEffect(() => {
    loadWeather(location || "Dharmapuri, Tamil Nadu");
  }, []);

  const loadWeather = async (locQuery: string) => {
    setIsLoadingWeather(true);
    try {
      const data = await fetchWeatherForecast(locQuery);
      setWeatherForecast(data);
      setWeatherLocation(data.location);
    } catch (e) {
      console.error("Failed to load weather forecast", e);
    } finally {
      setIsLoadingWeather(false);
    }
  };

  // Sync if props change from scanner transfer
  useEffect(() => {
    if (initialCrop) setCrop(initialCrop);
    if (initialCondition) setVisibleCondition(initialCondition);
  }, [initialCrop, initialCondition]);

  // Recalculate assessment whenever inputs change
  useEffect(() => {
    const errors: Record<string, string> = {};
    if (quantityKg <= 0 || isNaN(quantityKg)) errors.quantityKg = "Quantity must be greater than 0 kg";
    if (storageTempC < -10 || storageTempC > 55 || isNaN(storageTempC)) errors.storageTempC = "Temperature must be between -10°C and 55°C";
    if (storageHumidityPercent < 10 || storageHumidityPercent > 100 || isNaN(storageHumidityPercent)) errors.storageHumidityPercent = "Relative Humidity must be between 10% and 100%";
    if (transitDelayHours < 0 || transitDelayHours > 168 || isNaN(transitDelayHours)) errors.transitDelayHours = "Transit delay must be 0 to 168 hours";

    setValidationErrors(errors);

    if (Object.keys(errors).length === 0) {
      const result = calculateDeteriorationRisk({
        crop,
        quantityKg,
        harvestDateTime,
        storageTempC,
        storageHumidityPercent,
        storageType,
        transitDelayHours,
        visibleCondition,
        packaging,
      });
      setAssessment(result);
    }
  }, [
    crop,
    quantityKg,
    harvestDateTime,
    storageTempC,
    storageHumidityPercent,
    storageType,
    transitDelayHours,
    visibleCondition,
    packaging,
  ]);

  const profile = CROP_PROFILES[crop] || CROP_PROFILES["Other"];

  // Apply a specific day's weather to storage conditions
  const handleApplyWeatherDay = (day: WeatherForecastDay) => {
    setSelectedWeatherDayIndex(day.dayIndex);
    setStorageTempC(day.tempMax);
    setStorageHumidityPercent(day.humidityPercent);
    setWeatherAppliedMessage(
      `Applied ${day.dayName} Forecast: ${day.tempMax}°C Peak Temp & ${day.humidityPercent}% RH.`
    );
    setTimeout(() => setWeatherAppliedMessage(null), 4000);
  };

  // Apply 7-day average
  const handleApplyAverageWeather = () => {
    if (!weatherForecast) return;
    setSelectedWeatherDayIndex(null);
    setStorageTempC(weatherForecast.average7DayTempC);
    setStorageHumidityPercent(weatherForecast.average7DayHumidityPercent);
    setWeatherAppliedMessage(
      `Applied 7-Day Average: ${weatherForecast.average7DayTempC}°C & ${weatherForecast.average7DayHumidityPercent}% RH.`
    );
    setTimeout(() => setWeatherAppliedMessage(null), 4000);
  };

  // Apply peak heatwave stress test
  const handleApplyPeakHeat = () => {
    if (!weatherForecast) return;
    setSelectedWeatherDayIndex(null);
    setStorageTempC(weatherForecast.peakThermalTempC);
    setStorageHumidityPercent(weatherForecast.currentHumidityPercent);
    setWeatherAppliedMessage(
      `Stress Test Applied: Peak Heatwave of ${weatherForecast.peakThermalTempC}°C (${weatherForecast.peakThermalDay}).`
    );
    setTimeout(() => setWeatherAppliedMessage(null), 4000);
  };

  // Dynamic Crop × Weather cross-referenced recommendations
  const dynamicWeatherAdvisory = generateCropWeatherAdvisories(
    crop,
    weatherForecast,
    storageType,
    currentLang
  );

  const handleSaveBatch = () => {
    if (Object.keys(validationErrors).length > 0) return;

    // Merge dynamic weather protocols with baseline immediate actions
    const mergedAssessment: AssessmentDetails = {
      ...assessment,
      immediateActions: [
        ...dynamicWeatherAdvisory.actionProtocol,
        ...assessment.immediateActions.filter(
          (a) => !dynamicWeatherAdvisory.actionProtocol.includes(a)
        ),
      ],
    };

    onSaveAsBatch({
      batchCode: `HS-2026-${crop.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      farmerName,
      location,
      crop,
      quantityKg,
      harvestDateTime,
      storageTempC,
      storageHumidityPercent,
      storageType,
      transitDelayHours,
      visibleCondition,
      packaging,
      assessment: mergedAssessment,
      scanResult: initialScanResult || undefined,
      marketOptions: [
        {
          id: `mkt-def-1-${Date.now()}`,
          marketName: `${location.split(",")[0]} Local APMC Yard`,
          buyerType: "Wholesale APMC Mandi",
          pricePerKg: crop === "Tomato" ? 28 : crop === "Onion" ? 35 : 45,
          distanceKm: 35,
          transitHours: 1.5,
          transportCost: 1800,
          otherCosts: 600,
          notes: "Nearby mandi minimizing transit vibration and thermal spikes."
        }
      ],
      status: "Active",
    });

    setSaveSuccessMsg("Produce batch successfully saved to Active Batches!");
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  const isHigh = assessment.riskLevel === "High";
  const isMed = assessment.riskLevel === "Medium";

  // Weather-derived storage hazard evaluation
  const isHeatWaveIncoming =
    weatherForecast && weatherForecast.peakThermalTempC >= 36;
  const isRainIncoming =
    weatherForecast &&
    weatherForecast.forecastDays.some((d) => d.humidityPercent > 80);

  const clusterPresets = [
    "Dharmapuri, Tamil Nadu",
    "Theni Valley, Tamil Nadu",
    "Dindigul, Tamil Nadu",
    "Krishnagiri, Tamil Nadu",
    "Madurai, Tamil Nadu",
    "Nilgiris (Hill Zone)",
    "Perambalur (Shallot)",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5" />
              ICAR-CIPHET Rules Baseline
            </span>
            <span className="text-xs font-semibold text-stone-500">
              Q10 Thermal Kinetics & 7-Day Weather Outlook
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            {t.assessment.title}
          </h1>
          <p className="text-sm text-stone-500 mt-1 max-w-2xl">
            {t.assessment.subtitle}
          </p>
        </div>

        {initialScanResult && (
          <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Pre-filled from Gemini Visual Inspection</span>
          </div>
        )}
      </div>

      {/* 7-DAY LOCAL WEATHER FORECAST SERVICE WIDGET */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-sky-100 text-sky-800 text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                <CloudSun className="w-3.5 h-3.5 text-sky-600" />
                Local Agro-Weather Forecast Service
              </span>
              <span className="text-xs text-stone-400">
                7-Day Temperature & Humidity Outlook
              </span>
            </div>
            <h2 className="text-base font-bold text-stone-900 mt-1">
              {currentLang === "en" ? "Local Atmospheric Conditions for" : "உள்ளூர் வானிலை முன்னறிவிப்பு:"}{" "}
              <span className="text-emerald-800 font-black">{weatherForecast?.location || weatherLocation}</span>
            </h2>
          </div>

          {/* Location Search Bar & Cluster Presets */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={weatherLocation}
                onChange={(e) => setWeatherLocation(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") loadWeather(weatherLocation);
                }}
                placeholder="Enter district (e.g. Dharmapuri)"
                className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48 sm:w-56"
              />
            </div>
            <button
              type="button"
              onClick={() => loadWeather(weatherLocation)}
              disabled={isLoadingWeather}
              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-black text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              {isLoadingWeather ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Search className="w-3.5 h-3.5" />
              )}
              <span>Fetch Forecast</span>
            </button>
          </div>
        </div>

        {/* Quick Cluster Location Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
          <span className="font-bold text-stone-400 uppercase tracking-wider shrink-0">
            Horticulture Clusters:
          </span>
          {clusterPresets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setLocation(preset);
                loadWeather(preset);
              }}
              className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 text-stone-600 transition-colors shrink-0 cursor-pointer border border-stone-200 font-medium"
            >
              {preset.split(",")[0]}
            </button>
          ))}
        </div>

        {/* 7-Day Forecast Cards Strip */}
        {weatherForecast && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {weatherForecast.forecastDays.map((d) => {
                const isSelected = selectedWeatherDayIndex === d.dayIndex;
                const isHazardHigh = d.hazardLevel === "high";

                return (
                  <div
                    key={d.dayIndex}
                    onClick={() => handleApplyWeatherDay(d)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between text-xs ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20 shadow-xs"
                        : isHazardHigh
                        ? "border-rose-200 bg-rose-50/40 hover:bg-rose-50/80"
                        : "border-stone-200 bg-stone-50/70 hover:bg-stone-100/80"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-extrabold text-stone-900">{d.dayName}</span>
                        <span className="text-stone-400 text-[10px]">{d.dateFormatted}</span>
                      </div>

                      <div className="flex items-center gap-1.5 my-1.5">
                        {d.icon === "sun" && <Sun className="w-4 h-4 text-amber-500" />}
                        {d.icon === "cloud-sun" && <CloudSun className="w-4 h-4 text-sky-500" />}
                        {d.icon === "flame" && <Flame className="w-4 h-4 text-rose-500 animate-pulse" />}
                        {d.icon === "cloud-rain" && <CloudRain className="w-4 h-4 text-blue-500" />}
                        {d.icon === "wind" && <Wind className="w-4 h-4 text-teal-500" />}
                        <span className="text-[10px] font-bold text-stone-700 truncate">
                          {d.condition.split("&")[0]}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between mt-2 pt-1 border-t border-stone-200/60">
                        <span className="font-black text-stone-900 text-sm">
                          {d.tempMax}°C
                        </span>
                        <span className="text-[10px] text-stone-500">
                          {d.humidityPercent}% RH
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 pt-1.5">
                      <span
                        className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded block text-center truncate ${
                          d.hazardLevel === "high"
                            ? "bg-rose-100 text-rose-800"
                            : d.hazardLevel === "medium"
                            ? "bg-amber-100 text-amber-900"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                        title={d.storageHazardNote}
                      >
                        {d.hazardLevel === "high" ? "High Risk" : d.hazardLevel === "medium" ? "Med Risk" : "Safe"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Weather Actions & Advisory Outlook */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleApplyAverageWeather}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                >
                  <Thermometer className="w-3.5 h-3.5" />
                  <span>Apply 7-Day Average ({weatherForecast.average7DayTempC}°C, {weatherForecast.average7DayHumidityPercent}% RH)</span>
                </button>

                <button
                  type="button"
                  onClick={handleApplyPeakHeat}
                  className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Stress-Test Peak Heat ({weatherForecast.peakThermalTempC}°C on {weatherForecast.peakThermalDay})</span>
                </button>
              </div>

              {weatherAppliedMessage && (
                <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{weatherAppliedMessage}</span>
                </div>
              )}
            </div>

            {/* Weather Alert Advisory Summary */}
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-950">
                <Compass className="w-4 h-4 text-amber-700" />
                <span>Agro-Weather Storage Advisory for {crop}:</span>
              </div>
              <ul className="space-y-0.5 text-[11.5px] leading-relaxed text-amber-900 list-disc list-inside">
                {weatherForecast.advisoryNotes.map((note, i) => (
                  <li key={i}>{note}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Assessment Form (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="border-b border-stone-100 pb-3">
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                1. Produce & Harvest Details
              </h2>
            </div>

            {/* Crop Selector */}
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                {t.assessment.cropType} *
              </label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value as CropType)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Tomato">Tomato (தக்காளி)</option>
                <option value="Banana">Banana (வாழைப்பழம்)</option>
                <option value="Mango">Mango (மாம்பழம்)</option>
                <option value="Potato">Potato (உருளைக்கிழங்கு)</option>
                <option value="Onion">Onion (வெங்காயம்)</option>
                <option value="Papaya">Papaya (பப்பாளி)</option>
                <option value="Guava">Guava (கொய்யா)</option>
                <option value="Other">Other Produce (இதர)</option>
              </select>
            </div>

            {/* Quantity in KG */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-stone-700">
                  {t.assessment.quantityKg} *
                </label>
                <span className="text-xs text-stone-500 font-medium">
                  = {(quantityKg / 1000).toFixed(2)} MT / {(quantityKg / 100).toFixed(1)} Quintals
                </span>
              </div>
              <input
                type="number"
                min="10"
                step="50"
                value={quantityKg}
                onChange={(e) => setQuantityKg(parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 bg-stone-50 border rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 ${
                  validationErrors.quantityKg
                    ? "border-rose-400 focus:ring-rose-500"
                    : "border-stone-200 focus:ring-emerald-500"
                }`}
              />
              {validationErrors.quantityKg && (
                <p className="text-[11px] text-rose-600 mt-1">{validationErrors.quantityKg}</p>
              )}
            </div>

            {/* Harvest Date & Time */}
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                {t.assessment.harvestDateTime} *
              </label>
              <input
                type="datetime-local"
                value={harvestDateTime}
                onChange={(e) => setHarvestDateTime(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Farmer Name & Cluster */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Farmer / FPO Name
                </label>
                <input
                  type="text"
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Village / District
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="border-b border-stone-100 pt-2 pb-2">
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                2. Storage Environment & Transit
              </h2>
            </div>

            {/* Temperature & Humidity */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-stone-500" />
                    Temp (°C) *
                  </label>
                  <span className="text-xs font-extrabold text-stone-900">
                    {storageTempC}°C
                  </span>
                </div>
                <input
                  type="number"
                  min="-5"
                  max="50"
                  step="0.5"
                  value={storageTempC}
                  onChange={(e) => setStorageTempC(parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-1.5 bg-stone-50 border rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 ${
                    validationErrors.storageTempC
                      ? "border-rose-400 focus:ring-rose-500"
                      : "border-stone-200 focus:ring-emerald-500"
                  }`}
                />
                <div className="text-[10px] text-stone-400 mt-0.5">
                  Optimal: {profile.optimalTempMin}°C–{profile.optimalTempMax}°C
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-stone-500" />
                    RH (%) *
                  </label>
                  <span className="text-xs font-extrabold text-stone-900">
                    {storageHumidityPercent}%
                  </span>
                </div>
                <input
                  type="number"
                  min="20"
                  max="100"
                  value={storageHumidityPercent}
                  onChange={(e) => setStorageHumidityPercent(parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-1.5 bg-stone-50 border rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 ${
                    validationErrors.storageHumidityPercent
                      ? "border-rose-400 focus:ring-rose-500"
                      : "border-stone-200 focus:ring-emerald-500"
                  }`}
                />
                <div className="text-[10px] text-stone-400 mt-0.5">
                  Optimal: {profile.optimalHumidityMin}%–{profile.optimalHumidityMax}%
                </div>
              </div>
            </div>

            {/* Storage Facility Type */}
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                {t.assessment.storageType} *
              </label>
              <select
                value={storageType}
                onChange={(e) => setStorageType(e.target.value as StorageType)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Ambient Ventilated Room">Ambient Ventilated Room</option>
                <option value="Zero Energy Cool Chamber (ZECC)">Zero Energy Cool Chamber (ZECC)</option>
                <option value="Cold Storage (Controlled Temp)">Cold Storage (Controlled Temperature)</option>
                <option value="Open Shaded Yard">Open Shaded Yard</option>
                <option value="Reefer Container / Van">Reefer Container / Van</option>
                <option value="Direct Sunlight / Field Heap">Direct Sunlight / Field Heap</option>
              </select>
            </div>

            {/* Expected Transit Delay */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-stone-500" />
                  {t.assessment.transitDelay} *
                </label>
                <span className="text-xs font-extrabold text-stone-900">
                  {transitDelayHours} Hours
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="48"
                step="1"
                value={transitDelayHours}
                onChange={(e) => setTransitDelayHours(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-700 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 font-medium">
                <span>0h (Immediate)</span>
                <span>12h (Same Day)</span>
                <span>24h (Overnight)</span>
                <span>48h (Distant)</span>
              </div>
            </div>

            <div className="border-b border-stone-100 pt-2 pb-2">
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                3. Physical Condition & Packaging
              </h2>
            </div>

            {/* Visible Condition Grade */}
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                {t.assessment.visibleCondition} *
              </label>
              <select
                value={visibleCondition}
                onChange={(e) => setVisibleCondition(e.target.value as VisibleConditionGrade)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Grade A (Prime/Fresh)">Grade A (Prime/Fresh - Turgid, unbroken cuticle)</option>
                <option value="Grade B (Minor Blemishes)">Grade B (Minor Blemishes - Light surface scratches)</option>
                <option value="Grade C (Softening/Bruised)">Grade C (Softening/Bruised - Compression or blossom softness)</option>
                <option value="Grade D (Severe Deterioration/Rot Signs)">Grade D (Severe Deterioration/Rot Signs - Soft decay/spores)</option>
              </select>
            </div>

            {/* Packaging Type */}
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                {t.assessment.packaging}
              </label>
              <select
                value={packaging}
                onChange={(e) => setPackaging(e.target.value as PackagingType)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Ventilated Plastic Crates">Ventilated Plastic Crates (Recommended)</option>
                <option value="Corrugated Fiberboard Boxes">Corrugated Fiberboard Boxes (Cushioned)</option>
                <option value="Jute / Gunny Sacks">Jute / Gunny Sacks (High Bruising Risk)</option>
                <option value="Polythene Bags">Polythene Bags (Condensation Hazard)</option>
                <option value="Loose Bulk Heap">Loose Bulk Heap (Crushing Hazard)</option>
              </select>
            </div>

            {/* Save as Batch Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveBatch}
                className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4 text-emerald-200" />
                <span>{t.assessment.saveAsBatch}</span>
              </button>
              {saveSuccessMsg && (
                <div className="mt-2 p-2.5 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Real-time Scientific Assessment Results (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Risk Score Meter Card */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
              <div>
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Baseline Botanical Assessment
                </span>
                <h2 className="text-xl font-black text-stone-900 tracking-tight mt-0.5">
                  {t.assessment.riskScore}
                </h2>
              </div>

              <div
                className={`px-4 py-2 rounded-xl font-black text-sm flex items-center gap-2 ${
                  isHigh
                    ? "bg-rose-100 text-rose-800 border border-rose-300"
                    : isMed
                    ? "bg-amber-100 text-amber-900 border border-amber-300"
                    : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isHigh ? "bg-rose-600 animate-pulse" : isMed ? "bg-amber-600" : "bg-emerald-600"
                  }`}
                />
                <span>{assessment.riskLevel} Deterioration Risk</span>
              </div>
            </div>

            {/* Score & Gauge Meter */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <div className="text-[10px] font-bold text-stone-500 uppercase">
                  Deterioration Score
                </div>
                <div
                  className={`text-3xl font-black ${
                    isHigh ? "text-rose-600" : isMed ? "text-amber-600" : "text-emerald-700"
                  }`}
                >
                  {assessment.riskScore}
                  <span className="text-xs text-stone-400 font-semibold">/100</span>
                </div>
                <div className="text-[11px] text-stone-500 font-medium">
                  {isHigh ? "High Spoilage Vulnerability" : isMed ? "Moderate Thermal Stress" : "Safe Preservation Envelope"}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <div className="text-[10px] font-bold text-stone-500 uppercase">
                  {t.assessment.safeHours}
                </div>
                <div className="text-3xl font-black text-stone-900">
                  {assessment.safeDispatchHours}
                  <span className="text-xs text-stone-400 font-semibold"> hrs</span>
                </div>
                <div className="text-[11px] text-stone-500 font-medium">
                  Before grade downgrade at mandi
                </div>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <div className="text-[10px] font-bold text-stone-500 uppercase">
                  {t.assessment.atRiskQty}
                </div>
                <div className="text-3xl font-black text-amber-600">
                  {Math.round((quantityKg * assessment.estimatedLossPercentage) / 100).toLocaleString()}
                  <span className="text-xs text-stone-400 font-semibold"> kg</span>
                </div>
                <div className="text-[11px] text-stone-500 font-medium">
                  ~{assessment.estimatedLossPercentage}% unmitigated loss risk
                </div>
              </div>
            </div>

            {/* Visual Risk Gauge Meter bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-stone-600">
                <span>0 (Optimum)</span>
                <span>35 (Low / Med Threshold)</span>
                <span>68 (Med / High Threshold)</span>
                <span>100 (Severe)</span>
              </div>
              <div className="h-3 w-full rounded-full bg-stone-200 overflow-hidden relative">
                <div
                  style={{ width: `${assessment.riskScore}%` }}
                  className={`h-full transition-all duration-300 ${
                    isHigh ? "bg-rose-500" : isMed ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Itemized Contributing Factors */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-700" />
                {t.assessment.factorsTitle}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Exact point penalties and credits derived from storage physics and crop biology
              </p>
            </div>

            <div className="space-y-2.5">
              {assessment.contributingFactors.map((f, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                    f.impactScore > 0
                      ? f.severity === "high"
                        ? "bg-rose-50/50 border-rose-200 text-stone-800"
                        : "bg-amber-50/50 border-amber-200 text-stone-800"
                      : "bg-emerald-50/50 border-emerald-200 text-stone-800"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="font-bold text-stone-900 flex items-center gap-1.5">
                      <span>{f.factor}</span>
                      <span
                        className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded ${
                          f.impactScore > 0 ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {f.impactScore > 0 ? `+${f.impactScore} pts` : `${f.impactScore} pts`}
                      </span>
                    </div>
                    <p className="text-stone-600 leading-relaxed">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DYNAMIC WEATHER-SYNCHRONIZED STORAGE RECOMMENDATIONS CARD */}
          <div
            className={`p-6 rounded-2xl border shadow-md space-y-4 transition-all ${
              dynamicWeatherAdvisory.threatLevel === "critical"
                ? "bg-rose-50/70 border-rose-300 ring-2 ring-rose-400/20"
                : dynamicWeatherAdvisory.threatLevel === "warning"
                ? "bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/20"
                : "bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-400/20"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-black ${
                    dynamicWeatherAdvisory.threatLevel === "critical"
                      ? "bg-rose-600 text-white"
                      : dynamicWeatherAdvisory.threatLevel === "warning"
                      ? "bg-amber-500 text-stone-950"
                      : "bg-emerald-700 text-white"
                  }`}
                >
                  <CloudSun className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    {currentLang === "en"
                      ? "Dynamic Weather-Synchronized Advisory"
                      : "வானிலை ஒருங்கிணைந்த சேமிப்பு வழிகாட்டல்"}
                  </span>
                  <h3 className="text-base font-black text-stone-900 tracking-tight">
                    {crop} × {weatherForecast?.location || weatherLocation}
                  </h3>
                </div>
              </div>

              <div
                className={`px-3 py-1 rounded-full text-xs font-black self-start sm:self-center uppercase tracking-wide flex items-center gap-1.5 ${
                  dynamicWeatherAdvisory.threatLevel === "critical"
                    ? "bg-rose-100 text-rose-800 border border-rose-300"
                    : dynamicWeatherAdvisory.threatLevel === "warning"
                    ? "bg-amber-100 text-amber-900 border border-amber-300"
                    : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    dynamicWeatherAdvisory.threatLevel === "critical"
                      ? "bg-rose-600 animate-ping"
                      : dynamicWeatherAdvisory.threatLevel === "warning"
                      ? "bg-amber-600"
                      : "bg-emerald-600"
                  }`}
                />
                <span>
                  {dynamicWeatherAdvisory.threatLevel === "critical"
                    ? "Critical Atmospheric Hazard"
                    : dynamicWeatherAdvisory.threatLevel === "warning"
                    ? "Weather Warning"
                    : "Favorable Storage Outlook"}
                </span>
              </div>
            </div>

            {/* Headline & Scientific Mechanism */}
            <div className="space-y-1.5">
              <h4 className="text-sm font-extrabold text-stone-900">
                {currentLang === "en"
                  ? dynamicWeatherAdvisory.headline
                  : dynamicWeatherAdvisory.tamilHeadline}
              </h4>
              <p className="text-xs text-stone-700 leading-relaxed font-medium">
                {currentLang === "en"
                  ? dynamicWeatherAdvisory.scientificImpact
                  : dynamicWeatherAdvisory.tamilScientificImpact}
              </p>
            </div>

            {/* Peak Timeline Alert */}
            <div className="p-3 rounded-xl bg-white/95 border border-stone-200 text-xs font-semibold text-stone-800 flex items-center gap-2 shadow-2xs">
              <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{dynamicWeatherAdvisory.timelineAlert}</span>
            </div>

            {/* Dynamic Action Protocol */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block">
                {currentLang === "en"
                  ? "Atmospheric Storage Mitigation Steps:"
                  : "வானிலை பாதுகாப்பு நெறிமுறைகள்:"}
              </span>
              <ul className="space-y-1.5 text-xs text-stone-800">
                {(currentLang === "en"
                  ? dynamicWeatherAdvisory.actionProtocol
                  : dynamicWeatherAdvisory.tamilActionProtocol
                ).map((step, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 bg-white/90 p-2.5 rounded-xl border border-stone-200/80 font-medium shadow-2xs"
                  >
                    <span className="w-4 h-4 rounded-full bg-emerald-700 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Facility Compatibility & Mandi Timing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
              <div className="p-3 rounded-xl bg-white/95 border border-stone-200 space-y-1 shadow-2xs">
                <span className="font-bold text-stone-500 uppercase text-[10px] block">
                  Facility Compatibility Diagnostic
                </span>
                <p className="text-stone-800 font-semibold leading-snug">
                  {dynamicWeatherAdvisory.facilityRecommendation}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/95 border border-stone-200 space-y-1 shadow-2xs">
                <span className="font-bold text-stone-500 uppercase text-[10px] block">
                  Mandi Dispatch Timing Strategy
                </span>
                <p className="text-emerald-900 font-semibold leading-snug">
                  {dynamicWeatherAdvisory.dispatchAdvice}
                </p>
              </div>
            </div>
          </div>

          {/* Immediate Farm-Gate Action Recommendations */}
          <div className="bg-emerald-900 text-white p-6 rounded-2xl shadow-md space-y-3">
            <h3 className="text-sm font-bold text-emerald-200 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-300" />
              {t.assessment.actionsTitle}
            </h3>
            <ul className="space-y-2 text-xs text-emerald-50 font-medium">
              {assessment.immediateActions.map((act, i) => (
                <li key={i} className="flex items-start gap-2 bg-emerald-800/60 p-2.5 rounded-xl border border-emerald-700/60">
                  <span className="font-bold text-amber-300 shrink-0">{i + 1}.</span>
                  <span className="leading-relaxed">{act}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Transparent Method Explanation & Uncertainty Notice */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-xs text-stone-600 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-stone-800 text-[11px] uppercase tracking-wider">
              <Info className="w-3.5 h-3.5 text-stone-500" />
              Transparent Rule Baseline & Uncertainty Notice
            </div>
            <p className="text-[11px] leading-relaxed text-stone-600">
              {assessment.scientificRationale}
            </p>
            <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 leading-relaxed font-medium">
              {assessment.disclaimer}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
