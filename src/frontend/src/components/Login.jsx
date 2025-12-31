import React from 'react';
import { Shield, Lock } from 'lucide-react';

export default function Login({ username, setUsername, password, setPassword, onLogin }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 font-mono text-zinc-200">
      <form onSubmit={onLogin} className="bg-zinc-900 p-10 border border-zinc-800 w-[450px] shadow-2xl">
        <div className="flex items-center gap-3 mb-10 border-b border-zinc-800 pb-6">
          <Shield size={24} className="text-blue-500" />
          <span className="text-sm font-bold uppercase tracking-[0.2em]">Auth_Required</span>
        </div>
        <h2 className="text-xl font-bold mb-8">Access Terminal:</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-zinc-600 uppercase mb-2 tracking-widest">Ident_User_</label>
            <input
              type="text"
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-5 py-3 text-lg outline-none focus:border-blue-500 transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-600 uppercase mb-2 tracking-widest">Pass_Key_</label>
            <input
              type="password"
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-5 py-3 text-lg outline-none focus:border-blue-500 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 font-black uppercase text-xs tracking-[0.3em] transition-all shadow-xl">
            Connect_Session
          </button>
        </div>
        <div className="mt-10 text-xs text-zinc-600 font-bold uppercase tracking-widest flex justify-between">
          <span>HookFlux_v1.1</span>
          <span>Secure_Shell</span>
        </div>
      </form>
    </div>
  );
}