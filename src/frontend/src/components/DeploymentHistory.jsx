import React from 'react';
import { Activity } from 'lucide-react';

export default function DeploymentHistory({ deployments, selectedDeploymentId, onSelectDeployment }) {
  return (
    <div className="w-72 bg-zinc-950 border-r border-zinc-800 flex flex-col">
      <div className="p-3 border-b border-zinc-800 bg-zinc-900/20">
        <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-600 flex items-center gap-2">
          <Activity size={10} /> History
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        {deployments.length === 0 ? (
          <div className="p-8 text-center text-zinc-700 italic text-[10px]">No logs found</div>
        ) : (
          deployments.map(d => (
            <button
              key={d.id}
              onClick={() => onSelectDeployment(d.id)}
              className={`w-full text-left p-3 border-b border-zinc-900 transition-all group ${
                selectedDeploymentId === d.id 
                ? 'bg-zinc-900 text-blue-400' 
                : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-bold"># {d.id}</span>
                <span className={`text-[8px] font-black px-1 ${
                  d.status === 'success' ? 'text-green-500' : 
                  d.status === 'failed' ? 'text-red-500' : 
                  'text-blue-500 animate-pulse'
                }`}>
                  {d.status.toUpperCase()}
                </span>
              </div>
              <div className="text-[9px] opacity-50 font-mono">
                {new Date(d.start_time).toISOString().replace('T', ' ').split('.')[0]}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
