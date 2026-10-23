import React, { useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Play,
  RotateCcw,
} from "lucide-react";
import { TabType } from "./Sidebar";
import { Language } from "../utils/translations";

interface Step {
  stepNumber: number;
  title: string;
  tamilTitle: string;
  description: string;
  targetTab: TabType;
  actionText: string;
  tip: string;
}

const DEMO_STEPS: Step[] = [
  {
    stepNumber: 1,
    title: "1. Post-Harvest Dashboard Overview",
    tamilTitle: "1. மேலோட்டம் & முக்கிய குறிகாட்டிகள்",
    description: "Explore total produce entered (24.6 Metric Tonnes), active batches, high-risk alerts, and transparent risk distribution charts labeled with demo data.",
    targetTab: "dashboard",
    actionText: "Go to Dashboard",
    tip: "Notice the urgent action alerts showing immediate hours remaining for high-risk batches."
  },
  {
    stepNumber: 2,
    title: "2. Select or Upload Tomato Photograph",
    tamilTitle: "2. தக்காளி புகைப்படத்தை தேர்வு செய்க",
    description: "Go to the AI Produce Scanner. Click the pre-loaded 'Tomato (Bruised & Softening)' sample image, or upload any JPG/PNG/WEBP photo.",
    targetTab: "scanner",
    actionText: "Open AI Scanner",
    tip: "You can test with 1-click using the pre-loaded sample images without uploading files."
  },
  {
    stepNumber: 3,
    title: "3. Review AI Visual Assessment",
    tamilTitle: "3. ஜெமினி AI ஆய்வை மதிப்பாய்வு செய்க",
    description: "Click 'Analyze Produce Image'. Multimodal Gemini 3.8 Flash assesses apparent freshness, skin bruising, discoloration, and mold signs with explicit scientific limitations.",
    targetTab: "scanner",
    actionText: "Inspect AI Results",
    tip: "Check the transparent uncertainty notice explaining that optical photography evaluates surface characteristics only."
  },
  {
    stepNumber: 4,
    title: "4. Enter Batch & Storage Conditions",
    tamilTitle: "4. சேமிப்பு சூழலை உள்ளிடுக",
    description: "Open the Spoilage-Risk Assessment calculator. Enter crop type, harvest time, temperature (e.g. 32°C), humidity, storage type, and transit delay.",
    targetTab: "assessment",
    actionText: "Open Risk Calculator",
    tip: "You can click 'Transfer Scanned Data' from the scanner to auto-fill the condition."
  },
  {
    stepNumber: 5,
    title: "5. Generate Deterioration-Risk Assessment",
    tamilTitle: "5. அழுகல் அபாயத்தைக் கணக்கிடுக",
    description: "Review the calculated risk score (Low, Medium, or High) derived from ICAR-CIPHET botanical rules, Q10 thermal quotient, and moisture deficits.",
    targetTab: "assessment",
    actionText: "View Risk Penalties",
    tip: "Never presents arbitrary predictions as black-box guarantees; every penalty factor is itemized."
  },
  {
    stepNumber: 6,
    title: "6. Review Smart Action Recommendations",
    tamilTitle: "6. ஸ்மார்ட் பாதுகாப்பு பரிந்துரைகள்",
    description: "Inspect immediate farm-gate interventions: pre-cooling protocols, Zero Energy Cool Chamber (ZECC) guidelines, and crate vs sack handling.",
    targetTab: "assessment",
    actionText: "Review Recommendations",
    tip: "Shows actionable hours window before quality deterioration degrades mandi grade."
  },
  {
    stepNumber: 7,
    title: "7. Compare Two Mandi Selling Options",
    tamilTitle: "7. இரண்டு சந்தை வாய்ப்புகளை ஒப்பிடுக",
    description: "Go to Market Intelligence. Compare a high-paying distant mandi (e.g. Koyambedu Chennai at ₹34/kg with 8hr transit) vs a closer local mandi (Dindigul at ₹27/kg).",
    targetTab: "market",
    actionText: "Compare Markets",
    tip: "HarvestShield highlights whether transit delay of damaged produce wipes out distant price premiums!"
  },
  {
    stepNumber: 8,
    title: "8. Ask Assistant in Tamil or English",
    tamilTitle: "8. தமிழில் அல்லது ஆங்கிலத்தில் கேளுங்கள்",
    description: "Ask HarvestShield Assistant a post-harvest question like 'வெங்காயம் அழுகாமல் சேமிப்பது எப்படி?' or 'How does Zero Energy Cool Chamber work?'",
    targetTab: "assistant",
    actionText: "Chat with Assistant",
    tip: "Fluently converses in both Tamil and English with structured actionable agronomy steps."
  },
  {
    stepNumber: 9,
    title: "9. Generate & Print Assessment Report",
    tamilTitle: "9. அதிகாரப்பூர்வ அறிக்கையைப் பதிவிறக்குக",
    description: "Open Batch Management and click 'Print / PDF Report' on any batch. View the clean printable A4 assessment report formatted for NABARD MABIF hackathon review.",
    targetTab: "batches",
    actionText: "Open Batch Reports",
    tip: "Click 'Print / Save PDF' to generate an export-ready official agricultural summary."
  }
];

interface HackathonDemoGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: TabType) => void;
  currentLang: Language;
}

export const HackathonDemoGuide: React.FC<HackathonDemoGuideProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  currentLang,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const currentStep = DEMO_STEPS[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < DEMO_STEPS.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      onSelectTab(DEMO_STEPS[nextIndex].targetTab);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      onSelectTab(DEMO_STEPS[prevIndex].targetTab);
    }
  };

  const handleJumpToStep = (index: number) => {
    setCurrentStepIndex(index);
    onSelectTab(DEMO_STEPS[index].targetTab);
  };

  const handleExecuteAction = () => {
    onSelectTab(currentStep.targetTab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-amber-400 text-stone-950 font-black text-[11px] px-2 py-0.5 rounded tracking-wide uppercase">
                JALLIKATTU 5.0 DEMO
              </span>
              <span className="text-xs text-emerald-300 font-medium">NABARD MABIF Hackathon</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {currentLang === "en" ? "Interactive 9-Step Evaluation Workflow" : "9-படி செயல்முறை டெமோ வழிகாட்டி"}
            </h2>
            <p className="text-xs text-emerald-200/90 mt-0.5">
              Follow this verified workflow to validate all Hackathon criteria in real time.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-800/80 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator progress bar */}
        <div className="px-6 pt-4 pb-2 bg-stone-50 border-b border-stone-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">
              Step {currentStep.stepNumber} of 9
            </span>
            <span className="text-xs font-semibold text-emerald-700">
              {Math.round(((currentStepIndex + 1) / DEMO_STEPS.length) * 100)}% Complete
            </span>
          </div>

          <div className="grid grid-cols-9 gap-1.5">
            {DEMO_STEPS.map((s, idx) => (
              <button
                key={s.stepNumber}
                type="button"
                onClick={() => handleJumpToStep(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentStepIndex
                    ? "bg-amber-500 ring-2 ring-amber-300"
                    : idx < currentStepIndex
                    ? "bg-emerald-600"
                    : "bg-stone-200 hover:bg-stone-300"
                }`}
                title={s.title}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-base">
              {currentStep.stepNumber}
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900">
                {currentLang === "en" ? currentStep.title : currentStep.tamilTitle}
              </h3>
              <p className="text-sm text-stone-600 mt-1 leading-relaxed">
                {currentStep.description}
              </p>
            </div>
          </div>

          {/* Pro-Tip Box */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold">Evaluation Cue: </strong>
              <span>{currentStep.tip}</span>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              currentStepIndex === 0
                ? "text-stone-300 cursor-not-allowed"
                : "text-stone-700 hover:bg-stone-200"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExecuteAction}
              className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-sm shadow-xs transition-all cursor-pointer"
            >
              <span>{currentStep.actionText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {currentStepIndex < DEMO_STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1 bg-stone-900 hover:bg-black text-white font-semibold px-3 py-2 rounded-xl text-sm transition-all cursor-pointer"
              >
                Next Step
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-4 py-2 rounded-xl text-sm transition-all cursor-pointer"
              >
                Finish Walkthrough
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
