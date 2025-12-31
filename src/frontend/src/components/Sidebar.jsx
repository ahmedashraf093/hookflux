import React from 'react';
import { Activity, Terminal, Settings, LogOut } from 'lucide-react';

export default function Sidebar({ fluxes, activeFlux, setActiveFlux, view, setView, onLogout, onNewFlux }) {
  return (
    <div className="w-72 bg-zinc-900 border-r border-zinc-800 flex flex-col">
      <div className="p-8 flex items-center gap-4 border-b border-zinc-800 bg-zinc-900/50">
        <Activity size={24} className="text-blue-500" />
        <h1 className="font-bold text-base uppercase tracking-widest text-zinc-100">HOOK_FLUX</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2 mt-4">
        <div className="text-xs text-zinc-600 mb-4 font-bold uppercase px-4 tracking-[0.2em]">Active_Fluxes</div>
        {fluxes.map(flux => (
          <button
            key={flux.id}
            onClick={() => { setActiveFlux(flux.id); setView('console'); }}
            className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center gap-3 ${
              activeFlux === flux.id && view === 'console' 
              ? 'bg-blue-600 text-white font-bold shadow-lg' 
              : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
            }`}
          >
            <span className="opacity-50 text-xs">{activeFlux === flux.id && view === 'console' ? '●' : '○'}</span>
            <span className="truncate">{flux.name}</span>
          </button>
        ))}
        <button
          onClick={onNewFlux}
          className="w-full text-left px-4 py-3 text-xs text-zinc-500 hover:text-blue-400 transition-colors mt-6 border border-dashed border-zinc-800 uppercase font-bold tracking-widest"
        >
          + Create_Flux
        </button>
      </div>

      <div className="p-4 border-t border-zinc-800 space-y-2">
        <button 
          onClick={() => setView('modules')}
          className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors ${view === 'modules' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-200'}`}
        >
          <Terminal size={18} /> Modules
        </button>
        <button 
          onClick={() => setView('settings')}
          className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors ${view === 'settings' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-200'}`}
        >
          <Settings size={18} /> Settings
        </button>
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-900 hover:text-red-500 transition-colors mt-4">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
}
