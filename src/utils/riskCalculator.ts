import { AssessmentDetails, CropType, PackagingType, RiskFactor, RiskLevel, StorageType, VisibleConditionGrade } from "../types";
import { CROP_PROFILES } from "../data/cropProfiles";

interface CalculationInput {
  crop: CropType;
  quantityKg: number;
  harvestDateTime: string;
  storageTempC: number;
  storageHumidityPercent: number;
  storageType: StorageType;
  transitDelayHours: number;
  visibleCondition: VisibleConditionGrade;
  packaging: PackagingType;
}

export function calculateDeteriorationRisk(input: CalculationInput): AssessmentDetails {
  const profile = CROP_PROFILES[input.crop] || CROP_PROFILES["Other"];
  const factors: RiskFactor[] = [];
  let baseScore = 15; // baseline baseline for perishable horticulture

  // 1. Temperature Analysis
  const temp = input.storageTempC;
  if (temp < profile.chillingInjuryThreshold) {
    const chillingDiff = profile.chillingInjuryThreshold - temp;
    const impact = Math.min(35, Math.round(chillingDiff * 5.5));
    baseScore += impact;
    factors.push({
      factor: "Chilling Injury Risk",
      impactScore: impact,
      description: `Storage temperature (${temp}°C) is below the chilling threshold (${profile.chillingInjuryThreshold}°C). Chilling causes cellular collapse, skin pitting, discoloration, and rapid post-thaw breakdown.`,
      severity: impact > 20 ? "high" : "medium"
    });
  } else if (temp > profile.optimalTempMax) {
    const heatDiff = temp - profile.optimalTempMax;
    // Respiration rate roughly doubles for every 10°C rise (Van 't Hoff Q10 rule)
    const impact = Math.min(38, Math.round(heatDiff * 2.2));
    baseScore += impact;
    factors.push({
      factor: "Accelerated Respiration & Field Heat",
      impactScore: impact,
      description: `Temperature (${temp}°C) is ${heatDiff.toFixed(1)}°C higher than the optimal threshold (${profile.optimalTempMax}°C). According to Q10 kinetics, produce respiration and ethylene synthesis double every 10°C rise, rapidly depleting sugars and water.`,
      severity: impact > 20 ? "high" : "medium"
    });
  } else {
    // Within optimal range
    baseScore -= 6;
    factors.push({
      factor: "Optimal Thermal Zone",
      impactScore: -6,
      description: `Storage temperature (${temp}°C) is within the safe botanical preservation window (${profile.optimalTempMin}°C - ${profile.optimalTempMax}°C).`,
      severity: "low"
    });
  }

  // 2. Humidity Analysis
  const humidity = input.storageHumidityPercent;
  if (input.crop === "Onion") {
    // Onions require lower humidity (65-70%)
    if (humidity > 75) {
      const impact = Math.min(25, Math.round((humidity - 75) * 1.2));
      baseScore += impact;
      factors.push({
        factor: "Excess Humidity for Onion",
        impactScore: impact,
        description: `Relative humidity (${humidity}%) exceeds the 70% threshold. For dry alliums, moisture stimulates root re-growth, Aspergillus niger black mold, and neck rot.`,
        severity: "high"
      });
    }
  } else {
    // Other perishables need high humidity (85-95%)
    if (humidity < profile.optimalHumidityMin) {
      const humDiff = profile.optimalHumidityMin - humidity;
      const impact = Math.min(22, Math.round(humDiff * 0.7));
      baseScore += impact;
      factors.push({
        factor: "Vapor Pressure Deficit & Desiccation",
        impactScore: impact,
        description: `Humidity (${humidity}%) is below the ${profile.optimalHumidityMin}% minimum. High vapor pressure deficit causes moisture evaporation, skin wilting, and commercial weight loss.`,
        severity: impact > 15 ? "high" : "medium"
      });
    } else if (humidity > 95) {
      const impact = 8;
      baseScore += impact;
      factors.push({
        factor: "Condensation & Pathogen Risk",
        impactScore: impact,
        description: `Excessive humidity (>95%) risks water condensation droplets on skin surfaces, favoring fungal germination if free water settles.`,
        severity: "medium"
      });
    }
  }

  // 3. Storage Type Environment
  switch (input.storageType) {
    case "Direct Sunlight / Field Heap":
      baseScore += 28;
      factors.push({
        factor: "Direct Solar Radiation Exposure",
        impactScore: 28,
        description: "Exposure to direct sunlight causes solar heat trapping, pulp scald, and rapid moisture depletion.",
        severity: "high"
      });
      break;
    case "Open Shaded Yard":
      baseScore += 16;
      factors.push({
        factor: "Uncontrolled Ambient Airflow",
        impactScore: 16,
        description: "Shaded yard protects from direct sun but remains vulnerable to ambient heat waves and insect vectors.",
        severity: "medium"
      });
      break;
    case "Ambient Ventilated Room":
      baseScore += 10;
      factors.push({
        factor: "Ambient Passive Ventilation",
        impactScore: 10,
        description: "Adequate air movement helps dissipate ethylene and respiration CO2, though temperature tracks diurnal highs.",
        severity: "low"
      });
      break;
    case "Zero Energy Cool Chamber (ZECC)":
      baseScore -= 10;
      factors.push({
        factor: "Evaporative Cooling Protection (ZECC)",
        impactScore: -10,
        description: "Wet double-brick evaporative chamber lowers internal temperature by 8-12°C and maintains >90% RH economically.",
        severity: "low"
      });
      break;
    case "Cold Storage (Controlled Temp)":
      baseScore -= 18;
      factors.push({
        factor: "Controlled Atmosphere / Cold Chain",
        impactScore: -18,
        description: "Refrigerated environment suppresses enzymatic ripening and microbial spore proliferation.",
        severity: "low"
      });
      break;
    case "Reefer Container / Van":
      baseScore -= 14;
      factors.push({
        factor: "Mobile Refrigerated Transport",
        impactScore: -14,
        description: "Maintains cold chain throughout movement to terminal markets.",
        severity: "low"
      });
      break;
  }

  // 4. Packaging Type
  switch (input.packaging) {
    case "Jute / Gunny Sacks":
      baseScore += 14;
      factors.push({
        factor: "Gunny Sack Compression & Heat Trapping",
        impactScore: 14,
        description: "Rough jute sacks lack rigid sidewall protection; bottom layers bear compressive weight causing internal bruising.",
        severity: "medium"
      });
      break;
    case "Loose Bulk Heap":
      baseScore += 18;
      factors.push({
        factor: "Bulk Stacking Pressure",
        impactScore: 18,
        description: "Deep heaps create hot-spots in the center due to trapped respiration heat and crush bottom produce.",
        severity: "high"
      });
      break;
    case "Ventilated Plastic Crates":
      baseScore -= 6;
      factors.push({
        factor: "Rigid Ventilated Plastic Crates",
        impactScore: -6,
        description: "Smooth interior surfaces minimize mechanical scuffing and perforated walls ensure uniform airflow.",
        severity: "low"
      });
      break;
    case "Corrugated Fiberboard Boxes":
      baseScore -= 4;
      factors.push({
        factor: "Cushioned Fiberboard Packaging",
        impactScore: -4,
        description: "Provides impact cushioning and individual compartment protection for delicate fruits.",
        severity: "low"
      });
      break;
    case "Polythene Bags":
      baseScore += 12;
      factors.push({
        factor: "Unperforated Plastic Moisture Trapping",
        impactScore: 12,
        description: "Trapped condensation creates anaerobic conditions and rapid bacterial soft rot.",
        severity: "medium"
      });
      break;
  }

  // 5. Transit Delay Hours
  const delay = input.transitDelayHours;
  if (delay > 24) {
    const impact = Math.min(26, Math.round(delay * 0.7));
    baseScore += impact;
    factors.push({
      factor: "Severe Transit Delay (>24h)",
      impactScore: impact,
      description: `Extended transport delay of ${delay} hours significantly increases cumulative thermal exposure and road vibration micro-cracking.`,
      severity: "high"
    });
  } else if (delay > 8) {
    const impact = Math.min(14, Math.round(delay * 0.5));
    baseScore += impact;
    factors.push({
      factor: "Moderate Transit Transit Time",
      impactScore: impact,
      description: `${delay} hours of transit exposes produce to vehicle engine heat and road shocks.`,
      severity: "medium"
    });
  }

  // 6. Visible Condition Grade
  switch (input.visibleCondition) {
    case "Grade D (Severe Deterioration/Rot Signs)":
      baseScore += 45;
      factors.push({
        factor: "Active Microbial Inoculum & Softening",
        impactScore: 45,
        description: "Existing rotten specimens release spores and high volumes of ethylene, rapidly cross-infecting healthy fruits.",
        severity: "high"
      });
      break;
    case "Grade C (Softening/Bruised)":
      baseScore += 26;
      factors.push({
        factor: "Compromised Epidermis / Bruises",
        impactScore: 26,
        description: "Cracked or soft skin provides direct entry points for opportunistic wound pathogens like Botrytis and Rhizopus.",
        severity: "high"
      });
      break;
    case "Grade B (Minor Blemishes)":
      baseScore += 10;
      factors.push({
        factor: "Minor Surface Blemishes",
        impactScore: 10,
        description: "Superficial scratches without deep dermal puncture; slight aesthetic discount at mandi.",
        severity: "low"
      });
      break;
    case "Grade A (Prime/Fresh)":
      baseScore -= 8;
      factors.push({
        factor: "Intact Cuticle & Firm Turgor",
        impactScore: -8,
        description: "Produce has strong cellular turgidity and unbroken natural waxy cuticle providing native barrier resistance.",
        severity: "low"
      });
      break;
  }

  // Clamp risk score to 5 - 98
  const finalScore = Math.max(5, Math.min(98, baseScore));

  let riskLevel: RiskLevel = "Low";
  if (finalScore >= 68) {
    riskLevel = "High";
  } else if (finalScore >= 36) {
    riskLevel = "Medium";
  }

  // Calculate safe dispatch window (heuristic based on score and crop perishability)
  let safeHours = 48;
  if (riskLevel === "High") {
    safeHours = Math.max(4, Math.round(24 * (1 - (finalScore - 68) / 35)));
  } else if (riskLevel === "Medium") {
    safeHours = Math.round(48 * (1 - (finalScore - 36) / 45) + 12);
  } else {
    safeHours = Math.round(96 * (1 - finalScore / 40) + 48);
  }

  // Special shelf-life adjustment for long-keeping crops like Onion/Potato
  if (input.crop === "Onion" || input.crop === "Potato") {
    safeHours = Math.round(safeHours * 3.5);
  }

  // Estimated potential quantity at risk percentage
  const estimatedLossPercentage = Math.round(
    riskLevel === "High"
      ? 20 + ((finalScore - 68) / 32) * 35
      : riskLevel === "Medium"
      ? 8 + ((finalScore - 36) / 32) * 12
      : Math.max(2, (finalScore / 36) * 6)
  );

  // Generate specific actionable steps
  const actions: string[] = [];

  if (input.visibleCondition.includes("Grade C") || input.visibleCondition.includes("Grade D")) {
    actions.push("IMMEDIATE SEGREGATION: Manually remove all split, bruised, and soft produce from crates. Do not allow moldy fruits to touch healthy stock.");
  }

  if (temp > profile.optimalTempMax) {
    if (input.storageType !== "Cold Storage (Controlled Temp)" && input.storageType !== "Zero Energy Cool Chamber (ZECC)") {
      actions.push(`PRE-COOLING & SHADE: Move produce into shaded, well-ventilated breezeways immediately. Apply evaporative sand/burlap cooling or fan aeration to dissipate field heat (${temp}°C down to target ${profile.optimalTempMax}°C).`);
    }
  }

  if (input.packaging === "Jute / Gunny Sacks" || input.packaging === "Loose Bulk Heap") {
    actions.push("PACKAGING UPGRADE: Transfer produce into 20kg stackable, vented plastic crates. Maximum 3 crates vertical height to eliminate crushing pressure.");
  }

  if (delay > 12 || riskLevel === "High") {
    actions.push(`FAST-TRACK LOGISTICS: Schedule priority transit within ${safeHours} hours. Coordinate with local APMC or Uzhavar Sandhai to avoid mid-day sun transit.`);
  }

  if (input.crop === "Tomato" || input.crop === "Banana" || input.crop === "Mango") {
    actions.push("ETHYLENE MANAGEMENT: Store separately from other ripe fruits. Ensure cross-ventilation in storage room to prevent ethylene accumulation.");
  }

  if (actions.length < 3) {
    actions.push("MONITORING: Check crate temperatures twice daily (early morning 6 AM and afternoon 2 PM) to track temperature spikes.");
  }

  const scientificRationale = `Calculated via HarvestShield Agri-Rule Engine grounded in ICAR-CIPHET and NHB post-harvest physiology baselines. Evaluates Q10 respiration quotient against crop-specific thermal limits (${profile.optimalTempMin}°C - ${profile.optimalTempMax}°C), chilling injury thresholds, moisture vapor deficits, mechanical packaging resistance, and microbial inoculation risk from surface condition.`;

  const disclaimer = `Decision-Support Notice: This deterioration assessment is a scientifically grounded rules-based baseline estimation to aid farm-gate operational planning. It is not an empirical guarantee of shelf life. Real storage life is affected by specific cultivar, latent pre-harvest weather, pesticide residue intervals, and micro-climates. Always inspect physical produce prior to sale.`;

  return {
    riskScore: finalScore,
    riskLevel,
    safeDispatchHours: safeHours,
    estimatedLossPercentage,
    contributingFactors: factors.sort((a, b) => Math.abs(b.impactScore) - Math.abs(a.impactScore)),
    immediateActions: actions,
    scientificRationale,
    disclaimer
  };
}
