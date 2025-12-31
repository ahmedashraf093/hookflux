import React from 'react';
import { Terminal, Settings, Trash2 } from 'lucide-react';

export default function ModuleManager({ modules, onEdit, onDelete, onNew }) {
  return (
    <div className="p-12 max-w-6xl mx-auto w-full overflow-y-auto">
      <div className="flex justify-between items-center mb-12 border-b border-zinc-800 pb-6">
        <h2 className="text-2xl font-bold flex items-center gap-4 text-zinc-100 uppercase tracking-widest">
          <Terminal className="text-blue-500" size={28} /> Pipeline_Modules
        </h2>
        <button 
          onClick={onNew} 
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl"
        >
          + Create_Module
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map(mod => (
          <div key={mod.id} className="bg-zinc-900 border border-zinc-800 p-6 group hover:border-blue-900/50 transition-colors shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-bold text-lg text-zinc-100 tracking-tight">{mod.name}</h3>
                <p className="text-[10px] text-zinc-600 font-mono mt-1 uppercase tracking-tighter">ID: {mod.id}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => onEdit(mod)} className="p-2 bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-blue-400 transition-colors"><Settings size={18} /></button>
                <button onClick={() => onDelete(mod.id)} className="p-2 bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-red-400 transition-colors"><Trash2 size={18} /></button>
              </div>
            </div>
            <div className="mb-6">
              <span className="text-[9px] font-black uppercase text-zinc-700 tracking-widest block mb-2">Parameters:</span>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(mod.params) && mod.params.map(p => (
                  <span key={p} className="bg-zinc-950 border border-zinc-800 px-2 py-0.5 text-[9px] font-mono text-zinc-500">{p}</span>
                ))}
                {(!mod.params || (Array.isArray(mod.params) && mod.params.length === 0)) && <span className="text-[9px] text-zinc-800 italic uppercase">None</span>}
              </div>
            </div>
            <div className="bg-[#050506] p-4 rounded border border-zinc-800/50 text-xs text-zinc-600 font-mono line-clamp-2 overflow-hidden italic leading-relaxed">
              {mod.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}