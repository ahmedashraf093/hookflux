import React from 'react';
import { X, Copy, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function PublicKeyModal({ isOpen, onClose, publicKey }) {
// ...
  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicKey);
    setCopied(true);
    toast.success('Public key copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-[60]">
      <div className="bg-zinc-900 border border-zinc-800 p-10 w-full max-w-2xl shadow-2xl relative">
        <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-6">
          <div className="flex items-center gap-3 text-blue-500">
            <Key size={24} />
            <h3 className="text-sm font-black uppercase tracking-[0.2em]">System_SSH_Public_Key</h3>
          </div>
          <button type="button" onClick={onClose} className="text-zinc-500 hover:text-zinc-200 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-950 border border-zinc-800 p-6">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-3 underline decoration-blue-500/50 underline-offset-4">What is this key?</h4>
            <p className="text-xs leading-relaxed text-zinc-500">
              This is the unique identity of your HookFlux instance. To allow HookFlux to execute pipelines on a remote machine, you must add this key to that machine's authorized list.
            </p>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-600 uppercase mb-2 tracking-widest">Public Key Content_</label>
            <textarea
              readOnly
              className="w-full h-32 bg-black border border-zinc-800 text-zinc-400 p-4 text-[10px] font-mono outline-none focus:border-blue-500/50 resize-none leading-relaxed"
              value={publicKey}
            />
          </div>

          <div className="bg-blue-900/5 border border-blue-900/20 p-4">
            <h5 className="text-[9px] font-black text-blue-400 uppercase mb-2 tracking-widest">Quick Setup:</h5>
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              1. Copy this key.<br />
              2. Log into your target server.<br />
              3. Paste it into <code className="bg-zinc-950 px-1 text-zinc-300">~/.ssh/authorized_keys</code>.
            </p>
          </div>
        </div>

        <div className="mt-10 flex gap-4">
          <button 
            onClick={copyToClipboard}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-4 font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-3"
          >
            <Copy size={16} /> Copy_Public_Key
          </button>
          <button 
            onClick={onClose}
            className="flex-1 border border-zinc-800 text-zinc-500 py-4 font-bold uppercase text-xs tracking-[0.2em] hover:text-zinc-200 transition-all"
          >
            Close_Terminal
          </button>
        </div>
      </div>
    </div>
  );
}
