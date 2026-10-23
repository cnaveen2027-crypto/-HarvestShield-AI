import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Increase payload limit for base64 images
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Server-side Gemini initialization with required User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "HarvestShield AI",
    hasApiKey: !!process.env.GEMINI_API_KEY,
  });
});

// Produce image analysis endpoint
app.post("/api/gemini/analyze-produce", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg", cropType = "Tomato", notes = "" } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Image data is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Gemini API key is not configured on the server. Please check the Secrets panel in AI Studio.",
      });
    }

    // Clean base64 string if it contains data URI prefix
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");

    const promptText = `You are the HarvestShield Agricultural Post-Harvest Computer Vision Diagnostic Engine, built for Indian horticulture farmers under NABARD MABIF standards.
Analyze this photo of produce. The user selected the crop type: "${cropType}". Additional farmer notes: "${notes || "None"}".

Carefully evaluate observable external characteristics:
1. Apparent freshness and skin firmness indicators.
2. Visible bruising, crushing, or physical mechanical damage.
3. Visible discoloration, blemishes, or uneven ripening.
4. Visible mold-like growth, mycelium, dark rot spots, or stem-end decay.
5. Observable defects and external limitations.

CRITICAL GUIDELINES:
- Return strictly objective visual observations.
- Do NOT claim that a photograph proves internal pulp spoilage, detects invisible foodborne pathogens, or guarantees exact remaining shelf life down to hours.
- State clear limitations of image-only optical inspection.
- Provide actionable, crop-appropriate segregation and immediate handling steps for the farmer.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType || "image/jpeg",
            },
          },
          {
            text: promptText,
          },
        ],
      },
      config: {
        systemInstruction: "You are an expert post-harvest agricultural specialist. Analyze produce imagery with scientific accuracy, transparent uncertainty, and practical farm-gate handling recommendations.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            crop: { type: Type.STRING, description: "Identified or confirmed crop name" },
            freshnessGrade: { type: Type.STRING, description: "e.g. Grade A (Fresh/Prime), Grade B (Fair/Early Maturity), Grade C (At Risk/Deteriorating)" },
            freshnessScore: { type: Type.INTEGER, description: "Estimated visual freshness score from 0 (heavily spoiled) to 100 (flawless harvest)" },
            estimatedRiskLevel: { type: Type.STRING, description: "Low, Medium, or High deterioration risk" },
            visibleConditionSummary: { type: Type.STRING, description: "2-3 sentences summarizing visible external appearance" },
            observedEvidence: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Bullet points of specific observable optical cues"
            },
            defectTags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Short defect tags, e.g. 'Bruising', 'Discoloration', 'Mold Signs', 'Firm Skin', 'Mechanical Cut'"
            },
            confidenceLevel: { type: Type.STRING, description: "Assessment confidence level and reason" },
            suggestedHandlingActions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Immediate step-by-step actions for the farmer"
            },
            limitationsOfImageAssessment: {
              type: Type.STRING,
              description: "Explicit scientific reminder that photograph inspects surface only and cannot detect internal pathogens or guarantee shelf life."
            }
          },
          required: [
            "crop",
            "freshnessGrade",
            "freshnessScore",
            "estimatedRiskLevel",
            "visibleConditionSummary",
            "observedEvidence",
            "defectTags",
            "confidenceLevel",
            "suggestedHandlingActions",
            "limitationsOfImageAssessment"
          ]
        }
      }
    });

    const responseText = response.text?.trim();
    if (!responseText) {
      throw new Error("No response text received from Gemini API");
    }

    const parsedData = JSON.parse(responseText);
    return res.json(parsedData);
  } catch (error: any) {
    console.error("Produce image analysis error:", error);
    return res.status(500).json({
      error: error?.message || "Failed to analyze produce image. Please check image quality and try again.",
    });
  }
});

// Farming assistant chatbot endpoint (English and Tamil)
app.post("/api/gemini/assistant-chat", async (req, res) => {
  try {
    const { message, conversationHistory = [], language = "en" } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Gemini API key is not configured on the server. Please check the Secrets panel in AI Studio.",
      });
    }

    const systemInstruction = `You are "HarvestShield Assistant" (அறுவடை பாதுகாப்பு உதவியாளர்), an expert AI agronomy companion for Indian farmers, Farmer Producer Organizations (FPOs), and agricultural students participating in the JALLIKATTU 5.0 Agri-Tech Hackathon organized by NABARD MABIF.

Your role:
- Provide practical, scientifically grounded post-harvest management advice for perishables (Tomatoes, Bananas, Mangoes, Potatoes, Onions, Papayas, Vegetables, Fruits).
- Advise on low-cost on-farm solutions like Zero Energy Cool Chambers (ZECC), shade drying, proper curing of onions/garlic, plastic crate vs gunny bag handling, ethylene segregation, and pre-cooling techniques.
- Explain transportation precautions: avoiding peak afternoon heat transport, proper ventilation in trucks/tempo, cushioning against transit vibration.
- Explain how to use the HarvestShield AI application (Batch Management, Spoilage Risk Assessment, Market Comparison, and Report Generation).
- Language support: You fluently converse in BOTH English and Tamil (தமிழ்). If the user asks in Tamil or mixed Tamil-English (Tanglish), respond in natural, polite Tamil with clear bullet points. If the user asks in English, respond in clear, accessible English.

STRICT BOUNDARIES:
- DO NOT fabricate live market prices or ticker rates (clarify that prices vary daily across mandis like Koyambedu, Dindigul, APMCs).
- DO NOT promise guaranteed 100% cure for severely rotting or mold-infested crops; advise immediate segregation and compost disposal to save surrounding crates.
- State clearly that this is decision-support guidance, not a replacement for local Krishi Vigyan Kendra (KVK) or State Horticulture Department certified officers.
- Keep answers structured: short explanation followed by numbered actionable steps.`;

    // Format chat history
    const contents: any[] = [];
    if (Array.isArray(conversationHistory)) {
      for (const turn of conversationHistory.slice(-8)) {
        if (turn.role === "user" || turn.role === "model") {
          contents.push({
            role: turn.role,
            parts: [{ text: turn.text || turn.content || "" }]
          });
        }
      }
    }

    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    let reply = "";
    let lastError: any = null;

    // Retry up to 2 times for transient 503/network spikes
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          }
        });

        reply = response.text || "";
        if (reply) break;
      } catch (err: any) {
        lastError = err;
        console.warn(`Gemini chat attempt ${attempt + 1} failed:`, err.message || err);
        // Wait 1 second before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (!reply && lastError) {
      // If temporary upstream 503/unavailable occurs, provide a helpful fallback response
      if (lastError.message?.includes("503") || lastError.message?.includes("high demand") || lastError.status === "UNAVAILABLE") {
        if (language === "ta" || message.match(/[\u0B80-\u0BFF]/)) {
          reply = `வணக்கம்! அறுவடைக்குப் பிந்தைய மேலாண்மை ஆலோசனைகள்:
1. குளிர்வித்தல் (Pre-cooling): அறுவடை செய்தவுடன் நிழலான, காற்றோட்டமுள்ள இடத்தில் வைக்கவும்.
2. ஜீரோ எனர்ஜி கூல் சேம்பர் (ZECC): மின்சாரம் இன்றி ஈர மணல் தொட்டி மூலம் வெப்பநிலையை 8–12°C குறைக்கலாம்.
3. தரம் பிரித்தல் (Segregation): சேதமடைந்த அல்லது காயம் பட்ட பழங்களை உடனே பிரித்து எடுக்கவும்.
4. காற்றோட்ட பெட்டிகள்: சாக்கு பைகளுக்குப் பதிலாக பிளாஸ்டிக் கிரேட்களைப் பயன்படுத்தவும்.

(குறிப்பு: ஜெமினி சேவையகம் தற்காலிகமாக அதிகப் பயன்பாட்டில் உள்ளது; சில வினாடிகளில் மீண்டும் முயற்சி செய்யவும்.)`;
        } else {
          reply = `HarvestShield Post-Harvest Advisory:
1. Immediate Pre-Cooling: Move harvested produce into shaded breezeways to dispel field heat.
2. Evaporative Cooling (ZECC): Use double-walled brick sand chambers to reduce ambient temperature by 8–12°C without electricity.
3. Rapid Segregation: Remove split or bruised produce immediately to prevent ethylene and fungal spread.
4. Crate Handling: Use ventilated, smooth-walled plastic crates instead of rough gunny sacks.

(Note: Upstream model is experiencing momentary demand spikes; please retry in a few seconds for deeper Q&A.)`;
        }
      } else {
        throw lastError;
      }
    }

    return res.json({ reply });
  } catch (error: any) {
    console.error("Chatbot error:", error);
    return res.status(500).json({
      error: error?.message || "Failed to process chat request. Please try again.",
    });
  }
});

// Mock 7-day weather forecast API service for agricultural post-harvest advice
app.get("/api/weather/forecast", (req, res) => {
  try {
    const rawLocation = (req.query.location as string) || "Dharmapuri, Tamil Nadu";
    const locLower = rawLocation.toLowerCase();

    // Regional climate base profiles
    let baseTempMax = 34;
    let baseTempMin = 23;
    let baseHumidity = 65;
    let climateZone = "Tropical Inland Agro-Climatic Zone";

    if (locLower.includes("nilgiri") || locLower.includes("ooty") || locLower.includes("kodaikanal") || locLower.includes("shimla")) {
      baseTempMax = 20;
      baseTempMin = 10;
      baseHumidity = 85;
      climateZone = "High Altitude Hill Horticulture Zone";
    } else if (locLower.includes("chennai") || locLower.includes("cuddalore") || locLower.includes("kochi") || locLower.includes("coastal")) {
      baseTempMax = 33;
      baseTempMin = 26;
      baseHumidity = 80;
      climateZone = "Coastal High-Humidity Belt";
    } else if (locLower.includes("theni") || locLower.includes("dindigul") || locLower.includes("madurai")) {
      baseTempMax = 36;
      baseTempMin = 24;
      baseHumidity = 58;
      climateZone = "Southern Semi-Arid Horticultural Valley";
    }

    // Generate 7-day forecast
    const forecastDays = [];
    const conditionPool = [
      { cond: "Sunny & High Solar Heat", icon: "sun", humDelta: -8, tempDelta: +2, risk: "high", alert: "High respiration and pulp water loss. Move harvest to shade by 10 AM." },
      { cond: "Clear & Warm", icon: "sun", humDelta: -4, tempDelta: +1, risk: "medium", alert: "Normal seasonal heat. Maintain adequate cross-ventilation in storage godowns." },
      { cond: "Humid & Partly Cloudy", icon: "cloud-sun", humDelta: +6, tempDelta: -1, risk: "medium", alert: "Mild humidity elevation. Good for leaf turgor but check for surface sweating." },
      { cond: "Severe Afternoon Heatwave", icon: "flame", humDelta: -12, tempDelta: +4, risk: "high", alert: "CRITICAL: Ambient temps exceed 37°C. Respiration doubles. Evaporative cooling (ZECC) strongly urged." },
      { cond: "Overcast & Tropical Rain Showers", icon: "cloud-rain", humDelta: +18, tempDelta: -3, risk: "high", alert: "High condensation risk. Keep onions dry; avoid moving wet produce directly into crates." },
      { cond: "Breezy & Moderate Ambient", icon: "wind", humDelta: -2, tempDelta: 0, risk: "low", alert: "Favorable convective airflow aids dissipation of trapped ethylene." },
      { cond: "Dry Warm Afternoon", icon: "sun", humDelta: -6, tempDelta: +1, risk: "medium", alert: "Dry air increases vapor pressure deficit; mist burlap sheets in cool chambers." },
    ];

    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const forecastDate = new Date(today);
      forecastDate.setDate(today.getDate() + i);

      const pattern = conditionPool[i % conditionPool.length];
      const maxT = Math.round((baseTempMax + pattern.tempDelta + (Math.sin(i) * 1.5)) * 10) / 10;
      const minT = Math.round((baseTempMin + (pattern.tempDelta * 0.5)) * 10) / 10;
      const avgT = Math.round(((maxT + minT) / 2) * 10) / 10;
      const hum = Math.max(30, Math.min(95, Math.round(baseHumidity + pattern.humDelta)));

      forecastDays.push({
        dayIndex: i,
        dayName: i === 0 ? "Today" : i === 1 ? "Tomorrow" : forecastDate.toLocaleDateString("en-IN", { weekday: "short" }),
        dateFormatted: forecastDate.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
        tempMax: maxT,
        tempMin: minT,
        tempAvg: avgT,
        humidityPercent: hum,
        condition: pattern.cond,
        icon: pattern.icon,
        hazardLevel: pattern.risk as "low" | "medium" | "high",
        storageHazardNote: pattern.alert,
      });
    }

    // Compute average forecast parameters
    const avgMaxTemp = Math.round((forecastDays.reduce((acc, d) => acc + d.tempMax, 0) / 7) * 10) / 10;
    const avgHumidity = Math.round(forecastDays.reduce((acc, d) => acc + d.humidityPercent, 0) / 7);
    const peakHeatDay = forecastDays.reduce((max, d) => (d.tempMax > max.tempMax ? d : max), forecastDays[0]);
    const peakHumDay = forecastDays.reduce((max, d) => (d.humidityPercent > max.humidityPercent ? d : max), forecastDays[0]);

    const advisoryNotes = [
      `7-Day Outlook for ${rawLocation}: Average daytime peak is ${avgMaxTemp}°C with ${avgHumidity}% RH.`,
      `Peak Thermal Hazard: ${peakHeatDay.dayName} will see highest temperature (${peakHeatDay.tempMax}°C), accelerating Q10 respiration.`,
      `Moisture Alert: ${peakHumDay.dayName} experiences peak humidity (${peakHumDay.humidityPercent}%), which requires extra vigilance against mold on onions/shallots.`,
      `Recommendation: For ambient storage, dispatch perishable batches before ${peakHeatDay.dayName} or activate evaporative cool chambers (ZECC).`
    ];

    res.json({
      location: rawLocation,
      climateZone,
      fetchedAt: new Date().toISOString(),
      currentTempC: forecastDays[0].tempAvg,
      currentHumidityPercent: forecastDays[0].humidityPercent,
      average7DayTempC: avgMaxTemp,
      average7DayHumidityPercent: avgHumidity,
      peakThermalDay: peakHeatDay.dayName,
      peakThermalTempC: peakHeatDay.tempMax,
      peakHumidityDay: peakHumDay.dayName,
      peakHumidityPercent: peakHumDay.humidityPercent,
      advisoryNotes,
      forecastDays,
    });
  } catch (error: any) {
    console.error("Weather service error:", error);
    res.status(500).json({ error: "Failed to generate weather forecast." });
  }
});

// Setup Vite dev server or static file serving
async function startServer() {
  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`HarvestShield AI Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
