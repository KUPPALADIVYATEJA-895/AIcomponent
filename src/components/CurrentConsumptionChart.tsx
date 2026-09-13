import React from 'react';
import { SpacecraftComponent } from '../types';
import { Zap, AlertTriangle, AlertCircle } from 'lucide-react';

interface CurrentConsumptionChartProps {
  components: SpacecraftComponent[];
  selectedComponentId: string;
  onSelectComponent: (id: string) => void;
}

export const CurrentConsumptionChart: React.FC<CurrentConsumptionChartProps> = ({
  components,
  selectedComponentId,
  onSelectComponent,
}) => {
  // Sort components by current draw descending
  const sorted = [...components].sort((a, b) => {
    // Put disconnected at bottom or sort strictly by currentDraw
    return b.currentDraw - a.currentDraw;
  });

  const maxScaleAmps = Math.max(
    ...components.map((c) => Math.max(c.currentDraw, c.maxCurrent, 100))
  );

  const totalCurrent = components.reduce((acc, c) => acc + c.currentDraw, 0);

  return (
    <div
      id="machinery-current-consumption-chart"
      className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100 font-['Chakra_Petch'] tracking-wide">
                MACHINERY CURRENT CONSUMPTION (A)
              </h3>
              <p className="text-[11px] text-slate-400">
                Ranked load distribution: Identifies highest current draws & zero-flow components.
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 block">TOTAL BUS LOAD</span>
            <span className="text-sm font-mono font-bold text-cyan-400">
              {totalCurrent.toFixed(1)} A
            </span>
          </div>
        </div>

        {/* Bar Chart List */}
        <div className="space-y-2.5">
          {sorted.map((comp, idx) => {
            const isSelected = comp.id === selectedComponentId;
            const isZero = comp.currentDraw === 0 || !comp.cableConnected;
            const isOver = comp.currentDraw > comp.maxCurrent;
            const percentageOfMax = Math.min(100, (comp.currentDraw / maxScaleAmps) * 100);
            const percentageOfTotal =
              totalCurrent > 0 ? ((comp.currentDraw / totalCurrent) * 100).toFixed(1) : '0';

            let barColor = 'bg-cyan-500';
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
                className={`p-2 rounded-lg cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-500/60 shadow-md shadow-cyan-950/30'
                    : 'bg-slate-950/50 border-slate-800/60 hover:bg-slate-800/50 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 w-4">
                      #{idx + 1}
                    </span>
                    <span className="font-semibold text-slate-200">
                      {comp.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ({comp.id})
                    </span>
                    {isZero && (
                      <span className="px-1.5 py-0.2 text-[9px] bg-rose-950 text-rose-300 border border-rose-800 rounded font-semibold flex items-center gap-1">
                        <AlertCircle className="w-2.5 h-2.5" /> NO CURRENT FLOW
                      </span>
                    )}
                    {isOver && (
                      <span className="px-1.5 py-0.2 text-[9px] bg-rose-950 text-rose-300 border border-rose-800 rounded font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5" /> OVERFLOW ({comp.currentDraw.toFixed(0)}A &gt; {comp.maxCurrent}A)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">
                      {percentageOfTotal}% bus
                    </span>
                    <span
                      className={`font-bold font-mono ${
                        isZero
                          ? 'text-slate-500'
                          : isOver
                          ? 'text-rose-400'
                          : 'text-cyan-300'
                      }`}
                    >
                      {comp.currentDraw.toFixed(1)} A
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                  {/* Rated limit tick indicator */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-amber-400/80 z-10"
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

      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          Primary Consumer: <strong className="text-cyan-300">{sorted[0]?.name || 'N/A'}</strong>
        </span>
        <span className="flex items-center gap-1 text-slate-400">
          <span className="w-1.5 h-2 bg-amber-400 inline-block" /> = Max Safe Limit Marker
        </span>
      </div>
    </div>
  );
};
