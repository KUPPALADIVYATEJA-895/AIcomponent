export type AppTheme = 'industrial-studio' | 'graphite-emerald' | 'tactical-hazard' | 'monochrome-amber' | 'pixel-monochrome-light';

export type ComponentCategory =
  | 'POWER'
  | 'PROPULSION'
  | 'LIFE_SUPPORT'
  | 'AVIONICS'
  | 'DEFENSE'
  | 'COOLING'
  | 'COMM';

export type ComponentStatus = 'NOMINAL' | 'WARNING' | 'CRITICAL' | 'OFFLINE';

export interface SpacecraftComponent {
  id: string;
  name: string;
  category: ComponentCategory;
  voltage: number; // Volts DC
  nominalCurrent: number; // Amps
  currentDraw: number; // Current draw in Amps
  maxCurrent: number; // Safety maximum threshold in Amps
  temperature: number; // Current temperature in °C
  tempNominal: number; // Nominal operating temp °C
  tempThreshold: number; // Warning temperature °C
  tempMax: number; // Critical hazard temperature °C
  cableId: string; // Associated cable identifier (e.g. CB-01)
  cableConnected: boolean; // Plugged in = true, Unplugged = false
  cableResistance: number; // Contact resistance in milliohms
  leakageCurrent: number; // Chassis leakage in mA (ground fault)
  shortCircuitRisk: number; // 0 to 100% risk probability
  status: ComponentStatus;
  isCritical: boolean;
  gridX: number; // Visual topology coordinate X (0-1000)
  gridY: number; // Visual topology coordinate Y (0-600)
  description: string;
  specDetails: {
    operatingPowerKw: number;
    insulationRatingKv: number;
    coolantChannel: string;
    subsystemBus: string;
  };
}

export interface CableConnection {
  id: string;
  sourceId: string;
  targetId: string;
  targetComponentId: string;
  connected: boolean;
  currentFlow: number; // Amps
  leakage: number; // mA
  temperature: number; // °C
  resistance: number; // mΩ
  gauge: string;
  wireType: string;
  lengthMeters: number;
}

export interface DiagnosticIssue {
  id: string;
  componentId: string;
  componentName: string;
  type:
    | 'OPEN_CIRCUIT_DISCONNECT'
    | 'GROUND_FAULT_LEAKAGE'
    | 'THERMAL_OVERHEAT'
    | 'CURRENT_OVERFLOW'
    | 'SHORT_CIRCUIT_HAZARD'
    | 'POWER_FAILURE';
  severity: 'CRITICAL' | 'HIGH' | 'WARNING' | 'NOMINAL';
  description: string;
  remedy: string;
  timestamp: string;
  resolved?: boolean;
}

export interface AnomalyAttribution {
  featureName: string;
  contributionPercent: number; // e.g. 54%
  observedValue: string;
  expectedNominal: string;
}

export interface RagEvidenceDocument {
  documentId: string;
  title: string;
  standardReference: string; // e.g. "ISRO PAS-102 Section 4.3"
  excerpt: string;
  relevanceScore: number; // 0 to 1.0
}

export interface MultivariateInvestigation {
  componentId: string;
  componentName: string;
  anomalyScore: number; // 0 to 100
  status: 'NOMINAL' | 'ELEVATED_ANOMALY' | 'CRITICAL_ANOMALY';
  modelAgreementCount: number; // e.g. 3 of 3 models
  totalModelsTested: number;
  detectedModels: string[]; // ['Isolation Forest', 'One-Class SVM', 'Autoencoder']
  leadTimeGainMinutes: number; // Lead time gain vs traditional threshold
  attributions: AnomalyAttribution[];
  retrievedEvidence: RagEvidenceDocument[];
  recommendedAction: string;
  isSimulatedEstimate: boolean;
}

export interface AiDiagnosisResult {
  gridHealthScore: number;
  rootCauseSummary: string;
  issuesCount: number;
  topPowerConsumer: {
    name: string;
    current: number;
    percentTotal: string;
  } | null;
  issues: DiagnosticIssue[];
  shortCircuitAnalysis: string;
  actionPlan: string[];
  multivariateInvestigation?: MultivariateInvestigation;
  source?: string;
  timestamp: string;
}

export interface TelemetrySnapshot {
  time: string;
  totalCurrent: number;
  avgTemperature: number;
  maxLeakage: number;
  maxShortCircuitRisk: number;
  reactorTemp: number;
  ionEngineTemp: number;
  cryoPumpCurrent: number;
  ionEngineCurrent: number;
  lifeSupportCurrent: number;
}

export interface FaultPreset {
  id: string;
  title: string;
  category: string;
  summary: string;
  severity: 'CRITICAL' | 'HIGH' | 'WARNING' | 'NOMINAL';
  apply: (components: SpacecraftComponent[]) => SpacecraftComponent[];
}
