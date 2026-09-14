import React, { useState } from 'react';
import { SpacecraftComponent } from '../types';
import {
  Zap,
  Thermometer,
  Unplug,
  AlertTriangle,
  Flame,
  ShieldAlert,
  Cpu,
  Activity,
  Maximize2,
  Info,
} from 'lucide-react';

interface CircuitSchematicGraphProps {
  components: SpacecraftComponent[];
  selectedComponentId: string;
  onSelectComponent: (id: string) => void;
  onToggleCable: (id: string) => void;
}

export const CircuitSchematicGraph: React.FC<CircuitSchematicGraphProps> = ({
  components,
  selectedComponentId,
  onSelectComponent,
  onToggleCable,
}) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Center bus node coordinates in SVG space (1000 x 560)
  const busCenter = { x: 500, y: 280 };

  // Calculate total grid current
  const totalBusCurrent = components.reduce((acc, c) => acc + (c.cableConnected ? c.currentDraw : 0), 0);
  const selectedComp = components.find(c => c.id === selectedComponentId);

  return (
    <div
      id="spacecraft-circuit-schematic-graph"
      className="bg-[#131926] border border-[#232f42] rounded-xl p-4 shadow-md relative flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#232f42]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600/15 text-blue-400 rounded-lg border border-blue-500/30">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 tracking-tight">
              CHAMBER MONITORING SECTION & CABLE NETWORK
            </h3>
          </div>
        </div>

        {/* Legend */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            Nominal
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            Warning
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            Fault
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block" />
            Disconnected
          </span>
        </div>
      </div>

      {/* SVG Canvas for Single-Line Electrical Schematic */}
      <div className="relative w-full aspect-[16/9] min-h-[420px] bg-[#0c1017] rounded-lg border border-[#1f2937] overflow-hidden select-none">
        <svg
          viewBox="0 0 1000 560"
          className="relative w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Clean CAD Engineering Grid */}
            <pattern id="cad-grid-fine" width="25" height="25" patternUnits="userSpaceOnUse">
              <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#1c2536" strokeWidth="0.5" strokeOpacity="0.4" />
            </pattern>
            <pattern id="cad-grid-major" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#26344a" strokeWidth="0.8" strokeOpacity="0.5" />
            </pattern>

            {/* Subtle Gradient for Module Cards */}
            <linearGradient id="card-bg-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#171f2d" />
              <stop offset="100%" stopColor="#121824" />
            </linearGradient>
          </defs>

          {/* BACKGROUND: CAD Grid */}
          <rect width="1000" height="560" fill="url(#cad-grid-fine)" />
          <rect width="1000" height="560" fill="url(#cad-grid-major)" />

          {/* Clean Engineering Boundary Frame */}
          <rect
            x="20"
            y="20"
            width="960"
            height="520"
            fill="none"
            stroke="#202a3a"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <text x="32" y="38" fill="#475569" fontSize="9" fontFamily="monospace" fontWeight="600">
            SCHEMATIC: DC DISTRIBUTION BUS // 480V SYSTEM
          </text>
          <text x="840" y="38" fill="#475569" fontSize="9" fontFamily="monospace" fontWeight="600">
            8-CHANNEL NETWORK
          </text>

          {/* CABLE CONNECTIONS (Central Bus to Chambers) */}
          {components.map((comp) => {
            const isSelected = comp.id === selectedComponentId;
            const isHovered = comp.id === hoveredNode;
            const isConnected = comp.cableConnected;
            const isCritical = comp.status === 'CRITICAL';
            const isOvercurrent = comp.currentDraw > comp.maxCurrent;

            // Wire color
            let wireStroke = '#3b82f6'; // Clean Blue
            if (!isConnected) {
              wireStroke = '#64748b'; // Muted Gray/Slate for disconnected
            } else if (isCritical || isOvercurrent) {
              wireStroke = '#ef4444'; // Red for fault
            } else if (comp.status === 'WARNING') {
              wireStroke = '#f59e0b'; // Amber
            }

            // Path from central bus to component
            const pathD = `M ${busCenter.x} ${busCenter.y} Q ${(busCenter.x + comp.gridX) / 2} ${(busCenter.y + comp.gridY) / 2} ${comp.gridX} ${comp.gridY}`;

            return (
              <g key={`cable-group-${comp.id}`}>
                {/* Highlight line on hover or selection */}
                {(isSelected || isHovered) && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke={wireStroke}
                    strokeWidth={6}
                    strokeOpacity={0.2}
                  />
                )}

                {/* Primary Conductor Cable */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={wireStroke}
                  strokeWidth={isSelected ? 2.5 : 1.75}
                  strokeOpacity={isConnected ? 0.9 : 0.4}
                  strokeDasharray={isConnected ? 'none' : '5 4'}
                />

                {/* Flow indicator dashes when connected and drawing current */}
                {isConnected && comp.currentDraw > 0 && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isCritical ? '#fca5a5' : '#93c5fd'}
                    strokeWidth={1.5}
                    strokeDasharray="4 14"
                    className="animate-[dash_2s_linear_infinite]"
                    style={{
                      strokeDashoffset: 100,
                      animationDuration: `${Math.max(0.8, 2.5 - (comp.currentDraw / comp.maxCurrent) * 1.5)}s`,
                    }}
                  />
                )}

                {/* Disconnected Open Switch Indicator */}
                {!isConnected && (
                  <g
                    transform={`translate(${(busCenter.x * 0.48 + comp.gridX * 0.52)}, ${(busCenter.y * 0.48 + comp.gridY * 0.52)})`}
                  >
                    <rect x="-10" y="-10" width="20" height="20" rx="4" fill="#1e1515" stroke="#ef4444" strokeWidth="1.2" />
                    <line x1="-5" y1="-5" x2="5" y2="5" stroke="#f87171" strokeWidth="1.5" />
                    <line x1="5" y1="-5" x2="-5" y2="5" stroke="#f87171" strokeWidth="1.5" />
                  </g>
                )}

                {/* Cable Tag Label (Click to toggle) */}
                <g
                  transform={`translate(${(busCenter.x * 0.32 + comp.gridX * 0.68)}, ${(busCenter.y * 0.32 + comp.gridY * 0.68)})`}
                  className="cursor-pointer transition-transform hover:scale-105"
                  onClick={() => onToggleCable(comp.id)}
                >
                  <rect
                    x="-32"
                    y="-10"
                    width="64"
                    height="20"
                    rx="4"
                    fill="#111722"
                    stroke={isConnected ? (isSelected ? '#3b82f6' : '#2d3b50') : '#7f1d1d'}
                    strokeWidth={isSelected || !isConnected ? 1.5 : 1}
                  />
                  <text
                    x="0"
                    y="3.5"
                    textAnchor="middle"
                    fill={isConnected ? (isSelected ? '#60a5fa' : '#94a3b8') : '#f87171'}
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="600"
                  >
                    {isConnected ? comp.cableId : 'UNPLUGGED'}
                  </text>
                </g>
              </g>
            );
          })}

          {/* CENTRAL POWER BUS NODE */}
          <g transform={`translate(${busCenter.x}, ${busCenter.y})`} className="cursor-pointer">
            {/* Bus Enclosure */}
            <rect
              x="-65"
              y="-40"
              width="130"
              height="80"
              rx="8"
              fill="#141c2a"
              stroke="#2563eb"
              strokeWidth="2"
            />
            {/* Bus Header */}
            <rect
              x="-65"
              y="-40"
              width="130"
              height="22"
              rx="8"
              fill="#1e2a3e"
            />
            <rect
              x="-65"
              y="-26"
              width="130"
              height="8"
              fill="#1e2a3e"
            />
            <text x="0" y="-26" textAnchor="middle" fill="#93c5fd" fontSize="9" fontFamily="monospace" fontWeight="bold">
              480V DC MAIN BUS
            </text>

            {/* Digital Readout */}
            <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="16" fontFamily="monospace" fontWeight="bold">
              {totalBusCurrent.toFixed(1)} A
            </text>
            <text x="0" y="24" textAnchor="middle" fill="#64748b" fontSize="8.5" fontFamily="monospace" fontWeight="600">
              AGGREGATE LOAD
            </text>
          </g>

          {/* CHAMBER MODULE CARDS */}
          {components.map((comp) => {
            const isSelected = comp.id === selectedComponentId;
            const isHovered = comp.id === hoveredNode;
            const isDisconnected = !comp.cableConnected;
            const isCritical = comp.status === 'CRITICAL';
            const isWarning = comp.status === 'WARNING';
            const isOver = comp.currentDraw > comp.maxCurrent;

            // Status Colors
            let statusColor = '#10b981'; // emerald
            if (isDisconnected) {
              statusColor = '#64748b'; // slate
            } else if (isCritical || isOver) {
              statusColor = '#ef4444'; // red
            } else if (isWarning) {
              statusColor = '#f59e0b'; // amber
            }

            // Category tag abbreviations
            const getCategoryShort = (cat: string) => {
              switch (cat) {
                case 'POWER_GENERATION': return 'PWR';
                case 'PROPULSION': return 'PROP';
                case 'THERMAL_COOLING': return 'CRYO';
                case 'LIFE_SUPPORT': return 'ECLSS';
                case 'AVIONICS': return 'NAV';
                case 'DEFENSE_SHIELDING': return 'SHD';
                case 'COMMUNICATIONS': return 'COMM';
                default: return 'SYS';
              }
            };

            const loadPercent = Math.min(100, (comp.currentDraw / comp.maxCurrent) * 100);

            return (
              <g
                key={`comp-node-${comp.id}`}
                transform={`translate(${comp.gridX}, ${comp.gridY})`}
                className="cursor-pointer transition-transform duration-150"
                onClick={() => onSelectComponent(comp.id)}
                onMouseEnter={() => setHoveredNode(comp.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Node Box Body */}
                <rect
                  x="-80"
                  y="-36"
                  width="160"
                  height="72"
                  rx="6"
                  fill="url(#card-bg-grad)"
                  stroke={isSelected ? '#3b82f6' : isHovered ? '#475569' : '#232e40'}
                  strokeWidth={isSelected ? 2 : 1}
                />

                {/* Left Status Accent Bar */}
                <rect
                  x="-80"
                  y="-36"
                  width="4"
                  height="72"
                  rx="2"
                  fill={statusColor}
                />

                {/* Top Row: Chamber Name & Category Badge */}
                <text
                  x="-68"
                  y="-18"
                  fill="#f8fafc"
                  fontSize="12"
                  fontFamily="sans-serif"
                  fontWeight="bold"
                >
                  {comp.name}
                </text>

                <rect
                  x="28"
                  y="-28"
                  width="44"
                  height="14"
                  rx="3"
                  fill="#111722"
                  stroke="#2d3b50"
                  strokeWidth="1"
                />
                <text
                  x="50"
                  y="-18"
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="8"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  {getCategoryShort(comp.category)}
                </text>

                {/* Subtitle: Subsystem Bus */}
                <text
                  x="-68"
                  y="-4"
                  fill="#64748b"
                  fontSize="8.5"
                  fontFamily="sans-serif"
                >
                  {comp.specDetails.subsystemBus.length > 24
                    ? comp.specDetails.subsystemBus.slice(0, 23) + '..'
                    : comp.specDetails.subsystemBus}
                </text>

                {/* Mini Load Progress Bar Track */}
                <rect
                  x="-68"
                  y="7"
                  width="140"
                  height="3"
                  rx="1.5"
                  fill="#1e293b"
                />
                <rect
                  x="-68"
                  y="7"
                  width={isDisconnected ? 0 : Math.max(4, (140 * loadPercent) / 100)}
                  height="3"
                  rx="1.5"
                  fill={isOver ? '#ef4444' : loadPercent > 75 ? '#f59e0b' : '#3b82f6'}
                />

                {/* Bottom Row: Current Flow & Temperature Readings */}
                <g transform="translate(-68, 15)">
                  {/* Current Draw */}
                  <text
                    x="0"
                    y="12"
                    fill={isDisconnected ? '#64748b' : isOver ? '#ef4444' : '#f1f5f9'}
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {isDisconnected ? '0.0 A' : `${comp.currentDraw.toFixed(1)} A`}
                  </text>

                  {/* Temperature */}
                  <text
                    x="82"
                    y="12"
                    fill={comp.temperature >= comp.tempMax ? '#ef4444' : comp.temperature > comp.tempThreshold ? '#f59e0b' : '#10b981'}
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="600"
                  >
                    {comp.temperature.toFixed(0)}°C
                  </text>
                </g>

                {/* Disconnected Badge */}
                {isDisconnected && (
                  <g transform="translate(64, -24)">
                    <rect x="-14" y="-7" width="28" height="14" rx="3" fill="#3f1616" stroke="#ef4444" strokeWidth="0.8" />
                    <text x="0" y="3.5" textAnchor="middle" fill="#fca5a5" fontSize="7.5" fontFamily="monospace" fontWeight="bold">
                      OFF
                    </text>
                  </g>
                )}

                {/* Fault Badge */}
                {isCritical && !isDisconnected && (
                  <g transform="translate(64, -24)">
                    <rect x="-14" y="-7" width="28" height="14" rx="3" fill="#450a0a" stroke="#ef4444" strokeWidth="0.8" />
                    <text x="0" y="3.5" textAnchor="middle" fill="#fca5a5" fontSize="7.5" fontFamily="monospace" fontWeight="bold">
                      FAULT
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Floating Bottom Quick Action Overlay */}
        <div className="absolute bottom-3 left-3 bg-[#131926]/90 border border-[#232f42] rounded-lg px-3 py-1.5 text-xs font-mono text-slate-300 flex items-center gap-3 shadow-sm">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Selected: <strong className="text-white font-medium">{selectedComp?.name || selectedComponentId}</strong>
          </span>
          <span className="text-[#324056]">|</span>
          <button
            onClick={() => onToggleCable(selectedComponentId)}
            className="text-slate-300 hover:text-white transition-colors flex items-center gap-1 font-medium"
          >
            <Unplug className="w-3.5 h-3.5 text-slate-400" />
            Toggle Connection
          </button>
        </div>
      </div>
    </div>
  );
};
