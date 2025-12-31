import React from 'react';
import { Settings, Trash2, Plus, Download } from 'lucide-react';

export default function FluxManager({ fluxes, onEdit, onDelete }) {
  const copyWebhook = (id) => {
    const url = `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':3000' : ''}/webhook/${id}`;
    navigator.clipboard.writeText(url);
    alert('Webhook URL copied: ' + url);
  };

  const exportWebhookJSON = (flux) => {
    const webhookConfig = [{
      id: flux.id,
      "execute-command": "/usr/local/bin/hookflux-runner", // Logical placeholder
      "command-working-directory": flux.cwd,
      "response-message": `Triggered flux: ${flux.name}`,
      "trigger-rule": {
        "and": [
          {
            "match": {
              "type": "payload-hmac-sha256",
              "secret": flux.webhook_secret || "CHANGE_ME",
              "parameter": {
                "source": "header",
                "name": "X-Hub-Signature-256"
              }
            }
          },
          {
            "match": {
              "type": "value",
              "value": flux.branch,
              "parameter": {
                "source": "payload",
                "name": "ref"
              }
            }
          }
        ]
      }
    }];

    const blob = new Blob([JSON.stringify(webhookConfig, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${flux.id}-webhook.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-12 max-w-6xl mx-auto w-full overflow-y-auto">
      <h2 className="text-2xl font-bold mb-12 flex items-center gap-4 border-b border-zinc-800 pb-6 text-zinc-100 uppercase tracking-widest">
        <Settings className="text-blue-500" size={28} /> Flux_Endpoints
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fluxes.map(flux => (
          <div key={flux.id} className="bg-zinc-900 border border-zinc-800 p-6 shadow-xl group hover:border-blue-900 transition-colors">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-lg text-zinc-100 tracking-tight">{flux.name}</h3>
                  {flux.ssh_host && (
                    <span className="bg-blue-900/30 text-blue-500 border border-blue-800 text-[8px] px-1.5 py-0.5 font-black uppercase tracking-widest shadow-sm">SSH</span>
                  )}
                </div>
                <p className="text-xs text-zinc-600 font-mono mt-1 uppercase tracking-tighter">SLUG: {flux.id}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => onEdit(flux)} title="Edit Configuration" className="p-2 bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-blue-400 transition-colors"><Settings size={18} /></button>
                <button onClick={() => onDelete(flux.id)} title="Delete Flux" className="p-2 bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-red-400 transition-colors"><Trash2 size={18} /></button>
              </div>
            </div>
            <div className="space-y-2 text-xs text-zinc-500 font-mono mb-8 bg-zinc-950/50 p-4 rounded border border-zinc-800/50">
              <p className="truncate"><span className="text-zinc-700">SOURCE:</span> {flux.repo}</p>
              <p><span className="text-zinc-700">BRANCH:</span> {flux.branch}</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => copyWebhook(flux.id)}
                className="flex-[2] py-2.5 bg-zinc-950 border border-zinc-800 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 transition-all flex items-center justify-center gap-3"
              >
                <Plus size={14} /> Copy_Endpoint
              </button>
              <button 
                onClick={() => exportWebhookJSON(flux)}
                title="Export adnanh/webhook JSON"
                className="flex-1 py-2.5 bg-zinc-950 border border-zinc-800 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 hover:bg-zinc-800 hover:text-blue-400 transition-all flex items-center justify-center gap-3"
              >
                <Download size={14} /> Export_JSON
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
