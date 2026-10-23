import React, { useState, useRef } from "react";
import {
  Camera,
  Upload,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  ArrowRight,
  RefreshCw,
  Eye,
  FileCheck,
  ShieldAlert,
} from "lucide-react";
import { CropType, ScanResult, VisibleConditionGrade } from "../types";
import { SAMPLE_PRODUCE_IMAGES, SampleProduceImage } from "../data/sampleImages";
import { Language, TRANSLATIONS } from "../utils/translations";

interface ImageScannerViewProps {
  onTransferToAssessment: (data: {
    crop: CropType;
    visibleCondition: VisibleConditionGrade;
    scanResult: ScanResult;
  }) => void;
  currentLang: Language;
}

export const ImageScannerView: React.FC<ImageScannerViewProps> = ({
  onTransferToAssessment,
  currentLang,
}) => {
  const t = TRANSLATIONS[currentLang];

  const [selectedCrop, setSelectedCrop] = useState<CropType>("Tomato");
  const [selectedImageUri, setSelectedImageUri] = useState<string>(
    SAMPLE_PRODUCE_IMAGES[0].dataUri
  );
  const [selectedSampleId, setSelectedSampleId] = useState<string>(
    SAMPLE_PRODUCE_IMAGES[0].id
  );
  const [farmerNotes, setFarmerNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const cropsList: CropType[] = [
    "Tomato",
    "Banana",
    "Mango",
    "Potato",
    "Onion",
    "Papaya",
    "Guava",
    "Other",
  ];

  const handleSelectSample = (sample: SampleProduceImage) => {
    setSelectedSampleId(sample.id);
    setSelectedImageUri(sample.dataUri);
    setSelectedCrop(sample.crop);
    setErrorMsg(null);
    setScanResult(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErrorMsg("Please upload a valid image file (JPG, PNG, or WEBP).");
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      setErrorMsg("Image size exceeds 12MB. Please select a smaller photo.");
      return;
    }

    setErrorMsg(null);
    setSelectedSampleId("uploaded-user-image");

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedImageUri(event.target.result as string);
        setScanResult(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImageUri) {
      setErrorMsg("Please select or upload a produce photo first.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      // Determine MIME type
      let mimeType = "image/jpeg";
      if (selectedImageUri.startsWith("data:image/png")) mimeType = "image/png";
      else if (selectedImageUri.startsWith("data:image/webp")) mimeType = "image/webp";
      else if (selectedImageUri.startsWith("data:image/svg+xml")) mimeType = "image/svg+xml";

      const res = await fetch("/api/gemini/analyze-produce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: selectedImageUri,
          mimeType,
          cropType: selectedCrop,
          notes: farmerNotes,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();
      const result: ScanResult = {
        crop: data.crop || selectedCrop,
        freshnessGrade: data.freshnessGrade || "Grade B (Fair)",
        freshnessScore: Number(data.freshnessScore) || 60,
        estimatedRiskLevel: (data.estimatedRiskLevel as any) || "Medium",
        visibleConditionSummary: data.visibleConditionSummary || "",
        observedEvidence: Array.isArray(data.observedEvidence) ? data.observedEvidence : [],
        defectTags: Array.isArray(data.defectTags) ? data.defectTags : [],
        confidenceLevel: data.confidenceLevel || "Moderate",
        suggestedHandlingActions: Array.isArray(data.suggestedHandlingActions)
          ? data.suggestedHandlingActions
          : [],
        limitationsOfImageAssessment:
          data.limitationsOfImageAssessment ||
          "Image inspection assesses visible external surface defects only; cannot confirm internal core rots.",
        scannedAt: new Date().toISOString(),
        imageUrl: selectedImageUri,
      };

      setScanResult(result);
    } catch (err: any) {
      console.error("Scan error:", err);
      setErrorMsg(
        err.message || "Failed to analyze image. Please verify your connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransfer = () => {
    if (!scanResult) return;

    let conditionGrade: VisibleConditionGrade = "Grade B (Minor Blemishes)";
    if (scanResult.freshnessScore >= 80) {
      conditionGrade = "Grade A (Prime/Fresh)";
    } else if (scanResult.freshnessScore >= 60) {
      conditionGrade = "Grade B (Minor Blemishes)";
    } else if (scanResult.freshnessScore >= 35) {
      conditionGrade = "Grade C (Softening/Bruised)";
    } else {
      conditionGrade = "Grade D (Severe Deterioration/Rot Signs)";
    }

    onTransferToAssessment({
      crop: selectedCrop,
      visibleCondition: conditionGrade,
      scanResult,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" />
              Multimodal Vision Engine
            </span>
            <span className="text-xs font-semibold text-stone-500">
              Gemini 3.8 Flash
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            {t.scanner.title}
          </h1>
          <p className="text-sm text-stone-500 mt-1 max-w-2xl">
            {t.scanner.subtitle}
          </p>
        </div>

        <div className="text-right hidden sm:block">
          <div className="text-xs text-stone-400">Supported Formats</div>
          <div className="text-xs font-bold text-stone-700">JPG • PNG • WEBP (Up to 12MB)</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Selector & Input Form (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Pre-Loaded Demonstration Samples */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {currentLang === "en" ? "1-Click Hackathon Sample Photos" : "மாதிரி புகைப்படங்கள்"}
              </label>
              <span className="text-[11px] text-emerald-700 font-semibold">
                Instant Test
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {SAMPLE_PRODUCE_IMAGES.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedSampleId === sample.id
                      ? "border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20"
                      : "border-stone-200 bg-stone-50/50 hover:bg-stone-100/70"
                  }`}
                >
                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-white border border-stone-200 mb-1.5 flex items-center justify-center">
                    <img
                      src={sample.dataUri}
                      alt={sample.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-900 truncate">
                      {sample.name}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-stone-500 mt-0.5">
                      <span>{sample.crop}</span>
                      <span
                        className={`font-semibold ${
                          sample.expectedRisk === "High"
                            ? "text-rose-600"
                            : sample.expectedRisk === "Medium"
                            ? "text-amber-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {sample.expectedRisk} Risk
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* User File Upload Area */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div>
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-2">
                {currentLang === "en" ? "Or Upload Farmer Produce Photo" : "அல்லது சொந்த புகைப்படத்தைப் பதிவேற்றவும்"}
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-stone-300 hover:border-emerald-500 hover:bg-emerald-50/20 rounded-xl p-5 text-center cursor-pointer transition-all"
              >
                <Upload className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-stone-700">
                  {t.scanner.uploadPrompt}
                </p>
                <p className="text-[11px] text-stone-400 mt-1">
                  {t.scanner.supportedFormats}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Crop Selector dropdown */}
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1.5">
                {t.scanner.selectCrop}
              </label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value as CropType)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {cropsList.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Optional Farmer Notes */}
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                {currentLang === "en" ? "Optional Observation Notes" : "கூடுதல் குறிப்புகள் (விருப்பத்தேர்வு)"}
              </label>
              <input
                type="text"
                placeholder="e.g. Harvested 12 hours ago, noticed some fruit fly marks"
                value={farmerNotes}
                onChange={(e) => setFarmerNotes(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Submit Analyze Button */}
            <button
              type="button"
              onClick={handleAnalyzeImage}
              disabled={isLoading || !selectedImageUri}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer ${
                isLoading
                  ? "bg-emerald-900 cursor-wait opacity-80"
                  : "bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900"
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" />
                  <span>{t.scanner.analyzing}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{t.scanner.analyzeBtn}</span>
                </>
              )}
            </button>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold">Analysis Failed: </strong>
                  <span>{errorMsg}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected Image Preview & Results (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Image Display Card */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-stone-500" />
                {currentLang === "en" ? "Selected Produce Photo" : "தேர்வு செய்யப்பட்ட புகைப்படம்"}
              </span>
              <span className="text-xs font-semibold text-emerald-700">
                Crop: {selectedCrop}
              </span>
            </div>

            <div className="w-full aspect-16/10 rounded-xl bg-stone-900 overflow-hidden flex items-center justify-center relative border border-stone-200">
              <img
                src={selectedImageUri}
                alt="Selected produce"
                className="w-full h-full object-contain"
              />
              {isLoading && (
                <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-3">
                  <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
                  <p className="text-sm font-bold text-emerald-200">
                    Inspecting Cuticle, Bruising, and Spore Signs...
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* AI Diagnostic Results Card */}
          {scanResult ? (
            <div className="bg-white p-6 rounded-2xl border border-emerald-300 shadow-md space-y-5 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-600 text-white text-[11px] font-bold px-2 py-0.5 rounded">
                      Gemini Vision 3.8
                    </span>
                    <span className="text-xs text-stone-400">
                      Scanned {new Date(scanResult.scannedAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-stone-900 tracking-tight mt-1">
                    {t.scanner.resultsTitle}
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-stone-500">
                      Freshness Score
                    </div>
                    <div className="text-2xl font-black text-emerald-700">
                      {scanResult.freshnessScore}
                      <span className="text-xs text-stone-400 font-semibold">/100</span>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs ${
                      scanResult.estimatedRiskLevel === "High"
                        ? "bg-rose-100 text-rose-800 border border-rose-300"
                        : scanResult.estimatedRiskLevel === "Medium"
                        ? "bg-amber-100 text-amber-900 border border-amber-300"
                        : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    }`}
                  >
                    {scanResult.estimatedRiskLevel} Risk
                  </div>
                </div>
              </div>

              {/* Freshness Grade & Condition Summary */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    {t.scanner.grade}:
                  </span>
                  <span className="text-sm font-extrabold text-stone-900">
                    {scanResult.freshnessGrade}
                  </span>
                </div>
                <p className="text-sm text-stone-700 bg-stone-50 p-3 rounded-xl border border-stone-200 leading-relaxed font-medium">
                  {scanResult.visibleConditionSummary}
                </p>
              </div>

              {/* Observed Optical Evidence */}
              <div>
                <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-700" />
                  {t.scanner.evidence}
                </h3>
                <ul className="space-y-1.5 text-xs text-stone-700">
                  {scanResult.observedEvidence.map((ev, i) => (
                    <li key={i} className="flex items-start gap-2 bg-stone-50/70 p-2 rounded-lg border border-stone-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                      <span>{ev}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Defect Tags */}
              {scanResult.defectTags.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                    {t.scanner.defectTags}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {scanResult.defectTags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 border border-stone-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Handling Actions */}
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 space-y-2">
                <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-emerald-700" />
                  {t.scanner.suggestedActions}
                </h3>
                <ul className="space-y-1.5 text-xs text-emerald-900 font-medium">
                  {scanResult.suggestedHandlingActions.map((act, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-bold text-emerald-700">{i + 1}.</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Explicit Scientific Limitations Notice */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-[11px] text-stone-500 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-stone-700 uppercase tracking-wider text-[10px]">
                  <Info className="w-3.5 h-3.5 text-stone-400" />
                  {t.scanner.limitations}
                </div>
                <p className="leading-relaxed">
                  {scanResult.limitationsOfImageAssessment}
                </p>
              </div>

              {/* Action Button: Transfer to Spoilage-Risk Assessment */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleTransfer}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{t.scanner.transferToAssessment}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200 p-8 text-center space-y-3">
              <Sparkles className="w-10 h-10 text-stone-300 mx-auto" />
              <div>
                <h3 className="text-base font-bold text-stone-700">
                  {currentLang === "en" ? "Ready for Image Inspection" : "பட ஆய்வுக்கு தயார்"}
                </h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto mt-1">
                  Click 'Analyze Produce Image' above to inspect apparent freshness, epidermal damage, discoloration, and mold signs using Gemini 3.8 Flash.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
