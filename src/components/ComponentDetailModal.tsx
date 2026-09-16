import React from 'react';
import { SpacecraftComponent } from '../types';
import {
  X,
  ShieldAlert,
  CheckCircle2,
  Cpu,
  Flame,
  Clock,
  Wrench,
  Lock,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useRbac } from '../context/RbacContext';

interface ComponentDetailModalProps {
  component: SpacecraftComponent | null;
  onClose: () => void;
  onUpdateComponent: (id: string, partial: Partial<SpacecraftComponent>) => void;
}

interface ChamberFaultInfo {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH';
  detail: string;
  timeToMitigate: string;
  damageRisk: string;
  onQuickFix: () => void;
  fixButtonLabel: string;
}

export const ComponentDetailModal: React.FC<ComponentDetailModalProps> = ({
  component,
  onClose,
  onUpdateComponent,
}) => {
  const { isHazard, isIndustrial } = useTheme();
  const { currentRole, canApproveRecommendations } = useRbac();

  if (!component) return null;

  const isDisconnected = !component.cableConnected;
  const isOvercurrent = component.currentDraw > component.maxCurrent;
  const isOverheating = component.temperature > component.tempThreshold;
  const isGroundFault = component.leakageCurrent > 25;
  const isShortRisk = component.shortCircuitRisk > 45;

  // Compile specific detected faults for this chamber
  const detectedFaults: ChamberFaultInfo[] = [];

  if (isDisconnected) {
    detectedFaults.push({
      id: 'fault-unplug',
      title: 'Cable Disconnected',
      severity: 'CRITICAL',
      detail: 'Open circuit blackout',
      timeToMitigate: '< 1 min',
      damageRisk: 'Power loss',
      fixButtonLabel: 'Reconnect Cable',
      onQuickFix: () => {
        onUpdateComponent(component.id, {
          cableConnected: true,
          currentDraw: component.nominalCurrent,
          temperature: component.tempNominal,
          leakageCurrent: 2.5,
          shortCircuitRisk: 5,
          status: 'NOMINAL',
        });
      },
    });
  }

  if (isOvercurrent && !isDisconnected) {
    detectedFaults.push({
      id: 'fault-overcurrent',
      title: 'Current Overflow',
      severity: 'CRITICAL',
      detail: 'Excessive bus draw',
      timeToMitigate: '< 2 min',
      damageRisk: 'Thermal overload',
      fixButtonLabel: 'Throttle Current',
      onQuickFix: () => {
        onUpdateComponent(component.id, {
          currentDraw: component.nominalCurrent,
          status: component.temperature > component.tempThreshold ? 'WARNING' : 'NOMINAL',
        });
      },
    });
  }

  if (isOverheating) {
    detectedFaults.push({
      id: 'fault-overheat',
      title: 'Chamber Overheating',
      severity: 'CRITICAL',
      detail: 'Thermal runaway risk',
      timeToMitigate: '< 2 min',
      damageRisk: 'Component burnout',
      fixButtonLabel: 'Purge Coolant',
      onQuickFix: () => {
        onUpdateComponent(component.id, {
          temperature: component.tempNominal,
          status: component.currentDraw > component.maxCurrent ? 'CRITICAL' : 'NOMINAL',
        });
      },
    });
  }

  if (isGroundFault) {
    detectedFaults.push({
      id: 'fault-ground',
      title: 'Ground Leakage',
      severity: 'HIGH',
      detail: 'Chassis ground fault',
      timeToMitigate: '< 3 min',
      damageRisk: 'Dielectric breakdown',
      fixButtonLabel: 'Isolate Ground',
      onQuickFix: () => {
        onUpdateComponent(component.id, {
          leakageCurrent: 2.5,
          status: 'NOMINAL',
        });
      },
    });
  }

  if (isShortRisk) {
    detectedFaults.push({
      id: 'fault-short',
      title: 'Arc Hazard',
      severity: 'HIGH',
      detail: 'Short circuit risk',
      timeToMitigate: '< 2 min',
      damageRisk: 'Arc flash',
      fixButtonLabel: 'Suppress Arc',
      onQuickFix: () => {
        onUpdateComponent(component.id, {
          shortCircuitRisk: 6,
          status: 'NOMINAL',
        });
      },
    });
  }

  // If there are multiple faults, only show the primary fault (remove the 2nd onwards)
  const activeFaults = detectedFaults.slice(0, 1);
  const hasFaults = activeFaults.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="component-detail-modal"
        className={`border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden ${
          isHazard
            ? 'bg-[#0E0E12] border-[#2A2A35]'
            : isIndustrial
            ? 'bg-[#1E232B] border-[#3E4654]'
            : 'bg-[#131926] border-[#232f42]'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-4 border-b ${
            isHazard
              ? 'bg-[#14141A] border-[#2A2A35]'
              : isIndustrial
              ? 'bg-[#252B35] border-[#3E4654]'
              : 'bg-[#0f141f] border-[#232f42]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-lg border ${
                hasFaults
                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/40 animate-pulse'
                  : isHazard
                  ? 'bg-[#FACC15]/15 text-[#FACC15] border-[#FACC15]/40'
                  : isIndustrial
                  ? 'bg-[#E28743]/15 text-[#E28743] border-[#E28743]/40'
                  : 'bg-blue-600/15 text-blue-400 border-blue-500/30'
              }`}
            >
              {hasFaults ? <ShieldAlert className="w-5 h-5" /> : <Cpu className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100 tracking-tight">
                  {component.name}
                </h3>
                {hasFaults ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-600 text-white animate-pulse">
                    FAULT
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    NOMINAL
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#1b2332] text-slate-400 hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div
          className={`p-5 overflow-y-auto space-y-4 ${
            isHazard ? 'bg-[#0A0A0E]' : isIndustrial ? 'bg-[#181C22]' : 'bg-[#0f141f]'
          }`}
        >
          {/* FAULT & FAST-FIX REMEDIATION SECTION (Clean, 2-3 words per detail) */}
          {hasFaults ? (
            <div className="space-y-3">
              {activeFaults.map((fault) => (
                <div
                  key={fault.id}
                  className="p-3.5 rounded-xl border bg-rose-950/30 border-rose-700/60 text-slate-200 space-y-3 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded bg-rose-600/20 text-rose-300 border border-rose-600/40">
                        <Flame className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-rose-200 font-mono">
                          {fault.title}
                        </h4>
                        <p className="text-[11px] text-slate-300 font-sans">
                          {fault.detail}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={fault.onQuickFix}
                      disabled={!canApproveRecommendations}
                      title={
                        canApproveRecommendations
                          ? 'Approve and execute fix'
                          : 'Senior Engineer role required to approve'
                      }
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 disabled:cursor-not-allowed text-white rounded-lg text-xs font-mono font-bold shadow transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      {canApproveRecommendations ? (
                        <Wrench className="w-3.5 h-3.5" />
                      ) : (
                        <Lock className="w-3.5 h-3.5" />
                      )}
                      {canApproveRecommendations ? fault.fixButtonLabel : 'Locked'}
                    </button>
                  </div>

                  {/* Concise 2-3 word metrics: Fix Time & Damage Risk */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-rose-800/40 font-mono">
                    <div className="bg-black/40 p-2.5 rounded border border-rose-900/50 flex items-center justify-between">
                      <span className="text-amber-300 text-[11px] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Fix Time
                      </span>
                      <strong className="text-white text-xs">{fault.timeToMitigate}</strong>
                    </div>

                    <div className="bg-black/40 p-2.5 rounded border border-rose-900/50 flex items-center justify-between">
                      <span className="text-rose-400 text-[11px] flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" /> Damage Risk
                      </span>
                      <strong className="text-white text-xs">{fault.damageRisk}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Metric 1: Current */}
            <div
              className={`rounded-lg p-3 border ${
                isHazard
                  ? 'bg-[#121218] border-[#2A2A35]'
                  : isIndustrial
                  ? 'bg-[#232832] border-[#3E4654]'
                  : 'bg-[#161d2b] border-[#232f42]'
              }`}
            >
              <span className="text-[10px] font-mono text-slate-400 block mb-1">CURRENT DRAW</span>
              <div
                className={`text-xl font-bold font-mono ${
                  isOvercurrent ? 'text-rose-400' : isDisconnected ? 'text-slate-500' : 'text-slate-100'
                }`}
              >
                {component.currentDraw.toFixed(1)} A
              </div>
            </div>

            {/* Metric 2: Temperature */}
            <div
              className={`rounded-lg p-3 border ${
                isHazard
                  ? 'bg-[#121218] border-[#2A2A35]'
                  : isIndustrial
                  ? 'bg-[#232832] border-[#3E4654]'
                  : 'bg-[#161d2b] border-[#232f42]'
              }`}
            >
              <span className="text-[10px] font-mono text-slate-400 block mb-1">TEMPERATURE</span>
              <div
                className={`text-xl font-bold font-mono ${
                  component.temperature >= component.tempMax
                    ? 'text-rose-400'
                    : component.temperature > component.tempThreshold
                    ? 'text-amber-400'
                    : 'text-slate-100'
                }`}
              >
                {component.temperature.toFixed(1)} °C
              </div>
            </div>

            {/* Metric 3: Chassis Leakage */}
            <div
              className={`rounded-lg p-3 border ${
                isHazard
                  ? 'bg-[#121218] border-[#2A2A35]'
                  : isIndustrial
                  ? 'bg-[#232832] border-[#3E4654]'
                  : 'bg-[#161d2b] border-[#232f42]'
              }`}
            >
              <span className="text-[10px] font-mono text-slate-400 block mb-1">GROUND LEAKAGE</span>
              <div
                className={`text-xl font-bold font-mono ${
                  component.leakageCurrent > 25 ? 'text-rose-400' : 'text-slate-100'
                }`}
              >
                {component.leakageCurrent.toFixed(1)} mA
              </div>
            </div>

            {/* Metric 4: Short Circuit Risk */}
            <div
              className={`rounded-lg p-3 border ${
                isHazard
                  ? 'bg-[#121218] border-[#2A2A35]'
                  : isIndustrial
                  ? 'bg-[#232832] border-[#3E4654]'
                  : 'bg-[#161d2b] border-[#232f42]'
              }`}
            >
              <span className="text-[10px] font-mono text-slate-400 block mb-1">SHORT CIRCUIT RISK</span>
              <div
                className={`text-xl font-bold font-mono ${
                  component.shortCircuitRisk > 45 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {component.shortCircuitRisk}%
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`p-3 border-t flex items-center justify-end ${
            isHazard
              ? 'bg-[#14141A] border-[#2A2A35]'
              : isIndustrial
              ? 'bg-[#252B35] border-[#3E4654]'
              : 'bg-[#0f141f] border-[#232f42]'
          }`}
        >
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1b2332] hover:bg-[#232e42] border border-[#2c384c] text-slate-200 rounded-lg text-xs font-mono transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
