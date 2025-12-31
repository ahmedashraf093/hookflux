import React from 'react';
import { X, Save } from 'lucide-react';

export default function AppModal({ app, setApp, onSave, onClose, isEdit }) {
  if (!app) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <form onSubmit={onSave} className="bg-zinc-900 border border-zinc-800 p-8 w-full max-w-2xl shadow-2xl">
        <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
          <h3 className="text-sm font-bold uppercase tracking-widest">{isEdit ? 'Edit_Project' : 'New_Project'}</h3>
          <button type="button" onClick={onClose} className="text-zinc-500 hover:text-zinc-200"><X size={16} /></button>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-1">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">ID (Slug)</label>
            <input
              disabled={isEdit}
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-3 py-2 text-xs outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
              value={app.id}
              onChange={e => setApp({...app, id: e.target.value})}
              required
            />
          </div>
          <div className="col-span-1">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Display Name</label>
            <input
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-3 py-2 text-xs outline-none focus:border-blue-500 transition-colors"
              value={app.name}
              onChange={e => setApp({...app, name: e.target.value})}
              required
            />
          </div>
          <div className="col-span-2">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">GitHub Repo (user/repo)</label>
            <input
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-3 py-2 text-xs outline-none focus:border-blue-500 transition-colors"
              value={app.repo}
              onChange={e => setApp({...app, repo: e.target.value})}
              required
            />
          </div>
          <div className="col-span-1">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Branch</label>
            <input
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-3 py-2 text-xs outline-none focus:border-blue-500 transition-colors"
              value={app.branch}
              onChange={e => setApp({...app, branch: e.target.value})}
              required
            />
          </div>
          <div className="col-span-1">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Webhook Secret</label>
            <input
              type="password"
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-3 py-2 text-xs outline-none focus:border-blue-500 transition-colors"
              value={app.webhook_secret}
              onChange={e => setApp({...app, webhook_secret: e.target.value})}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Deployment Script</label>
            <input
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-3 py-2 text-xs outline-none focus:border-blue-500 transition-colors"
              value={app.script}
              onChange={e => setApp({...app, script: e.target.value})}
              required
            />
          </div>
          <div className="col-span-2">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Working Directory</label>
            <input
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-3 py-2 text-xs outline-none focus:border-blue-500 transition-colors"
              value={app.cwd}
              onChange={e => setApp({...app, cwd: e.target.value})}
              required
            />
          </div>
        </div>
        <div className="mt-8 flex gap-3">
          <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 font-bold uppercase text-[10px] tracking-widest transition-all">
            Save Changes
          </button>
          <button type="button" onClick={onClose} className="flex-1 border border-zinc-800 text-zinc-500 hover:text-zinc-200 py-2 font-bold uppercase text-[10px] tracking-widest transition-all">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
