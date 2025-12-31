import React from 'react';
import { Activity, Terminal, Settings, LogOut, Key, Home, ChevronsLeft, ChevronsRight, BookOpen } from 'lucide-react';

export default function Sidebar({ 
  fluxes, 
  activeFlux, 
  setActiveFlux, 
  view, 
  setView, 
  onLogout, 
  onNewFlux, 
  publicKey,
  isCollapsed,
  setIsCollapsed,
  fluxStatuses = {},
  onShowPublicKey
}) {
  const getStatusColor = (fluxId) => {
    const status = fluxStatuses[fluxId];
    if (status === 'success') return 'text-green-500';
    if (status === 'failed') return 'text-red-500';
    if (status === 'running') return 'text-blue-500 animate-pulse';
    return 'text-zinc-800';
  };

  return (
    <div className={`transition-all duration-300 ease-in-out bg-zinc-900 border-r border-zinc-800 flex flex-col ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className={`p-4 flex items-center gap-3 border-b border-zinc-800 bg-zinc-900/50 transition-all ${isCollapsed ? 'justify-center' : ''}`}>
        <Activity size={20} className="text-blue-500 shrink-0" />
        {!isCollapsed && <h1 className="font-bold text-sm uppercase tracking-widest text-zinc-100">HOOK_FLUX</h1>}
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1 mt-2 custom-scrollbar">
        {!isCollapsed && (
          <div className="text-[10px] text-zinc-600 mb-2 font-bold uppercase px-3 tracking-[0.2em]">
            Active_Fluxes
          </div>
        )}
        {fluxes.map(flux => (
          <button
            key={flux.id}
            onClick={() => { setActiveFlux(flux.id); setView('console'); }}
            title={isCollapsed ? flux.name : ''}
            className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''} ${
              activeFlux === flux.id && view === 'console' 
              ? 'bg-blue-600 text-white font-bold' 
              : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
            }`}
          >
            <span className={`text-[10px] shrink-0 ${getStatusColor(flux.id)}`}>
              ●
            </span>
            {!isCollapsed && <span className="truncate">{flux.name}</span>}
          </button>
        ))}
        <button
          onClick={onNewFlux}
          className={`w-full text-left px-3 py-2 text-[10px] text-zinc-500 hover:text-blue-400 transition-colors mt-2 border border-dashed border-zinc-800 uppercase font-bold tracking-widest ${isCollapsed ? 'justify-center' : ''}`}
        >
          {isCollapsed ? '+' : '+ Create_Flux'}
        </button>
      </div>

      <div className="p-2 border-t border-zinc-800 space-y-1">
        {publicKey && (
          <button 
            onClick={onShowPublicKey}
            title={isCollapsed ? 'System SSH Key' : ''}
            className={`w-full flex items-center gap-3 px-3 py-2 text-[10px] font-bold text-zinc-500 hover:text-blue-400 transition-colors border border-zinc-800/50 bg-black/20 uppercase tracking-widest ${isCollapsed ? 'justify-center' : ''}`}
          >
            <Key size={14} /> {!isCollapsed && 'System_Key'}
          </button>
        )}
        <button 
          onClick={() => setView('docs')}
          title={isCollapsed ? 'Documentation' : ''}
          className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-bold transition-colors ${isCollapsed ? 'justify-center' : ''} ${view === 'docs' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-200'}`}
        >
          <BookOpen size={16} /> {!isCollapsed && 'Docs'}
        </button>
        <button 
          onClick={() => setView('home')}
          title={isCollapsed ? 'Home' : ''}
          className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-bold transition-colors ${isCollapsed ? 'justify-center' : ''} ${view === 'home' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-200'}`}
        >
          <Home size={16} /> {!isCollapsed && 'Home'}
        </button>
        <button 
          onClick={() => setView('modules')}
          title={isCollapsed ? 'Modules' : ''}
          className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-bold transition-colors ${isCollapsed ? 'justify-center' : ''} ${view === 'modules' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-200'}`}
        >
          <Terminal size={16} /> {!isCollapsed && 'Modules'}
        </button>
        <button 
          onClick={() => setView('settings')}
          title={isCollapsed ? 'Settings' : ''}
          className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-bold transition-colors ${isCollapsed ? 'justify-center' : ''} ${view === 'settings' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-200'}`}
        >
          <Settings size={16} /> {!isCollapsed && 'Settings'}
        </button>
        <button 
          onClick={onLogout} 
          title={isCollapsed ? 'Logout' : ''}
          className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-red-900 hover:text-red-500 transition-colors mt-1 ${isCollapsed ? 'justify-center' : ''}`}>
          <LogOut size={16} /> {!isCollapsed && 'Logout'}
        </button>
      </div>
      
      <div className="p-1 border-t border-zinc-800">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-300 transition-colors"
        >
          {isCollapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>
      </div>
    </div>
  );
}