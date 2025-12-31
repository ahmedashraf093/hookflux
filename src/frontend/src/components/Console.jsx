import React from 'react';
import { Play } from 'lucide-react';
import DeploymentHistory from './DeploymentHistory.jsx';
import LogViewer from './LogViewer.jsx';

export default function Console({ 
  app, 
  deployments, 
  selectedDeploymentId, 
  onTriggerDeploy, 
  onSelectDeployment, 
  logs, 
  logEndRef 
}) {
  if (!app) return null;

  return (
    <>
      <div className="px-6 py-4 bg-zinc-900/50 border-b border-zinc-800 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-sm font-bold text-zinc-100">{app.name}</h2>
            <p className="text-[10px] text-zinc-500 mt-0.5 uppercase tracking-tighter">
              {app.repo} <span className="mx-1">/</span> {app.branch}
            </p>
          </div>
        </div>
        <button
          onClick={() => onTriggerDeploy(app.id)}
          className="bg-zinc-100 text-black px-4 py-1.5 hover:bg-white font-bold flex items-center gap-2 transition-all uppercase text-[10px] tracking-widest"
        >
          <Play size={12} fill="currentColor" /> Trigger_Deploy
        </button>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
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
    </>
  );
}
