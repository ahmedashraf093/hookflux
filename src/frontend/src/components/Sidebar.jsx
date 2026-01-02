import React from 'react';
import { Activity, Terminal, Settings, LogOut, Key, Home, ChevronsLeft, ChevronsRight, BookOpen, Menu, X, AlertCircle } from 'lucide-react';

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
  onShowPublicKey,
  isMobileOpen,
  setIsMobileOpen,
  versionInfo
}) {
  const getStatusColor = (fluxId) => {
    const status = fluxStatuses[fluxId];
    if (status === 'success') return 'text-green-500';
    if (status === 'failed') return 'text-red-500';
    if (status === 'running') return 'text-blue-500 animate-pulse';
    return 'text-zinc-800';
  };

  const SidebarContent = () => (
    <>
      <div className={`p-4 flex items-center gap-3 border-b border-zinc-800 bg-zinc-900/50 transition-all ${isCollapsed ? 'justify-center' : ''}`}>
        <Activity size={20} className="text-blue-500 shrink-0" />
        {!isCollapsed && <h1 className="font-bold text-sm uppercase tracking-widest text-zinc-100">HOOK_FLUX</h1>}
        <button className="md:hidden ml-auto text-zinc-500" onClick={() => setIsMobileOpen(false)}><X size={20}/></button>
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
            onClick={() => { setActiveFlux(flux.id); setView('console'); setIsMobileOpen(false); }}
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
          onClick={() => { onNewFlux(); setIsMobileOpen(false); }}
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
          onClick={() => { setView('docs'); setIsMobileOpen(false); }}
          title={isCollapsed ? 'Documentation' : ''}
          className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-bold transition-colors ${isCollapsed ? 'justify-center' : ''} ${view === 'docs' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-200'}`}
        >
          <BookOpen size={16} /> {!isCollapsed && 'Docs'}
        </button>
        <button 
          onClick={() => { setView('home'); setIsMobileOpen(false); }}
          title={isCollapsed ? 'Home' : ''}
          className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-bold transition-colors ${isCollapsed ? 'justify-center' : ''} ${view === 'home' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-200'}`}
        >
          <Home size={16} /> {!isCollapsed && 'Home'}
        </button>
        <button 
          onClick={() => setView('modules')}
          title={isCollapsed ? 'Shell Scripts' : ''}
          className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-bold transition-colors ${isCollapsed ? 'justify-center' : ''} ${view === 'modules' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-orange-400'}`}
        >
          <Terminal size={16} className={view === 'modules' ? 'text-orange-500' : ''} /> {!isCollapsed && 'Scripts'}
        </button>
        <button 
          onClick={() => { setView('settings'); setIsMobileOpen(false); }}
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
      
      <div className="p-1 border-t border-zinc-800 hidden md:block">
        {versionInfo && (
          <div className={`px-3 py-2 text-[10px] font-bold transition-all ${isCollapsed ? 'text-center' : 'flex items-center justify-between'}`}>
            <span className="text-zinc-600 flex items-center gap-1">
              v{versionInfo.current}
              {versionInfo.error && <AlertCircle size={10} className="text-zinc-800 hover:text-zinc-500 cursor-help" title={versionInfo.error} />}
            </span>
            {!isCollapsed && versionInfo.updateAvailable && (
              <span className="bg-blue-500 text-white px-1.5 py-0.5 rounded animate-bounce shadow-lg shadow-blue-500/20 cursor-help" title={`New version available: v${versionInfo.latest}`}>
                UPDATE!
              </span>
            )}
          </div>
        )}
        <button           onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-300 transition-colors"
        >
          {isCollapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>
      </div>
    </>
  );

  return (
    <>
      <div className={`hidden md:flex transition-all duration-300 ease-in-out bg-zinc-900 border-r border-zinc-800 flex-col ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <SidebarContent />
      </div>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/80 backdrop-blur-sm">
          <div className="w-64 h-full bg-zinc-900 shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
