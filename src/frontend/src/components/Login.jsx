import React from 'react';
import { Shield, Lock } from 'lucide-react';

export default function Login({ password, setPassword, onLogin }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 font-mono">
      <form onSubmit={onLogin} className="bg-zinc-900 p-8 border border-zinc-800 w-96 text-zinc-200">
        <div className="flex items-center gap-2 mb-8 border-b border-zinc-800 pb-4">
          <Shield size={20} className="text-blue-500" />
          <span className="text-xs font-bold uppercase tracking-widest">Authentication_Required</span>
        </div>
        <h2 className="text-lg font-bold mb-6">Enter access key:</h2>
        <div className="space-y-6">
          <div>
            <input
              type="password"
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoFocus
            />
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-500 text-white transition-all py-2 font-bold flex items-center justify-center gap-2 uppercase text-xs tracking-widest">
            <Lock size={14} /> Connect
          </button>
        </div>
        <div className="mt-8 text-[10px] text-zinc-600 font-bold uppercase tracking-widest flex justify-between">
          <span>Swarm_v1.0</span>
          <span>Secure_Shell</span>
        </div>
      </form>
    </div>
  );
}
