import React from 'react';
import { Play } from 'lucide-react';
import { toast } from 'react-hot-toast';
import DeploymentHistory from './DeploymentHistory.jsx';
import LogViewer from './LogViewer.jsx';

export default function Console({ 
  flux, 
  deployments, 
  selectedDeploymentId, 
  onTriggerDeploy, 
  onSelectDeployment, 
  logs, 
  logEndRef 
}) {
  if (!flux) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-700 uppercase tracking-widest text-xs italic">
        Loading_Flux_Configuration...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <div className="px-8 py-6 bg-zinc-900/50 border-b border-zinc-800 flex justify-between items-center text-zinc-300 shrink-0">
        <div className="flex items-center gap-10">
          <div>
            <h2 className="text-xl font-bold text-zinc-100 tracking-tight">{flux.name}</h2>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1 font-mono">
              {flux.repo} <span className="mx-2 text-zinc-800">/</span> {flux.branch}
            </p>
          </div>
          <button 
            onClick={() => {
              const url = `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':3000' : ''}/webhook/${flux.id}`;
              navigator.clipboard.writeText(url);
              toast.success('Webhook URL copied to clipboard');
            }}
            className="px-3 py-1.5 border border-zinc-800 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors text-zinc-500"
          >
            Copy_Webhook
          </button>
        </div>
        <button 
          onClick={() => onTriggerDeploy(flux.id)} 
          className="bg-zinc-100 text-black px-6 py-2.5 font-black flex items-center gap-3 uppercase text-xs tracking-[0.2em] active:scale-95 transition-all hover:bg-white shadow-xl"
        >
          <Play size={16} fill="currentColor" /> Execute_Pipeline
        </button>
      </div>
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <DeploymentHistory 
          deployments={deployments} 
          selectedDeploymentId={selectedDeploymentId} 
          onSelectDeployment={onSelectDeployment} 
        />
        <LogViewer 
          logs={logs} 
          selectedDeploymentId={selectedDeploymentId} 
          logEndRef={logEndRef} 
        />
      </div>
    </div>
  );
}