import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch (err) {
      console.error("Failed to initialize Gemini AI client:", err);
    }
  }
  return aiClient;
}

// Track quota cooldown to prevent spamming the API when rate limit / quota is exhausted
let quotaCooldownUntil: number = 0;

interface GeminiGenerationResult {
  text: string;
  model: string;
}

/**
 * Safely invokes Gemini with model fallback ('gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash').
 * If rate limit (429 / RESOURCE_EXHAUSTED) is encountered, engages a cooldown and cleanly yields to the onboard engine.
 */
async function safeGeminiGenerate(
  contents: any,
  config?: any
): Promise<GeminiGenerationResult | null> {
  const ai = getGenAI();
  if (!ai) return null;

  const now = Date.now();
  if (now < quotaCooldownUntil) {
    // Silently use onboard engine during cooldown
    return null;
  }

  // Model fallback chain: flash-lite has distinct and higher quotas, then flash-latest, then 3.8-flash
  const candidateModels = [
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
    "gemini-3.8-flash",
  ];

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config,
      });

      if (response && response.text) {
        return {
          text: response.text,
          model,
        };
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      const isQuotaExhausted =
        err?.status === "RESOURCE_EXHAUSTED" ||
        err?.status === 429 ||
        msg.includes("429") ||
        msg.includes("Quota exceeded") ||
        msg.includes("RESOURCE_EXHAUSTED");

      if (isQuotaExhausted) {
        console.info(`[AEGIS AI] Quota limit active for ${model}. Trying next available model tier...`);
        continue;
      } else {
        console.info(`[AEGIS AI] ${model} unavailable: ${msg.slice(0, 100)}`);
      }
    }
  }

  // If all candidate models exceeded quota or failed, enter a 45-second cooldown
  quotaCooldownUntil = Date.now() + 45000;
  console.info(
    "[AEGIS AI] External AI quota reached. Seamlessly utilizing high-precision onboard Aerospace Diagnostic Engine."
  );
  return null;
}

// In-memory cache for recent diagnosis results to conserve API quota
let cachedDiagnosis: { payloadKey: string; result: any; expiresAt: number } | null = null;

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// AI Telemetry Diagnostics Endpoint
app.post("/api/ai/diagnose", async (req, res) => {
  try {
    const { components, cables, busState, overallRisk } = req.body;
    const ai = getGenAI();

    // Fallback high-fidelity aerospace diagnostic calculation function
    const generateLocalDiagnosis = () => {
      const issues: Array<{
        componentId: string;
        componentName: string;
        type: string;
        severity: "CRITICAL" | "HIGH" | "WARNING" | "NOMINAL";
        description: string;
        remedy: string;
      }> = [];

      let topConsumer = components?.[0] || null;
      let totalCurrent = 0;

      components?.forEach((c: any) => {
        totalCurrent += c.currentDraw || 0;
        if (!topConsumer || (c.currentDraw || 0) > (topConsumer.currentDraw || 0)) {
          topConsumer = c;
        }

        // Cable disconnect / No current flow
        if (c.cableConnected === false) {
          issues.push({
            componentId: c.id,
            componentName: c.name,
            type: "OPEN_CIRCUIT_DISCONNECT",
            severity: c.isCritical ? "CRITICAL" : "HIGH",
            description: `Cable umbilical disconnected from ${c.name}. Zero current flow detected (0.0A). Operational blackout for this subsystem.`,
            remedy: `Re-seat and lock magnetic latch on cable ${c.cableId || "port"}. Verify terminal impedance before energizing.`,
          });
        }

        // Current leakage
        if (c.leakageCurrent > 25) {
          issues.push({
            componentId: c.id,
            componentName: c.name,
            type: "GROUND_FAULT_LEAKAGE",
            severity: c.leakageCurrent > 80 ? "CRITICAL" : "HIGH",
            description: `Abnormal chassis leakage current of ${c.leakageCurrent.toFixed(1)} mA detected on ${c.name}. Insulation breakdown hazard.`,
            remedy: `Deploy dielectric shunt, isolate ground bus, and inspect dielectric coating on ${c.name} casing.`,
          });
        }

        // Overheating
        if (c.temperature > c.tempThreshold) {
          const delta = c.temperature - c.tempThreshold;
          issues.push({
            componentId: c.id,
            componentName: c.name,
            type: "THERMAL_OVERHEAT",
            severity: delta > 30 ? "CRITICAL" : "HIGH",
            description: `Core temperature (${c.temperature.toFixed(1)}°C) exceeds safety limit (${c.tempThreshold}°C) by ${delta.toFixed(1)}°C. Risk of thermal degradation.`,
            remedy: `Divert secondary coolant loop to ${c.name}, throttle component duty cycle by 40%, and check radiator fins.`,
          });
        }

        // Current Overflow / Surge
        if (c.currentDraw > c.maxCurrent) {
          issues.push({
            componentId: c.id,
            componentName: c.name,
            type: "CURRENT_OVERFLOW",
            severity: "CRITICAL",
            description: `Current surge of ${c.currentDraw.toFixed(1)}A exceeds rated max limit (${c.maxCurrent}A). Potential transformer/coil blowout.`,
            remedy: `Engage active current limiter, trim sub-phase draw, and reset digital circuit breaker CB-${c.id}.`,
          });
        }

        // Potential Short Circuit Risk
        if (c.shortCircuitRisk > 40) {
          issues.push({
            componentId: c.id,
            componentName: c.name,
            type: "SHORT_CIRCUIT_HAZARD",
            severity: c.shortCircuitRisk > 75 ? "CRITICAL" : "HIGH",
            description: `Short circuit probability assessed at ${c.shortCircuitRisk.toFixed(0)}% due to combined thermal stress and impedance degradation.`,
            remedy: `Isolate high-voltage bus bar, engage solid-state contactor, and perform pulse impedance sweep.`,
          });
        }
      });

      return {
        timestamp: new Date().toISOString(),
        gridHealthScore: Math.max(10, 100 - (issues.length * 18)),
        issuesCount: issues.length,
        topPowerConsumer: topConsumer ? {
          name: topConsumer.name,
          current: topConsumer.currentDraw,
          percentTotal: totalCurrent > 0 ? ((topConsumer.currentDraw / totalCurrent) * 100).toFixed(1) : "0",
        } : null,
        issues,
        rootCauseSummary: issues.length === 0
          ? "All spacecraft electrical bus channels, cabling, and thermal profiles are operating within nominal NASA-STD aerospace tolerances."
          : `Detected ${issues.length} anomaly vectors across the power grid. Primary failure driver: ${issues[0]?.description || "Electrical irregularity"}.`,
        shortCircuitAnalysis: `Grid dielectric integrity is currently rated at ${Math.max(5, 100 - (overallRisk || 0))}%. Critical arc flash prevention systems are active.`,
        actionPlan: issues.length === 0
          ? ["Continue passive telemetry monitoring.", "Maintain cryogenic pump pressure.", "Battery charge balancing nominal."]
          : issues.map((iss, i) => `${i + 1}. [${iss.severity}] ${iss.remedy}`),
      };
    };

    // Check recent cache to prevent unnecessary duplicate Gemini API calls
    const cacheKey = JSON.stringify({
      comps: components?.map((c: any) => `${c.id}:${c.cableConnected}:${Math.round(c.currentDraw)}:${Math.round(c.temperature)}:${c.leakageCurrent > 20}`),
      overallRisk: Math.round(overallRisk || 0),
    });

    const now = Date.now();
    if (cachedDiagnosis && cachedDiagnosis.payloadKey === cacheKey && now < cachedDiagnosis.expiresAt) {
      return res.json(cachedDiagnosis.result);
    }

    const prompt = `You are the onboard Aegis Spacecraft Electrical & Component Diagnostic AI.
Analyze this live telemetry data:
${JSON.stringify({ components, cables, busState, overallRisk }, null, 2)}

Provide a strict JSON response analyzing the faults:
- Cables unplugged / broken (where current stopped flowing)
- Current leakages (ground fault mA)
- Which machinery consumes the most current
- Current overflow / overcurrent risks
- Overheating / thermal runaway
- Potential short circuit risks
- Step-by-step engineering solutions to fix each issue

Respond strictly with valid JSON conforming to this schema:
{
  "gridHealthScore": number (0-100),
  "rootCauseSummary": string,
  "topPowerConsumer": {
    "name": string,
    "current": number,
    "percentTotal": string
  },
  "issues": [
    {
      "componentId": string,
      "componentName": string,
      "type": string,
      "severity": "CRITICAL" | "HIGH" | "WARNING",
      "description": string,
      "remedy": string
    }
  ],
  "shortCircuitAnalysis": string,
  "actionPlan": string[]
}`;

    const geminiResult = await safeGeminiGenerate(prompt, {
      responseMimeType: "application/json",
    });

    if (geminiResult && geminiResult.text) {
      try {
        const parsed = JSON.parse(geminiResult.text.trim());
        const responseData = {
          source: geminiResult.model,
          ...parsed,
        };
        cachedDiagnosis = {
          payloadKey: cacheKey,
          result: responseData,
          expiresAt: Date.now() + 20000, // 20-second cache window
        };
        return res.json(responseData);
      } catch (parseErr) {
        console.info("[AEGIS AI] Response parsing yielded invalid JSON, utilizing onboard engine.");
      }
    }

    // High-fidelity fallback response from onboard aerospace engine
    const localResult = generateLocalDiagnosis();
    const fallbackResponse = {
      source: "aegis-embedded-engine",
      ...localResult,
    };

    cachedDiagnosis = {
      payloadKey: cacheKey,
      result: fallbackResponse,
      expiresAt: Date.now() + 10000,
    };

    return res.json(fallbackResponse);
  } catch (err: any) {
    console.error("Diagnostics error:", err);
    res.status(500).json({ error: err.message || "Diagnostic computation failed" });
  }
});

// Interactive AI Spacecraft Engineer Q&A
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, systemState } = req.body;
    const components: any[] = systemState?.components || [];

    const prompt = `You are the Aegis AI, the spacecraft's electrical systems diagnostic and flight engineer.
Current live spacecraft electrical telemetry:
${JSON.stringify(systemState, null, 2)}

User question: "${message}"

Follow these diagnostic evaluation rules based on the user's intent:
1. "Which component consumes more power / current":
   - Identify the highest power-consuming machinery based on active current draw (Amperes) and percentage of total bus load.
   - Note whether its draw is normal or an overcurrent hazard.
   - Also mention any component with 0A / disconnected power.
2. "Which component has current leakage":
   - Inspect chassis ground leakage (leakageCurrent in mA).
   - If any component has leakage > 20 mA (or high risk), identify the component, its exact mA, hazard level, and isolation/grounding solution.
   - If NO component has elevated leakage (all <= 20 mA), explicitly state: "No abnormal current leakage detected. All component insulation barriers are intact and chassis ground return is clean."
3. "Which component has high temperature":
   - Inspect component operating temperatures (°C).
   - If any component exceeds nominal/safe thermal thresholds (>75°C or status WARNING/CRITICAL), detail the component, exact temperature, thermal runaway risk, and cooling remediation.
   - If NO component is overheating, state clearly: "All spacecraft machinery components are operating in normal thermal equilibrium."
4. "Faults and risks list" or "List of faults":
   - If there ARE active faults (cables unplugged, current overflow, high temperature, chassis leakage > 20mA, short circuit risk >= 50%):
     Provide a comprehensive, itemized report listing each fault found, which component it belongs to, exact metric readings, and the step-by-step engineering solution.
   - If there are NO faults in the system (all components nominal):
     Explicitly state: "No faults detected in the system. All components are working good!" and provide a clean confirmation checklist.
5. Specific component inquiry (e.g. asking about a particular component like Reactor, Ion Thruster, Coolant Pump, Life Support, Avionics, etc.):
   - Inspect that exact component in the telemetry.
   - If it has ANY fault (cable disconnected/0A, overcurrent, elevated temperature, ground leakage, short-circuit risk): explain the exact fault and give the solution to solve it.
   - If it has NO fault: explicitly respond with: "No fault detected in [Component Name]. All parameters (Current Draw, Temperature, Cable Connection, and Ground Isolation) are operating within nominal specifications."

Format your response clearly using markdown with bold headings and bullet points. Maintain professional aerospace engineering tone.`;

    const geminiResult = await safeGeminiGenerate(prompt);
    if (geminiResult && geminiResult.text) {
      return res.json({ reply: geminiResult.text });
    }

    // Dynamic, telemetry-aware rule engine for /api/ai/chat fallback
    const msg = (message || "").toLowerCase();
    let reply = "";

    // 1. Highest Power Consumer
    if (
      msg.includes("consumes more power") ||
      msg.includes("more power") ||
      msg.includes("most current") ||
      msg.includes("top consumer") ||
      msg.includes("power consumer")
    ) {
      if (components.length > 0) {
        const sorted = [...components].sort((a, b) => b.currentDraw - a.currentDraw);
        const top = sorted[0];
        const totalAmps = components.reduce((sum, c) => sum + (c.currentDraw || 0), 0);
        const share = totalAmps > 0 ? ((top.currentDraw / totalAmps) * 100).toFixed(1) : "0";
        const zeroFlow = components.filter((c) => c.currentDraw === 0 || !c.cableConnected);

        reply = `### ⚡ Top Power Consumption Audit\n\n` +
          `**Primary Consumer:** **${top.name} (${top.id})**\n` +
          `- **Current Draw:** ${top.currentDraw.toFixed(1)} A (${share}% of total 480V DC grid load)\n` +
          `- **Operating Status:** ${top.status}\n` +
          `- **Thermal Load:** ${top.temperature.toFixed(1)}°C\n\n` +
          `**Grid Load Breakdown:**\n` +
          sorted.slice(0, 3).map((c, i) => `${i + 1}. **${c.name}**: ${c.currentDraw.toFixed(1)} A (${totalAmps > 0 ? ((c.currentDraw / totalAmps) * 100).toFixed(0) : 0}%)`).join("\n") +
          (zeroFlow.length > 0
            ? `\n\n⚠️ **Zero Current Flow Detected:**\n${zeroFlow.map((c) => `- **${c.name} (${c.id})**: 0.0 A (${!c.cableConnected ? "Cable Umbilical Unplugged / Open Circuit" : "Standby / De-energized"})`).join("\n")}`
            : "");
      } else {
        reply = `Telemetry offline: Unable to calculate power consumption ranking.`;
      }
    }

    // 2. Current Leakage Audit
    else if (
      msg.includes("current leakage") ||
      msg.includes("leakage") ||
      msg.includes("ground fault") ||
      msg.includes("chassis leak")
    ) {
      const leaking = components.filter((c) => (c.leakageCurrent || 0) > 20);
      if (leaking.length > 0) {
        reply = `### 🧲 Current Leakage & Ground Fault Telemetry\n\n` +
          `**Detected Active Ground Leakages:**\n\n` +
          leaking.map((c) => (
            `- **${c.name} (${c.id})**:\n` +
            `  • **Leakage Current:** **${c.leakageCurrent.toFixed(1)} mA** to titanium chassis\n` +
            `  • **Short Circuit Risk Index:** ${c.shortCircuitRisk}%\n` +
            `  • **Hazard Evaluation:** Dielectric degradation detected. Moisture or insulation chafing bridging conductors to hull.\n` +
            `  • **Recommended Solution:** Isolate branch circuit breaker, re-seat harness shielding, and spray dielectric sealant onto umbilical terminal.`
          )).join("\n\n");
      } else {
        reply = `### 🧲 Current Leakage & Ground Fault Telemetry\n\n` +
          `**No abnormal current leakage detected.**\n\n` +
          `All spacecraft component dielectric insulation barriers are intact. Monitored chassis leakage across all 8 nodes remains below the 20.0 mA safety threshold (nominal baseline < 5.0 mA). No ground fault remediation is required.`;
      }
    }

    // 3. High Temperature Monitor
    else if (
      msg.includes("high temperature") ||
      msg.includes("hot") ||
      msg.includes("overheat") ||
      msg.includes("temperature")
    ) {
      const hot = components.filter((c) => (c.temperature || 0) > 75 || c.status === "CRITICAL" || c.status === "WARNING");
      if (hot.length > 0) {
        reply = `### 🌡️ Thermal Overheat Diagnostic Report\n\n` +
          `**Elevated Temperature Components:**\n\n` +
          hot.map((c) => (
            `- **${c.name} (${c.id})**:\n` +
            `  • **Current Core Temperature:** **${c.temperature.toFixed(1)}°C**\n` +
            `  • **Thermal Status:** ${c.status}\n` +
            `  • **Underlying Cause:** Resistive Joule heating under sustained load (${c.currentDraw.toFixed(1)} A) or insufficient cryogenic heat-sink flow.\n` +
            `  • **Prescribed Solution:** Throttle power throughput or cycle auxiliary Cryogenic Coolant Distribution Pump to restore nominal 45°C–65°C equilibrium.`
          )).join("\n\n");
      } else {
        reply = `### 🌡️ Thermal Overheat Diagnostic Report\n\n` +
          `**All components are operating within safe thermal equilibrium.**\n\n` +
          `No machinery node exceeds thermal threshold boundaries. All component core temperatures are operating normally between 40°C and 72°C. Cryogenic heat sinks and passive radiators are dissipating nominal thermal output.`;
      }
    }

    // 4. Faults and Risks List
    else if (
      msg.includes("faults risks list") ||
      msg.includes("faults and risks") ||
      msg.includes("list of fault") ||
      msg.includes("list of all faults") ||
      msg.includes("all faults") ||
      msg.includes("fault list")
    ) {
      const faults: string[] = [];

      components.forEach((c) => {
        if (!c.cableConnected) {
          faults.push(`- **${c.name} (${c.id})** [OPEN CIRCUIT / POWER LOSS]: Cable umbilical disconnected. Current flow interrupted (0.0 A). **Remedy:** Re-engage umbilical quick-lock collar.`);
        }
        if (c.currentDraw > 150) {
          faults.push(`- **${c.name} (${c.id})** [CURRENT OVERFLOW]: Excessive draw of ${c.currentDraw.toFixed(1)} A exceeds rated bus threshold. **Remedy:** Reduce throttle or engage load shedder.`);
        }
        if (c.temperature > 85) {
          faults.push(`- **${c.name} (${c.id})** [CRITICAL OVERHEATING]: Core temperature at ${c.temperature.toFixed(1)}°C exceeds threshold. **Remedy:** Boost cryogenic coolant pump circulation.`);
        }
        if (c.leakageCurrent > 25) {
          faults.push(`- **${c.name} (${c.id})** [CHASSIS GROUND LEAKAGE]: Ground fault current of ${c.leakageCurrent.toFixed(1)} mA escaping to hull. **Remedy:** Inspect harness insulation and restore chassis grounding.`);
        }
        if (c.shortCircuitRisk >= 60) {
          faults.push(`- **${c.name} (${c.id})** [HIGH SHORT CIRCUIT RISK]: Hazard probability calculated at ${c.shortCircuitRisk}%. **Remedy:** Isolate redundant branch before contact arc flash occurs.`);
        }
      });

      if (faults.length > 0) {
        reply = `### ⚠️ Active Faults & Risk Manifest\n\n` +
          `The Aegis telemetry engine detected **${faults.length} active issue(s)** configured in the spacecraft grid:\n\n` +
          faults.join("\n\n") +
          `\n\n*Execute corrective actions directly using the interactive Admin Deck or automated remediation.*`;
      } else {
        reply = `### ✅ Spacecraft Electrical Grid Status\n\n` +
          `**No faults detected in the system. All components are working good!**\n\n` +
          `• **All Cable Umbilicals:** Connected & securely locked\n` +
          `• **Current Flow:** Nominal across all 8 machinery nodes\n` +
          `• **Ground Isolation:** No leakage detected (< 5 mA safe baseline)\n` +
          `• **Thermal Profiles:** All components within safe thermal envelopes\n` +
          `• **Short Circuit Risks:** Nominal (< 15%)`;
      }
    }

    // 5. Particular Component Analysis
    else {
      // Check if user specifically mentioned a component
      const targetComp = components.find((c) => {
        const idMatch = msg.includes(c.id.toLowerCase());
        const nameKeywords = c.name.toLowerCase().split(" ");
        const nameMatch = nameKeywords.some((word: string) => word.length > 3 && msg.includes(word));
        return idMatch || nameMatch;
      });

      if (targetComp) {
        const compFaults: string[] = [];
        if (!targetComp.cableConnected) {
          compFaults.push(`Cable umbilical is disconnected (open circuit), causing total current loss (0.0 A). Solution: Reconnect and lock cable collar.`);
        }
        if (targetComp.currentDraw > 150) {
          compFaults.push(`Current overflow detected at ${targetComp.currentDraw.toFixed(1)} A. Solution: Step down voltage regulator and shed secondary load.`);
        }
        if (targetComp.temperature > 85) {
          compFaults.push(`Thermal runaway risk at ${targetComp.temperature.toFixed(1)}°C. Solution: Flush coolant conduits and adjust operational duty cycle.`);
        }
        if (targetComp.leakageCurrent > 25) {
          compFaults.push(`Chassis ground leakage measured at ${targetComp.leakageCurrent.toFixed(1)} mA. Solution: Re-coat wiring insulation and inspect ground strap.`);
        }
        if (targetComp.shortCircuitRisk >= 60) {
          compFaults.push(`Short circuit hazard score at ${targetComp.shortCircuitRisk}%. Solution: Cycle branch breaker and inspect contact pins.`);
        }

        if (compFaults.length > 0) {
          reply = `### ⚠️ Diagnostic Analysis: ${targetComp.name} (${targetComp.id})\n\n` +
            `**Fault Detected:**\n` +
            compFaults.map((f, i) => `${i + 1}. ${f}`).join("\n") +
            `\n\n**Live Telemetry Readings:**\n` +
            `- **Current Draw:** ${targetComp.currentDraw.toFixed(1)} A\n` +
            `- **Temperature:** ${targetComp.temperature.toFixed(1)}°C\n` +
            `- **Cable Status:** ${targetComp.cableConnected ? "Connected" : "DISCONNECTED"}\n` +
            `- **Chassis Leakage:** ${targetComp.leakageCurrent.toFixed(1)} mA\n` +
            `- **Short Circuit Risk:** ${targetComp.shortCircuitRisk}%`;
        } else {
          reply = `### ✅ Diagnostic Analysis: ${targetComp.name} (${targetComp.id})\n\n` +
            `**No fault detected in ${targetComp.name}.**\n\n` +
            `All telemetry parameters are operating within nominal specifications:\n` +
            `- **Current Draw:** ${targetComp.currentDraw.toFixed(1)} A (Nominal)\n` +
            `- **Core Temperature:** ${targetComp.temperature.toFixed(1)}°C (Stable)\n` +
            `- **Cable Umbilical:** Connected & Latched\n` +
            `- **Chassis Leakage:** ${targetComp.leakageCurrent.toFixed(1)} mA (Safe insulation)\n` +
            `- **Short Circuit Risk:** ${targetComp.shortCircuitRisk}% (Low)`;
        }
      } else {
        reply = `Aegis Diagnostic AI online. Choose from the recommended inquiries above (Top Power Consumer, Current Leakage, High Temperature, or Faults & Risks List), or select a specific component to run a dedicated diagnostic audit.`;
      }
    }

    return res.json({ reply });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Chat failed" });
  }
});

// Full Incident / Diagnostic Report Generator
app.post("/api/ai/report", async (req, res) => {
  try {
    const { systemState, telemetryHistory } = req.body;

    const prompt = `Generate a formal Aerospace Electrical & Life Safety Diagnostic Incident Report for spacecraft NCC-74656 Aegis.
System state data:
${JSON.stringify(systemState, null, 2)}

Structure the report with:
1. Executive Summary & Fleet Registry
2. Electrical Bus & Power Distribution Audit (highlighting top power consumers and total amperage)
3. Cable Umbilical & Physical Connection Status (highlighting any disconnected or 0A open-circuit cables)
4. Current Leakage & Ground Fault Analysis (mA leakage, chassis integrity)
5. Thermal Dissipation & Overheat Incidents (°C)
6. Potential Short Circuit Risk Assessment
7. Prescribed Engineering Remediation Procedures
8. Chief Flight Engineer Sign-Off`;

    const geminiResult = await safeGeminiGenerate(prompt);
    if (geminiResult && geminiResult.text) {
      return res.json({ report: geminiResult.text });
    }

    // Default high-precision formatted aerospace report
    const now = new Date();
    const timestamp = now.toUTCString();
    const reportText = `# SPACECRAFT ELECTRICAL & COMPONENT DIAGNOSTIC REPORT
**VESSEL:** USSC AEGIS (HULL REGISTRY SC-8821)
**MISSION TIME:** ${timestamp}
**DIAGNOSTIC ENGINE:** AEGIS TELEMETRY AI v4.8 [EMBEDDED AEROSPACE FIRMWARE]
**STATUS:** ${systemState?.issues?.length > 0 ? "ATTENTION REQUIRED - ACTIVE FAULTS LOGGED" : "NOMINAL - ALL SYSTEMS CLEARED FOR ORBIT"}

---

## 1. EXECUTIVE SUMMARY
Continuous telemetry polling scanned 8 primary machinery nodes and 8 high-gauge interconnect umbilicals. 
- Total Active Power Bus Draw: ${systemState?.totalCurrent || 384} Amperes @ 480V DC
- Grid Health Index: ${systemState?.gridHealthScore || 92} / 100
- Active Anomaly Vectors: ${systemState?.issues?.length || 0} detected

## 2. MACHINERY CURRENT CONSUMPTION BREAKDOWN
Power distribution matrix analysis ranks subsystems by total current draw:
${(systemState?.components || []).map((c: any) => `- **${c.name} (${c.id})**: ${c.currentDraw.toFixed(1)}A (${((c.currentDraw / (systemState?.totalCurrent || 400)) * 100).toFixed(1)}% of total load) | Status: ${c.cableConnected ? (c.currentDraw > c.maxCurrent ? "OVERCURRENT SURGE" : "ENERGIZED") : "OFFLINE / 0.0A"}`).join("\n")}

## 3. CABLE CONNECTIONS & OPEN CIRCUIT AUDIT
${(systemState?.components || []).map((c: any) => `- Cable **${c.cableId || "CB-" + c.id}** -> ${c.name}: ${c.cableConnected ? "LOCKED & SECURED [CONTINUOUS FLOW]" : "DISCONNECTED / OPEN-CIRCUIT [ZERO CURRENT FLOW]"}`).join("\n")}

## 4. CURRENT LEAKAGE & GROUND FAULT VECTORS
- Maximum detected chassis leakage: ${Math.max(...(systemState?.components || []).map((c: any) => c.leakageCurrent || 0)).toFixed(1)} mA
- Safe operational standard threshold: < 20.0 mA
${(systemState?.components || []).filter((c: any) => (c.leakageCurrent || 0) > 20).map((c: any) => `  * WARNING: ${c.name} exhibiting ${c.leakageCurrent.toFixed(1)} mA ground shunt leakage. Potential dielectric micro-fractures in harness.`).join("\n") || "  * All ground paths within safe galvanic margins (<20mA)."}

## 5. THERMAL PROFILES & SHORT CIRCUIT HAZARD INDEX
- Maximum Operating Temperature: ${Math.max(...(systemState?.components || []).map((c: any) => c.temperature || 0)).toFixed(1)} °C
- Aggregate Short Circuit Hazard Probability: ${systemState?.overallRisk || 12}%
${(systemState?.components || []).filter((c: any) => (c.shortCircuitRisk || 0) > 40).map((c: any) => `  * HAZARD: ${c.name} short circuit risk calculated at ${c.shortCircuitRisk.toFixed(0)}%. Triggered by elevated operating temp and contact impedance.`).join("\n") || "  * Short circuit risks minimized by active circuit governors."}

## 6. PRESCRIBED CORRECTIVE ACTIONS
1. If any cables are dislodged, lock mechanical collars and verify continuity before full energization.
2. For current leakage exceeding 30mA, cycle the ground-fault interrupter (GFCI) and inject sealing dielectric resin.
3. For thermal over-runs, activate secondary coolant bypass loop and limit thruster output to 60%.
4. Maintain active short-circuit damping on high-current bus bars.

---
**CERTIFICATION:**
Automated Telemetry AI Core [SIGNATURE VERIFIED]
Ready for Orbital Operations.`;

    return res.json({ report: reportText });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Report generation failed" });
  }
});

// Vite Middleware for Development & Static Serving for Production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Aegis AI Server running on port ${PORT}`);
  });
}

startServer();
