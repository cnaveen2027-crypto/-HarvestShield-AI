import { ProduceBatch } from "../types";
import { calculateDeteriorationRisk } from "../utils/riskCalculator";

export const INITIAL_DEMO_BATCHES: ProduceBatch[] = [
  {
    id: "batch-demo-01",
    batchCode: "HS-2026-TOM-01",
    farmerName: "Murugan Selvam (Farmer Member)",
    location: "Dharmapuri Cluster, Tamil Nadu",
    crop: "Tomato",
    variety: "Shivam Hybrid (Plum Type)",
    quantityKg: 2400,
    harvestDateTime: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    storageTempC: 32,
    storageHumidityPercent: 62,
    storageType: "Ambient Ventilated Room",
    transitDelayHours: 14,
    visibleCondition: "Grade C (Softening/Bruised)",
    packaging: "Jute / Gunny Sacks",
    notes: "Harvested in afternoon heat. Packed in sacks; bottom crates showing pressure softness.",
    status: "Active",
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    assessment: calculateDeteriorationRisk({
      crop: "Tomato",
      quantityKg: 2400,
      harvestDateTime: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
      storageTempC: 32,
      storageHumidityPercent: 62,
      storageType: "Ambient Ventilated Room",
      transitDelayHours: 14,
      visibleCondition: "Grade C (Softening/Bruised)",
      packaging: "Jute / Gunny Sacks"
    }),
    marketOptions: [
      {
        id: "mkt-1",
        marketName: "Koyambedu Wholesale Terminal (Chennai)",
        buyerType: "Wholesale APMC Mandi",
        pricePerKg: 34,
        distanceKm: 280,
        transitHours: 7.5,
        transportCost: 9500,
        otherCosts: 3200,
        notes: "Higher rate but 8hr transit risks transit juice leakage for bruised stock."
      },
      {
        id: "mkt-2",
        marketName: "Dindigul Local APMC / Uzhavar Sandhai",
        buyerType: "Farmer Market (Uzhavar Sandhai)",
        pricePerKg: 27,
        distanceKm: 45,
        transitHours: 1.5,
        transportCost: 2200,
        otherCosts: 600,
        notes: "Quick 1.5hr delivery preserves current grade before further softening."
      }
    ]
  },
  {
    id: "batch-demo-02",
    batchCode: "HS-2026-BAN-02",
    farmerName: "Kavitha Ranganathan (MABIF FPO)",
    location: "Theni Valley FPO, Tamil Nadu",
    crop: "Banana",
    variety: "Grand Naine (G9)",
    quantityKg: 4500,
    harvestDateTime: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
    storageTempC: 13.5,
    storageHumidityPercent: 92,
    storageType: "Zero Energy Cool Chamber (ZECC)",
    transitDelayHours: 4,
    visibleCondition: "Grade A (Prime/Fresh)",
    packaging: "Corrugated Fiberboard Boxes",
    notes: "De-handed in clean wash tank, wrapped in perforated liners. Kept in evaporative chamber.",
    status: "Active",
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    assessment: calculateDeteriorationRisk({
      crop: "Banana",
      quantityKg: 4500,
      harvestDateTime: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
      storageTempC: 13.5,
      storageHumidityPercent: 92,
      storageType: "Zero Energy Cool Chamber (ZECC)",
      transitDelayHours: 4,
      visibleCondition: "Grade A (Prime/Fresh)",
      packaging: "Corrugated Fiberboard Boxes"
    }),
    marketOptions: [
      {
        id: "mkt-ban-1",
        marketName: "Madurai Central Fruit Commission Yard",
        buyerType: "Wholesale APMC Mandi",
        pricePerKg: 24,
        distanceKm: 75,
        transitHours: 2,
        transportCost: 4500,
        otherCosts: 1800
      },
      {
        id: "mkt-ban-2",
        marketName: "Direct Agri-Export Aggregator (Kochi Port)",
        buyerType: "Food Processing Industry",
        pricePerKg: 31,
        distanceKm: 210,
        transitHours: 5.5,
        transportCost: 11000,
        otherCosts: 3500
      }
    ]
  },
  {
    id: "batch-demo-03",
    batchCode: "HS-2026-MAN-03",
    farmerName: "Anand Kumar (Horticulture Cluster)",
    location: "Krishnagiri Orchard Belt",
    crop: "Mango",
    variety: "Bangalora / Alphonso Mix",
    quantityKg: 3200,
    harvestDateTime: new Date(Date.now() - 40 * 3600 * 1000).toISOString(),
    storageTempC: 28,
    storageHumidityPercent: 70,
    storageType: "Open Shaded Yard",
    transitDelayHours: 18,
    visibleCondition: "Grade B (Minor Blemishes)",
    packaging: "Ventilated Plastic Crates",
    notes: "Harvested with 5cm pedicel. Minor sap marks on lower cheeks.",
    status: "Active",
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    assessment: calculateDeteriorationRisk({
      crop: "Mango",
      quantityKg: 3200,
      harvestDateTime: new Date(Date.now() - 40 * 3600 * 1000).toISOString(),
      storageTempC: 28,
      storageHumidityPercent: 70,
      storageType: "Open Shaded Yard",
      transitDelayHours: 18,
      visibleCondition: "Grade B (Minor Blemishes)",
      packaging: "Ventilated Plastic Crates"
    }),
    marketOptions: [
      {
        id: "mkt-man-1",
        marketName: "Bangalore KR Market Wholesale",
        buyerType: "Wholesale APMC Mandi",
        pricePerKg: 65,
        distanceKm: 90,
        transitHours: 2.5,
        transportCost: 5500,
        otherCosts: 2800
      },
      {
        id: "mkt-man-2",
        marketName: "Local Pulp Processing Factory",
        buyerType: "Food Processing Industry",
        pricePerKg: 52,
        distanceKm: 18,
        transitHours: 0.8,
        transportCost: 1800,
        otherCosts: 800
      }
    ]
  },
  {
    id: "batch-demo-04",
    batchCode: "HS-2026-ONI-04",
    farmerName: "Ramasamy Naidu",
    location: "Perambalur Shallot/Onion Belt",
    crop: "Onion",
    variety: "Bellary Red / Small Shallot",
    quantityKg: 6000,
    harvestDateTime: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    storageTempC: 31,
    storageHumidityPercent: 84, // high humidity is bad for onions
    storageType: "Ambient Ventilated Room",
    transitDelayHours: 8,
    visibleCondition: "Grade C (Softening/Bruised)",
    packaging: "Loose Bulk Heap",
    notes: "Sudden rain during drying phase created high dampness. Bulbs showing early neck moisture.",
    status: "Active",
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    assessment: calculateDeteriorationRisk({
      crop: "Onion",
      quantityKg: 6000,
      harvestDateTime: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
      storageTempC: 31,
      storageHumidityPercent: 84,
      storageType: "Ambient Ventilated Room",
      transitDelayHours: 8,
      visibleCondition: "Grade C (Softening/Bruised)",
      packaging: "Loose Bulk Heap"
    }),
    marketOptions: [
      {
        id: "mkt-oni-1",
        marketName: "Tiruchirappalli Gandhi Market",
        buyerType: "Wholesale APMC Mandi",
        pricePerKg: 38,
        distanceKm: 60,
        transitHours: 1.8,
        transportCost: 4800,
        otherCosts: 2400
      }
    ]
  },
  {
    id: "batch-demo-05",
    batchCode: "HS-2026-POT-05",
    farmerName: "Senthil Nathan",
    location: "Nilgiris Hill Region",
    crop: "Potato",
    variety: "Kufri Jyoti (Table Potato)",
    quantityKg: 8500,
    harvestDateTime: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
    storageTempC: 11,
    storageHumidityPercent: 88,
    storageType: "Cold Storage (Controlled Temp)",
    transitDelayHours: 6,
    visibleCondition: "Grade A (Prime/Fresh)",
    packaging: "Ventilated Plastic Crates",
    notes: "Cured properly for 12 days. Stored in dark cold godown at 11°C with regular ventilation.",
    status: "Active",
    createdAt: new Date(Date.now() - 60 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 3600 * 1000).toISOString(),
    assessment: calculateDeteriorationRisk({
      crop: "Potato",
      quantityKg: 8500,
      harvestDateTime: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
      storageTempC: 11,
      storageHumidityPercent: 88,
      storageType: "Cold Storage (Controlled Temp)",
      transitDelayHours: 6,
      visibleCondition: "Grade A (Prime/Fresh)",
      packaging: "Ventilated Plastic Crates"
    }),
    marketOptions: [
      {
        id: "mkt-pot-1",
        marketName: "Mettupalayam Potato Wholesale Mandi",
        buyerType: "Wholesale APMC Mandi",
        pricePerKg: 26,
        distanceKm: 42,
        transitHours: 1.2,
        transportCost: 5200,
        otherCosts: 2200
      }
    ]
  }
];
