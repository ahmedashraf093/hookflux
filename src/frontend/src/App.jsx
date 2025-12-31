import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { 
  Play, Shield, Terminal, Activity, Lock, 
  LogOut, Settings, Plus, Trash2, Save, X 
} from 'lucide-react';

// --- Internal Components ---

const Login = ({ password, setPassword, onLogin }) => (
  <div className="min-h-screen flex items-center justify-center bg-zinc-950 font-mono text-zinc-200">
    <form onSubmit={onLogin} className="bg-zinc-900 p-8 border border-zinc-800 w-96">
      <div className="flex items-center gap-2 mb-8 border-b border-zinc-800 pb-4">
        <Shield size={20} className="text-blue-500" />
        <span className="text-xs font-bold uppercase tracking-widest">Auth_Required</span>
      </div>
      <h2 className="text-lg font-bold mb-6">Enter access key:</h2>
      <div className="space-y-6">
        <input
          type="password"
          className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-4 py-2 focus:border-blue-500 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoFocus
        />
        <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 font-bold uppercase text-xs tracking-widest transition-all">
          Connect
        </button>
      </div>
    </form>
  </div>
);

const Sidebar = ({ apps, activeApp, setActiveApp, view, setView, onLogout, onNewApp }) => (
  <div className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
    <div className="p-6 flex items-center gap-3 border-b border-zinc-800 bg-zinc-900/50">
      <Activity size={18} className="text-blue-500" />
      <h1 className="font-bold text-sm uppercase tracking-wider text-zinc-100">SWARM_DEPLOYER</h1>
    </div>
    <div className="flex-1 overflow-y-auto p-2 space-y-1 mt-2">
      <div className="text-[10px] text-zinc-600 mb-2 font-bold uppercase px-3 tracking-widest">Apps</div>
      {apps.map(app => (
        <button
          key={app.id}
          onClick={() => { setActiveApp(app.id); setView('console'); }}
          className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center gap-2 ${
            activeApp === app.id && view === 'console' 
            ? 'bg-blue-600 text-white font-bold' 
            : 'text-zinc-400 hover:bg-zinc-800'
          }`}
        >
          <span>{activeApp === app.id && view === 'console' ? '●' : '○'}</span>
          <span className="truncate">{app.name}</span>
        </button>
      ))}
      <button
        onClick={onNewApp}
        className="w-full text-left px-3 py-2 text-xs text-zinc-600 hover:text-blue-400 transition-colors mt-4 border border-dashed border-zinc-800"
      >
        + Register_App
      </button>
    </div>
    <div className="p-2 border-t border-zinc-800 space-y-1">
      <button 
        onClick={() => setView('settings')}
        className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${view === 'settings' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
      >
        <Settings size={14} /> Settings
      </button>
      <button onClick={onLogout} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-900 hover:text-red-500">
        <LogOut size={14} /> Logout
      </button>
    </div>
  </div>
);

const DeploymentHistory = ({ deployments, selectedDeploymentId, onSelectDeployment }) => (
  <div className="w-72 bg-zinc-950 border-r border-zinc-800 flex flex-col">
    <div className="p-3 border-b border-zinc-800 bg-zinc-900/20 text-[9px] font-bold uppercase tracking-widest text-zinc-600">History</div>
    <div className="flex-1 overflow-y-auto">
      {deployments.length === 0 ? (
        <div className="p-8 text-center text-zinc-700 italic text-[10px]">No logs</div>
      ) : (
        deployments.map(d => (
          <button
            key={d.id}
            onClick={() => onSelectDeployment(d.id)}
            className={`w-full text-left p-3 border-b border-zinc-900 transition-all ${
              selectedDeploymentId === d.id ? 'bg-zinc-900 text-blue-400' : 'text-zinc-500'
            }`}
          >
            <div className="flex justify-between items-start mb-1">
              <span className="text-[10px] font-bold"># {d.id}</span>
              <span className={`text-[8px] font-black ${
                d.status === 'success' ? 'text-green-500' : 
                d.status === 'failed' ? 'text-red-500' : 'text-blue-500 animate-pulse'
              }`}>
                {d.status.toUpperCase()}
              </span>
            </div>
            <div className="text-[9px] opacity-50">{new Date(d.start_time).toLocaleString()}</div>
          </button>
        ))
      )}
    </div>
  </div>
);

const LogViewer = ({ logs, selectedDeploymentId, logEndRef }) => (
  <div className="flex-1 bg-zinc-950 p-4 flex flex-col overflow-hidden">
    <div className="flex items-center gap-2 mb-2 border-b border-zinc-900 pb-2 text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
      <Terminal size={12} /> Output_Logs {selectedDeploymentId && `[ID:${selectedDeploymentId}]`}
    </div>
    <div className="flex-1 bg-[#09090b] border border-zinc-800 p-4 font-mono text-[11px] overflow-y-auto whitespace-pre-wrap leading-relaxed text-zinc-400">
      {logs || 'Awaiting selection...'}
      <div ref={logEndRef} />
    </div>
  </div>
);

const AppManager = ({ apps, onEdit, onDelete }) => {
  const copyWebhook = (id) => {
    const url = `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':3000' : ''}/webhook/${id}`;
    navigator.clipboard.writeText(url);
    alert('Webhook URL copied: ' + url);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto w-full overflow-y-auto">
      <h2 className="text-xl font-bold mb-8 flex items-center gap-3 border-b border-zinc-800 pb-4 text-zinc-100">
        <Settings className="text-blue-500" size={20} /> Project Settings
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {apps.map(app => (
          <div key={app.id} className="bg-zinc-900 border border-zinc-800 p-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-sm text-zinc-100">{app.name}</h3>
              <div className="flex gap-2">
                <button onClick={() => onEdit(app)} title="Edit" className="text-zinc-500 hover:text-blue-400 transition-colors"><Settings size={14} /></button>
                <button onClick={() => onDelete(app.id)} title="Delete" className="text-zinc-500 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="space-y-1 text-[10px] text-zinc-500 font-mono mb-4">
              <p className="truncate">REPO: {app.repo}</p>
              <p>BRANCH: {app.branch}</p>
            </div>
            <button 
              onClick={() => copyWebhook(app.id)}
              className="w-full py-1.5 border border-zinc-800 text-[9px] font-bold uppercase tracking-widest text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={10} /> Copy Webhook URL
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const AppModal = ({ app, setApp, onSave, onClose, isEdit }) => {
  if (!app) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <form onSubmit={onSave} className="bg-zinc-900 border border-zinc-800 p-8 w-full max-w-2xl text-zinc-300">
        <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
          <h3 className="text-sm font-bold uppercase tracking-widest">{isEdit ? 'Edit_Project' : 'New_Project'}</h3>
          <button type="button" onClick={onClose} className="text-zinc-500"><X size={16} /></button>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-1">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">ID</label>
            <input disabled={isEdit} className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-3 py-2 text-xs outline-none" value={app.id} onChange={e => setApp({...app, id: e.target.value})} required />
          </div>
          <div className="col-span-1">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Name</label>
            <input className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-3 py-2 text-xs outline-none" value={app.name} onChange={e => setApp({...app, name: e.target.value})} required />
          </div>
          <div className="col-span-2">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">GitHub Repo</label>
            <input className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-3 py-2 text-xs outline-none" value={app.repo} onChange={e => setApp({...app, repo: e.target.value})} required />
          </div>
          <div className="col-span-1">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Branch</label>
            <input className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-3 py-2 text-xs outline-none" value={app.branch} onChange={e => setApp({...app, branch: e.target.value})} required />
          </div>
          <div className="col-span-1">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Webhook Secret</label>
            <input type="password" className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-3 py-2 text-xs outline-none" value={app.webhook_secret} onChange={e => setApp({...app, webhook_secret: e.target.value})} />
          </div>
          <div className="col-span-2">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Script</label>
            <input className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-3 py-2 text-xs outline-none" value={app.script} onChange={e => setApp({...app, script: e.target.value})} required />
          </div>
          <div className="col-span-2">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">CWD</label>
            <input className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-3 py-2 text-xs outline-none" value={app.cwd} onChange={e => setApp({...app, cwd: e.target.value})} required />
          </div>
        </div>
        <div className="mt-8 flex gap-3">
          <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 font-bold uppercase text-[10px] tracking-widest">Save</button>
          <button type="button" onClick={onClose} className="flex-1 border border-zinc-800 text-zinc-500 py-2 font-bold uppercase text-[10px] tracking-widest">Cancel</button>
        </div>
      </form>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [password, setPassword] = useState('');
  const [apps, setApps] = useState([]);
  const [logs, setLogs] = useState({});
  const [deployments, setDeployments] = useState([]);
  const [activeApp, setActiveApp] = useState(null);
  const [selectedDeploymentId, setSelectedDeploymentId] = useState(null);
  const [view, setView] = useState('console');
  const [editingApp, setEditingApp] = useState(null);
  const logEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!socketRef.current) socketRef.current = io();
    const s = socketRef.current;
    
    s.on('log', ({ appId, deploymentId, data }) => {
      setLogs(prev => ({ ...prev, [deploymentId]: (prev[deploymentId] || '') + data }));
      if (appId === activeApp) {
        setSelectedDeploymentId(deploymentId);
        setDeployments(prev => {
          if (prev.some(d => d.id === deploymentId)) return prev;
          return [{ id: deploymentId, status: 'running', start_time: new Date().toISOString() }, ...prev];
        });
      }
    });

    s.on('status', ({ appId, deploymentId, status }) => {
      if (appId === activeApp) fetchDeployments(activeApp);
    });

    return () => { s.off('log'); s.off('status'); };
  }, [activeApp]);

  useEffect(() => {
    if (token) fetchApps();
  }, [token]);

  useEffect(() => {
    if (activeApp && token) {
      setSelectedDeploymentId(null);
      fetchDeployments(activeApp);
    }
  }, [activeApp, token]);

  useEffect(() => {
    if (view === 'console') logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, selectedDeploymentId, view]);

  const fetchApps = async () => {
    try {
      const res = await axios.get('/api/apps', { headers: { Authorization: `Bearer ${token}` } });
      setApps(res.data);
      if (res.data.length > 0 && !activeApp) setActiveApp(res.data[0].id);
    } catch (err) { if (err.response?.status === 401) handleLogout(); }
  };

  const fetchDeployments = async (appId) => {
    try {
      const res = await axios.get(`/api/apps/${appId}/deployments`, { headers: { Authorization: `Bearer ${token}` } });
      setDeployments(res.data);
      if (res.data.length > 0 && !selectedDeploymentId) handleSelectDeployment(res.data[0].id);
    } catch (err) { console.error(err); }
  };

  const handleSelectDeployment = async (deploymentId) => {
    setSelectedDeploymentId(deploymentId);
    if (!logs[deploymentId]) {
      try {
        const res = await axios.get(`/api/deployments/${deploymentId}`, { headers: { Authorization: `Bearer ${token}` } });
        setLogs(prev => ({ ...prev, [deploymentId]: res.data.logs }));
      } catch (err) { console.error(err); }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/login', { password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
    } catch (err) { alert('Invalid password'); }
  };

  const handleLogout = () => { localStorage.removeItem('token'); setToken(null); };

  const triggerDeploy = async (id) => {
    try {
      const res = await axios.post(`/api/deploy/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.deploymentId) {
        setSelectedDeploymentId(res.data.deploymentId);
        fetchDeployments(activeApp);
      }
    } catch (err) { alert('Failed'); }
  };

  const saveApp = async (e) => {
    e.preventDefault();
    try {
      if (apps.find(a => a.id === editingApp.id)) {
        await axios.put(`/api/apps/${editingApp.id}`, editingApp, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post('/api/apps', editingApp, { headers: { Authorization: `Bearer ${token}` } });
      }
      setEditingApp(null); fetchApps();
    } catch (err) { alert('Error'); }
  };

  const deleteApp = async (id) => {
    if (!confirm('Delete?')) return;
    try {
      await axios.delete(`/api/apps/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (activeApp === id) setActiveApp(apps.find(a => a.id !== id)?.id || null);
      fetchApps();
    } catch (err) { alert('Error'); }
  };

  if (!token) return <Login password={password} setPassword={setPassword} onLogin={handleLogin} />;

  const activeAppConfig = apps.find(a => a.id === activeApp);

  return (
    <div className="min-h-screen flex bg-zinc-950 text-zinc-300 font-mono">
      <Sidebar 
        apps={apps} activeApp={activeApp} setActiveApp={setActiveApp} 
        view={view} setView={setView} onLogout={handleLogout} 
        onNewApp={() => { setEditingApp({ id: '', name: '', repo: '', branch: 'main', script: '', cwd: '.', webhook_secret: '' }); setView('settings'); }}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {view === 'settings' ? (
          <AppManager apps={apps} onEdit={setEditingApp} onDelete={deleteApp} />
        ) : activeApp ? (
          <>
            <div className="px-6 py-4 bg-zinc-900/50 border-b border-zinc-800 flex justify-between items-center text-zinc-300">
              <div className="flex items-center gap-6">
                <div>
                  <h2 className="text-sm font-bold text-zinc-100">{activeAppConfig?.name}</h2>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">{activeAppConfig?.repo} / {activeAppConfig?.branch}</p>
                </div>
                <button 
                  onClick={() => {
                    const url = `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':3000' : ''}/webhook/${activeAppConfig?.id}`;
                    navigator.clipboard.writeText(url);
                    alert('Webhook URL copied');
                  }}
                  className="px-2 py-1 border border-zinc-800 text-[8px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors"
                >
                  Copy_Webhook_URL
                </button>
              </div>
              <button onClick={() => triggerDeploy(activeApp)} className="bg-zinc-100 text-black px-4 py-1.5 font-bold flex items-center gap-2 uppercase text-[10px] tracking-widest active:translate-y-0.5 transition-all">
                <Play size={12} fill="currentColor" /> Trigger_Deploy
              </button>
            </div>
            <div className="flex-1 flex overflow-hidden">
              <DeploymentHistory deployments={deployments} selectedDeploymentId={selectedDeploymentId} onSelectDeployment={handleSelectDeployment} />
              <LogViewer logs={logs[selectedDeploymentId]} selectedDeploymentId={selectedDeploymentId} logEndRef={logEndRef} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-800 flex-col gap-4">
            <Activity size={32} className="opacity-20" />
            <div className="text-[10px] font-bold uppercase opacity-30 tracking-[0.2em]">Awaiting Selection</div>
          </div>
        )}
      </div>
      <AppModal app={editingApp} setApp={setEditingApp} onSave={saveApp} onClose={() => setEditingApp(null)} isEdit={!!(editingApp && apps.find(a => a.id === editingApp.id))} />
    </div>
  );
}
