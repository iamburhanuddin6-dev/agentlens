import React, { useEffect, useState } from 'react';
import DetailPanel from '../components/DetailPanel';
import { getAuthHeader } from '../App';
import { ShieldAlert } from 'lucide-react';

export default function Security() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetch('/api/events', { headers: getAuthHeader() })
      .then(r => r.json())
      .then(data => data && setEvents(data.filter(e => e.status === 'INJECTED')))
      .catch(e => console.error(e));
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-4 mb-2">
        <div className="p-3 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
          <ShieldAlert size={32} />
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight">Security <span className="text-red-500">Engine</span></h1>
      </div>
      <p className="text-slate-400 mb-8 ml-16 text-lg">Active prompt injection monitoring and threat detection. (<span className="text-white font-bold">{events.length}</span> threats mitigated)</p>

      <div className="glass-panel shadow-[0_0_40px_rgba(239,68,68,0.05)] rounded-2xl overflow-hidden border border-red-500/20 relative">
        {events.length === 0 ? (
           <div className="p-16 text-center text-slate-500 flex flex-col items-center">
              <ShieldAlert size={48} className="text-slate-700 opacity-50 mb-4" />
              <p className="text-lg font-medium">No injections detected.</p>
              <p className="text-sm mt-2">Systems operating ordinarily.</p>
           </div>
        ) : (
          <table className="min-w-full text-left">
            <thead className="bg-red-500/10 border-b border-red-500/20 text-red-200">
              <tr>
                <th className="p-5 text-sm font-bold uppercase tracking-wider">Detection Time</th>
                <th className="p-5 text-sm font-bold uppercase tracking-wider">Target Tool</th>
                <th className="p-5 text-sm font-bold uppercase tracking-wider">Vector Identity</th>
                <th className="p-5 text-sm font-bold uppercase tracking-wider">Signature Match</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-500/10">
              {events.map((ev, i) => (
                <tr key={i} onClick={() => setSelectedEvent(ev)} className="hover:bg-red-900/30 cursor-pointer transition-all duration-200">
                  <td className="p-5 text-sm font-medium text-slate-300">{new Date(ev.timestamp).toLocaleString()}</td>
                  <td className="p-5 text-sm font-mono text-slate-400">{ev.tool_name}</td>
                  <td className="p-5">
                    <span className="bg-red-500/20 text-red-300 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                      {ev.injection_type}
                    </span>
                  </td>
                  <td className="p-5">
                    <span className="font-mono text-sm bg-black/40 text-red-400 px-3 py-1.5 rounded-lg border border-red-500/10 shadow-inner block truncate max-w-xs">{ev.injection_match}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <DetailPanel event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
}
