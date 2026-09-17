import React from 'react';
import { AiDiagnosisResult } from '../types';
import {
  CheckCircle2,
  AlertOctagon,
  FileText,
  RefreshCw,
  Cpu,
  ShieldCheck,
  Zap,
  BookOpen,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface AiDiagnosticsPanelProps {
  diagnosis: AiDiagnosisResult | null;
  isLoading: boolean;
  onRefreshDiagnosis: () => void;
  onOpenReportModal: () => void;
  onExecuteFullMitigation?: () => void;
  onOpenChatDrawer: () => void;
}

export const AiDiagnosticsPanel: React.FC<AiDiagnosticsPanelProps> = ({
  diagnosis,
  isLoading,
  onRefreshDiagnosis,
  onOpenReportModal,
  onExecuteFullMitigation,
}) => {
  if (!diagnosis) return null;

  const inv = diagnosis.multivariateInvestigation;
  const isCritical = (diagnosis.gridHealthScore || 100) < 60;
  const isDegraded = (diagnosis.gridHealthScore || 100) < 85 || (inv && inv.anomalyScore > 50);

  return (
    <div
      id="ai-diagnostics-solutions-panel"
      className="bg-[#131926] border border-[#232f42] rounded-xl p-5 shadow-md relative overflow-hidden"
    >
      {/* Panel Top Banner */}
      <div className="flex flex-wrap items-center justify-between pb-4 mb-4 border-b border-[#232f42] gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-950/60 border border-blue-700/50 flex items-center justify-center text-blue-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100 tracking-tight">
                AURA INVESTIGATION & RAG EVIDENCE GROUNDING
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/60 font-semibold">
                ISRO PAS-102 GROUNDED
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Multivariate Cross-Channel Correlation Engine & RAG Standard Retrieval
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            id="btn-reanalyze-telemetry"
            onClick={onRefreshDiagnosis}
            disabled={isLoading}
            className="px-3 py-1.5 bg-[#1b2332] hover:bg-[#232e42] border border-[#2c384c] text-slate-200 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'ANALYZING...' : 'RE-EVALUATE'}
          </button>

          <button
            id="btn-open-incident-report"
            onClick={onOpenReportModal}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            GENERATE REPORT
          </button>
        </div>
      </div>

      {/* Hero Scenario Investigation Showcase */}
      {inv && (
        <div className="mb-5 bg-[#0b101a] border border-[#1e2b3c] rounded-xl p-4">
          <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-[#182333] gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-200 font-mono tracking-wide">
                PRIMARY INVESTIGATION: {inv.componentName}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Model Consensus: {inv.modelAgreementCount}/{inv.totalModelsTested} Detectors
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-800 font-bold">
                ANOMALY SCORE: {inv.anomalyScore} / 100
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            {diagnosis.rootCauseSummary}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Feature Attribution Breakdown (SHAP Style) */}
            <div className="bg-[#121927] border border-[#1f2c3d] rounded-lg p-3.5">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1c2738]">
                <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  FEATURE ATTRIBUTION (CROSS-CHANNEL)
                </span>
                <span className="text-[10px] font-mono text-slate-400">BENCHMARK TEST</span>
              </div>
              <div className="space-y-2.5">
                {inv.attributions.map((attr, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-300">{attr.featureName}</span>
                      <span className="text-blue-400 font-bold">{attr.contributionPercent}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-amber-500 transition-all duration-500"
                        style={{ width: `${attr.contributionPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>Observed: {attr.observedValue}</span>
                      <span>Nominal: {attr.expectedNominal}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RAG Evidence Corpus Retrieval */}
            <div className="bg-[#121927] border border-[#1f2c3d] rounded-lg p-3.5">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1c2738]">
                <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                  RETRIEVED RAG EVIDENCE (ISRO CORPUS)
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                  GROUNDED CITATION
                </span>
              </div>
              <div className="space-y-2">
                {inv.retrievedEvidence.map((doc, idx) => (
                  <div key={idx} className="p-2.5 bg-[#0a0f18] border border-[#182333] rounded-md space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-emerald-400 font-bold">{doc.standardReference}</span>
                      <span className="text-slate-400 text-[10px]">Relevance: {(doc.relevanceScore * 100).toFixed(0)}%</span>
                    </div>
                    <p className="text-[11px] text-slate-300 italic leading-snug">
                      "{doc.excerpt}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Strip Integration */}
          {onExecuteFullMitigation && (
            <div className="mt-4 pt-3 border-t border-[#1a2536] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono text-slate-200">
                  <strong className="text-emerald-400">Recommended Mitigating Action:</strong> {inv.recommendedAction}
                </span>
              </div>
              <button
                onClick={onExecuteFullMitigation}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shadow-md"
              >
                <span>APPROVE LOAD SHED</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Standard Grid Health Status Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Metric 1: Grid Health Score */}
        <div className="bg-[#0f141f] border border-[#1e2838] rounded-lg p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-400 block mb-0.5">
              POWER BUS HEALTH INDEX
            </span>
            <div className="flex items-baseline gap-1.5">
              <span
                className={`text-2xl font-bold font-mono ${
                  isCritical ? 'text-rose-400' : isDegraded ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {diagnosis.gridHealthScore}%
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {isCritical ? 'CRITICAL HAZARD' : isDegraded ? 'ELEVATED ANOMALY' : 'STABLE'}
              </span>
            </div>
          </div>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center border ${
              isCritical
                ? 'bg-rose-950/70 border-rose-800/80 text-rose-400'
                : isDegraded
                ? 'bg-amber-950/70 border-amber-800/80 text-amber-400'
                : 'bg-emerald-950/70 border-emerald-800/80 text-emerald-400'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: Primary Current Consumer */}
        <div className="bg-[#0f141f] border border-[#1e2838] rounded-lg p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-400 block mb-0.5">
              PRIMARY CURRENT CONSUMER
            </span>
            <div className="text-sm font-semibold text-slate-100 truncate max-w-[180px]">
              {diagnosis.topPowerConsumer?.name || 'Balanced Load'}
            </div>
            <span className="text-[11px] font-mono text-slate-300">
              {diagnosis.topPowerConsumer?.current?.toFixed(1)} A ({diagnosis.topPowerConsumer?.percentTotal}% load)
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-950/40 border border-blue-800/50 flex items-center justify-center text-blue-400">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Active Failure Vectors */}
        <div className="bg-[#0f141f] border border-[#1e2838] rounded-lg p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-400 block mb-0.5">
              ACTIVE FAULT VECTORS
            </span>
            <div className="flex items-baseline gap-1.5">
              <span
                className={`text-2xl font-bold font-mono ${
                  diagnosis.issues.length > 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {diagnosis.issues.length}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {diagnosis.issues.length === 0 ? 'CLEARED' : 'NEED MITIGATION'}
              </span>
            </div>
          </div>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center border ${
              diagnosis.issues.length > 0
                ? 'bg-rose-950/70 border-rose-800/80 text-rose-400'
                : 'bg-emerald-950/70 border-emerald-800/80 text-emerald-400'
            }`}
          >
            {diagnosis.issues.length > 0 ? (
              <AlertOctagon className="w-5 h-5" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
