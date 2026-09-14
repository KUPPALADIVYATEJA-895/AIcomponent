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
      className="bg-[#111622] border-b border-[#222c3d] sticky top-0 z-40 px-4 py-3 shadow-md"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Logo & Spacecraft Identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Radio className="w-4 h-4 text-blue-400" />
          </div>

          <div>
            <h1 className="text-base font-bold text-slate-100 tracking-tight flex items-center gap-2">
              <span>AURA</span>
              <span className="text-slate-500 font-normal">|</span>
              <span className="text-slate-300 font-medium text-xs sm:text-sm tracking-normal">Electrical Telemetry & Diagnostics</span>
            </h1>
          </div>
        </div>

        {/* Global Grid Status Telemetry Badges */}
        <div className="flex items-center gap-3">
          {/* Health Index */}
          <div className="bg-[#182030] border border-[#263348] rounded-lg px-3 py-1.5 hidden md:block">
            <span className="text-[10px] font-mono text-slate-400 block tracking-wide">GRID HEALTH</span>
            <div className="flex items-center gap-1.5 font-mono font-bold text-sm">
              <span
                className={`w-2 h-2 rounded-full ${
                  isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : 'bg-emerald-400'
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
          <div className="bg-[#182030] border border-[#263348] rounded-lg px-3 py-1.5 hidden md:block">
            <span className="text-[10px] font-mono text-slate-400 block tracking-wide">ANOMALY STATUS</span>
            <span
              className={`text-sm font-mono font-bold ${
                activeAlertsCount > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {activeAlertsCount} {activeAlertsCount === 1 ? 'FAULT' : 'FAULTS'}
            </span>
          </div>

          {/* Total Bus Load */}
          <div className="bg-[#182030] border border-[#263348] rounded-lg px-3 py-1.5 hidden sm:block">
            <span className="text-[10px] font-mono text-slate-400 block tracking-wide">TOTAL CURRENT</span>
            <span className="text-sm font-mono font-bold text-slate-100">
              {totalCurrent.toFixed(1)} A <span className="text-[10px] text-slate-400 font-normal">({totalPowerKw.toFixed(1)} kW)</span>
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              id="btn-header-reanalyze"
              onClick={onRefreshDiagnosis}
              disabled={isLoadingDiagnosis}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isLoadingDiagnosis ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Diagnostics</span>
            </button>

            <button
              id="btn-header-report"
              onClick={onOpenReportModal}
              className="px-3 py-2 bg-[#182030] hover:bg-[#202b40] border border-[#263348] text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Generate Official Spacecraft Diagnostic Report"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Report</span>
            </button>

            <button
              id="btn-header-chat"
              onClick={onOpenChatDrawer}
              className="px-3 py-2 bg-[#182030] hover:bg-[#202b40] border border-[#263348] text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Open Flight Diagnostics Assistant"
            >
              <Bot className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Assistant</span>
            </button>

            <button
              id="btn-header-reset"
              onClick={onResetAll}
              className="p-2 bg-[#182030] hover:bg-[#202b40] border border-[#263348] text-slate-300 hover:text-white rounded-lg transition-colors"
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
