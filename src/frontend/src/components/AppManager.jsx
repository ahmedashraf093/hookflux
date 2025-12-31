import React from 'react';
import { Settings, Trash2 } from 'lucide-react';

export default function AppManager({ apps, onEdit, onDelete }) {
  return (
    <div className="p-8 max-w-5xl mx-auto w-full overflow-y-auto">
      <h2 className="text-xl font-bold mb-8 flex items-center gap-3 border-b border-zinc-800 pb-4">
        <Settings className="text-blue-500" size={20} /> Project Settings
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {apps.map(app => (
          <div key={app.id} className="bg-zinc-900 border border-zinc-800 p-4 relative group">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-sm text-zinc-100">{app.name}</h3>
              <div className="flex gap-2">
                <button onClick={() => onEdit(app)} className="text-zinc-500 hover:text-blue-400 transition-colors"><Settings size={14} /></button>
                <button onClick={() => onDelete(app.id)} className="text-zinc-500 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="space-y-1 text-[10px] text-zinc-500 font-mono">
              <p className="truncate">REPO: {app.repo}</p>
              <p>BRANCH: {app.branch}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
