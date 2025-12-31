import React from 'react';

export default function AuditLog({ logs }) {
  return (
    <div className="mt-12 border-t border-zinc-800 pt-12">
      <h3 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-600 mb-8">System_Audit_Trail</h3>
      <div className="bg-zinc-950 border border-zinc-900 rounded overflow-hidden">
        <table className="w-full text-left text-[10px] border-collapse">
          <thead>
            <tr className="bg-zinc-900 text-zinc-500 uppercase tracking-widest border-b border-zinc-800">
              <th className="p-3 font-bold">Timestamp</th>
              <th className="p-3 font-bold">User</th>
              <th className="p-3 font-bold">Action</th>
              <th className="p-3 font-bold">Details</th>
              <th className="p-3 font-bold text-right">Source_IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {logs.map(log => (
              <tr key={log.id} className="hover:bg-zinc-900/30 transition-colors">
                <td className="p-3 text-zinc-600 font-mono whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                <td className="p-3 text-blue-500 font-bold">{log.username || 'SYSTEM'}</td>
                <td className="p-3"><span className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-300 font-black">{log.action}</span></td>
                <td className="p-3 text-zinc-500 font-mono truncate max-w-[300px]" title={log.details}>{log.details}</td>
                <td className="p-3 text-zinc-700 font-mono text-right">{log.ip_address}</td>
              </tr>
            ))}
            {logs.length === 0 && <tr><td colSpan="5" className="p-10 text-center text-zinc-800 italic uppercase tracking-widest">No audit records found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
