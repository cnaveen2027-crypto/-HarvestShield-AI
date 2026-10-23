export type CropType =
  | "Tomato"
  | "Banana"
  | "Mango"
  | "Potato"
  | "Onion"
  | "Papaya"
  | "Guava"
  | "Other";

export type RiskLevel = "Low" | "Medium" | "High";

export type VisibleConditionGrade =
  | "Grade A (Prime/Fresh)"
  | "Grade B (Minor Blemishes)"
  | "Grade C (Softening/Bruised)"
  | "Grade D (Severe Deterioration/Rot Signs)";

export type StorageType =
  | "Open Shaded Yard"
  | "Ambient Ventilated Room"
  | "Zero Energy Cool Chamber (ZECC)"
  | "Cold Storage (Controlled Temp)"
  | "Reefer Container / Van"
  | "Direct Sunlight / Field Heap";

export type PackagingType =
  | "Ventilated Plastic Crates"
  | "Corrugated Fiberboard Boxes"
  | "Jute / Gunny Sacks"
  | "Polythene Bags"
  | "Loose Bulk Heap";

export interface ScanResult {
  crop: string;
  freshnessGrade: string;
  freshnessScore: number;
  estimatedRiskLevel: RiskLevel;
  visibleConditionSummary: string;
  observedEvidence: string[];
  defectTags: string[];
  confidenceLevel: string;
  suggestedHandlingActions: string[];
  limitationsOfImageAssessment: string;
  scannedAt: string;
  imageUrl?: string;
}

export interface RiskFactor {
  factor: string;
  impactScore: number; // positive adds to risk
  description: string;
  severity: "low" | "medium" | "high";
}

export interface AssessmentDetails {
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  safeDispatchHours: number;
  estimatedLossPercentage: number;
  contributingFactors: RiskFactor[];
  immediateActions: string[];
  scientificRationale: string;
  disclaimer: string;
}

export interface MarketOption {
  id: string;
  marketName: string;
  buyerType: "Wholesale APMC Mandi" | "Farmer Market (Uzhavar Sandhai)" | "Local Trader / Middleman" | "Food Processing Industry" | "Direct Retail / Supermarket";
  pricePerKg: number;
  distanceKm: number;
  transitHours: number;
  transportCost: number;
  otherCosts: number; // mandi cess, loading, commission
  notes?: string;
}

export interface MarketCalculationResult extends MarketOption {
  grossRevenue: number;
  totalDeductions: number;
  netRevenue: number;
  netPerKg: number;
  riskAdjustedNet: number; // accounts for transit loss if high risk
  isRecommended: boolean;
}

export interface ProduceBatch {
  id: string;
  batchCode: string;
  farmerName: string;
  location: string;
  crop: CropType;
  variety?: string;
  quantityKg: number;
  harvestDateTime: string;
  storageTempC: number;
  storageHumidityPercent: number;
  storageType: StorageType;
  transitDelayHours: number;
  visibleCondition: VisibleConditionGrade;
  packaging: PackagingType;
  notes?: string;
  scanResult?: ScanResult;
  assessment: AssessmentDetails;
  marketOptions: MarketOption[];
  status: "Active" | "Dispatched" | "Sold" | "Segregated";
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  suggestedActions?: string[];
}

export interface CropProfile {
  name: CropType;
  tamilName: string;
  optimalTempMin: number;
  optimalTempMax: number;
  chillingInjuryThreshold: number;
  optimalHumidityMin: number;
  optimalHumidityMax: number;
  ethyleneSensitivity: "Very High" | "High" | "Medium" | "Low";
  typicalNationalLossRate: number; // percentage in Indian post-harvest chain
  shelfLifeAtOptimal: string;
  shelfLifeAtAmbient: string;
  storageProtocols: string[];
  keyRisks: string[];
}

export interface WeatherForecastDay {
  dayIndex: number;
  dayName: string;
  dateFormatted: string;
  tempMax: number;
  tempMin: number;
  tempAvg: number;
  humidityPercent: number;
  condition: string;
  icon: string;
  hazardLevel: "low" | "medium" | "high";
  storageHazardNote: string;
}

export interface WeatherForecastResponse {
  location: string;
  climateZone: string;
  fetchedAt: string;
  currentTempC: number;
  currentHumidityPercent: number;
  average7DayTempC: number;
  average7DayHumidityPercent: number;
  peakThermalDay: string;
  peakThermalTempC: number;
  peakHumidityDay: string;
  peakHumidityPercent: number;
  advisoryNotes: string[];
  forecastDays: WeatherForecastDay[];
}

