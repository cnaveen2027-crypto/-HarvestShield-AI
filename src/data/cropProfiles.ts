import { CropProfile, CropType } from "../types";

export const CROP_PROFILES: Record<CropType, CropProfile> = {
  Tomato: {
    name: "Tomato",
    tamilName: "தக்காளி (Thakkali)",
    optimalTempMin: 12,
    optimalTempMax: 15,
    chillingInjuryThreshold: 10,
    optimalHumidityMin: 85,
    optimalHumidityMax: 90,
    ethyleneSensitivity: "High",
    typicalNationalLossRate: 18.2, // ~18% post-harvest loss in India (ICAR-CIPHET)
    shelfLifeAtOptimal: "2 to 3 weeks",
    shelfLifeAtAmbient: "3 to 5 days at 30°C+",
    storageProtocols: [
      "Never store ripe tomatoes below 10°C; chilling causes water-soaked pitting and loss of flavor aroma.",
      "Use ventilated plastic crates (20-25 kg) with newspaper lining; avoid gunny bags which cause crushing.",
      "Maintain air circulation to disperse ethylene and reduce rapid over-ripening.",
      "Evaporative cooling (ZECC) maintains 20-22°C and extends shelf life by 8-12 days at minimal cost."
    ],
    keyRisks: [
      "Cracking and mechanical compression under crate weight",
      "Alternaria rot and soft rot under excessive free surface moisture",
      "Rapid ethylene-triggered skin softening in hot ambient warehouses"
    ]
  },
  Banana: {
    name: "Banana",
    tamilName: "வாழைப்பழம் (Vazhaipazham)",
    optimalTempMin: 13,
    optimalTempMax: 14,
    chillingInjuryThreshold: 12,
    optimalHumidityMin: 90,
    optimalHumidityMax: 95,
    ethyleneSensitivity: "Very High",
    typicalNationalLossRate: 15.6,
    shelfLifeAtOptimal: "2 to 4 weeks (green), 4 to 6 days (ripe)",
    shelfLifeAtAmbient: "2 to 4 days at 32°C",
    storageProtocols: [
      "Extremely susceptible to chilling injury below 12°C: peel turns dull grey/smoky black, fails to ripen.",
      "Segregate completely from other ripening fruits unless controlled ripening with ethylene gas is intended.",
      "Harvest at 75-80% maturity for long distance transit; use de-handing tanks with clean alum wash to stem crown rot.",
      "Wrap hands in perforated polyethylene liners inside telescopic corrugated boxes."
    ],
    keyRisks: [
      "Finger drop and crown rot from fungal infection at cutting wounds",
      "Skin blackening caused by chilling injury in cold transport",
      "Bruising from stacking heavy unpadded bunches"
    ]
  },
  Mango: {
    name: "Mango",
    tamilName: "மாம்பழம் (Maambazham)",
    optimalTempMin: 11,
    optimalTempMax: 13,
    chillingInjuryThreshold: 10,
    optimalHumidityMin: 85,
    optimalHumidityMax: 90,
    ethyleneSensitivity: "High",
    typicalNationalLossRate: 17.4,
    shelfLifeAtOptimal: "2 to 3 weeks",
    shelfLifeAtAmbient: "4 to 7 days",
    storageProtocols: [
      "Desap immediately upon harvest with a 5 cm pedicel intact to avoid caustic latex staining and skin burn.",
      "Hot water treatment (52°C for 5 minutes) controls latent anthracnose and fruit fly infestation.",
      "Store at 11-13°C for firm green mature fruits; do not chill below 10°C.",
      "Pack in single-layer corrugated boxes with partitioned foam sleeves."
    ],
    keyRisks: [
      "Anthracnose black tear-staining during ripening",
      "Stem-end rot appearing as fruit softens",
      "Spongy tissue formation under high pre-harvest ambient heat"
    ]
  },
  Potato: {
    name: "Potato",
    tamilName: "உருளைக்கிழங்கு (Urulaikilangu)",
    optimalTempMin: 8,
    optimalTempMax: 12, // For table potato; processing at 10-12°C to prevent sweetening
    chillingInjuryThreshold: 4,
    optimalHumidityMin: 85,
    optimalHumidityMax: 92,
    ethyleneSensitivity: "Low",
    typicalNationalLossRate: 12.5,
    shelfLifeAtOptimal: "4 to 8 months (in commercial cold storage with CIPC sprout suppressant)",
    shelfLifeAtAmbient: "15 to 30 days in dry ventilated shade",
    storageProtocols: [
      "Crucial: Cure tubers at 15-20°C and 90% RH for 10-14 days immediately post-harvest to suberize cuts.",
      "Store away from direct daylight to prevent chlorophyll synthesis (greening) and toxic solanine buildup.",
      "Keep away from apples and onions; ensure adequate air exchange to flush accumulated CO2.",
      "Use leno mesh bags instead of airtight plastic to maintain cross-ventilation."
    ],
    keyRisks: [
      "Sprouting and shrinkage at ambient temperatures above 18°C",
      "Bacterial soft rot and dry rot in humid non-ventilated godowns",
      "Greening and solanine bitterness when exposed to light"
    ]
  },
  Onion: {
    name: "Onion",
    tamilName: "வெங்காயம் (Vengayam)",
    optimalTempMin: 0,
    optimalTempMax: 2, // Cold storage; or 25-30°C in dry ventilated chawl
    chillingInjuryThreshold: -1,
    optimalHumidityMin: 65,
    optimalHumidityMax: 70, // Needs DRY atmosphere, NOT humid!
    ethyleneSensitivity: "Low",
    typicalNationalLossRate: 20.8, // High national loss rate
    shelfLifeAtOptimal: "5 to 6 months in cold storage (0-2°C, 65% RH) or 2-4 months in traditional chawl",
    shelfLifeAtAmbient: "20 to 45 days in dry shaded aerated racks",
    storageProtocols: [
      "Mandatory field and shade curing for 10-15 days until neck is completely sealed and paper outer scales rustle.",
      "Unlike other produce, onions require low humidity (65-70% RH); high humidity (>75%) triggers rooting and neck rot.",
      "Store in raised bamboo or wire-mesh bottom storage structures ('Kanda Chawl') for bottom-up aeration.",
      "Never store onions adjacent to potatoes, as onions release moisture and volatiles that accelerate potato sprouting."
    ],
    keyRisks: [
      "Black mold (Aspergillus niger) and neck rot in high humidity",
      "Sprouting if stored in intermediate temperatures (10-18°C)",
      "Bulb rotting caused by uncured thick necks ('bull necks')"
    ]
  },
  Papaya: {
    name: "Papaya",
    tamilName: "பப்பாளி (Pappali)",
    optimalTempMin: 12,
    optimalTempMax: 14,
    chillingInjuryThreshold: 10,
    optimalHumidityMin: 85,
    optimalHumidityMax: 90,
    ethyleneSensitivity: "High",
    typicalNationalLossRate: 19.1,
    shelfLifeAtOptimal: "2 to 3 weeks",
    shelfLifeAtAmbient: "3 to 5 days",
    storageProtocols: [
      "Harvest when 1 or 2 yellow stripes appear on the furrow (color break stage).",
      "Wrap individual fruits in paper or net sleeves to prevent skin friction and latex bleed.",
      "Prevent chilling injury by maintaining temperatures above 11°C.",
      "Transport upright or in single-layer horizontal trays."
    ],
    keyRisks: [
      "Anthracnose circular sunken spots",
      "Skin friction abrasion during transit",
      "Rapid over-ripening and pulp collapse"
    ]
  },
  Guava: {
    name: "Guava",
    tamilName: "கொய்யா (Koyya)",
    optimalTempMin: 8,
    optimalTempMax: 10,
    chillingInjuryThreshold: 6,
    optimalHumidityMin: 90,
    optimalHumidityMax: 95,
    ethyleneSensitivity: "High",
    typicalNationalLossRate: 16.3,
    shelfLifeAtOptimal: "2 to 3 weeks",
    shelfLifeAtAmbient: "2 to 4 days",
    storageProtocols: [
      "Harvest at mature green stage with pale yellowish-green tint.",
      "Foam net sleeves prevent puncture and skin bruising.",
      "Pre-cool with cool well-water wash or evaporative chamber before transit.",
      "Avoid stacking deep in bamboo baskets without paper cushioning."
    ],
    keyRisks: [
      "Stylar end rot and fruit fly oviposition",
      "Skin browning and weight loss under dry ambient heat",
      "Pulp softening within 48 hours at ambient temperatures"
    ]
  },
  Other: {
    name: "Other",
    tamilName: "இதர காய்கறிகள் / பழங்கள்",
    optimalTempMin: 10,
    optimalTempMax: 15,
    chillingInjuryThreshold: 7,
    optimalHumidityMin: 85,
    optimalHumidityMax: 90,
    ethyleneSensitivity: "Medium",
    typicalNationalLossRate: 15.0,
    shelfLifeAtOptimal: "1 to 3 weeks",
    shelfLifeAtAmbient: "3 to 6 days",
    storageProtocols: [
      "Pre-cool immediately to remove field heat within 4 hours of picking.",
      "Store in ventilated shade with high relative humidity.",
      "Use stackable plastic crates with smooth interior surfaces.",
      "Dispatch earliest to reduce cumulative degree-hours above baseline."
    ],
    keyRisks: [
      "Moisture loss leading to shriveling and weight shrinkage",
      "Mechanical crush damage in unrigid containers",
      "Bacterial and fungal breakdown at warm ambient conditions"
    ]
  }
};
