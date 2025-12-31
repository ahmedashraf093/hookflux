import React from 'react';
import { Activity, Settings, LogOut } from 'lucide-react';

export default function Sidebar({ apps, activeApp, setActiveApp, view, setView, onLogout, onNewApp }) {
  return (
    <div className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
      <div className="p-6 flex items-center gap-3 border-b border-zinc-800 bg-zinc-900/50">
        <Activity size={18} className="text-blue-500" />
        <h1 className="font-bold text-sm uppercase tracking-wider text-zinc-100">SWARM_DEPLOYER</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1 mt-2">
        <div className="text-[10px] text-zinc-600 mb-2 font-bold uppercase px-3 tracking-widest">Applications</div>
        {apps.map(app => (
          <button
            key={app.id}
            onClick={() => { setActiveApp(app.id); setView('console'); }}
            className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center gap-2 group ${
              activeApp === app.id && view === 'console' 
              ? 'bg-blue-600 text-white font-bold' 
              : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
            }`}
          >
            <span className="opacity-50">{activeApp === app.id && view === 'console' ? '●' : '○'}</span>
            <span className="truncate">{app.name}</span>
          </button>
        ))}
        <button
          onClick={onNewApp}
          className="w-full text-left px-3 py-2 text-xs text-zinc-600 hover:text-blue-400 transition-colors mt-4 border border-dashed border-zinc-800 mx-auto"
        >
          {`+ Register_App`}
        </button>
      </div>

      <div className="p-2 border-t border-zinc-800 space-y-1">
        <button 
          onClick={() => setView('settings')}
          className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${view === 'settings' ? 'bg-zinc-800 text-white border border-zinc-700' : 'text-zinc-500 hover:text-zinc-200'}`}
        >
          <Settings size={14} /> Settings
        </button>
        <button onClick={onLogout} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-900 hover:text-red-500 hover:bg-red-950/10 transition-colors">
          <LogOut size={14} /> Logout
        </button>
      </div>
    </div>
  );
}
