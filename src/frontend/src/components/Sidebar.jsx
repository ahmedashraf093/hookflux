import React from 'react';
import { Activity, Terminal, Settings, LogOut, Key } from 'lucide-react';

export default function Sidebar({ fluxes, activeFlux, setActiveFlux, view, setView, onLogout, onNewFlux, publicKey }) {
  const copyKey = () => {
    navigator.clipboard.writeText(publicKey);
    alert('Public key copied to clipboard');
  };

  return (
    <div className="w-72 bg-zinc-900 border-r border-zinc-800 flex flex-col">
// ...
      <div className="p-4 border-t border-zinc-800 space-y-2">
        {publicKey && (
          <button 
            onClick={copyKey}
            className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold text-zinc-500 hover:text-blue-400 transition-colors border border-zinc-800/50 bg-black/20 uppercase tracking-widest"
          >
            <Key size={14} /> Copy_System_Key
          </button>
        )}
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
