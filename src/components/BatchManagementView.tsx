import React, { useState } from "react";
import {
  Boxes,
  Search,
  Filter,
  Plus,
  FileText,
  Edit2,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Thermometer,
  ShieldAlert,
} from "lucide-react";
import { CropType, ProduceBatch, RiskLevel } from "../types";
import { Language, TRANSLATIONS } from "../utils/translations";

interface BatchManagementViewProps {
  batches: ProduceBatch[];
  onAddBatch: () => void;
  onEditBatch: (batch: ProduceBatch) => void;
  onDeleteBatch: (batchId: string) => void;
  onViewReport: (batch: ProduceBatch) => void;
  onResetDemoData: () => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currentLang: Language;
}

export const BatchManagementView: React.FC<BatchManagementViewProps> = ({
  batches,
  onAddBatch,
  onEditBatch,
  onDeleteBatch,
  onViewReport,
  onResetDemoData,
  onExportData,
  onImportData,
  currentLang,
}) => {
  const t = TRANSLATIONS[currentLang];

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCropFilter, setSelectedCropFilter] = useState<string>("All");
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>("All");

  // Deletion confirmation state
  const [batchToDelete, setBatchToDelete] = useState<ProduceBatch | null>(null);

  // Filter batches
  const filteredBatches = batches.filter((b) => {
    const matchesSearch =
      b.batchCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.crop.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCrop =
      selectedCropFilter === "All" || b.crop === selectedCropFilter;

    const matchesRisk =
      selectedRiskFilter === "All" || b.assessment.riskLevel === selectedRiskFilter;

    return matchesSearch && matchesCrop && matchesRisk;
  });

  const confirmDelete = () => {
    if (batchToDelete) {
      onDeleteBatch(batchToDelete.id);
      setBatchToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <Boxes className="w-3.5 h-3.5" />
              Inventory & Lifecycle Tracking
            </span>
            <span className="text-xs font-semibold text-stone-500">
              {batches.length} Active Records
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            {t.nav.batches}
          </h1>
          <p className="text-sm text-stone-500 mt-1 max-w-2xl">
            {currentLang === "en"
              ? "Comprehensive post-harvest record management with traceable assessments, history, and printable reports."
              : "முழுமையான அறுவடைப் பதிவுகள், இடர் மதிப்பீடு மற்றும் அச்சு அறிக்கைகள்."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
          <button
            type="button"
            onClick={onExportData}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-all border border-stone-200 cursor-pointer"
            title="Export batches to JSON"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            <span>Export Backup</span>
          </button>

          <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-all border border-stone-200 cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-stone-500" />
            <span>Import</span>
            <input
              type="file"
              accept=".json"
              onChange={onImportData}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={onAddBatch}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-200" />
            <span>{t.dashboard.newBatch}</span>
          </button>
        </div>
      </div>

      {/* Persistence Note banner */}
      <div className="bg-stone-100 border border-stone-200/90 rounded-xl p-3 text-xs text-stone-600 flex items-center justify-between">
        <span>
          <strong>Storage Architecture: </strong>
          Batches persist across reloads in browser LocalStorage. You can export/import JSON backups anytime.
        </span>
        <button
          type="button"
          onClick={onResetDemoData}
          className="text-emerald-800 hover:text-emerald-950 font-bold underline cursor-pointer text-xs shrink-0 ml-2"
        >
          {t.dashboard.loadDemoData}
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Search */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Batch Code, Farmer Name, Crop, or Location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Crop Filter */}
        <div className="sm:col-span-3">
          <select
            value={selectedCropFilter}
            onChange={(e) => setSelectedCropFilter(e.target.value)}
            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">All Crops ({batches.length})</option>
            <option value="Tomato">Tomato</option>
            <option value="Banana">Banana</option>
            <option value="Mango">Mango</option>
            <option value="Potato">Potato</option>
            <option value="Onion">Onion</option>
          </select>
        </div>

        {/* Risk Filter */}
        <div className="sm:col-span-3">
          <select
            value={selectedRiskFilter}
            onChange={(e) => setSelectedRiskFilter(e.target.value)}
            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">All Risk Levels</option>
            <option value="Low">Low Risk Only</option>
            <option value="Medium">Medium Risk Only</option>
            <option value="High">High Risk Only</option>
          </select>
        </div>
      </div>

      {/* Batches Table Card */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-700">
            <thead className="bg-stone-50 text-[11px] font-bold text-stone-500 uppercase tracking-wider border-b border-stone-200">
              <tr>
                <th className="px-5 py-3">Batch Code & Crop</th>
                <th className="px-5 py-3">Farmer & Location</th>
                <th className="px-5 py-3">Quantity</th>
                <th className="px-5 py-3">Storage & Temp</th>
                <th className="px-5 py-3">Visible Grade</th>
                <th className="px-5 py-3">Deterioration Risk</th>
                <th className="px-5 py-3">Safe Window</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {filteredBatches.map((batch) => {
                const isHigh = batch.assessment.riskLevel === "High";
                const isMed = batch.assessment.riskLevel === "Medium";

                return (
                  <tr key={batch.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-stone-900">{batch.batchCode}</div>
                      <div className="text-xs font-semibold text-emerald-800">
                        {batch.crop} {batch.variety ? `• ${batch.variety}` : ""}
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-xs text-stone-700">
                      <div className="font-medium text-stone-900">{batch.farmerName}</div>
                      <div className="text-stone-400 text-[11px]">{batch.location}</div>
                    </td>

                    <td className="px-5 py-3.5 font-bold text-stone-900 text-xs">
                      {batch.quantityKg.toLocaleString()} kg
                      <div className="text-[10px] text-stone-400 font-normal">
                        ({(batch.quantityKg / 1000).toFixed(2)} MT)
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-xs text-stone-600">
                      <div className="font-semibold text-stone-900">
                        {batch.storageTempC}°C • {batch.storageHumidityPercent}% RH
                      </div>
                      <div className="text-[11px] text-stone-400 truncate max-w-[130px]">
                        {batch.storageType}
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-xs text-stone-700">
                      <div className="font-medium">{batch.visibleCondition.split("-")[0]}</div>
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
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        {batch.assessment.safeDispatchHours}h
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onViewReport(batch)}
                          className="p-1.5 text-emerald-700 hover:text-emerald-950 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Generate & View Printable Assessment Report"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditBatch(batch)}
                          className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Batch"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setBatchToDelete(batch)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Batch"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredBatches.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-sm text-stone-500">
                    No produce batches found matching your search and filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {batchToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 no-print">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 border border-stone-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 text-rose-600" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-stone-900">
                Confirm Batch Deletion
              </h3>
              <p className="text-xs text-stone-500">
                Are you sure you want to permanently delete batch{" "}
                <strong className="text-stone-900">{batchToDelete.batchCode}</strong> (
                {batchToDelete.crop}, {batchToDelete.quantityKg} kg)?
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBatchToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                {t.common.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
