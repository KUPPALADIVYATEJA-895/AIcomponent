import React from 'react';
import {
  SpacecraftComponent,
  FaultPreset,
} from '../types';
import {
  Sliders,
  Zap,
  Thermometer,
  Unplug,
  Flame,
  ShieldAlert,
  RotateCcw,
  AlertTriangle,
  Radio,
  CheckCircle2,
  Gauge,
  Activity,
} from 'lucide-react';

interface AdminConsoleProps {
  components: SpacecraftComponent[];
  selectedComponentId: string;
  onSelectComponent: (id: string) => void;
  onUpdateComponent: (id: string, partial: Partial<SpacecraftComponent>) => void;
  onApplyPreset: (preset: FaultPreset) => void;
  presets: FaultPreset[];
  onResetAll: () => void;
  isSimulating: boolean;
  setIsSimulating: (val: boolean) => void;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  components,
  selectedComponentId,
  onSelectComponent,
  onUpdateComponent,
  onApplyPreset,
  presets,
  onResetAll,
  isSimulating,
  setIsSimulating,
}) => {
  const selectedComp =
    components.find((c) => c.id === selectedComponentId) || components[0];

  if (!selectedComp) return null;

  // Handle cable plug in/out
  const handleToggleCable = () => {
    const nextConnected = !selectedComp.cableConnected;
    onUpdateComponent(selectedComp.id, {
      cableConnected: nextConnected,
      // When unplugged, current drops to 0A immediately
      currentDraw: nextConnected ? selectedComp.nominalCurrent : 0.0,
      shortCircuitRisk: nextConnected ? 5 : 0,
      status: nextConnected ? 'NOMINAL' : 'OFFLINE',
    });
  };

  // Handle temperature change
  const handleTempChange = (newTemp: number) => {
    onUpdateComponent(selectedComp.id, {
      temperature: Math.round(newTemp * 10) / 10,
    });
  };

  // Handle current overflow change
  const handleCurrentChange = (newCurrent: number) => {
    onUpdateComponent(selectedComp.id, {
      currentDraw: Math.round(newCurrent * 10) / 10,
      cableConnected: true, // if admin adjusts current, cable is powered
    });
  };

  // Handle ground leakage change
  const handleLeakageChange = (newLeakage: number) => {
    onUpdateComponent(selectedComp.id, {
      leakageCurrent: Math.round(newLeakage * 10) / 10,
    });
  };

  // Handle power consume / wattage adjustment (updates current according to P = V * I)
  const handlePowerKwChange = (powerKw: number) => {
    const voltage = selectedComp.voltage || 28;
    const computedCurrent = (powerKw * 1000) / voltage;
    onUpdateComponent(selectedComp.id, {
      currentDraw: Math.round(computedCurrent * 10) / 10,
      cableConnected: true,
    });
  };

  // Preset quick triggers
  const triggerThermalSpike = () => {
    onUpdateComponent(selectedComp.id, {
      temperature: selectedComp.tempMax + 15,
    });
  };

  const triggerOvercurrentSurge = () => {
    onUpdateComponent(selectedComp.id, {
      currentDraw: Math.round(selectedComp.maxCurrent * 1.35),
      cableConnected: true,
    });
  };

  const triggerSevereLeakage = () => {
    onUpdateComponent(selectedComp.id, {
      leakageCurrent: 88.5,
    });
  };

  const restoreComponent = () => {
    onUpdateComponent(selectedComp.id, {
      cableConnected: true,
      currentDraw: selectedComp.nominalCurrent,
      temperature: selectedComp.tempNominal,
      leakageCurrent: 2.1,
      shortCircuitRisk: 6,
      status: 'NOMINAL',
    });
  };

  return (
    <div
      id="admin-fault-injection-console"
      className="bg-slate-900/90 border border-cyan-500/30 rounded-xl p-5 shadow-2xl backdrop-blur-md relative overflow-hidden"
    >
      {/* Background HUD Grid Accent */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-100 tracking-wide font-['Chakra_Petch']">
                ADMIN FAULT INJECTION & SIMULATOR CONSOLE
              </h2>
              <span className="px-2 py-0.5 text-xs font-mono font-medium rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                INTERACTIVE TEST DECK
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-toggle-live-simulation"
            onClick={() => setIsSimulating(!isSimulating)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 border ${
              isSimulating
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60'
                : 'bg-amber-950/60 border-amber-500/50 text-amber-300 hover:bg-amber-900/60'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isSimulating ? 'animate-pulse text-emerald-400' : ''}`} />
            {isSimulating ? 'TELEMETRY CLOCK: RUNNING' : 'TELEMETRY: PAUSED'}
          </button>

          <button
            id="btn-admin-reset-all"
            onClick={onResetAll}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            RESET TO NOMINAL
          </button>
        </div>
      </div>

      {/* 1-Click Scenario Preset Buttons */}
      <div className="mb-5">
        <span className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 font-semibold">
          1-Click Fault Scenarios (Demonstrations)
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {presets.map((preset) => {
            const isNominal = preset.id === 'nominal-restore';
            return (
              <button
                key={preset.id}
                id={`preset-${preset.id}`}
                onClick={() => onApplyPreset(preset)}
                className={`text-left p-2.5 rounded-lg border text-xs font-sans transition-all group relative ${
                  isNominal
                    ? 'bg-emerald-950/30 border-emerald-500/30 hover:bg-emerald-900/40 text-emerald-200'
                    : 'bg-slate-800/60 border-slate-700/70 hover:border-amber-500/50 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-slate-400 uppercase tracking-tighter truncate">
                    {preset.category}
                  </span>
                  {preset.severity === 'CRITICAL' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  )}
                </div>
                <div className="font-medium text-xs text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-1">
                  {preset.title}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Component Selector Pills */}
      <div className="mb-4">
        <span className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 font-semibold">
          Select Component To Manipulate:
        </span>
        <div className="flex flex-wrap gap-2">
          {components.map((c) => {
            const isSelected = c.id === selectedComp.id;
            const isDisconnected = !c.cableConnected;
            const isCrit = c.status === 'CRITICAL';
            const isWarn = c.status === 'WARNING';

            return (
              <button
                key={c.id}
                id={`admin-select-comp-${c.id}`}
                onClick={() => onSelectComponent(c.id)}
                className={`px-3 py-2 rounded-lg text-xs font-mono border transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-950/40 font-semibold'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                {/* Status dot */}
                <span
                  className={`w-2 h-2 rounded-full ${
                    isDisconnected
                      ? 'bg-slate-500'
                      : isCrit
                      ? 'bg-rose-500 animate-pulse'
                      : isWarn
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                />
                <span>{c.id}</span>
                <span className="text-slate-400 text-[11px] hidden sm:inline">
                  ({c.name.split(' ')[0]})
                </span>
                {isDisconnected && (
                  <span className="px-1 text-[9px] bg-rose-950 text-rose-300 border border-rose-800 rounded">
                    UNPLUGGED
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Control Panel for Selected Component */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* 1. Cable Connection Plug In / Out */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                <Unplug className="w-4 h-4 text-cyan-400" />
                CABLE CONNECTION
              </span>
              <span
                className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded ${
                  selectedComp.cableConnected
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}
              >
                {selectedComp.cableConnected ? 'PLUGGED IN' : 'UNPLUGGED / DISCONNECTED'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Cable umbilical: <span className="font-mono text-cyan-300">{selectedComp.cableId}</span>.
              {selectedComp.cableConnected
                ? ' Continuous current flow active.'
                : ' Zero current flows! Downstream machine is unpowered.'}
            </p>
          </div>

          <button
            id={`btn-toggle-cable-${selectedComp.id}`}
            onClick={handleToggleCable}
            className={`w-full py-2 px-3 rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-2 border transition-all ${
              selectedComp.cableConnected
                ? 'bg-rose-950/70 hover:bg-rose-900/80 border-rose-600/50 text-rose-200'
                : 'bg-emerald-950/70 hover:bg-emerald-900/80 border-emerald-600/50 text-emerald-200'
            }`}
          >
            <Unplug className="w-4 h-4" />
            {selectedComp.cableConnected ? 'DISCONNECT / UNPLUG CABLE' : 'PLUG IN / RECONNECT CABLE'}
          </button>
        </div>

        {/* 2. Temperature Monitoring & Control */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-amber-400" />
              TEMPERATURE CONTROL
            </span>
            <span
              className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                selectedComp.temperature >= selectedComp.tempMax
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : selectedComp.temperature > selectedComp.tempThreshold
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {selectedComp.temperature.toFixed(1)} °C
            </span>
          </div>

          <div className="mb-3">
            <input
              id="slider-component-temp"
              type="range"
              min="-30"
              max="160"
              step="1"
              value={selectedComp.temperature}
              onChange={(e) => handleTempChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
              <span>Nominal: {selectedComp.tempNominal}°C</span>
              <span>Limit: {selectedComp.tempThreshold}°C</span>
              <span>Max: {selectedComp.tempMax}°C</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              id="btn-quick-temp-spike"
              onClick={triggerThermalSpike}
              className="py-1 px-2 bg-amber-950/60 hover:bg-amber-900/70 border border-amber-700/40 text-amber-200 rounded text-[11px] font-mono flex items-center justify-center gap-1"
            >
              <Flame className="w-3 h-3 text-amber-400" />
              Thermal Spike
            </button>
            <button
              id="btn-quick-temp-nominal"
              onClick={() => handleTempChange(selectedComp.tempNominal)}
              className="py-1 px-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded text-[11px] font-mono flex items-center justify-center gap-1"
            >
              Reset Temp
            </button>
          </div>
        </div>

        {/* 3. Current Consumption & Overflow Control */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-cyan-400" />
              CURRENT OVERFLOW CONTROL
            </span>
            <span
              className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                selectedComp.currentDraw > selectedComp.maxCurrent
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {selectedComp.currentDraw.toFixed(1)} A
            </span>
          </div>

          <div className="mb-3">
            <input
              id="slider-component-current"
              type="range"
              min="0"
              max={Math.round(selectedComp.maxCurrent * 1.5)}
              step="1"
              value={selectedComp.currentDraw}
              disabled={!selectedComp.cableConnected}
              onChange={(e) => handleCurrentChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-40"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
              <span>0A (Cutoff)</span>
              <span>Nominal: {selectedComp.nominalCurrent}A</span>
              <span>Max: {selectedComp.maxCurrent}A</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              id="btn-quick-overcurrent-surge"
              onClick={triggerOvercurrentSurge}
              className="py-1 px-2 bg-rose-950/60 hover:bg-rose-900/70 border border-rose-700/40 text-rose-200 rounded text-[11px] font-mono flex items-center justify-center gap-1"
            >
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              Surge (+135%)
            </button>
            <button
              id="btn-quick-current-nominal"
              onClick={() => handleCurrentChange(selectedComp.nominalCurrent)}
              className="py-1 px-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded text-[11px] font-mono flex items-center justify-center gap-1"
            >
              Set Nominal
            </button>
          </div>
        </div>

        {/* 4. Current Leakage & Short Circuit Hazard Injector */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-purple-400" />
              GROUND LEAKAGE & SHORT RISK
            </span>
            <span
              className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                selectedComp.leakageCurrent > 50
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : selectedComp.leakageCurrent > 20
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {selectedComp.leakageCurrent.toFixed(1)} mA
            </span>
          </div>

          <div className="mb-3">
            <input
              id="slider-component-leakage"
              type="range"
              min="0"
              max="150"
              step="1"
              value={selectedComp.leakageCurrent}
              onChange={(e) => handleLeakageChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
              <span>Safe (&lt;15mA)</span>
              <span>Warning (25mA)</span>
              <span>Arc Flash (&gt;75mA)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              id="btn-quick-ground-leakage"
              onClick={triggerSevereLeakage}
              className="py-1 px-2 bg-purple-950/60 hover:bg-purple-900/70 border border-purple-700/40 text-purple-200 rounded text-[11px] font-mono flex items-center justify-center gap-1"
            >
              <Zap className="w-3 h-3 text-purple-400" />
              Inject Leakage
            </button>
            <button
              id="btn-quick-reset-comp"
              onClick={restoreComponent}
              className="py-1 px-2 bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-700/40 text-emerald-200 rounded text-[11px] font-mono flex items-center justify-center gap-1"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Restore Comp
            </button>
          </div>
        </div>

        {/* 5. Power Consumption & Wattage Control */}
        {(() => {
          const powerKw =
            selectedComp.cableConnected
              ? (selectedComp.voltage * selectedComp.currentDraw) / 1000
              : 0;
          const nominalPowerKw = (selectedComp.voltage * selectedComp.nominalCurrent) / 1000;
          const maxPowerKw = (selectedComp.voltage * selectedComp.maxCurrent) / 1000;
          const isOverloaded = selectedComp.currentDraw > selectedComp.maxCurrent;

          return (
            <div
              id="admin-power-consume-section"
              className="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                    <Gauge className="w-4 h-4 text-emerald-400" />
                    POWER CONSUMPTION
                  </span>
                  <span
                    className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                      !selectedComp.cableConnected
                        ? 'bg-slate-800 text-slate-400'
                        : isOverloaded
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : powerKw > nominalPowerKw * 1.1
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {powerKw.toFixed(2)} kW
                  </span>
                </div>

                <div className="mb-3">
                  <input
                    id="slider-component-power-consume"
                    type="range"
                    min="0"
                    max={Math.round(maxPowerKw * 1.5 * 10) / 10 || 15}
                    step="0.1"
                    value={Math.round(powerKw * 10) / 10}
                    disabled={!selectedComp.cableConnected}
                    onChange={(e) => handlePowerKwChange(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 disabled:opacity-40"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                    <span>0 kW</span>
                    <span>Nom: {nominalPowerKw.toFixed(1)}kW</span>
                    <span>Max: {maxPowerKw.toFixed(1)}kW</span>
                  </div>
                </div>

                <div className="p-2 bg-slate-950/80 rounded border border-slate-800/80 mb-3 space-y-1 text-[10px] font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Bus Voltage:</span>
                    <span className="text-cyan-300">{selectedComp.voltage} V DC</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Wattage:</span>
                    <span className="text-emerald-300">{Math.round(powerKw * 1000)} W</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Current Draw:</span>
                    <span className={isOverloaded ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                      {selectedComp.currentDraw.toFixed(1)} A
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  id="btn-quick-eco-power"
                  onClick={() => handlePowerKwChange(nominalPowerKw * 0.7)}
                  disabled={!selectedComp.cableConnected}
                  className="py-1 px-2 bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-700/40 text-emerald-200 rounded text-[11px] font-mono flex items-center justify-center gap-1 disabled:opacity-40"
                >
                  <Activity className="w-3 h-3 text-emerald-400" />
                  Eco (-30%)
                </button>
                <button
                  id="btn-quick-peak-power"
                  onClick={() => handlePowerKwChange(maxPowerKw * 1.25)}
                  disabled={!selectedComp.cableConnected}
                  className="py-1 px-2 bg-rose-950/60 hover:bg-rose-900/70 border border-rose-700/40 text-rose-200 rounded text-[11px] font-mono flex items-center justify-center gap-1 disabled:opacity-40"
                >
                  <Flame className="w-3 h-3 text-rose-400" />
                  Peak (+125%)
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
