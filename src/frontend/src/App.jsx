import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { Play, Shield, Terminal, Activity, Lock, LogOut, Settings, Plus, Trash2, Save, X } from 'lucide-react';

const socket = io();

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [password, setPassword] = useState('');
  const [apps, setApps] = useState([]);
  const [logs, setLogs] = useState({});
  const [activeApp, setActiveApp] = useState(null);
  const [view, setView] = useState('console'); // 'console' or 'settings'
  const [editingApp, setEditingApp] = useState(null);
  const logEndRef = useRef(null);

  useEffect(() => {
    if (token) {
      fetchApps();
    }
  }, [token]);

  useEffect(() => {
    socket.on('log', ({ appId, data }) => {
      setLogs(prev => ({
        ...prev,
        [appId]: (prev[appId] || '') + data
      }));
    });

    return () => socket.off('log');
  }, []);

  useEffect(() => {
    if (view === 'console') {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, activeApp, view]);

  const fetchApps = async () => {
    try {
      const res = await axios.get('/api/apps', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApps(res.data);
      if (res.data.length > 0 && !activeApp) setActiveApp(res.data[0].id);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/login', { password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
    } catch (err) {
      alert('Invalid password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const triggerDeploy = async (id) => {
    try {
      setLogs(prev => ({ ...prev, [id]: '' }));
      await axios.post(`/api/deploy/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      alert('Failed to trigger deployment');
    }
  };

  const saveApp = async (e) => {
    e.preventDefault();
    try {
      if (apps.find(a => a.id === editingApp.id)) {
        await axios.put(`/api/apps/${editingApp.id}`, editingApp, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/apps', editingApp, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setEditingApp(null);
      fetchApps();
    } catch (err) {
      alert('Failed to save app: ' + (err.response?.data?.error || err.message));
    }
  };

  const deleteApp = async (id) => {
    if (!confirm('Are you sure you want to delete this app?')) return;
    try {
      await axios.delete(`/api/apps/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (activeApp === id) setActiveApp(apps.find(a => a.id !== id)?.id || null);
      fetchApps();
    } catch (err) {
      alert('Failed to delete app');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <form onSubmit={handleLogin} className="bg-slate-900 p-8 rounded-xl border border-slate-800 shadow-2xl w-96 text-white">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Shield size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center mb-6">Swarm Webhook</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Admin Password</label>
              <input
                type="password"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 transition-colors py-2 rounded-lg font-semibold flex items-center justify-center gap-2">
              <Lock size={18} /> Login
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-200">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <Activity className="text-blue-500" />
          <h1 className="font-bold text-lg">Deployer</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {apps.map(app => (
            <button
              key={app.id}
              onClick={() => { setActiveApp(app.id); setView('console'); }}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-colors ${
                activeApp === app.id && view === 'console' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'
              }`}
            >
              <span className="truncate">{app.name}</span>
            </button>
          ))}
          <button
            onClick={() => { setEditingApp({ id: '', name: '', repo: '', branch: 'main', script: '', cwd: '.', webhook_secret: '' }); setView('settings'); }}
            className="w-full text-left px-4 py-3 rounded-lg flex items-center gap-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Plus size={18} /> New App
          </button>
        </div>
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button 
            onClick={() => setView('settings')}
            className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${view === 'settings' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <Settings size={18} /> Settings
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {view === 'settings' ? (
          <div className="p-8 max-w-4xl mx-auto w-full">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Settings className="text-blue-500" /> Application Settings
            </h2>
            <div className="grid gap-4">
              {apps.map(app => (
                <div key={app.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{app.name}</h3>
                    <p className="text-sm text-slate-400 font-mono">{app.repo} [{app.branch}]</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingApp(app)} className="p-2 hover:bg-slate-800 rounded-lg text-blue-400"><Settings size={20} /></button>
                    <button onClick={() => deleteApp(app.id)} className="p-2 hover:bg-slate-800 rounded-lg text-red-400"><Trash2 size={20} /></button>
                  </div>
                </div>
              ))}
            </div>

            {editingApp && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <form onSubmit={saveApp} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-lg shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">{editingApp.id ? 'Edit' : 'New'} Application</h3>
                    <button type="button" onClick={() => setEditingApp(null)} className="text-slate-400 hover:text-white"><X /></button>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">App ID (Slug)</label>
                        <input
                          disabled={!!apps.find(a => a.id === editingApp.id)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                          value={editingApp.id}
                          onChange={e => setEditingApp({...editingApp, id: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Display Name</label>
                        <input
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                          value={editingApp.name}
                          onChange={e => setEditingApp({...editingApp, name: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">GitHub Repo (user/repo)</label>
                      <input
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        value={editingApp.repo}
                        onChange={e => setEditingApp({...editingApp, repo: e.target.value})}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Branch</label>
                        <input
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                          value={editingApp.branch}
                          onChange={e => setEditingApp({...editingApp, branch: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Webhook Secret</label>
                        <input
                          type="password"
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                          value={editingApp.webhook_secret}
                          onChange={e => setEditingApp({...editingApp, webhook_secret: e.target.value})}
                          placeholder="Shared with GitHub"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Deploy Script Path</label>
                      <input
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        value={editingApp.script}
                        onChange={e => setEditingApp({...editingApp, script: e.target.value})}
                        placeholder="./scripts/deploy.sh"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Working Directory (CWD)</label>
                      <input
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        value={editingApp.cwd}
                        onChange={e => setEditingApp({...editingApp, cwd: e.target.value})}
                        placeholder="."
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-8 flex gap-3">
                    <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors">
                      <Save size={18} /> Save Application
                    </button>
                    <button type="button" onClick={() => setEditingApp(null)} className="flex-1 bg-slate-800 hover:bg-slate-700 py-2 rounded-lg font-bold transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        ) : activeApp ? (
          <>
            <div className="p-6 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">{apps.find(a => a.id === activeApp)?.name}</h2>
                <p className="text-sm text-slate-400 font-mono">{apps.find(a => a.id === activeApp)?.repo}</p>
              </div>
              <button
                onClick={() => triggerDeploy(activeApp)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-transform active:scale-95"
              >
                <Play size={18} fill="currentColor" /> Deploy Now
              </button>
            </div>
            <div className="flex-1 bg-slate-950 p-6 overflow-hidden flex flex-col">
              <div className="flex items-center gap-2 mb-4 text-slate-400">
                <Terminal size={18} />
                <span className="text-sm font-semibold uppercase tracking-wider">Live Console Logs</span>
              </div>
              <div className="flex-1 bg-black rounded-lg border border-slate-800 p-4 font-mono text-sm overflow-y-auto whitespace-pre-wrap">
                {logs[activeApp] || 'Ready for deployment...'}
                <div ref={logEndRef} />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 flex-col gap-4">
            <Activity size={48} className="opacity-20" />
            <p>Select an application to view details or create a new one in settings.</p>
          </div>
        )}
      </div>
    </div>
  );
}