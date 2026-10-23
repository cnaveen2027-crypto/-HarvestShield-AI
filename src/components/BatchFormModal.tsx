import React, { useState } from "react";
import { X, Save, ShieldAlert, Sparkles } from "lucide-react";
import {
  CropType,
  PackagingType,
  ProduceBatch,
  StorageType,
  VisibleConditionGrade,
} from "../types";
import { calculateDeteriorationRisk } from "../utils/riskCalculator";
import { Language, TRANSLATIONS } from "../utils/translations";

interface BatchFormModalProps {
  initialBatch?: ProduceBatch | null;
  onSave: (batchData: Partial<ProduceBatch>) => void;
  onClose: () => void;
  currentLang: Language;
}

export const BatchFormModal: React.FC<BatchFormModalProps> = ({
  initialBatch,
  onSave,
  onClose,
  currentLang,
}) => {
  const t = TRANSLATIONS[currentLang];
  const isEditing = !!initialBatch;

  const [batchCode, setBatchCode] = useState(
    initialBatch?.batchCode ||
      `HS-2026-TOM-${Math.floor(100 + Math.random() * 900)}`
  );
  const [farmerName, setFarmerName] = useState(
    initialBatch?.farmerName || "R. Murugesan (Farmer)"
  );
  const [location, setLocation] = useState(
    initialBatch?.location || "Dindigul Horticulture Zone, Tamil Nadu"
  );
  const [crop, setCrop] = useState<CropType>(initialBatch?.crop || "Tomato");
  const [variety, setVariety] = useState(initialBatch?.variety || "");
  const [quantityKg, setQuantityKg] = useState<number>(
    initialBatch?.quantityKg || 1800
  );
  const [harvestDateTime, setHarvestDateTime] = useState<string>(
    initialBatch?.harvestDateTime
      ? initialBatch.harvestDateTime.slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );
  const [storageTempC, setStorageTempC] = useState<number>(
    initialBatch?.storageTempC ?? 26
  );
  const [storageHumidityPercent, setStorageHumidityPercent] = useState<number>(
    initialBatch?.storageHumidityPercent ?? 80
  );
  const [storageType, setStorageType] = useState<StorageType>(
    initialBatch?.storageType || "Ambient Ventilated Room"
  );
  const [transitDelayHours, setTransitDelayHours] = useState<number>(
    initialBatch?.transitDelayHours ?? 10
  );
  const [visibleCondition, setVisibleCondition] = useState<VisibleConditionGrade>(
    initialBatch?.visibleCondition || "Grade B (Minor Blemishes)"
  );
  const [packaging, setPackaging] = useState<PackagingType>(
    initialBatch?.packaging || "Ventilated Plastic Crates"
  );
  const [notes, setNotes] = useState(initialBatch?.notes || "");
  const [status, setStatus] = useState<"Active" | "Dispatched" | "Sold" | "Segregated">(
    initialBatch?.status || "Active"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const assessment = calculateDeteriorationRisk({
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

    onSave({
      batchCode,
      farmerName,
      location,
      crop,
      variety,
      quantityKg,
      harvestDateTime,
      storageTempC,
      storageHumidityPercent,
      storageType,
      transitDelayHours,
      visibleCondition,
      packaging,
      notes,
      status,
      assessment,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              {isEditing ? "Edit Produce Batch" : "Add New Produce Batch"}
            </h2>
            <p className="text-xs text-emerald-200/90 mt-0.5">
              Enter harvest parameters to compute real-time deterioration risk
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Batch Code *
              </label>
              <input
                type="text"
                required
                value={batchCode}
                onChange={(e) => setBatchCode(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
              >
                <option value="Active">Active</option>
                <option value="Dispatched">Dispatched</option>
                <option value="Sold">Sold</option>
                <option value="Segregated">Segregated</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Farmer / FPO Name *
              </label>
              <input
                type="text"
                required
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Location / District *
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Crop Type *
              </label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value as CropType)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Tomato">Tomato</option>
                <option value="Banana">Banana</option>
                <option value="Mango">Mango</option>
                <option value="Potato">Potato</option>
                <option value="Onion">Onion</option>
                <option value="Papaya">Papaya</option>
                <option value="Guava">Guava</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Variety (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Shivam / G9"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Quantity (kg) *
              </label>
              <input
                type="number"
                min="10"
                step="50"
                required
                value={quantityKg}
                onChange={(e) => setQuantityKg(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Storage Temp (°C) *
              </label>
              <input
                type="number"
                step="0.5"
                required
                value={storageTempC}
                onChange={(e) => setStorageTempC(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Humidity (%) *
              </label>
              <input
                type="number"
                step="1"
                min="10"
                max="100"
                required
                value={storageHumidityPercent}
                onChange={(e) => setStorageHumidityPercent(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Transit Delay (hrs)
              </label>
              <input
                type="number"
                min="0"
                max="168"
                required
                value={transitDelayHours}
                onChange={(e) => setTransitDelayHours(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Storage Facility
              </label>
              <select
                value={storageType}
                onChange={(e) => setStorageType(e.target.value as StorageType)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="Ambient Ventilated Room">Ambient Ventilated Room</option>
                <option value="Zero Energy Cool Chamber (ZECC)">Zero Energy Cool Chamber (ZECC)</option>
                <option value="Cold Storage (Controlled Temp)">Cold Storage (Controlled Temp)</option>
                <option value="Open Shaded Yard">Open Shaded Yard</option>
                <option value="Reefer Container / Van">Reefer Container / Van</option>
                <option value="Direct Sunlight / Field Heap">Direct Sunlight / Field Heap</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Packaging Type
              </label>
              <select
                value={packaging}
                onChange={(e) => setPackaging(e.target.value as PackagingType)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="Ventilated Plastic Crates">Ventilated Plastic Crates</option>
                <option value="Corrugated Fiberboard Boxes">Corrugated Fiberboard Boxes</option>
                <option value="Jute / Gunny Sacks">Jute / Gunny Sacks</option>
                <option value="Polythene Bags">Polythene Bags</option>
                <option value="Loose Bulk Heap">Loose Bulk Heap</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-stone-700 block mb-1">
              Visible Condition Grade
            </label>
            <select
              value={visibleCondition}
              onChange={(e) => setVisibleCondition(e.target.value as VisibleConditionGrade)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="Grade A (Prime/Fresh)">Grade A (Prime/Fresh)</option>
              <option value="Grade B (Minor Blemishes)">Grade B (Minor Blemishes)</option>
              <option value="Grade C (Softening/Bruised)">Grade C (Softening/Bruised)</option>
              <option value="Grade D (Severe Deterioration/Rot Signs)">Grade D (Severe Deterioration/Rot Signs)</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-stone-700 block mb-1">
              Field Notes / Observations
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Harvested in early morning before solar heat buildup"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-bold cursor-pointer"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? "Update Batch" : "Create Batch"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
