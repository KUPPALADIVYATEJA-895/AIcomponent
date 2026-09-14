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

  return (
    <div
      id="spacecraft-circuit-schematic-graph"
      className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl relative flex flex-col"
    >
      {/* HUD Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 font-['Chakra_Petch'] tracking-wide">
              CHAMBER MONITORING SECTION & CABLE NETWORK
            </h3>
            <p className="text-[11px] text-slate-400">
              Interactive node graph: Click any chamber to inspect or toggle its cable umbilical connection.
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="hidden lg:flex items-center gap-3 text-[11px] font-mono">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shadow-sm shadow-emerald-500/50" />
            Nominal
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            Warning
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping inline-block" />
            Critical / Fault
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block" />
            Unplugged (0A)
          </span>
        </div>
      </div>

      {/* SVG Canvas for Grid Topology with enhanced high-tech aerospace HUD */}
      <div className="relative w-full aspect-[16/9] min-h-[420px] bg-[#030712] rounded-xl border border-slate-800/90 overflow-hidden select-none shadow-2xl">
        {/* Ambient Cosmic Background Glows */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(14,165,233,0.12),rgba(15,23,42,0.6)_60%,#020617_100%)]" />
        <div className="absolute top-1/4 left-1/5 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/5 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <svg
          viewBox="0 0 1000 560"
          className="relative w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Holographic Aerospace Grid Patterns */}
            <pattern id="fine-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#0ea5e9" strokeWidth="0.3" strokeOpacity="0.12" />
            </pattern>
            <pattern id="major-grid" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#38bdf8" strokeWidth="0.6" strokeOpacity="0.2" />
              <circle cx="100" cy="100" r="1" fill="#38bdf8" fillOpacity="0.4" />
            </pattern>

            {/* Glowing Filters */}
            <filter id="glow-cyan" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-danger" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-gold" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Gradients */}
            <radialGradient id="bus-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#0284c7" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0b1120" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="hull-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#090d16" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="node-glass" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#131b2e" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#090e1a" stopOpacity="0.98" />
            </linearGradient>
          </defs>

          {/* BACKGROUND LAYER 1: Dual Aerospace Grid Matrix */}
          <rect width="1000" height="560" fill="url(#fine-grid)" />
          <rect width="1000" height="560" fill="url(#major-grid)" />

          {/* BACKGROUND LAYER 2: Concentric Tactical Radar Range Rings around Central Bus */}
          <g transform={`translate(${busCenter.x}, ${busCenter.y})`} pointerEvents="none">
            {/* Range Rings */}
            <circle r="90" fill="none" stroke="#0ea5e9" strokeWidth="0.75" strokeOpacity="0.25" strokeDasharray="4 6" />
            <circle r="170" fill="none" stroke="#0ea5e9" strokeWidth="0.75" strokeOpacity="0.2" strokeDasharray="6 8" />
            <circle r="255" fill="none" stroke="#0ea5e9" strokeWidth="0.75" strokeOpacity="0.15" strokeDasharray="8 10" />
            <circle r="340" fill="none" stroke="#0ea5e9" strokeWidth="0.5" strokeOpacity="0.1" />

            {/* Radar Crosshairs */}
            <line x1="-360" y1="0" x2="360" y2="0" stroke="#0ea5e9" strokeWidth="0.5" strokeOpacity="0.2" strokeDasharray="3 6" />
            <line x1="0" y1="-250" x2="0" y2="250" stroke="#0ea5e9" strokeWidth="0.5" strokeOpacity="0.2" strokeDasharray="3 6" />

            {/* Radial Degree Markers */}
            <text x="96" y="-6" fill="#38bdf8" fillOpacity="0.4" fontSize="8" fontFamily="monospace">100 kVA</text>
            <text x="176" y="-6" fill="#38bdf8" fillOpacity="0.35" fontSize="8" fontFamily="monospace">250 kVA</text>
            <text x="261" y="-6" fill="#38bdf8" fillOpacity="0.3" fontSize="8" fontFamily="monospace">500 kVA</text>

            {/* Subtle Rotating Tactical Compass Ring */}
            <circle
              r="220"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="0.75"
              strokeOpacity="0.15"
              strokeDasharray="2 12"
              className="animate-[spin_90s_linear_infinite]"
            />
          </g>

          {/* BACKGROUND LAYER 3: Detailed Aerospace Hull Architecture & Section Compartments */}
          <g pointerEvents="none">
            {/* Outer Armor Bulkhead Fill */}
            <path
              d="M 110 280 L 180 55 L 770 55 L 920 280 L 770 505 L 180 505 Z"
              fill="url(#hull-grad)"
              stroke="#0ea5e9"
              strokeWidth="1.8"
              strokeOpacity="0.4"
            />

            {/* Secondary Inner Armor Lining */}
            <path
              d="M 125 280 L 190 75 L 755 75 L 895 280 L 755 485 L 190 485 Z"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="0.75"
              strokeOpacity="0.2"
              strokeDasharray="10 5"
            />

            {/* Compartment Bulkhead Ribs */}
            <line x1="250" y1="65" x2="250" y2="495" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="4 4" />
            <line x1="420" y1="65" x2="420" y2="495" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="4 4" />
            <line x1="580" y1="65" x2="580" y2="495" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="4 4" />
            <line x1="740" y1="65" x2="740" y2="495" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="4 4" />

            {/* Compartment Technical Labels */}
            <text x="140" y="475" fill="#475569" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
              SEC-01 // PROPULSION & THERMAL
            </text>
            <text x="265" y="475" fill="#475569" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
              SEC-02 // NUCLEAR POWER CORE
            </text>
            <text x="435" y="475" fill="#475569" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
              SEC-03 // MAIN DISTRIBUTION
            </text>
            <text x="595" y="475" fill="#475569" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
              SEC-04 // CREW HABITAT & ECLSS
            </text>
            <text x="755" y="475" fill="#475569" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
              SEC-05 // SENSOR RADOME
            </text>

            {/* Thruster Exhaust Bells at AFT (Left) */}
            <path d="M 110 230 L 70 215 L 70 260 L 110 250 Z" fill="#0f172a" stroke="#0ea5e9" strokeWidth="1" strokeOpacity="0.4" />
            <path d="M 110 310 L 70 300 L 70 345 L 110 330 Z" fill="#0f172a" stroke="#0ea5e9" strokeWidth="1" strokeOpacity="0.4" />
            <text x="35" y="285" fill="#0ea5e9" fillOpacity="0.5" fontSize="8" fontFamily="monospace" transform="rotate(-90 35 285)">
              EXHAUST
            </text>

            {/* Forward Sensor Array Pitot at Nose (Right) */}
            <line x1="920" y1="280" x2="965" y2="280" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.5" />
            <circle cx="965" cy="280" r="3" fill="#38bdf8" fillOpacity="0.7" />

            {/* Tactical HUD Corner Crosshairs */}
            <g stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.6">
              {/* Top-Left */}
              <path d="M 20 35 L 20 20 L 35 20" fill="none" />
              <text x="25" y="48" fill="#38bdf8" fillOpacity="0.5" fontSize="8" fontFamily="monospace">GRID: 1000x560</text>
              {/* Top-Right */}
              <path d="M 980 35 L 980 20 L 965 20" fill="none" />
              <text x="910" y="48" fill="#38bdf8" fillOpacity="0.5" fontSize="8" fontFamily="monospace">SYS-ID: AURA-88</text>
              {/* Bottom-Left */}
              <path d="M 20 525 L 20 540 L 35 540" fill="none" />
              <text x="25" y="533" fill="#38bdf8" fillOpacity="0.5" fontSize="8" fontFamily="monospace">480V TELEMETRY</text>
              {/* Bottom-Right */}
              <path d="M 980 525 L 980 540 L 965 540" fill="none" />
              <text x="895" y="533" fill="#38bdf8" fillOpacity="0.5" fontSize="8" fontFamily="monospace">STATUS: ACTIVE SCAN</text>
            </g>
          </g>

          {/* CABLE CONNECTIONS LAYER (Bus to Components) */}
          {components.map((comp) => {
            const isSelected = comp.id === selectedComponentId;
            const isHovered = comp.id === hoveredNode;
            const isConnected = comp.cableConnected;
            const isCritical = comp.status === 'CRITICAL';
            const isOvercurrent = comp.currentDraw > comp.maxCurrent;
            const isLeakage = comp.leakageCurrent > 25;

            // Wire color based on state
            let wireStroke = '#0ea5e9'; // Cyan
            let glowFilter = isSelected ? 'url(#glow-cyan)' : undefined;

            if (!isConnected) {
              wireStroke = '#ef4444'; // Red disconnected
              glowFilter = 'url(#glow-danger)';
            } else if (isCritical || isOvercurrent) {
              wireStroke = '#f43f5e'; // Rose
              glowFilter = 'url(#glow-danger)';
            } else if (comp.status === 'WARNING') {
              wireStroke = '#f59e0b'; // Amber
              glowFilter = 'url(#glow-gold)';
            }

            // Path from central bus to component
            const pathD = `M ${busCenter.x} ${busCenter.y} Q ${(busCenter.x + comp.gridX) / 2} ${(busCenter.y + comp.gridY) / 2} ${comp.gridX} ${comp.gridY}`;

            return (
              <g key={`cable-group-${comp.id}`}>
                {/* Outer Glow Halo Path */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={wireStroke}
                  strokeWidth={isSelected || isHovered ? 8 : 4}
                  strokeOpacity={isConnected ? (isSelected ? 0.35 : 0.15) : 0.1}
                  filter={glowFilter}
                />

                {/* Core Conductor Cable Path */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={wireStroke}
                  strokeWidth={isSelected || isHovered ? 3.5 : 2}
                  strokeOpacity={isConnected ? (isSelected ? 0.95 : 0.75) : 0.35}
                  strokeDasharray={isConnected ? 'none' : '5 4'}
                />

                {/* Animated Electron Energy Stream (Flowing when connected) */}
                {isConnected && comp.currentDraw > 0 && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isCritical ? '#f43f5e' : '#38bdf8'}
                    strokeWidth={isSelected ? 2.5 : 1.75}
                    strokeDasharray="6 20"
                    className="animate-[dash_1.2s_linear_infinite]"
                    style={{
                      strokeDashoffset: 100,
                      animationDuration: `${Math.max(0.4, 2.2 - (comp.currentDraw / comp.maxCurrent) * 1.8)}s`,
                    }}
                  />
                )}

                {/* Severed / Disconnected Terminal Indicator */}
                {!isConnected && (
                  <g
                    transform={`translate(${(busCenter.x * 0.45 + comp.gridX * 0.55)}, ${(busCenter.y * 0.45 + comp.gridY * 0.55)})`}
                  >
                    <circle r="12" fill="#450a0a" stroke="#ef4444" strokeWidth="1.5" className="animate-pulse" />
                    <line x1="-5" y1="-5" x2="5" y2="5" stroke="#fca5a5" strokeWidth="1.5" />
                    <line x1="5" y1="-5" x2="-5" y2="5" stroke="#fca5a5" strokeWidth="1.5" />
                  </g>
                )}

                {/* Cable Midpoint Tag */}
                <g
                  transform={`translate(${(busCenter.x * 0.35 + comp.gridX * 0.65)}, ${(busCenter.y * 0.35 + comp.gridY * 0.65)})`}
                  className="cursor-pointer transition-transform hover:scale-105"
                  onClick={() => onToggleCable(comp.id)}
                >
                  <rect
                    x="-34"
                    y="-11"
                    width="68"
                    height="22"
                    rx="5"
                    fill="#030712"
                    stroke={isConnected ? (isSelected ? '#0ea5e9' : '#334155') : '#ef4444'}
                    strokeWidth={isSelected || !isConnected ? 1.5 : 1}
                  />
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill={isConnected ? (isSelected ? '#38bdf8' : '#cbd5e1') : '#f87171'}
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {isConnected ? comp.cableId : 'UNPLUGGED'}
                  </text>
                </g>
              </g>
            );
          })}

          {/* CENTRAL POWER BUS NODE (Upgraded Distribution Core) */}
          <g transform={`translate(${busCenter.x}, ${busCenter.y})`} className="cursor-pointer">
            {/* Ambient Radial Core Glow */}
            <circle r="72" fill="url(#bus-glow)" pointerEvents="none" />

            {/* Outer Rotating Tachymeter Ring */}
            <circle
              r="54"
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="1"
              strokeOpacity="0.4"
              strokeDasharray="4 8"
              className="animate-[spin_40s_linear_infinite]"
            />

            {/* Inner Rotating Energy Segments */}
            <circle
              r="46"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeDasharray="16 12"
              className="animate-[spin_18s_linear_infinite_reverse]"
            />

            {/* Core Body Container */}
            <circle
              r="38"
              fill="#080e1a"
              stroke="#0284c7"
              strokeWidth="2"
              filter="url(#glow-cyan)"
            />

            {/* Digital Readout */}
            <text x="0" y="-12" textAnchor="middle" fill="#38bdf8" fontSize="8" fontFamily="monospace" fontWeight="bold" letterSpacing="1">
              480V DC BUS
            </text>
            <text x="0" y="5" textAnchor="middle" fill="#ffffff" fontSize="14" fontFamily="'Chakra Petch', monospace" fontWeight="bold">
              {totalBusCurrent.toFixed(1)} A
            </text>
            <text x="0" y="19" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">
              TOTAL LOAD
            </text>
          </g>

          {/* COMPONENT MACHINERY NODES (Upgraded High-Tech Module Cards) */}
          {components.map((comp) => {
            const isSelected = comp.id === selectedComponentId;
            const isHovered = comp.id === hoveredNode;
            const isDisconnected = !comp.cableConnected;
            const isCritical = comp.status === 'CRITICAL';
            const isWarning = comp.status === 'WARNING';
            const isOver = comp.currentDraw > comp.maxCurrent;

            // Status Colors
            let statusColor = '#10b981'; // emerald
            let glowFilter = undefined;
            if (isDisconnected) {
              statusColor = '#64748b'; // slate
            } else if (isCritical || isOver) {
              statusColor = '#ef4444'; // red
              glowFilter = 'url(#glow-danger)';
            } else if (isWarning) {
              statusColor = '#f59e0b'; // amber
              glowFilter = 'url(#glow-gold)';
            }

            // Category tag colors
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
                className="cursor-pointer transition-all duration-200"
                onClick={() => onSelectComponent(comp.id)}
                onMouseEnter={() => setHoveredNode(comp.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Active Selection / Hazard Ambient Rings */}
                {(isSelected || isCritical) && (
                  <circle
                    r={isSelected ? '56' : '52'}
                    fill="none"
                    stroke={isCritical ? '#ef4444' : '#38bdf8'}
                    strokeWidth={isSelected ? '2' : '1.5'}
                    strokeDasharray={isCritical ? '4 3' : 'none'}
                    className={isCritical ? 'animate-pulse' : ''}
                  />
                )}

                {/* Node Box Body */}
                <rect
                  x="-80"
                  y="-36"
                  width="160"
                  height="72"
                  rx="10"
                  fill="url(#node-glass)"
                  stroke={isSelected ? '#38bdf8' : statusColor}
                  strokeWidth={isSelected ? 2 : 1.25}
                  filter={isSelected ? 'url(#glow-cyan)' : glowFilter}
                />

                {/* Left Status Accent Bar */}
                <rect
                  x="-75"
                  y="-30"
                  width="6"
                  height="60"
                  rx="3"
                  fill={statusColor}
                />

                {/* Top Row: Category Pill & Component ID */}
                <rect
                  x="-63"
                  y="-28"
                  width="36"
                  height="12"
                  rx="3"
                  fill="#030712"
                  stroke={statusColor}
                  strokeWidth="0.7"
                />
                <text
                  x="-45"
                  y="-19"
                  textAnchor="middle"
                  fill={statusColor}
                  fontSize="7.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {getCategoryShort(comp.category)}
                </text>

                <text
                  x="-22"
                  y="-18"
                  fill="#f8fafc"
                  fontSize="11.5"
                  fontFamily="'Chakra Petch', sans-serif"
                  fontWeight="bold"
                >
                  {comp.id}
                </text>

                {/* Component Name */}
                <text
                  x="-63"
                  y="-5"
                  fill="#cbd5e1"
                  fontSize="9.5"
                  fontFamily="sans-serif"
                  fontWeight="500"
                >
                  {comp.name.length > 17 ? comp.name.slice(0, 16) + '..' : comp.name}
                </text>

                {/* Mini Load Progress Bar Track */}
                <rect
                  x="-63"
                  y="6"
                  width="132"
                  height="3"
                  rx="1.5"
                  fill="#1e293b"
                />
                <rect
                  x="-63"
                  y="6"
                  width={isDisconnected ? 0 : Math.max(4, (132 * loadPercent) / 100)}
                  height="3"
                  rx="1.5"
                  fill={isOver ? '#ef4444' : loadPercent > 75 ? '#f59e0b' : '#0ea5e9'}
                />

                {/* Bottom Row: Current Flow & Temperature Readings */}
                <g transform="translate(-63, 14)">
                  {/* Current Draw */}
                  <text
                    x="0"
                    y="13"
                    fill={isDisconnected ? '#64748b' : isOver ? '#f43f5e' : '#38bdf8'}
                    fontSize="11.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {isDisconnected ? '0.0 A' : `${comp.currentDraw.toFixed(1)} A`}
                  </text>

                  {/* Temperature */}
                  <text
                    x="75"
                    y="13"
                    fill={comp.temperature >= comp.tempMax ? '#ef4444' : comp.temperature > comp.tempThreshold ? '#f59e0b' : '#10b981'}
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="600"
                  >
                    {comp.temperature.toFixed(0)}°C
                  </text>
                </g>

                {/* Disconnected / Fault Badge */}
                {isDisconnected && (
                  <g transform="translate(62, -26)">
                    <circle r="9" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1.2" />
                    <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">
                      OFF
                    </text>
                  </g>
                )}

                {isCritical && !isDisconnected && (
                  <g transform="translate(62, -26)">
                    <circle r="9" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1.2" className="animate-ping" />
                    <circle r="9" fill="#ef4444" />
                    <text x="0" y="3.5" textAnchor="middle" fill="#ffffff" fontSize="9.5" fontWeight="bold">
                      !
                    </text>
                  </g>
                )}

                {comp.leakageCurrent > 25 && (
                  <g transform="translate(60, 20)">
                    <rect x="-17" y="-7" width="34" height="13" rx="3" fill="#3b0764" stroke="#c084fc" strokeWidth="0.8" />
                    <text x="0" y="2.5" textAnchor="middle" fill="#e9d5ff" fontSize="7.5" fontFamily="monospace">
                      {comp.leakageCurrent.toFixed(0)}mA
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Floating Quick Action Overlay */}
        <div className="absolute bottom-3 left-3 bg-slate-900/80 border border-slate-700/60 rounded-lg px-3 py-1.5 backdrop-blur text-[11px] font-mono text-slate-300 flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            Selected: <strong className="text-cyan-300">{selectedComponentId}</strong>
          </span>
          <span className="text-slate-500">|</span>
          <button
            onClick={() => onToggleCable(selectedComponentId)}
            className="hover:text-cyan-300 transition-colors underline flex items-center gap-1"
          >
            <Unplug className="w-3 h-3 text-cyan-400" />
            Toggle Cable
          </button>
        </div>
      </div>
    </div>
  );
};
