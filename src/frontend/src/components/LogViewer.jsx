import React from 'react';
import { Terminal } from 'lucide-react';
import Ansi from 'ansi-to-react';

export default function LogViewer({ logs, selectedDeploymentId, logEndRef }) {
  return (
    <div className="flex-1 bg-zinc-950 p-4 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-3 border-b border-zinc-900 pb-3 text-zinc-600 text-[10px] font-bold uppercase tracking-[0.3em] shrink-0">
        <div className="flex items-center gap-3">
          <Terminal size={14} /> 
          <span>Tty_Output {selectedDeploymentId && `// Stream_Id:${selectedDeploymentId}`}</span>
        </div>
        <div className="flex gap-4 opacity-50">
          <span>8-Bit</span>
          <span>Utf-8</span>
        </div>
      </div>
      <div className="flex-1 bg-[#020203] border border-zinc-900 p-4 font-mono text-[12px] overflow-y-auto custom-scrollbar whitespace-pre-wrap leading-tight text-zinc-400">
        {logs ? (
          <div className="space-y-0.5">
            <Ansi linkify={false}>{logs}</Ansi>
            <div ref={logEndRef} className="h-4" />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-zinc-800 italic uppercase tracking-widest text-[10px]">
            Awaiting_Pipeline_Data...
          </div>
        )}
      </div>
    </div>
  );
}