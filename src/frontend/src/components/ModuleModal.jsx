import React, { useRef } from 'react';
import { X } from 'lucide-react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-bash';
import 'prismjs/themes/prism-tomorrow.css';

export default function ModuleModal({ module, setModule, onSave, onClose, isEdit }) {
  if (!module) return null;
  const paramInput = useRef(null);

  const addParam = (e) => {
    e.preventDefault();
    const val = paramInput.current.value.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_');
    if (!val) return;
    
    const params = Array.isArray(module.params) ? module.params : [];
    if (!params.includes(val)) {
      setModule({ ...module, params: [...params, val] });
    }
    paramInput.current.value = '';
  };

  const removeParam = (p) => {
    const params = Array.isArray(module.params) ? module.params : [];
    const newParams = params.filter(x => x !== p);
    setModule({ ...module, params: newParams });
  };

  const currentParams = Array.isArray(module.params) ? module.params : [];

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 z-50">
      <form onSubmit={onSave} className="bg-zinc-900 border border-zinc-800 p-10 w-full max-w-4xl text-zinc-300 max-h-[95vh] overflow-y-auto shadow-2xl relative">
        <div className="flex justify-between items-center mb-10 border-b border-zinc-800 pb-6 uppercase tracking-[0.2em] text-sm font-black">
          {isEdit ? 'Modify_Shell_Script' : 'New_Shell_Script'}
          <button type="button" onClick={onClose} className="text-zinc-500 hover:text-zinc-200 transition-colors"><X size={24} /></button>
        </div>
        
        <div className="grid grid-cols-2 gap-8 mb-10">
          <div className="col-span-1">
            <label className="block text-[10px] font-bold text-zinc-600 uppercase mb-2 tracking-widest text-orange-900">Script Slug_</label>
            <input disabled={isEdit} className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-4 py-3 text-sm font-mono outline-none focus:border-orange-500 transition-all" value={module.id} onChange={e => setModule({...module, id: e.target.value})} required />
          </div>
          <div className="col-span-1">
            <label className="block text-[10px] font-bold text-zinc-600 uppercase mb-2 tracking-widest text-orange-900">Display Name_</label>
            <input className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-4 py-3 text-sm outline-none focus:border-orange-500 transition-all" value={module.name} onChange={e => setModule({...module, name: e.target.value})} required />
          </div>
        </div>

        <div className="mb-10">
          <label className="block text-[10px] font-bold text-zinc-600 uppercase mb-2 tracking-widest text-orange-900">Input Parameters_</label>
          <div className="flex gap-3 mb-4">
            <input ref={paramInput} className="flex-1 bg-zinc-950 border border-zinc-800 text-zinc-200 px-4 py-2 text-sm font-mono outline-none focus:border-orange-500" placeholder="e.g. PORT" onKeyDown={e => e.key === 'Enter' && addParam(e)} />
            <button onClick={addParam} className="px-6 py-2 bg-orange-900/30 text-orange-500 border border-orange-800 hover:bg-orange-500 hover:text-black text-[10px] font-black uppercase tracking-widest transition-all">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentParams.map(p => (
              <span key={p} className="bg-orange-900/20 text-orange-400 border border-orange-800/50 px-3 py-1 text-[10px] font-bold flex items-center gap-3">
                {p} <button type="button" onClick={() => removeParam(p)} className="text-orange-600 hover:text-orange-200 font-black">×</button>
              </span>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <label className="block text-[10px] font-bold text-zinc-600 uppercase mb-2 tracking-widest text-orange-900">Execution Logic (Bash)_</label>
          <div className="bg-[#050506] border border-zinc-800 focus-within:border-orange-500 transition-all shadow-inner">
            <Editor
              value={module.content}
              onValueChange={code => setModule({...module, content: code})}
              highlight={code => highlight(code, languages.bash)}
              padding={24}
              className="font-mono text-sm min-h-[400px]"
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 13,
                backgroundColor: 'transparent',
                color: '#e4e4e7',
              }}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-500 text-white py-4 font-black uppercase text-xs tracking-[0.2em] transition-all shadow-xl">Commit_Script</button>
          <button type="button" onClick={onClose} className="flex-1 border border-zinc-800 text-zinc-500 py-4 font-bold uppercase text-xs tracking-[0.2em] hover:text-zinc-200 transition-all">Abort</button>
        </div>
      </form>
    </div>
  );
}