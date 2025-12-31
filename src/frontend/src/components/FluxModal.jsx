import React, { useState } from 'react';
import { X, Settings, Trash2 } from 'lucide-react';

export default function FluxModal({ flux, setFlux, onSave, onClose, isEdit, modules }) {
  if (!flux) return null;
  const [editingStepIndex, setEditingStepIndex] = useState(null);
  const [showModuleSelector, setShowModuleSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  let flowSteps = [];
  try {
    flowSteps = JSON.parse(flux.flow_config || '[]');
    if (!Array.isArray(flowSteps)) flowSteps = [];
  } catch (e) {
    flowSteps = [];
  }

  const addFlowStep = (moduleId) => {
    const mod = modules.find(m => m.id === moduleId);
    if (!mod) return;

    const params = Array.isArray(mod.params) ? mod.params : [];

    const newStep = {
      id: Math.random().toString(36).substr(2, 9),
      template_id: moduleId,
      params: params.reduce((acc, p) => ({ ...acc, [p]: '' }), {})
    };
    const updatedFlow = [...flowSteps, newStep];
    setFlux({ ...flux, flow_config: JSON.stringify(updatedFlow) });
    setEditingStepIndex(updatedFlow.length - 1);
  };

  const removeFlowStep = (index) => {
    const newFlow = [...flowSteps];
    newFlow.splice(index, 1);
    setFlux({ ...flux, flow_config: JSON.stringify(newFlow) });
  };

  const updateStepParam = (index, key, val) => {
    const newFlow = [...flowSteps];
    newFlow[index].params[key] = val;
    setFlux({ ...flux, flow_config: JSON.stringify(newFlow) });
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 z-50">
      <form onSubmit={onSave} className="bg-zinc-900 border border-zinc-800 p-10 w-full max-w-3xl text-zinc-300 max-h-[90vh] overflow-y-auto relative shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="flex justify-between items-center mb-10 border-b border-zinc-800 pb-6 uppercase tracking-[0.2em] text-sm font-black">
          {isEdit ? 'Modify_Flux_Pipeline' : 'Initialize_New_Flux'}
          <button type="button" onClick={onClose} className="text-zinc-500 hover:text-zinc-200 transition-colors"><X size={24} /></button>
        </div>
        
        <div className="grid grid-cols-2 gap-8 mb-12">
          <div className="col-span-1">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-2 tracking-widest text-zinc-600">Flux ID (Slug)_</label>
            <input disabled={isEdit} className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-4 py-3 text-sm outline-none focus:border-blue-500 transition-all" value={flux.id} onChange={e => setFlux({...flux, id: e.target.value})} required />
          </div>
          <div className="col-span-1">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-2 tracking-widest text-zinc-600">Display Name_</label>
            <input className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-4 py-3 text-sm outline-none focus:border-blue-500 transition-all" value={flux.name} onChange={e => setFlux({...flux, name: e.target.value})} required />
          </div>
          <div className="col-span-1">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-2 tracking-widest text-zinc-600">GitHub Repository_</label>
            <input className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-4 py-3 text-sm outline-none focus:border-blue-500 transition-all" value={flux.repo} onChange={e => setFlux({...flux, repo: e.target.value})} required />
          </div>
          <div className="col-span-1">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-2 tracking-widest text-zinc-600">Target Branch_</label>
            <input className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-4 py-3 text-sm outline-none focus:border-blue-500 transition-all" value={flux.branch} onChange={e => setFlux({...flux, branch: e.target.value})} required />
          </div>
          <div className="col-span-2">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-2 tracking-widest text-zinc-600">Working Directory_</label>
            <input className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-4 py-3 text-sm outline-none focus:border-blue-500 transition-all" value={flux.cwd} onChange={e => setFlux({...flux, cwd: e.target.value})} required />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center mb-4 border-b border-zinc-800/50 pb-2">
            <label className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.3em]">Pipeline_Steps</label>
            <button 
              type="button"
              onClick={() => setShowModuleSelector(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] px-4 py-1.5 transition-all font-black uppercase tracking-widest shadow-lg"
            >
              + Insert_Module
            </button>
          </div>
          
          <div className="space-y-3">
            {flowSteps.map((step, idx) => {
              const mod = modules.find(m => m.id === step.template_id);
              const paramKeys = Object.keys(step.params || {});
              const missingParams = paramKeys.filter(k => !step.params[k] || step.params[k].trim() === '');
              const isComplete = missingParams.length === 0;

              return (
                <div key={step.id} className={`flex flex-col bg-zinc-950 border ${isComplete ? 'border-zinc-800' : 'border-red-900/50'} p-5 group hover:border-blue-900/50 transition-all shadow-inner`}>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-black text-zinc-800 w-6">{idx + 1}.</span>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-zinc-200 tracking-tight flex items-center gap-2">
                        {mod?.name || 'Unknown_Module'}
                        {!isComplete && (
                          <span className="text-[8px] bg-red-900/20 text-red-500 border border-red-900/50 px-1.5 py-0.5 font-black uppercase tracking-tighter animate-pulse">
                            Incomplete_Config
                          </span>
                        )}
                      </div>
                      <div className="text-[9px] text-zinc-600 uppercase font-mono tracking-widest">{step.template_id}</div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setEditingStepIndex(idx)} title="Configure Step" className={`p-2 border transition-colors ${isComplete ? 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-blue-400' : 'bg-red-950/10 border-red-900/30 text-red-400 hover:bg-red-900 hover:text-white'}`}>
                        <Settings size={18} />
                      </button>
                      <button type="button" onClick={() => removeFlowStep(idx)} title="Delete Step" className="p-2 bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  
                  {paramKeys.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-zinc-900/50 grid grid-cols-2 gap-x-4 gap-y-1">
                      {paramKeys.map(k => (
                        <div key={k} className="flex items-center justify-between text-[9px] font-mono">
                          <span className="text-zinc-700 uppercase">{k}:</span>
                          <span className={`truncate max-w-[150px] ${step.params[k] ? 'text-zinc-500' : 'text-red-900 italic'}`}>
                            {step.params[k] || 'MISSING'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {flowSteps.length === 0 && (
              <div className="text-center py-16 border border-dashed border-zinc-800 text-[10px] text-zinc-700 uppercase tracking-[0.4em] font-bold">
                Buffer_Empty // Define pipeline tasks
              </div>
            )}
          </div>
        </div>

        {editingStepIndex !== null && (
          <div className="absolute inset-0 bg-zinc-950 z-10 p-12 flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-10 border-b border-zinc-800 pb-6">
              <div>
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500 mb-1">Step_Config</h4>
                <p className="text-lg font-bold text-zinc-100 uppercase">{editingStepIndex + 1}: {modules.find(m => m.id === flowSteps[editingStepIndex].template_id)?.name}</p>
              </div>
              <button type="button" onClick={() => setEditingStepIndex(null)} className="text-zinc-500 hover:text-zinc-200 transition-colors bg-zinc-900 p-2 border border-zinc-800"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-10 pr-4">
              {Object.keys(flowSteps[editingStepIndex].params).map(p => (
                <div key={p}>
                  <label className="block text-[10px] font-bold text-zinc-600 uppercase mb-2 tracking-widest">{p}_</label>
                  <input className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 px-5 py-4 text-sm font-mono outline-none focus:border-blue-500 transition-all shadow-inner" value={flowSteps[editingStepIndex].params[p]} onChange={e => updateStepParam(editingStepIndex, p, e.target.value)} required />
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setEditingStepIndex(null)} className="mt-10 bg-blue-600 hover:bg-blue-500 text-white py-4 font-black uppercase text-xs tracking-[0.3em] transition-all shadow-2xl">Apply_Config</button>
          </div>
        )}

        {/* Module Selector Overlay */}
        {showModuleSelector && (
          <div className="absolute inset-0 bg-zinc-950 z-20 p-12 flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-10 border-b border-zinc-800 pb-6">
              <div>
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500 mb-1">Module_Library</h4>
                <p className="text-lg font-bold text-zinc-100 uppercase tracking-tight">Select module to insert</p>
              </div>
              <button type="button" onClick={() => setShowModuleSelector(false)} className="text-zinc-500 hover:text-zinc-200 transition-colors bg-zinc-900 p-2 border border-zinc-800"><X size={24} /></button>
            </div>
            
            <input 
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 px-6 py-4 text-sm font-mono outline-none focus:border-blue-500 transition-all mb-8" 
              placeholder="Search modules..." 
              autoFocus
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />

            <div className="flex-1 overflow-y-auto grid grid-cols-1 gap-3 pr-4">
              {modules.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.id.toLowerCase().includes(searchTerm.toLowerCase())).map(m => (
                <button key={m.id} type="button" onClick={() => { addFlowStep(m.id); setShowModuleSelector(false); setSearchTerm(''); }} className="text-left bg-zinc-900 border border-zinc-800 p-6 hover:border-blue-600 transition-all group relative overflow-hidden">
                  <div className="flex justify-between items-center relative z-10">
                    <div>
                      <div className="font-black text-zinc-100 uppercase group-hover:text-blue-400 transition-colors">{m.name}</div>
                      <div className="text-[10px] text-zinc-600 font-mono mt-1">{m.id}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 relative z-10">
                    {m.params && (Array.isArray(m.params) ? m.params : []).map(p => (
                      <span key={p} className="text-[8px] font-black bg-zinc-950 px-2 py-0.5 text-zinc-500 border border-zinc-800 uppercase tracking-tighter">{p}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
            
            <button type="button" onClick={() => setShowModuleSelector(false)} className="mt-10 border border-zinc-800 text-zinc-500 py-4 font-black uppercase text-xs tracking-[0.3em] hover:bg-zinc-900 transition-all shadow-2xl">Cancel</button>
          </div>
        )}

        <div className="mt-16 pt-8 border-t border-zinc-800 flex gap-4">
          <button type="submit" className="flex-1 bg-zinc-100 text-black py-4 font-black uppercase text-xs tracking-[0.2em] hover:bg-white transition-all shadow-xl">Commit_Flux</button>
          <button type="button" onClick={onClose} className="flex-1 border border-zinc-800 text-zinc-500 py-4 font-bold uppercase text-xs tracking-[0.2em] hover:text-zinc-200 transition-all">Abort</button>
        </div>
      </form>
    </div>
  );
}