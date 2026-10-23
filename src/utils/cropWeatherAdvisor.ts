import { CropType, StorageType, WeatherForecastResponse } from "../types";
import { CROP_PROFILES } from "../data/cropProfiles";
import { Language } from "./translations";

export interface CropWeatherAdvisory {
  threatLevel: "critical" | "warning" | "favorable";
  headline: string;
  tamilHeadline: string;
  scientificImpact: string;
  tamilScientificImpact: string;
  timelineAlert: string;
  actionProtocol: string[];
  tamilActionProtocol: string[];
  facilityRecommendation: string;
  dispatchAdvice: string;
}

export function generateCropWeatherAdvisories(
  crop: CropType,
  weather: WeatherForecastResponse | null,
  currentStorageType: StorageType,
  lang: Language = "en"
): CropWeatherAdvisory {
  const profile = CROP_PROFILES[crop] || CROP_PROFILES["Other"];

  // Default fallback if weather not yet loaded
  if (!weather || !weather.forecastDays || weather.forecastDays.length === 0) {
    return {
      threatLevel: "favorable",
      headline: `Standard Storage Protocol for ${crop}`,
      tamilHeadline: `${profile.tamilName} நிலையான சேமிப்பு வழிகாட்டல்`,
      scientificImpact: `Maintain temperature between ${profile.optimalTempMin}°C and ${profile.optimalTempMax}°C with ${profile.optimalHumidityMin}%-${profile.optimalHumidityMax}% relative humidity to suppress respiration.`,
      tamilScientificImpact: `வெப்பநிலையை ${profile.optimalTempMin}°C - ${profile.optimalTempMax}°C அளவிலும், ஈரப்பதத்தை ${profile.optimalHumidityMin}%-${profile.optimalHumidityMax}% அளவிலும் பராமரிக்கவும்.`,
      timelineAlert: "Fetch 7-day weather forecast above to unlock dynamic atmospheric recommendations.",
      actionProtocol: profile.storageProtocols,
      tamilActionProtocol: [
        "நிழலான, காற்றோட்டமுள்ள இடத்தில் வைக்கவும்.",
        "சேதமடைந்த பயிர்களை உடனே தரம் பிரிக்கவும்.",
        "பிளாஸ்டிக் கிரேட்களைப் பயன்படுத்தவும்."
      ],
      facilityRecommendation: "Ventilated shaded room or Zero Energy Cool Chamber (ZECC).",
      dispatchAdvice: "Plan market transit within normal safe dispatch window."
    };
  }

  const peakTemp = weather.peakThermalTempC;
  const peakTempDay = weather.peakThermalDay;
  const peakHum = weather.peakHumidityPercent;
  const peakHumDay = weather.peakHumidityDay;
  const avgTemp = weather.average7DayTempC;
  const hasRainEvent = weather.forecastDays.some((d) => d.condition.toLowerCase().includes("rain") || d.humidityPercent > 80);
  const hasHeatwave = weather.forecastDays.some((d) => d.tempMax >= 36);

  // 1. TOMATO
  if (crop === "Tomato") {
    if (hasHeatwave || peakTemp >= 35) {
      return {
        threatLevel: "critical",
        headline: `Thermal Wave Threat: Respiration Surge & Rapid Softening`,
        tamilHeadline: `வெப்ப அலை எச்சரிக்கை: தக்காளி வேகமாக மென்மையாதல் & எடை இழப்பு`,
        scientificImpact: `Ambient peak of ${peakTemp}°C on ${peakTempDay} exceeds tomato optimal range (${profile.optimalTempMin}-${profile.optimalTempMax}°C) by ${(peakTemp - profile.optimalTempMax).toFixed(1)}°C. Under Q10 kinetics, tomato respiration rate doubles every 10°C, burning internal acids and sugars, leading to water-blistered pericarp softening within 18 hours.`,
        tamilScientificImpact: `${peakTempDay} அன்று வெப்பநிலை ${peakTemp}°C ஆக உயர்வதால் தக்காளியின் சுவாசம் இருமடங்காக அதிகரித்து விரைவாக அழுகல் மற்றும் நீர்ச்சத்து இழப்பு ஏற்படும்.`,
        timelineAlert: `Critical Heat Window: ${peakTempDay} (Peak ${peakTemp}°C). Pre-cool before 9:00 AM.`,
        actionProtocol: [
          `Activate Evaporative Cool Chamber (ZECC): Wet sand cavity 3 times daily (${peakTempDay} requires extra mid-day saturation to maintain 22°C interior).`,
          `Avoid Mid-Day Picking: Complete harvesting before 8:30 AM to prevent trapping afternoon solar field heat in crates.`,
          `Hydro-Cooling: Wash crates in cool well-water (18-20°C) with 100 ppm sodium hypochlorite to remove field heat and reduce microbial load.`,
          `Stacking Limit: Stack plastic crates maximum 3 layers high; heat accumulates rapidly in center crates under warm weather.`
        ],
        tamilActionProtocol: [
          `காலை 8:30 மணிக்குள் அறுவடையை முடிக்கவும்; நண்பகல் வெயிலில் அறுவடை செய்ய வேண்டாம்.`,
          `ஜீரோ எனர்ஜி கூல் சேம்பரில் மணலை தினமும் 3 முறை நனைத்து குளிர்ச்சியைப் பராமரிக்கவும்.`,
          `பிளாஸ்டிக் கிரேட்களை 3 அடுக்குகளுக்கு மேல் அடுக்க வேண்டாம்; நடுப்பகுதியில் வெப்பம் தேங்கும்.`
        ],
        facilityRecommendation: currentStorageType === "Ambient Ventilated Room" || currentStorageType.includes("Yard")
          ? "URGENT UPGRADE: Ambient rooms cannot shield against 38°C peaks. Move produce into Zero Energy Cool Chamber (ZECC) or cold storage."
          : "Maintain current controlled cooling with high air exchange.",
        dispatchAdvice: `Dispatch tomato batches to mandi before ${peakTempDay} morning to sell at Grade A premium before heat wave induces skin softening.`
      };
    } else if (hasRainEvent) {
      return {
        threatLevel: "warning",
        headline: `Condensation Hazard: Alternaria & Gray Mold Infection Risk`,
        tamilHeadline: `ஈரப்பத எச்சரிக்கை: பூஞ்சை காளான் & அழுகல் பரவும் அபாயம்`,
        scientificImpact: `High atmospheric moisture (${peakHum}% RH on ${peakHumDay}) combined with rain showers promotes microscopic water condensation on tomato calyx and skin micro-cracks. This creates optimal germination conditions for Botrytis cinerea and Alternaria rot.`,
        tamilScientificImpact: `${peakHumDay} அன்று நிலவும் அதிக ஈரப்பதம் (${peakHum}%) தக்காளியின் தோலில் பூஞ்சை காளான் தொற்று மற்றும் கருப்பு அழுகலைத் தூண்டும்.`,
        timelineAlert: `High Moisture Window: ${peakHumDay} (${peakHum}% RH).`,
        actionProtocol: [
          `Never Pack Wet Produce: Allow surface moisture to completely air-dry under high-speed ceiling fans before stacking into crates.`,
          `Sanitize Sorting Tables: Wipe crates with 0.5% potassium metabisulfite or clean chlorine solution.`,
          `Increase Air Circulation: Keep exhaust louvers open to prevent still, saturated air pockets inside storage shed.`
        ],
        tamilActionProtocol: [
          `ஈரமான தக்காளியை நேரடியாக பெட்டிகளில் அடைக்க வேண்டாம்; மின்விசிறி காற்றில் முழுமையாக உலர்த்தவும்.`,
          `காற்றோட்டத்தை அதிகரித்து பூஞ்சை தொற்று பரவாமல் தடுக்கவும்.`
        ],
        facilityRecommendation: "Well-ventilated dry ambient room with mechanical exhaust fans.",
        dispatchAdvice: "Prioritize crates showing hairline cuticle splits for immediate local sale within 12 hours."
      };
    }
  }

  // 2. ONION / SHALLOT
  if (crop === "Onion") {
    if (hasRainEvent || peakHum >= 75) {
      return {
        threatLevel: "critical",
        headline: `CRITICAL ALLIUM MOISTURE HAZARD: Black Mold & Sprouting Risk`,
        tamilHeadline: `அதிதீவிர வெங்காய ஈரப்பதம் எச்சரிக்கை: கருப்பு பூஞ்சை & முளைப்பு அபாயம்`,
        scientificImpact: `Onions require low relative humidity (65-70% RH). The forecast shows ${peakHum}% RH on ${peakHumDay}. Free moisture triggers immediate root disc swelling, premature sprouting, and Aspergillus niger (black mold) mycelium spread beneath dry papery tunics.`,
        tamilScientificImpact: `வெங்காயத்திற்கு 65-70% ஈரப்பதமே தேவை. முன்னறிவிப்பில் உள்ள ${peakHum}% ஈரப்பதம் வெங்காயத்தில் வேர் விடுதலையும், கருப்பு பூஞ்சை அழுகலையும் தூண்டும்.`,
        timelineAlert: `Moisture Threat Peak: ${peakHumDay} (${peakHum}% RH with ambient precipitation).`,
        actionProtocol: [
          `Suspend Field Curing Immediately: Move windrowed onions from open fields into covered, raised aerated sheds before rainfall begins.`,
          `Bottom-Up Aeration: Store on raised bamboo/wire-mesh slatted platforms ('Kanda Chawl') at least 30 cm above ground level.`,
          `Strict Separation from Potatoes: Keep onions completely separate from tubers and tomatoes; onions absorb respiration moisture rapidly.`,
          `De-scale & Dry: Cull all thick-neck ('bull-neck') bulbs immediately as they will rot first under humid weather.`
        ],
        tamilActionProtocol: [
          `மழை தொடங்கும் முன் வயலில் உள்ள வெங்காயத்தை உடனே மூடிய காற்றோட்ட கொட்டகைக்கு மாற்றவும்.`,
          `தரையில் கொட்டாமல் மூங்கில் பரண்கள் மீது 1 அடி உயரத்தில் பரப்பி வைக்கவும்.`,
          `தடிமனான தண்டு கொண்ட வெங்காயங்களை உடனே தனியாகப் பிரித்து விற்பனை செய்யவும்.`
        ],
        facilityRecommendation: "Dry ventilated storage structure ('Kanda Chawl') with bottom airflow. NEVER use Zero Energy Cool Chambers for onions (too humid).",
        dispatchAdvice: `Sell semi-cured shallots/onions before ${peakHumDay} or thoroughly cure under forced-air fans.`
      };
    } else {
      return {
        threatLevel: "favorable",
        headline: `Optimal Dry Curing Window for Alliums`,
        tamilHeadline: `வெங்காயம் பதப்படுத்துவதற்கு உகந்த உலர்ந்த வானிலை`,
        scientificImpact: `Warm dry weather (avg ${avgTemp}°C, ${peakHum}% RH) provides ideal environmental vapor pressure to cure outer neck tissues, sealing vascular pathways against fungal invasion.`,
        tamilScientificImpact: `தற்போதைய உலர்ந்த வானிலை வெங்காயத்தின் கழுத்துப் பகுதியை உலர்த்தி இயற்கையான பாதுகாப்பு தோலை உருவாக்க மிகவும் உகந்தது.`,
        timelineAlert: `Favorable drying conditions through next 5 days.`,
        actionProtocol: [
          `Continue shade curing until outer scales rustle like dry parchment paper.`,
          `Trim neck to 2.5–3 cm length; do not cut flush with bulb shoulder.`,
          `Pack into leno open-mesh bags (25-40 kg) for uniform convective ventilation.`
        ],
        tamilActionProtocol: [
          `வெளித்தோல் சலசலக்கும் வரை நிழலில் உலர்த்தவும்.`,
          `தண்டை 3 செ.மீ நீளத்திற்கு வெட்டி, வலைப் பைகளில் (Mesh bags) அடைக்கவும்.`
        ],
        facilityRecommendation: "Well-aerated ambient shed with slatted side walls.",
        dispatchAdvice: "Bulbs are in prime storage condition; can be held safely for 30–60 days."
      };
    }
  }

  // 3. BANANA
  if (crop === "Banana") {
    if (avgTemp <= profile.chillingInjuryThreshold || weather.forecastDays.some((d) => d.tempMin <= 12)) {
      return {
        threatLevel: "critical",
        headline: `Chilling Injury Critical Alert: Peel Blackening & Ripening Arrest`,
        tamilHeadline: `குளிர் காயம் எச்சரிக்கை: வாழைப்பழம் தோல் கருத்தல் & பழுக்க இயலாமை`,
        scientificImpact: `Forecast temperatures dropping below ${profile.chillingInjuryThreshold}°C trigger severe sub-epidermal cellular collapse. Bananas will suffer peel browning (dull smoky gray), hard core failure, and inability to convert starch to sugar.`,
        tamilScientificImpact: `குளிர்ச்சி 12°C க்குக் கீழ் குறையும் போது வாழைப்பழத்தின் தோல் கருகி பழுப்பு நிறமாகும்; பழம் சரியாகப் பழுக்காது.`,
        timelineAlert: `Night-time minimum dips to critical chilling limits.`,
        actionProtocol: [
          `Never store bananas in cold storage rooms below 13°C.`,
          `Wrap stacked crates in padded kraft paper or perforated plastic liners to buffer night drafts.`,
          `Keep storage room doors sealed during cool night hours.`
        ],
        tamilActionProtocol: [
          `வாழைப்பழத்தை 13°C க்குக் குறைவான குளிர் அறைகளில் வைக்க வேண்டாம்.`,
          `இரவு நேரக் குளிர்காற்று படாதவாறு பெட்டிகளை பேக்கிங் காகிதத்தால் மூடவும்.`
        ],
        facilityRecommendation: "Temperature-controlled room maintained strictly at 13°C to 15°C.",
        dispatchAdvice: "Transport only in insulated or enclosed vehicles to avoid wind chill during transit."
      };
    } else if (hasHeatwave || peakTemp >= 35) {
      return {
        threatLevel: "warning",
        headline: `Ethylene Surge & Crown Rot Accelerated by Heat`,
        tamilHeadline: `வெப்பத்தால் வாழைப்பழம் உதிர்வு & காம்பு அழுகல் எச்சரிக்கை`,
        scientificImpact: `High ambient heat (${peakTemp}°C) stimulates autonomous ethylene release. High ethylene triggers rapid peel yellowing while pulp remains firm, followed by crown softening and finger drop during transit.`,
        tamilScientificImpact: `அதிக வெப்பத்தால் காம்பு அழுகி, சீப்பில் இருந்து பழங்கள் எளிதில் உதிர்ந்துவிடும் (Finger drop).`,
        timelineAlert: `Peak heatwave on ${peakTempDay} (${peakTemp}°C).`,
        actionProtocol: [
          `De-hand bunches using sharp de-handing curved knives; wash cut crown in alum water (1% potassium aluminum sulfate) to cauterize wound against crown rot.`,
          `Isolate completely from ripe fruit chambers to avoid autocatalytic ripening.`,
          `Pack in foam-lined corrugated telescopic boxes (13 kg standard).`
        ],
        tamilActionProtocol: [
          `காம்பை சுத்தமான படிகார நீரில் கழுவி பூஞ்சை தொற்று ஏற்படாமல் சீல் வைக்கவும்.`,
          `பழுத்த பழங்களுக்கு அருகில் வைக்க வேண்டாம்.`
        ],
        facilityRecommendation: "Evaporative Cool Chamber (ZECC) or 14°C cold facility.",
        dispatchAdvice: `Dispatch at 75% mature green stage before ${peakTempDay} heat triggers premature ripening.`
      };
    }
  }

  // 4. MANGO
  if (crop === "Mango") {
    if (hasHeatwave || peakTemp >= 36) {
      return {
        threatLevel: "warning",
        headline: `Spongy Tissue & Pulp Fermentation Threat`,
        tamilHeadline: `மாம்பழத்தில் உள்சதை அழுகல் (Spongy Tissue) எச்சரிக்கை`,
        scientificImpact: `Exposure of harvested mangoes to ambient temperatures >36°C causes localized convective pulp heating, triggering internal enzyme inactivation, starch breakdown failure, and acidic spongy tissue formation.`,
        tamilScientificImpact: `36°C க்கும் அதிகமான வெப்பம் மாம்பழத்தின் உள்சதையை கெடுத்து அமில சுவை மற்றும் ஸ்பாஞ்சி திசுவை உண்டாக்கும்.`,
        timelineAlert: `Peak thermal hazard on ${peakTempDay} (${peakTemp}°C).`,
        actionProtocol: [
          `Harvest strictly with 5 cm stalk attached using pole harvesters with collection nets.`,
          `Desap on specialized inverted desapping racks for 4 hours to avoid caustic latex burn.`,
          `Perform hot water treatment (52°C for 5 minutes) to eradicate latent anthracnose spores before packing.`
        ],
        tamilActionProtocol: [
          `பால் வடியாமல் இருக்க 5 செ.மீ காம்புடன் அறுவடை செய்து பிரத்யேக ஸ்டாண்டில் கவிழ்த்து வைக்கவும்.`,
          `சுடுநீர் சிகிச்சை (52°C இல் 5 நிமிடம்) செய்து ஆந்த்ராக்னோஸ் பூஞ்சையை அழிக்கவும்.`
        ],
        facilityRecommendation: "Shaded well-ventilated packing house maintained at 20-22°C via evaporative cooling.",
        dispatchAdvice: "Use night-time transit between 8 PM and 6 AM to avoid daytime solar roof heat on trucks."
      };
    }
  }

  // 5. POTATO
  if (crop === "Potato") {
    if (avgTemp >= 25 || hasHeatwave) {
      return {
        threatLevel: "warning",
        headline: `Sprouting Induction & Desiccation Weight Loss`,
        tamilHeadline: `உருளைக்கிழங்கு முளைப்பு & எடை சுருக்கம் எச்சரிக்கை`,
        scientificImpact: `At ambient temperatures exceeding 22°C, tuber endodormancy breaks rapidly. Tubers begin metabolic sprouting, respiration spikes, and moisture loss exceeds 4% per week. Exposure to light will additionally trigger toxic solanine synthesis (greening).`,
        tamilScientificImpact: `22°C க்கும் அதிகமான வெப்பத்தில் உருளைக்கிழங்கு முளைவிடத் தொடங்கும்; வெளிச்சம் பட்டால் பச்சையாக மாறி சோலனைன் நச்சு உருவாகும்.`,
        timelineAlert: `Sustained warm trend (Avg ${avgTemp}°C) across 7-day forecast.`,
        actionProtocol: [
          `Ensure 100% complete darkness in storage godown to stop solanine synthesis.`,
          `Maintain cross-ventilation through louvers during cooler night hours (10 PM - 5 AM).`,
          `Do not store alongside onions; onions release volatile sulfur compounds that accelerate potato sprouting.`
        ],
        tamilActionProtocol: [
          `முழுமையான இருட்டறையில் சேமிக்கவும்; வெளிச்சம் படக்கூடாது.`,
          `வெங்காயத்திற்கு அருகில் சேமிக்க வேண்டாம்.`
        ],
        facilityRecommendation: "Cold storage godown at 10-12°C (for table/processing) or dark ventilated ambient room.",
        dispatchAdvice: "Sort and bag in leno mesh bags; prioritize uncured lots for nearest market."
      };
    }
  }

  // GENERAL DEFAULT
  return {
    threatLevel: hasHeatwave ? "warning" : "favorable",
    headline: hasHeatwave
      ? `Elevated Respiration Under Incoming Heatwave (${peakTemp}°C)`
      : `Stable Weather Window for ${crop} Preservation`,
    tamilHeadline: hasHeatwave
      ? `வெப்ப அலை காரணமாக ${profile.tamilName} சுவாசம் அதிகரிப்பு`
      : `${profile.tamilName} சேமிப்பிற்கு சாதகமான வானிலை`,
    scientificImpact: `Forecast averages ${avgTemp}°C with ${peakHum}% RH. Thermal conditions dictate metabolic loss rate according to Arrhenius kinetics.`,
    tamilScientificImpact: `சராசரி வெப்பநிலை ${avgTemp}°C மற்றும் ஈரப்பதம் ${peakHum}% ஆக உள்ளது.`,
    timelineAlert: `Monitor daily weather shifts on ${peakTempDay}.`,
    actionProtocol: [
      `Maintain produce within safe thermal envelope (${profile.optimalTempMin}°C - ${profile.optimalTempMax}°C).`,
      `Use ventilated, smooth-walled plastic crates to prevent transit abrasion.`,
      `Inspect stock every 12 hours for soft rot or weeping lesions.`
    ],
    tamilActionProtocol: [
      `பயிரை நிழலான, காற்றோட்டமான இடத்தில் சேமிக்கவும்.`,
      `பிளாஸ்டிக் கிரேட்களைப் பயன்படுத்தி காயம் ஏற்படாமல் பாதுகாக்கவும்.`
    ],
    facilityRecommendation: "Zero Energy Cool Chamber (ZECC) or shaded ventilated breezeway.",
    dispatchAdvice: "Coordinate dispatch timing to avoid mid-day transit heat."
  };
}
