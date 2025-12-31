import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { Play, Shield, Terminal, Activity, Lock, LogOut } from 'lucide-react';

const socket = io();

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [password, setPassword] = useState('');
  const [apps, setApps] = useState([]);
  const [logs, setLogs] = useState({});
  const [activeApp, setActiveApp] = useState(null);
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
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, activeApp]);

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

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <form onSubmit={handleLogin} className="bg-slate-900 p-8 rounded-xl border border-slate-800 shadow-2xl w-96">
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
              onClick={() => setActiveApp(app.id)}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-colors ${
                activeApp === app.id ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'
              }`}
            >
              <span className="truncate">{app.name}</span>
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {activeApp ? (
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
          <div className="flex-1 flex items-center justify-center text-slate-500">
            Select an application to view details
          </div>
        )}
      </div>
    </div>
  );
}
