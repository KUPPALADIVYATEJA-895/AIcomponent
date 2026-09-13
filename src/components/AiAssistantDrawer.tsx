import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { SpacecraftComponent } from '../types';
import {
  Send,
  X,
  Bot,
  User,
  Sparkles,
  Zap,
  Flame,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Radio,
  RotateCcw,
  ChevronLeft,
  ChevronDown,
} from 'lucide-react';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  components: SpacecraftComponent[];
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  components,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: '### 🛡️ Aegis Telemetry & Diagnostic AI Online\nI am continuously monitoring real-time cable connections, current flow, thermal dissipation, chassis leakage, and short-circuit risk indices across all 8 spacecraft machinery modules.\n\nSelect an inquiry from the **Recommended Inquiries** below or tap any component to diagnose its status.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedComponentId, setSelectedComponentId] = useState<string>('');

  const [isOptionsCollapsed, setIsOptionsCollapsed] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'ai',
        text: '### 🛡️ Aegis Telemetry & Diagnostic AI Online\nI am continuously monitoring real-time cable connections, current flow, thermal dissipation, chassis leakage, and short-circuit risk indices across all 8 spacecraft machinery modules.\n\nSelect an inquiry from the **Recommended Inquiries** below or tap any component to diagnose its status.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setSelectedComponentId('');
    setInput('');
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          systemState: {
            components: components.map((c) => ({
              id: c.id,
              name: c.name,
              currentDraw: c.currentDraw,
              nominalCurrent: c.nominalCurrent,
              maxCurrent: c.maxCurrent,
              temperature: c.temperature,
              cableConnected: c.cableConnected,
              leakageCurrent: c.leakageCurrent,
              shortCircuitRisk: c.shortCircuitRisk,
              status: c.status,
            })),
          },
        }),
      });

      const data = await res.json();
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.reply || 'Analysis completed.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: '⚠️ Telemetry link interrupted. Re-establishing secure datalink with the onboard primary avionics bus.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckParticularComponent = (comp: SpacecraftComponent) => {
    setSelectedComponentId(comp.id);
    handleSend(`Is there any fault occurring in ${comp.name} (${comp.id})?`);
  };

  const recommendationOptions = [
    {
      id: 'opt-power',
      label: 'Top Power Consumer',
      query: 'Which component consumes more power in the spacecraft grid?',
      icon: Zap,
      desc: 'Rank machinery current draw',
      border: 'hover:border-cyan-500/70',
      badge: 'Current Load',
    },
    {
      id: 'opt-leakage',
      label: 'Current Leakage Check',
      query: 'Which component has current leakage escaping to the chassis ground?',
      icon: Radio,
      desc: 'Chassis ground faults & mA',
      border: 'hover:border-amber-500/70',
      badge: 'Ground Faults',
    },
    {
      id: 'opt-temp',
      label: 'High Temperature Monitor',
      query: 'Which component has high temperature or thermal runaway risk?',
      icon: Flame,
      desc: 'Overheat & coolant check',
      border: 'hover:border-orange-500/70',
      badge: 'Thermal Risk',
    },
    {
      id: 'opt-faults-list',
      label: 'Faults & Risks List',
      query: 'List of faults and risks in the spacecraft components',
      icon: ShieldAlert,
      desc: 'Full anomaly audit report',
      border: 'hover:border-rose-500/70',
      badge: 'Fault Manifest',
    },
  ];

  return (
    <div
      id="ai-assistant-drawer-container"
      className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-slate-900 border-l border-slate-700/80 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 font-sans"
    >
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100 font-['Chakra_Petch'] tracking-wide">
                AEGIS DIAGNOSTIC AI
              </h3>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
                ACTIVE TELEMETRY
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Orbital telemetry engineering assistant & fault analysis console
            </p>
          </div>
        </div>

        {/* Action Controls: Refresh / New Chat and Close */}
        <div className="flex items-center gap-1.5">
          {/* Refresh Option: Clears previous chat and starts fresh */}
          <button
            id="btn-refresh-ai-chat"
            onClick={handleResetChat}
            title="Start new chat (clears all previous messages)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700/80 hover:border-cyan-500/50 transition-all shadow-sm group"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400 group-hover:-rotate-90 transition-transform duration-200" />
            <span>New Chat</span>
          </button>

          {/* Close Drawer */}
          <button
            id="btn-close-ai-chat"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            title="Close Assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Recommendations & Component Audit Section */}
      <div className="border-b border-slate-800/90 bg-slate-950/90 shrink-0 transition-all">
        {/* Section Header with Small Arrow Toggle (<) */}
        <div className="px-3 py-2 flex items-center justify-between bg-slate-950">
          <button
            id="btn-toggle-options-collapse"
            onClick={() => setIsOptionsCollapsed((prev) => !prev)}
            className="flex items-center gap-2 group text-left focus:outline-none"
            title={isOptionsCollapsed ? 'Expand diagnostic options' : 'Collapse diagnostic options'}
          >
            <div className="w-5 h-5 rounded flex items-center justify-center bg-slate-900 border border-slate-700/80 text-cyan-400 group-hover:border-cyan-500 group-hover:bg-slate-800 transition-all shadow-sm">
              <ChevronLeft
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isOptionsCollapsed ? '-rotate-90' : 'rotate-0'
                }`}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Diagnostic Options
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {isOptionsCollapsed ? '(tap < to expand)' : '(inquiries & components)'}
              </span>
            </div>
          </button>

          <span className="text-[10px] font-mono text-slate-500">
            {isOptionsCollapsed ? `${components.length} modules` : 'Tap to diagnose'}
          </span>
        </div>

        {/* Expandable / Collapsible Options Content */}
        {!isOptionsCollapsed && (
          <div className="p-3 pt-0 space-y-3">
            <div>
              {/* 4 Core Inquiries */}
              <div className="grid grid-cols-2 gap-1.5">
                {recommendationOptions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      id={opt.id}
                      onClick={() => handleSend(opt.query)}
                      disabled={isLoading}
                      className={`p-2 rounded-lg bg-slate-900/90 border border-slate-800/90 ${opt.border} text-left transition-all group relative overflow-hidden flex flex-col justify-between`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="p-1 rounded bg-slate-800 text-cyan-400 group-hover:text-cyan-300 transition-colors">
                          <Icon className="w-3.5 h-3.5" />
                        </span>
                        <span className="text-[9px] font-mono text-slate-500 group-hover:text-slate-400">
                          {opt.badge}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 leading-tight">
                        {opt.label}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">
                        {opt.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Particular Component Selector */}
            <div className="pt-2 border-t border-slate-800/70">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  Check Particular Component
                </span>
                <span className="text-[10px] font-mono text-slate-500">Tap to audit module</span>
              </div>

              <div className="grid grid-cols-4 gap-1">
                {components.map((c) => {
                  const hasFault =
                    !c.cableConnected ||
                    c.currentDraw > c.maxCurrent ||
                    c.temperature > c.tempThreshold ||
                    c.leakageCurrent > 20 ||
                    c.shortCircuitRisk >= 60;

                  return (
                    <button
                      key={c.id}
                      id={`btn-check-comp-${c.id}`}
                      onClick={() => handleCheckParticularComponent(c)}
                      disabled={isLoading}
                      title={`Click to check ${c.name} for faults`}
                      className={`p-1.5 rounded text-left border transition-all ${
                        selectedComponentId === c.id
                          ? 'bg-cyan-950 border-cyan-500 text-cyan-200 ring-1 ring-cyan-500/50'
                          : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-mono font-bold">{c.id}</span>
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            hasFault ? 'bg-rose-500 animate-pulse' : 'bg-emerald-400'
                          }`}
                        />
                      </div>
                      <div className="text-[9px] truncate text-slate-400 leading-tight mt-0.5">
                        {c.name.split(' ')[0]}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/60 font-sans">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                m.sender === 'user'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950'
                  : 'bg-slate-800 border border-cyan-500/30 text-cyan-400'
              }`}
            >
              {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`p-3.5 rounded-xl max-w-[88%] text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-cyan-950/80 border border-cyan-700/80 text-cyan-100 shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 shadow-md'
              }`}
            >
              {m.sender === 'user' ? (
                <p className="whitespace-pre-wrap font-medium">{m.text}</p>
              ) : (
                <div className="space-y-2 prose-invert text-slate-200 [&_h3]:text-xs [&_h3]:font-bold [&_h3]:text-cyan-300 [&_h3]:mb-1 [&_p]:mb-1.5 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_strong]:text-cyan-200 [&_strong]:font-semibold [&_li]:text-slate-300">
                  <Markdown>{m.text}</Markdown>
                </div>
              )}
              <span className="text-[9px] font-mono text-slate-500 block text-right mt-1.5 pt-1 border-t border-slate-800/60">
                {m.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 p-2.5 bg-slate-900/80 rounded-lg border border-cyan-900/50">
            <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
            <span>AI Flight Engineer evaluating component telemetry & physics models...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="p-3 border-t border-slate-800 bg-slate-950 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            id="input-engineer-chat"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI about cables, leakage, temperatures, or components..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
          />
          <button
            id="btn-send-engineer-chat"
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white rounded-lg transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

