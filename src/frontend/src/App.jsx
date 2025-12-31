import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Activity } from 'lucide-react';

import Login from './components/Login.jsx';
import Sidebar from './components/Sidebar.jsx';
import Console from './components/Console.jsx';
import FluxManager from './components/FluxManager.jsx';
import FluxModal from './components/FluxModal.jsx';
import ModuleManager from './components/ModuleManager.jsx';
import ModuleModal from './components/ModuleModal.jsx';
import HomeDashboard from './components/HomeDashboard.jsx';
import Documentation from './components/Documentation.jsx';
import PublicKeyModal from './components/PublicKeyModal.jsx';
import ChangePasswordModal from './components/ChangePasswordModal.jsx';
import AuditLog from './components/AuditLog.jsx';

import * as api from './lib/api';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [fluxes, setFluxes] = useState([]);
  const [fluxStatuses, setFluxStatuses] = useState({});
  const [modules, setModules] = useState([]);
  const [logs, setLogs] = useState({});
  const [deployments, setDeployments] = useState([]);
  const [activeFluxId, setActiveFluxId] = useState(null);
  const [selectedDeploymentId, setSelectedDeploymentId] = useState(null);
  const [view, setView] = useState('home');
  const [editingFlux, setEditingFlux] = useState(null);
  const [editingModule, setEditingModule] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showPublicKeyModal, setShowPublicKeyModal] = useState(false);
  const [isPasswordChangeRequired, setIsPasswordChangeRequired] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);

  const logEndRef = useRef(null);
  const socketRef = useRef(null);

  // --- Socket Initialization ---
  useEffect(() => {
    if (!token) return;
    
    if (!socketRef.current) {
      socketRef.current = io({ auth: { token } });
    }
    
    const s = socketRef.current;
    s.on('log', ({ appId, deploymentId, data }) => {
      setLogs(prev => ({ ...prev, [deploymentId]: (prev[deploymentId] || '') + data }));
      if (appId === activeFluxId) {
        setSelectedDeploymentId(deploymentId);
        setDeployments(prev => {
          if (prev.some(d => d.id === deploymentId)) return prev;
          return [{ id: deploymentId, status: 'running', start_time: new Date().toISOString() }, ...prev];
        });
      }
    });

    s.on('status', ({ appId, deploymentId, status }) => { 
      if (appId === activeFluxId) fetchDeployments(activeFluxId); 
      fetchFluxStatuses();
    });

    return () => { s.off('log'); s.off('status'); };
  }, [activeFluxId, token]);

  useEffect(() => {
    if (!token && socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, [token]);

  // --- Data Fetching ---
  useEffect(() => {
    if (token) {
      fetchAllData();
    }
  }, [token]);

  useEffect(() => {
    if (activeFluxId && token) {
      setSelectedDeploymentId(null);
      fetchDeployments(activeFluxId);
    }
  }, [activeFluxId, token]);

  useEffect(() => {
    if (view === 'console' && selectedDeploymentId && logs[selectedDeploymentId]) {
      logEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, [logs[selectedDeploymentId], selectedDeploymentId, view]);

  const fetchAllData = () => {
    fetchFluxes();
    fetchModules();
    fetchPublicKey();
    fetchFluxStatuses();
    fetchAuditLogs();
  };

  const fetchFluxes = async () => {
    try {
      const res = await api.fluxes.getAll();
      const data = Array.isArray(res.data) ? res.data : [];
      setFluxes(data);
      if (data.length > 0 && !activeFluxId) setActiveFluxId(data[0].id);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
    }
  };

  const fetchFluxStatuses = async () => {
    try {
      const res = await api.fluxes.getStatuses();
      setFluxStatuses(res.data);
    } catch (err) {}
  };

  const fetchModules = async () => {
    try {
      const res = await api.modules.getAll();
      const parsed = res.data.map(m => ({
        ...m,
        params: Array.isArray(m.params) ? m.params : JSON.parse(m.params || '[]')
      }));
      setModules(parsed);
    } catch (err) {}
  };

  const fetchDeployments = async (id) => {
    if (!id) return;
    try {
      const res = await api.fluxes.getDeployments(id);
      setDeployments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {}
  };

  const fetchPublicKey = async () => {
    try {
      const res = await api.system.getPublicKey();
      setPublicKey(res.data.publicKey);
    } catch (err) {}
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await api.system.getAuditLogs();
      setAuditLogs(res.data);
    } catch (err) {}
  };

  const handleSelectDeployment = async (deploymentId) => {
    setSelectedDeploymentId(deploymentId);
    if (!logs[deploymentId]) {
      try {
        const res = await api.deployments.getLogs(deploymentId);
        setLogs(prev => ({ ...prev, [deploymentId]: res.data.logs }));
      } catch (err) {}
    }
  };

  // --- Auth Handlers ---
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.auth.login(username, password);
      localStorage.setItem('token', res.data.token);
      socketRef.current = io({ auth: { token: res.data.token } });
      setToken(res.data.token);
      setIsPasswordChangeRequired(res.data.changeRequired);
    } catch (err) {
      alert('Invalid credentials');
    }
  };

  const handleLogout = () => {
    if (socketRef.current) socketRef.current.disconnect();
    socketRef.current = null;
    localStorage.removeItem('token');
    setToken(null);
  };

  // --- Flux Handlers ---
  const triggerDeploy = async (id) => {
    try {
      const res = await api.fluxes.deploy(id);
      if (res.data.deploymentId) {
        setSelectedDeploymentId(res.data.deploymentId);
        fetchDeployments(activeFluxId);
      }
    } catch (err) {
      alert('Failed to start pipeline');
    }
  };

  const saveFlux = async (e) => {
    e.preventDefault();
    try {
      if (fluxes.find(f => f.id === editingFlux.id)) {
        await api.fluxes.update(editingFlux.id, editingFlux);
      } else {
        await api.fluxes.create(editingFlux);
      }
      setEditingFlux(null);
      fetchFluxes();
    } catch (err) {
      alert('Error saving flux');
    }
  };

  const deleteFlux = async (id) => {
    if (!confirm('Delete this flux?')) return;
    try {
      await api.fluxes.delete(id);
      if (activeFluxId === id) setActiveFluxId(fluxes.find(f => f.id !== id)?.id || null);
      fetchFluxes();
    } catch (err) {}
  };

  // --- Module Handlers ---
  const saveModule = async (e) => {
    e.preventDefault();
    try {
      if (modules.find(m => m.id === editingModule.id)) {
        await api.modules.update(editingModule.id, editingModule);
      } else {
        await api.modules.create(editingModule);
      }
      setEditingModule(null);
      fetchModules();
    } catch (err) {
      alert('Error saving module');
    }
  };

  const deleteModule = async (id) => {
    if (!confirm('Delete this module?')) return;
    try {
      await api.modules.delete(id);
      fetchModules();
    } catch (err) {}
  };

  // --- Helpers ---
  const checkPasswordChangeRequired = () => {
    if (isPasswordChangeRequired) return true;
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return !!payload.changeRequired;
    } catch (e) { return false; }
  };

  if (!token) return (
    <Login 
      username={username} setUsername={setUsername}
      password={password} setPassword={setPassword}
      onLogin={handleLogin}
    />
  );

  const activeFluxConfig = fluxes.find(f => f.id === activeFluxId);

  return (
    <div className="h-screen flex bg-zinc-950 text-zinc-300 font-mono selection:bg-blue-500 selection:text-white overflow-hidden">
      <Sidebar 
        fluxes={fluxes} activeFlux={activeFluxId} setActiveFlux={setActiveFluxId}
        view={view} setView={setView} onLogout={handleLogout}
        publicKey={publicKey}
        onNewFlux={() => { setEditingFlux({ id: '', name: '', repo: '', branch: 'main', cwd: '.', flow_config: '[]', ssh_host: '', ssh_user: '' }); setView('settings'); }}
        isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed}
        fluxStatuses={fluxStatuses}
        onShowPublicKey={() => setShowPublicKeyModal(true)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {view === 'home' ? (
          <HomeDashboard 
            fluxes={fluxes} modules={modules} deployments={deployments} 
            setView={setView} setActiveFlux={setActiveFluxId}
          />
        ) : view === 'docs' ? (
          <Documentation />
        ) : view === 'modules' ? (
          <ModuleManager 
            modules={modules} onEdit={setEditingModule} onDelete={deleteModule}
            onNew={() => setEditingModule({ id: '', name: '', content: '#!/bin/bash\nset -e\n', params: [] })}
          />
        ) : view === 'settings' ? (
          <div className="flex-1 overflow-y-auto">
            <FluxManager fluxes={fluxes} onEdit={setEditingFlux} onDelete={deleteFlux} />
            <div className="max-w-6xl mx-auto px-12 pb-20">
              <AuditLog logs={auditLogs} />
            </div>
          </div>
        ) : activeFluxId ? (
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
            <Activity size={64} className="opacity-20 animate-pulse" />
            <div className="text-center uppercase tracking-widest text-[10px] font-bold opacity-30">Awaiting_Signal_</div>
          </div>
        )}
      </div>

      <FluxModal 
        flux={editingFlux} setFlux={setEditingFlux} 
        onSave={saveFlux} onClose={() => setEditingFlux(null)}
        isEdit={!!(editingFlux && fluxes.find(f => f.id === editingFlux.id))}
        modules={modules}
      />

      <ModuleModal 
        module={editingModule} setModule={setEditingModule}
        onSave={saveModule} onClose={() => setEditingModule(null)}
        isEdit={!!(editingModule && modules.find(m => m.id === editingModule.id))}
      />

      <PublicKeyModal 
        isOpen={showPublicKeyModal} onClose={() => setShowPublicKeyModal(false)}
        publicKey={publicKey}
      />

      <ChangePasswordModal 
        isOpen={checkPasswordChangeRequired()}
        token={token} setToken={(t) => { setToken(t); setIsPasswordChangeRequired(false); }}
      />
    </div>
  );
}
