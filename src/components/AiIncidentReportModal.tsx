import React, { useState } from 'react';
import Markdown from 'react-markdown';
import {
  FileText,
  Copy,
  Check,
  Printer,
  X,
  RefreshCw,
  Download,
} from 'lucide-react';

interface AiIncidentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportText: string;
  isLoading: boolean;
  onRegenerateReport: () => void;
}

export const AiIncidentReportModal: React.FC<AiIncidentReportModalProps> = ({
  isOpen,
  onClose,
  reportText,
  isLoading,
  onRegenerateReport,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="incident-report-modal"
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100 font-['Chakra_Petch']">
                SPACECRAFT ELECTRICAL & COMPONENT INCIDENT REPORT
              </h3>
              <p className="text-xs text-slate-400">
                Official flight telemetry audit, electrical bus analysis, and sign-off certification.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-modal-regenerate"
              onClick={onRegenerateReport}
              disabled={isLoading}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors"
              title="Regenerate with current live telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>

            <button
              id="btn-modal-copy-report"
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'COPIED!' : 'COPY'}
            </button>

            <button
              id="btn-modal-print-report"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Printer className="w-4 h-4" />
              PRINT
            </button>

            <button
              id="btn-modal-close-report"
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto font-mono text-xs leading-relaxed text-slate-200 space-y-4 bg-slate-950/90">
          {isLoading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-sm font-semibold text-slate-200">
                Aegis AI Synthesizing Comprehensive Incident Telemetry Report...
              </p>
              <p className="text-xs text-slate-500">
                Auditing 8 machinery components, contact impedances, and dielectric breakdown vectors.
              </p>
            </div>
          ) : (
            <div className="markdown-body prose prose-invert max-w-none text-slate-200 text-xs">
              <Markdown>{reportText}</Markdown>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Security Classification: TOP SECRET // USSC FLEET OPERATIONS</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
