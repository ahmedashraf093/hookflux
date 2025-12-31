import React from 'react';
import { Terminal } from 'lucide-react';

export default function LogViewer({ logs, selectedDeploymentId, logEndRef }) {
  return (
    <div className="flex-1 bg-zinc-950 p-4 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-2 border-b border-zinc-900 pb-2">
        <div className="flex items-center gap-2 text-zinc-600">
          <Terminal size={12} />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            Output_Logs {selectedDeploymentId && `[ID:${selectedDeploymentId}]`}
          </span>
        </div>
      </div>
      <div className="flex-1 bg-[#09090b] border border-zinc-800 p-4 font-mono text-[11px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
        <div className="text-zinc-400">
          {logs || 'Awaiting selection or output...'}
        </div>
        <div ref={logEndRef} />
      </div>
    </div>
  );
}
