import React from 'react';
import { Network, Terminal, Settings, ArrowRight } from 'lucide-react';

export default function HomeDashboard({ fluxes, modules, deployments, setView, setActiveFlux }) {
  const totalDeployments = deployments.length;
  const recentDeployments = deployments.slice(0, 5);
  const successCount = deployments.filter(d => d.status === 'success').length;
  const failedCount = deployments.filter(d => d.status === 'failed').length;

  return (
    <div className="p-12 max-w-6xl mx-auto w-full overflow-y-auto custom-scrollbar">
      <div className="mb-12">
        <h1 className="text-3xl font-black tracking-tighter text-zinc-100">Welcome to HookFlux</h1>
        <p className="text-base text-zinc-500 mt-2">Your self-hosted automation engine is running.</p>
      </div>

      <div className="grid grid-cols-3 gap-8 mb-12">
        <div className="bg-zinc-900 border border-zinc-800 p-6 shadow-2xl">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-600 mb-4 flex items-center gap-3"><Network size={16}/> System Status</h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-zinc-950/50 p-4 border border-zinc-800/50">
              <div className="text-3xl font-mono font-black text-blue-500">{fluxes.length}</div>
              <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest mt-1">Fluxes</div>
            </div>
            <div className="bg-zinc-950/50 p-4 border border-zinc-800/50">
              <div className="text-3xl font-mono font-black text-blue-500">{modules.length}</div>
              <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest mt-1">Modules</div>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 shadow-2xl col-span-2">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-600 mb-4 flex items-center gap-3"><Terminal size={16} /> Recent Activity</h3>
          <div className="space-y-2">
            {recentDeployments.length > 0 ? recentDeployments.map(d => (
              <div key={d.id} className="flex justify-between items-center bg-zinc-950/50 p-3 border border-zinc-800/50 text-xs">
                <span className="font-mono text-zinc-500">TASK_#{d.id}</span>
                <span className={`font-mono text-[10px] font-black ${d.status === 'success' ? 'text-green-500' : 'text-red-500'}`}>{d.status.toUpperCase()}</span>
              </div>
            )) : <div className="text-center py-6 text-zinc-800 text-xs uppercase font-bold tracking-widest">No deployments recorded</div>}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-black tracking-tight text-zinc-300 mb-6 flex items-center gap-3"><Settings size={20} className="text-blue-500"/> Get Started in 3 Steps</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900 border border-zinc-800/50 p-6 flex flex-col justify-between">
            <div>
              <div className="text-blue-500 font-black text-2xl mb-4">1.</div>
              <h4 className="font-bold text-zinc-100 mb-2">Create a Module</h4>
              <p className="text-xs text-zinc-500">Define a reusable script in the **Modules** section. Use <code className="text-blue-400 bg-zinc-950 p-1 rounded-sm text-[10px]">{`{{PLACEHOLDERS}}`}</code> for dynamic variables.</p>
            </div>
            <button onClick={() => setView('modules')} className="mt-6 w-full text-center py-2 text-[10px] font-bold uppercase tracking-widest bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors text-zinc-300">
              Go to Modules <ArrowRight className="inline-block w-3 h-3 ml-1" />
            </button>
          </div>
          <div className="bg-zinc-900 border border-zinc-800/50 p-6 flex flex-col justify-between">
            <div>
              <div className="text-blue-500 font-black text-2xl mb-4">2.</div>
              <h4 className="font-bold text-zinc-100 mb-2">Build a Flux Pipeline</h4>
              <p className="text-xs text-zinc-500">Go to **Settings**, create a new Flux, and chain your modules together in the order you need.</p>
            </div>
            <button onClick={() => setView('settings')} className="mt-6 w-full text-center py-2 text-[10px] font-bold uppercase tracking-widest bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors text-zinc-300">
              Manage Fluxes <ArrowRight className="inline-block w-3 h-3 ml-1" />
            </button>
          </div>
          <div className="bg-zinc-900 border border-zinc-800/50 p-6 flex flex-col justify-between">
            <div>
              <div className="text-blue-500 font-black text-2xl mb-4">3.</div>
              <h4 className="font-bold text-zinc-100 mb-2">Trigger your Flux</h4>
              <p className="text-xs text-zinc-500">Copy the unique webhook URL and add it to your GitHub repository or trigger it manually from the console.</p>
            </div>
            <button onClick={() => { if (fluxes.length > 0) { setActiveFlux(fluxes[0].id); setView('console'); } else { setView('settings'); } }} className="mt-6 w-full text-center py-2 text-[10px] font-bold uppercase tracking-widest bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors text-zinc-300">
              View Console <ArrowRight className="inline-block w-3 h-3 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}