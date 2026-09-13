import React from 'react';
import {
  Activity,
  Sparkles,
  FileText,
  RotateCcw,
  Bot,
  AlertTriangle,
  Radio,
  ShieldCheck,
} from 'lucide-react';

interface HeaderProps {
  gridHealthScore: number;
  activeAlertsCount: number;
  totalCurrent: number;
  totalPowerKw: number;
  onOpenReportModal: () => void;
  onOpenChatDrawer: () => void;
  onRefreshDiagnosis: () => void;
  onResetAll: () => void;
  isLoadingDiagnosis: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  gridHealthScore,
  activeAlertsCount,
  totalCurrent,
  totalPowerKw,
  onOpenReportModal,
  onOpenChatDrawer,
  onRefreshDiagnosis,
  onResetAll,
  isLoadingDiagnosis,
}) => {
  const isCritical = gridHealthScore < 60;
  const isWarning = gridHealthScore < 85;

  return (
    <header
      id="app-main-header"
      className="bg-slate-900/95 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md px-4 py-3 shadow-xl"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Logo & Spacecraft Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 border border-cyan-400/50 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-cyan-950/50">
            <Radio className="w-5 h-5 text-white" />
          </div>

          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-100 tracking-wider font-['Chakra_Petch']">
              AEGIS AI <span className="text-cyan-400 font-normal">//</span> ORBITAL COMPONENT DIAGNOSTICS
            </h1>
          </div>
        </div>

        {/* Global Grid Status Telemetry Badges */}
        <div className="flex items-center gap-3">
          {/* Health Index */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5 hidden md:block">
            <span className="text-[10px] font-mono text-slate-400 block">GRID HEALTH</span>
            <div className="flex items-center gap-1.5 font-mono font-bold text-sm">
              <span
                className={`w-2 h-2 rounded-full ${
                  isCritical ? 'bg-rose-500 animate-ping' : isWarning ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
              />
              <span
                className={
                  isCritical ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'
                }
              >
                {gridHealthScore}%
              </span>
            </div>
          </div>

          {/* Active Alerts Badge */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5 hidden md:block">
            <span className="text-[10px] font-mono text-slate-400 block">ANOMALY VECTORS</span>
            <span
              className={`text-sm font-mono font-bold ${
                activeAlertsCount > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {activeAlertsCount} {activeAlertsCount === 1 ? 'FAULT' : 'FAULTS'}
            </span>
          </div>

          {/* Total Bus Load */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5 hidden sm:block">
            <span className="text-[10px] font-mono text-slate-400 block">TOTAL CURRENT</span>
            <span className="text-sm font-mono font-bold text-cyan-300">
              {totalCurrent.toFixed(1)} A <span className="text-[10px] text-slate-400 font-normal">({totalPowerKw.toFixed(1)} kW)</span>
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              id="btn-header-reanalyze"
              onClick={onRefreshDiagnosis}
              disabled={isLoadingDiagnosis}
              className="px-3 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 shadow-md shadow-cyan-950/60 transition-all disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isLoadingDiagnosis ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">AI DIAGNOSTICS</span>
            </button>

            <button
              id="btn-header-report"
              onClick={onOpenReportModal}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors"
              title="Generate Official Spacecraft Diagnostic Report"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">REPORT</span>
            </button>

            <button
              id="btn-header-chat"
              onClick={onOpenChatDrawer}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors"
              title="Open AI Flight Engineer Terminal"
            >
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">ASK AI</span>
            </button>

            <button
              id="btn-header-reset"
              onClick={onResetAll}
              className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg transition-colors"
              title="Reset system state to 100% nominal"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
