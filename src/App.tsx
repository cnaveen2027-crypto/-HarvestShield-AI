import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Sidebar, TabType } from "./components/Sidebar";
import { DashboardView } from "./components/DashboardView";
import { ImageScannerView } from "./components/ImageScannerView";
import { RiskAssessmentView } from "./components/RiskAssessmentView";
import { MarketIntelligenceView } from "./components/MarketIntelligenceView";
import { AssistantChatView } from "./components/AssistantChatView";
import { BatchManagementView } from "./components/BatchManagementView";
import { CropGuideView } from "./components/CropGuideView";
import { ReportModal } from "./components/ReportModal";
import { BatchFormModal } from "./components/BatchFormModal";
import { HackathonDemoGuide } from "./components/HackathonDemoGuide";
import { FloatingChatbot } from "./components/FloatingChatbot";
import { CropType, ProduceBatch, ScanResult, VisibleConditionGrade } from "./types";
import { INITIAL_DEMO_BATCHES } from "./data/demoBatches";
import { Language } from "./utils/translations";

const STORAGE_KEY = "harvestshield_produce_batches_v1";

export default function App() {
  const [currentLang, setCurrentLang] = useState<Language>("en");
  const [currentTab, setCurrentTab] = useState<TabType>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Batches state with LocalStorage persistence
  const [batches, setBatches] = useState<ProduceBatch[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to read local batches, falling back to demo records", e);
    }
    return INITIAL_DEMO_BATCHES;
  });

  // Save to LocalStorage on updates
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(batches));
    } catch (e) {
      console.error("Failed to save batches to localStorage", e);
    }
  }, [batches]);

  // Modals state
  const [reportBatch, setReportBatch] = useState<ProduceBatch | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<ProduceBatch | null>(null);
  const [isDemoGuideOpen, setIsDemoGuideOpen] = useState(false);

  // Transfer state from scanner to assessment
  const [scannerTransferData, setScannerTransferData] = useState<{
    crop: CropType;
    visibleCondition: VisibleConditionGrade;
    scanResult: ScanResult;
  } | null>(null);

  // KPI aggregates
  const totalQuantityKg = batches.reduce((sum, b) => sum + b.quantityKg, 0);
  const highRiskCount = batches.filter((b) => b.assessment.riskLevel === "High").length;

  // Handlers
  const handleResetDemoData = () => {
    setBatches(INITIAL_DEMO_BATCHES);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_BATCHES));
    } catch (e) {}
  };

  const handleSaveBatchFromAssessment = (batchData: Partial<ProduceBatch>) => {
    const newBatch: ProduceBatch = {
      id: `batch-${Date.now()}`,
      batchCode: batchData.batchCode || `HS-${Date.now().toString().slice(-6)}`,
      farmerName: batchData.farmerName || "Farmer Member",
      location: batchData.location || "Tamil Nadu",
      crop: batchData.crop || "Tomato",
      variety: batchData.variety || "",
      quantityKg: batchData.quantityKg || 1000,
      harvestDateTime: batchData.harvestDateTime || new Date().toISOString(),
      storageTempC: batchData.storageTempC ?? 25,
      storageHumidityPercent: batchData.storageHumidityPercent ?? 85,
      storageType: batchData.storageType || "Ambient Ventilated Room",
      transitDelayHours: batchData.transitDelayHours ?? 10,
      visibleCondition: batchData.visibleCondition || "Grade B (Minor Blemishes)",
      packaging: batchData.packaging || "Ventilated Plastic Crates",
      notes: batchData.notes || "",
      scanResult: batchData.scanResult,
      assessment: batchData.assessment!,
      marketOptions: batchData.marketOptions || [],
      status: batchData.status || "Active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setBatches((prev) => [newBatch, ...prev]);
  };

  const handleSaveBatchFromModal = (batchData: Partial<ProduceBatch>) => {
    if (editingBatch) {
      setBatches((prev) =>
        prev.map((b) =>
          b.id === editingBatch.id
            ? ({
                ...b,
                ...batchData,
                updatedAt: new Date().toISOString(),
              } as ProduceBatch)
            : b
        )
      );
      setEditingBatch(null);
    } else {
      handleSaveBatchFromAssessment(batchData);
    }
  };

  const handleDeleteBatch = (batchId: string) => {
    setBatches((prev) => prev.filter((b) => b.id !== batchId));
  };

  const handleTransferToAssessment = (data: {
    crop: CropType;
    visibleCondition: VisibleConditionGrade;
    scanResult: ScanResult;
  }) => {
    setScannerTransferData(data);
    setCurrentTab("assessment");
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(batches, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `harvestshield-batches-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          setBatches(parsed);
        }
      } catch (err) {
        alert("Invalid JSON file for batches import.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        onOpenDemoWalkthrough={() => setIsDemoGuideOpen(true)}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        activeHighRiskCount={highRiskCount}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            currentLang={currentLang}
            totalBatches={batches.length}
            highRiskCount={highRiskCount}
            totalQuantityKg={totalQuantityKg}
          />
        </div>

        {/* Mobile Sidebar Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden bg-stone-950/60 backdrop-blur-xs flex">
            <div className="w-72 bg-white h-full shadow-2xl flex flex-col">
              <Sidebar
                currentTab={currentTab}
                onSelectTab={setCurrentTab}
                currentLang={currentLang}
                totalBatches={batches.length}
                highRiskCount={highRiskCount}
                totalQuantityKg={totalQuantityKg}
                onCloseMobile={() => setMobileMenuOpen(false)}
              />
            </div>
            <div
              className="flex-1"
              onClick={() => setMobileMenuOpen(false)}
            />
          </div>
        )}

        {/* Primary View Router */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {currentTab === "dashboard" && (
            <DashboardView
              batches={batches}
              onSelectTab={setCurrentTab}
              onOpenNewBatchModal={() => {
                setEditingBatch(null);
                setIsFormModalOpen(true);
              }}
              onResetDemoData={handleResetDemoData}
              onViewReport={(b) => setReportBatch(b)}
              onOpenDemoWalkthrough={() => setIsDemoGuideOpen(true)}
              currentLang={currentLang}
            />
          )}

          {currentTab === "scanner" && (
            <ImageScannerView
              onTransferToAssessment={handleTransferToAssessment}
              currentLang={currentLang}
            />
          )}

          {currentTab === "assessment" && (
            <RiskAssessmentView
              initialCrop={scannerTransferData?.crop}
              initialCondition={scannerTransferData?.visibleCondition}
              initialScanResult={scannerTransferData?.scanResult}
              onSaveAsBatch={handleSaveBatchFromAssessment}
              currentLang={currentLang}
            />
          )}

          {currentTab === "market" && (
            <MarketIntelligenceView
              batches={batches}
              currentLang={currentLang}
            />
          )}

          {currentTab === "batches" && (
            <BatchManagementView
              batches={batches}
              onAddBatch={() => {
                setEditingBatch(null);
                setIsFormModalOpen(true);
              }}
              onEditBatch={(b) => {
                setEditingBatch(b);
                setIsFormModalOpen(true);
              }}
              onDeleteBatch={handleDeleteBatch}
              onViewReport={(b) => setReportBatch(b)}
              onResetDemoData={handleResetDemoData}
              onExportData={handleExportData}
              onImportData={handleImportData}
              currentLang={currentLang}
            />
          )}

          {currentTab === "assistant" && (
            <AssistantChatView currentLang={currentLang} />
          )}

          {currentTab === "cropGuide" && (
            <CropGuideView currentLang={currentLang} />
          )}
        </main>
      </div>

      {/* Printable Report Modal */}
      <ReportModal
        batch={reportBatch}
        onClose={() => setReportBatch(null)}
        currentLang={currentLang}
      />

      {/* Batch Form Modal (Create / Edit) */}
      {isFormModalOpen && (
        <BatchFormModal
          initialBatch={editingBatch}
          onSave={handleSaveBatchFromModal}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingBatch(null);
          }}
          currentLang={currentLang}
        />
      )}

      {/* Hackathon Interactive Demonstration Guide */}
      <HackathonDemoGuide
        isOpen={isDemoGuideOpen}
        onClose={() => setIsDemoGuideOpen(false)}
        onSelectTab={setCurrentTab}
        currentLang={currentLang}
      />

      {/* Universal Floating Gemini Chatbot (Tamil & English) */}
      <FloatingChatbot currentLang={currentLang} />
    </div>
  );
}
