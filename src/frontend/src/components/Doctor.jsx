import React, { useEffect, useState } from 'react';
import { Activity, CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import * as api from '../lib/api';

export default function Doctor() {
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchChecks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.system.getDoctor();
      setChecks(res.data);
    } catch (err) {
      setError('Failed to fetch system status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChecks();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ok': return <CheckCircle className="text-green-500" size={20} />;
      case 'warn': return <AlertTriangle className="text-yellow-500" size={20} />;
      case 'error': return <XCircle className="text-red-500" size={20} />;
      default: return <Activity className="text-zinc-500" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ok': return 'bg-green-500/10 border-green-500/20 text-green-200';
      case 'warn': return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-200';
      case 'error': return 'bg-red-500/10 border-red-500/20 text-red-200';
      default: return 'bg-zinc-800 border-zinc-700 text-zinc-300';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-950 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
              <Activity className="text-blue-500" />
              System Doctor
            </h1>
            <p className="text-zinc-500 mt-1">Diagnostic checks for HookFlux environment.</p>
          </div>
          <button 
            onClick={fetchChecks} 
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Run Diagnostics
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-md">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-24 bg-zinc-900/50 animate-pulse rounded-lg border border-zinc-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {checks.map((check, idx) => (
              <div 
                key={idx} 
                className={`p-5 rounded-lg border flex flex-col gap-2 transition-all hover:scale-[1.01] ${getStatusColor(check.status)}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg">{check.name}</span>
                  {getStatusIcon(check.status)}
                </div>
                <div className="text-sm opacity-80 break-words font-mono">
                  {check.message}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
