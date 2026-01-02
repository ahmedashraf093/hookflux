import React, { useState } from 'react';
import { ShieldAlert, Lock, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

export default function ChangePasswordModal({ isOpen, token, setToken }) {
  if (!isOpen) return null;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return setError('Passwords do not match');
    if (newPassword.length < 8) return setError('New password must be at least 8 characters');

    try {
      const res = await axios.post('/api/auth/change-password', 
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      toast.success('Password updated successfully. System hardened.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update password');
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center p-6 font-mono">
      <form onSubmit={handleSubmit} className="bg-zinc-900 border-2 border-red-900 p-10 w-[500px] shadow-[0_0_100px_rgba(153,27,27,0.2)]">
        <div className="flex items-center gap-4 mb-10 border-b border-red-900/30 pb-6 text-red-500">
          <ShieldAlert size={32} />
          <div>
            <h3 className="text-lg font-black uppercase tracking-[0.2em]">Security_Violation</h3>
            <p className="text-[10px] font-bold text-red-900 uppercase">Default credentials detected</p>
          </div>
        </div>

        <div className="space-y-8">
          <p className="text-xs text-zinc-500 leading-relaxed">
            Your account is currently using the environment's default password. To protect the HookFlux terminal, you must establish a unique pass-key before continuing.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-600 uppercase mb-2">Verify_Current_Key_</label>
              <input
                type="password"
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-4 py-2 text-sm outline-none focus:border-red-900 transition-all"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-600 uppercase mb-2">Initialize_New_Key_</label>
              <input
                type="password"
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-4 py-2 text-sm outline-none focus:border-blue-500 transition-all"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-600 uppercase mb-2">Confirm_New_Key_</label>
              <input
                type="password"
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-4 py-2 text-sm outline-none focus:border-blue-500 transition-all"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-900/10 border border-red-900/50 text-red-500 text-[10px] font-bold uppercase tracking-widest text-center">
              Error: {error}
            </div>
          )}

          <button className="w-full bg-red-900 hover:bg-red-700 text-white py-4 font-black uppercase text-xs tracking-[0.3em] transition-all shadow-xl flex items-center justify-center gap-3">
            Harden_Security <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
