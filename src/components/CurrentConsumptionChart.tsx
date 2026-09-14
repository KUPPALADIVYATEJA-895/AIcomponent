import React from 'react';
import { SpacecraftComponent } from '../types';
import {
  Zap,
  AlertTriangle,
  AlertCircle,
  Sliders,
  Plus,
  Minus,
  RotateCcw,
  Unplug,
  Info,
  Flame,
  ArrowUpRight,
} from 'lucide-react';

interface CurrentConsumptionChartProps {
  components: SpacecraftComponent[];
  selectedComponentId: string;
  onSelectComponent: (id: string) => void;
  onUpdateComponent?: (id: string, partial: Partial<SpacecraftComponent>) => void;
  onInspectComponent?: (id: string) => void;
}

export const CurrentConsumptionChart: React.FC<CurrentConsumptionChartProps> = ({
  components,
  selectedComponentId,
  onSelectComponent,
  onUpdateComponent,
  onInspectComponent,
}) => {
  // Sort components by current draw descending dynamically
  const sorted = [...components].sort((a, b) => {
    return b.currentDraw - a.currentDraw;
  });

  const maxScaleAmps = Math.max(
    ...components.map((c) => Math.max(c.currentDraw, c.maxCurrent, 120))
  );

  const totalCurrent = components.reduce((acc, c) => acc + (c.cableConnected ? c.currentDraw : 0), 0);
  const highestConsumer = sorted[0];
  const selectedComp =
    components.find((c) => c.id === selectedComponentId) || components[0];

  // Real-time quick handlers for selected component
  const handleCurrentChange = (newCurrent: number) => {
    if (!onUpdateComponent || !selectedComp) return;
    const clamped = Math.max(0, Math.round(newCurrent * 10) / 10);
    onUpdateComponent(selectedComp.id, {
      currentDraw: clamped,
      cableConnected: clamped > 0 ? true : selectedComp.cableConnected,
    });
  };

  const handleMakeHighestConsumer = () => {
    if (!onUpdateComponent || !selectedComp) return;
    const currentHighest = highestConsumer?.id === selectedComp.id 
      ? selectedComp.currentDraw 
      : (highestConsumer?.currentDraw || selectedComp.nominalCurrent);
    const targetSurge = Math.round((currentHighest + 28) * 10) / 10;
    onUpdateComponent(selectedComp.id, {
      currentDraw: targetSurge,
      cableConnected: true,
    });
  };

  const handleStepCurrent = (delta: number) => {
    if (!onUpdateComponent || !selectedComp) return;
    const nextCurrent = Math.max(0, Math.round((selectedComp.currentDraw + delta) * 10) / 10);
    onUpdateComponent(selectedComp.id, {
      currentDraw: nextCurrent,
      cableConnected: nextCurrent > 0 ? true : selectedComp.cableConnected,
    });
  };

  const handleRowStepCurrent = (
    e: React.MouseEvent,
    comp: SpacecraftComponent,
    delta: number
  ) => {
    e.stopPropagation();
    if (!onUpdateComponent) return;
    const nextCurrent = Math.max(0, Math.round((comp.currentDraw + delta) * 10) / 10);
    onUpdateComponent(comp.id, {
      currentDraw: nextCurrent,
      cableConnected: nextCurrent > 0 ? true : comp.cableConnected,
    });
  };

  const handleTogglePower = () => {
    if (!onUpdateComponent || !selectedComp) return;
    const nextConnected = !selectedComp.cableConnected;
    onUpdateComponent(selectedComp.id, {
      cableConnected: nextConnected,
      currentDraw: nextConnected ? selectedComp.nominalCurrent : 0.0,
      shortCircuitRisk: nextConnected ? 5 : 0,
      status: nextConnected ? 'NOMINAL' : 'OFFLINE',
    });
  };

  const handleResetNominal = () => {
    if (!onUpdateComponent || !selectedComp) return;
    onUpdateComponent(selectedComp.id, {
      cableConnected: true,
      currentDraw: selectedComp.nominalCurrent,
      status: 'NOMINAL',
    });
  };

  return (
    <div
      id="machinery-current-consumption-chart"
      className="bg-[#131926] border border-[#232f42] rounded-xl p-4 sm:p-5 shadow-md flex flex-col justify-between space-y-4 transition-all"
    >
      <div>
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 mb-3.5 border-b border-[#232f42]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/15 text-blue-400 rounded-lg border border-blue-500/30">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100 tracking-tight font-sans">
                  MACHINERY CURRENT CONSUMPTION (A)
                </h3>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#1b2332] text-blue-300 border border-[#2c384c]">
                  REAL-TIME
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Live bus distribution dynamically reacts to admin manipulation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-right font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Highest Consumer</span>
              <span className="text-xs font-bold text-blue-300">
                {highestConsumer?.currentDraw > 0 ? highestConsumer.name : 'None (Offline)'} ({highestConsumer?.currentDraw.toFixed(1)}A)
              </span>
            </div>
            <div className="pl-3 border-l border-[#232f42]">
              <span className="text-[10px] text-slate-400 block uppercase">Total Bus Load</span>
              <span className="text-sm font-bold text-slate-100">
                {totalCurrent.toFixed(1)} A
              </span>
            </div>
          </div>
        </div>

        {/* Real-Time Admin Manipulation Control Strip */}
        <div className="mb-4 p-3 bg-[#0f141f] border border-[#232f42] rounded-lg space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
                Select Chamber To Manipulate:
              </span>
              <span className="text-xs font-bold font-mono text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-800/50">
                {selectedComp.name}
              </span>
            </div>
            <div className="text-xs font-mono text-slate-400">
              Current: <span className="font-bold text-slate-100">{selectedComp.currentDraw.toFixed(1)}A</span>
              {' • '}
              Rated Max: <span className="font-semibold text-slate-300">{selectedComp.maxCurrent}A</span>
            </div>
          </div>

          {/* Chamber Quick-Select Pills */}
          <div className="flex flex-wrap gap-1.5">
            {components.map((c) => {
              const isSelected = c.id === selectedComp.id;
              const isZero = c.currentDraw === 0 || !c.cableConnected;
              const isOver = c.currentDraw > c.maxCurrent;
              const isTop = c.id === highestConsumer?.id && c.currentDraw > 0;

              return (
                <button
                  key={c.id}
                  id={`chart-select-comp-${c.id}`}
                  onClick={() => onSelectComponent(c.id)}
                  title={`Select ${c.name} (${c.currentDraw.toFixed(1)}A) to manipulate`}
                  className={`px-2.5 py-1 rounded text-xs font-mono border transition-colors flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-blue-600 border-blue-400 text-white font-bold shadow-sm'
                      : 'bg-[#161d2b] border-[#232f42] text-slate-300 hover:bg-[#1e2738] hover:border-[#2f3d54]'
                  }`}
                >
                  <span>{c.name}</span>
                  <span
                    className={`text-[10px] px-1 rounded ${
                      isSelected
                        ? 'bg-blue-800 text-blue-100'
                        : isZero
                        ? 'bg-rose-950 text-rose-300'
                        : isOver
                        ? 'bg-rose-900/80 text-rose-200'
                        : isTop
                        ? 'bg-amber-950 text-amber-300'
                        : 'bg-[#101622] text-slate-400'
                    }`}
                  >
                    {c.currentDraw.toFixed(0)}A
                  </span>
                </button>
              );
            })}
          </div>

          {/* Direct Interactive Manipulation Slider & Action Buttons */}
          <div className="pt-2 border-t border-[#1e2838] flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Live Slider for Selected Chamber */}
            <div className="flex-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                <span>Real-Time Current Adjustment for {selectedComp.name}:</span>
                <span className="font-bold text-slate-200">{selectedComp.currentDraw.toFixed(1)} A</span>
              </div>
              <input
                id="chart-slider-selected-current"
                type="range"
                min="0"
                max={Math.max(260, Math.round(selectedComp.maxCurrent * 1.4))}
                step="1"
                value={selectedComp.currentDraw}
                disabled={!selectedComp.cableConnected}
                onChange={(e) => handleCurrentChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#1f293d] rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-40"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-0.5">
                <span>0A</span>
                <span>Nominal: {selectedComp.nominalCurrent}A</span>
                <span>Max Safety: {selectedComp.maxCurrent}A</span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
              <button
                id="btn-chart-make-highest-consumer"
                onClick={handleMakeHighestConsumer}
                title={`Surge ${selectedComp.name} to exceed all other chambers and become the #1 highest consumer`}
                className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-mono font-semibold flex items-center gap-1 transition-colors shadow-sm"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Make #1 Consumer</span>
              </button>

              <button
                id="btn-chart-step-minus"
                onClick={() => handleStepCurrent(-10)}
                disabled={!selectedComp.cableConnected || selectedComp.currentDraw <= 0}
                title="Decrease load by 10A"
                className="p-1.5 bg-[#1b2332] hover:bg-[#232e42] border border-[#2c384c] text-slate-300 disabled:opacity-40 rounded text-xs font-mono flex items-center justify-center transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <button
                id="btn-chart-step-plus"
                onClick={() => handleStepCurrent(10)}
                title="Increase load by 10A"
                className="p-1.5 bg-[#1b2332] hover:bg-[#232e42] border border-[#2c384c] text-slate-300 rounded text-xs font-mono flex items-center justify-center transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>

              <button
                id="btn-chart-reset-nominal"
                onClick={handleResetNominal}
                title={`Reset ${selectedComp.name} to nominal ${selectedComp.nominalCurrent}A`}
                className="px-2 py-1.5 bg-[#1b2332] hover:bg-[#232e42] border border-[#2c384c] text-slate-300 rounded text-xs font-mono transition-colors"
              >
                Nominal
              </button>

              <button
                id="btn-chart-toggle-power"
                onClick={handleTogglePower}
                title={selectedComp.cableConnected ? 'Cut power to 0A' : 'Plug in cable to restore power'}
                className={`px-2 py-1.5 rounded text-xs font-mono border transition-colors flex items-center gap-1 ${
                  selectedComp.cableConnected
                    ? 'bg-rose-950/40 hover:bg-rose-900/50 border-rose-800/60 text-rose-300'
                    : 'bg-emerald-950/40 hover:bg-emerald-900/50 border-emerald-800/60 text-emerald-300'
                }`}
              >
                <Unplug className="w-3 h-3" />
                <span>{selectedComp.cableConnected ? 'Cut Power' : 'Restore'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Ranked Bar Chart List */}
        <div className="space-y-2">
          {sorted.map((comp, idx) => {
            const isSelected = comp.id === selectedComp.id;
            const isZero = comp.currentDraw === 0 || !comp.cableConnected;
            const isOver = comp.currentDraw > comp.maxCurrent;
            const isTop = idx === 0 && comp.currentDraw > 0;
            const percentageOfMax = Math.min(100, (comp.currentDraw / maxScaleAmps) * 100);
            const percentageOfTotal =
              totalCurrent > 0 ? ((comp.currentDraw / totalCurrent) * 100).toFixed(1) : '0';

            let barColor = 'bg-blue-500';
            if (isZero) {
              barColor = 'bg-slate-700';
            } else if (isOver) {
              barColor = 'bg-rose-500';
            } else if (comp.currentDraw > comp.nominalCurrent * 1.1) {
              barColor = 'bg-amber-500';
            }

            return (
              <div
                key={comp.id}
                id={`bar-current-${comp.id}`}
                onClick={() => onSelectComponent(comp.id)}
                className={`p-2.5 rounded-lg cursor-pointer transition-colors border ${
                  isSelected
                    ? 'bg-[#192436] border-blue-500 ring-1 ring-blue-500/40 shadow-sm'
                    : 'bg-[#0f141f] border-[#1e2838] hover:bg-[#161f2e] hover:border-[#2a374b]'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        isTop
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-[#182030] text-slate-400'
                      }`}
                    >
                      #{idx + 1}
                    </span>
                    <span className="font-semibold text-slate-200">
                      {comp.name}
                    </span>

                    {/* Dynamic Status Badges */}
                    {isSelected && (
                      <span className="px-1.5 py-0.2 text-[9px] bg-blue-600/20 text-blue-300 border border-blue-500/50 rounded font-medium">
                        ADMIN TARGET
                      </span>
                    )}

                    {isTop && !isZero && (
                      <span className="px-1.5 py-0.2 text-[9px] bg-amber-950/70 text-amber-300 border border-amber-800/60 rounded font-medium flex items-center gap-1">
                        <Flame className="w-2.5 h-2.5 text-amber-400" /> TOP CONSUMER
                      </span>
                    )}

                    {isZero && (
                      <span className="px-1.5 py-0.2 text-[9px] bg-rose-950/70 text-rose-300 border border-rose-800/60 rounded font-medium flex items-center gap-1">
                        <AlertCircle className="w-2.5 h-2.5" /> DISCONNECTED
                      </span>
                    )}

                    {isOver && (
                      <span className="px-1.5 py-0.2 text-[9px] bg-rose-950/70 text-rose-300 border border-rose-800/60 rounded font-medium flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5" /> OVERFLOW ({comp.currentDraw.toFixed(0)}A &gt; {comp.maxCurrent}A)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5">
                    {/* Inline Quick Adjustment on hover/active */}
                    <div className="flex items-center gap-1 opacity-90">
                      <button
                        id={`btn-row-minus-${comp.id}`}
                        onClick={(e) => handleRowStepCurrent(e, comp, -5)}
                        title={`Decrease ${comp.name} current by 5A`}
                        className="w-5 h-5 rounded bg-[#1b2332] hover:bg-[#253247] text-slate-300 flex items-center justify-center border border-[#2c384c] text-[10px]"
                      >
                        -
                      </button>
                      <button
                        id={`btn-row-plus-${comp.id}`}
                        onClick={(e) => handleRowStepCurrent(e, comp, 5)}
                        title={`Increase ${comp.name} current by 5A`}
                        className="w-5 h-5 rounded bg-[#1b2332] hover:bg-[#253247] text-slate-300 flex items-center justify-center border border-[#2c384c] text-[10px]"
                      >
                        +
                      </button>
                    </div>

                    <span className="text-[10px] text-slate-400">
                      {percentageOfTotal}% bus
                    </span>

                    <span
                      className={`font-bold font-mono min-w-[54px] text-right ${
                        isZero
                          ? 'text-slate-500'
                          : isOver
                          ? 'text-rose-400'
                          : isTop
                          ? 'text-blue-300'
                          : 'text-slate-100'
                      }`}
                    >
                      {comp.currentDraw.toFixed(1)} A
                    </span>

                    {onInspectComponent && (
                      <button
                        id={`btn-inspect-row-${comp.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onInspectComponent(comp.id);
                        }}
                        title={`Inspect deep specifications for ${comp.name}`}
                        className="p-1 text-slate-400 hover:text-slate-200 hover:bg-[#1b2332] rounded transition-colors"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative w-full h-2 bg-[#1b2332] rounded-full overflow-hidden">
                  {/* Rated limit tick indicator */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10"
                    style={{ left: `${(comp.maxCurrent / maxScaleAmps) * 100}%` }}
                    title={`Max rating limit: ${comp.maxCurrent}A`}
                  />
                  {/* Active Bar */}
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                    style={{ width: `${Math.max(isZero ? 0 : 2, percentageOfMax)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

