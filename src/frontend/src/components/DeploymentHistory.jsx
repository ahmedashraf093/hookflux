import React from 'react';
import { Activity } from 'lucide-react';

export default function DeploymentHistory({ deployments, selectedDeploymentId, onSelectDeployment }) {
  return (
    <div className="w-80 bg-zinc-950 border-r border-zinc-800 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/20 text-xs font-bold uppercase tracking-[0.2em] text-zinc-600 flex items-center gap-3 shrink-0">
        <Activity size={14} /> History_Log
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {deployments.length === 0 ? (
          <div className="p-12 text-center text-zinc-700 italic text-sm">No deployment records</div>
        ) : (
          deployments.map(d => (
            <button
              key={d.id}
              onClick={() => onSelectDeployment(d.id)}
              className={`w-full text-left p-5 border-b border-zinc-900 transition-all ${
                selectedDeploymentId === d.id ? 'bg-zinc-900 border-l-4 border-l-blue-500 text-blue-400' : 'text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-300'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-bold font-mono">TASK_#{d.id}</span>
                <span className={`text-[10px] font-black px-2 py-0.5 border ${
                  d.status === 'success' ? 'border-green-500 text-green-500' : 
                  d.status === 'failed' ? 'border-red-500 text-red-500' : 
                  'border-blue-500 text-blue-500 animate-pulse'
                }`}>
                  {d.status.toUpperCase()}
                </span>
              </div>
              <div className="text-xs opacity-50 font-mono">
                {new Date(d.start_time).toLocaleString()}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}