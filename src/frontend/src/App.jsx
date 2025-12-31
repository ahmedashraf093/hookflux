import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { Activity } from 'lucide-react';

import Login from './components/Login.jsx';
import Sidebar from './components/Sidebar.jsx';
import Console from './components/Console.jsx';
import FluxManager from './components/FluxManager.jsx';
import FluxModal from './components/FluxModal.jsx';
import ModuleManager from './components/ModuleManager.jsx';
import ModuleModal from './components/ModuleModal.jsx';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [password, setPassword] = useState('');
  const [fluxes, setFluxes] = useState([]);
  const [modules, setModules] = useState([]);
  const [logs, setLogs] = useState({});
  const [deployments, setDeployments] = useState([]);
  const [activeFlux, setActiveFlux] = useState(null);
  const [selectedDeploymentId, setSelectedDeploymentId] = useState(null);
  const [view, setView] = useState('console');
  const [editingFlux, setEditingFlux] = useState(null);
  const [editingModule, setEditingModule] = useState(null);
  const logEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!socketRef.current) socketRef.current = io();
    const s = socketRef.current;
    s.on('log', ({ appId, deploymentId, data }) => {
      setLogs(prev => ({ ...prev, [deploymentId]: (prev[deploymentId] || '') + data }));
      if (appId === activeFlux) {
        setSelectedDeploymentId(deploymentId);
        setDeployments(prev => prev.some(d => d.id === deploymentId) ? prev : [ { id: deploymentId, status: 'running', start_time: new Date().toISOString() }, ...prev ]);
      }
    });
    s.on('status', ({ appId, deploymentId, status }) => { if (appId === activeFlux) fetchDeployments(activeFlux); });
    return () => { s.off('log'); s.off('status'); };
  }, [activeFlux]);

  useEffect(() => { if (token) { fetchFluxes(); fetchModules(); } }, [token]);
  useEffect(() => { if (activeFlux && token) { setSelectedDeploymentId(null); fetchDeployments(activeFlux); } }, [activeFlux, token]);
    useEffect(() => {
      if (view === 'console' && selectedDeploymentId && logs[selectedDeploymentId]) {
        logEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }
    }, [logs[selectedDeploymentId], selectedDeploymentId, view]);

  const fetchFluxes = async () => {
    try {
      const res = await axios.get('/api/fluxes', { headers: { Authorization: `Bearer ${token}` } });
      const data = Array.isArray(res.data) ? res.data : [];
      setFluxes(data);
      if (data.length > 0 && !activeFlux) setActiveFlux(data[0].id);
    } catch (err) { 
      console.error('Failed to fetch fluxes', err);
      if (err.response?.status === 401) handleLogout(); 
    }
  };

  const fetchModules = async () => {
    try {
      const res = await axios.get('/api/modules', { headers: { Authorization: `Bearer ${token}` } });
      const parsedModules = res.data.map(m => ({
        ...m,
        params: Array.isArray(m.params) ? m.params : JSON.parse(m.params || '[]')
      }));
      setModules(parsedModules);
    } catch (err) {
      console.error('Failed to fetch modules', err);
    }
  };

  const fetchDeployments = async (fluxId) => {
    if (!fluxId) return;
    try {
      const res = await axios.get(`/api/fluxes/${fluxId}/deployments`, { headers: { Authorization: `Bearer ${token}` } });
      const data = Array.isArray(res.data) ? res.data : [];
      setDeployments(data);
      if (data.length > 0 && !selectedDeploymentId) {
        handleSelectDeployment(data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch deployments', err);
    }
  };

  const handleSelectDeployment = async (deploymentId) => {
    setSelectedDeploymentId(deploymentId);
    if (!logs[deploymentId]) {
      try {
        const res = await axios.get(`/api/deployments/${deploymentId}`, { headers: { Authorization: `Bearer ${token}` } });
        setLogs(prev => ({ ...prev, [deploymentId]: res.data.logs }));
      } catch (err) {}
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/login', { password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
    } catch (err) { alert('Invalid credentials'); }
  };

  const handleLogout = () => { localStorage.removeItem('token'); setToken(null); };

  const triggerDeploy = async (id) => {
    try {
      const res = await axios.post(`/api/fluxes/${id}/deploy`, {}, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.deploymentId) { setSelectedDeploymentId(res.data.deploymentId); fetchDeployments(activeFlux); }
    } catch (err) { alert('Flux execution failed to start'); }
  };

  const saveFlux = async (e) => {
    e.preventDefault();
    try {
      if (fluxes.find(f => f.id === editingFlux.id)) await axios.put(`/api/fluxes/${editingFlux.id}`, editingFlux, { headers: { Authorization: `Bearer ${token}` } });
      else await axios.post('/api/fluxes', editingFlux, { headers: { Authorization: `Bearer ${token}` } });
      setEditingFlux(null); fetchFluxes();
    } catch (err) { alert('Failed to commit flux changes'); }
  };

  const deleteFlux = async (id) => {
    if (!confirm('Are you sure you want to delete this flux?')) return;
    try { await axios.delete(`/api/fluxes/${id}`, { headers: { Authorization: `Bearer ${token}` } }); if (activeFlux === id) setActiveFlux(fluxes.find(f => f.id !== id)?.id || null); fetchFluxes(); } catch (err) {}
  };

  const saveModule = async (e) => {
    e.preventDefault();
    try {
      if (modules.find(m => m.id === editingModule.id)) await axios.put(`/api/modules/${editingModule.id}`, editingModule, { headers: { Authorization: `Bearer ${token}` } });
      else await axios.post('/api/modules', editingModule, { headers: { Authorization: `Bearer ${token}` } });
      setEditingModule(null); fetchModules();
    } catch (err) { alert('Failed to commit module changes'); }
  };

  const deleteModule = async (id) => {
    if (!confirm('Are you sure you want to delete this module?')) return;
    try { await axios.delete(`/api/modules/${id}`, { headers: { Authorization: `Bearer ${token}` } }); fetchModules(); } catch (err) {}
  };

  if (!token) return <Login password={password} setPassword={setPassword} onLogin={handleLogin} />;

  const activeFluxConfig = fluxes.find(f => f.id === activeFlux);

  return (
    <div className="h-screen flex bg-zinc-950 text-zinc-300 font-mono selection:bg-blue-500 selection:text-white overflow-hidden">
      <Sidebar 
        fluxes={fluxes} activeFlux={activeFlux} setActiveFlux={setActiveFlux} view={view} setView={setView} onLogout={handleLogout} 
        onNewFlux={() => { setEditingFlux({ id: '', name: '', repo: '', branch: 'main', cwd: '.', flow_config: '[]' }); setView('settings'); }}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {view === 'modules' ? (
          <ModuleManager 
            modules={modules} 
            onEdit={setEditingModule} 
            onDelete={deleteModule} 
            onNew={() => setEditingModule({ id: '', name: '', content: '#!/bin/bash\nset -e\n', params: [] }) } 
          />
        ) : view === 'settings' ? (
          <FluxManager 
            fluxes={fluxes} 
            onEdit={setEditingFlux} 
            onDelete={deleteFlux} 
          />
        ) : activeFlux ? (
          <Console 
            flux={activeFluxConfig}
            deployments={deployments}
            selectedDeploymentId={selectedDeploymentId}
            onTriggerDeploy={triggerDeploy}
            onSelectDeployment={handleSelectDeployment}
            logs={logs[selectedDeploymentId]}
            logEndRef={logEndRef}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-800 flex-col gap-10 bg-[radial-gradient(circle,#18181b_1px,transparent_1px)] bg-[size:30px_30px]">
            <div className="border-2 border-zinc-900 p-12 rounded-full animate-pulse">
              <Activity size={64} className="opacity-20" />
            </div>
            <div className="text-center space-y-3">
              <div className="text-sm font-black uppercase tracking-[0.5em] opacity-30">System_Idle</div>
              <div className="text-[10px] font-bold uppercase tracking-widest opacity-10">Awaiting_Signal_</div>
            </div>
          </div>
        )}
      </div>

      <FluxModal 
        flux={editingFlux} 
        setFlux={setEditingFlux} 
        onSave={saveFlux} 
        onClose={() => setEditingFlux(null)} 
        isEdit={!!(editingFlux && fluxes.find(f => f.id === editingFlux.id))} 
        modules={modules} 
      />

      <ModuleModal 
        module={editingModule} 
        setModule={setEditingModule} 
        onSave={saveModule} 
        onClose={() => setEditingModule(null)} 
        isEdit={!!(editingModule && modules.find(m => m.id === editingModule.id))} 
      />
    </div>
  );
}
