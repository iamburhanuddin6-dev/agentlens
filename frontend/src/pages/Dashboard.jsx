import React, { useEffect, useState } from 'react';
import DetailPanel from '../components/DetailPanel';
import { getAuthHeader } from '../App';

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [metrics, setMetrics] = useState({ total_events: 0, flagged_events: 0, injections: 0, avg_latency: 0 });
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetch('/api/events', { headers: getAuthHeader() })
      .then(r => r.json()).then(setEvents).catch(e => console.error(e));
      
    fetch('/api/metrics', { headers: getAuthHeader() })
      .then(r => r.json()).then(setMetrics).catch(e => console.error(e));

    const token = localStorage.getItem('token');
    const sse = new EventSource(`/api/stream?token=${token}`);
    sse.onmessage = e => {
      setEvents(prev => [JSON.parse(e.data), ...prev]);
      fetch('/api/metrics', { headers: getAuthHeader() }) // keep metrics fresh
        .then(r => r.json()).then(setMetrics).catch(err => console.error(err));
    };
    return () => sse.close();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-white tracking-tight">Real-Time <span className="text-gradient">Observability</span></h1>
      
      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Events', val: metrics.total_events },
          { label: 'Flagged', val: metrics.flagged_events, color: 'text-yellow-600' },
          { label: 'Injections', val: metrics.injections, color: 'text-red-600' },
          { label: 'Avg Latency (ms)', val: metrics.avg_latency }
        ].map((m, i) => (
          <div key={i} className="glass-card p-6 rounded-2xl transition-transform hover:scale-105 duration-300">
            <div className="text-blue-200/70 text-sm font-medium mb-2 uppercase tracking-wider">{m.label}</div>
            <div className={`text-4xl font-bold ${m.color || 'text-white drop-shadow-md'}`}>{m.val}</div>
          </div>
        ))}
      </div>

      {/* Live Feed */}
      <div className="glass-panel shadow-2xl rounded-2xl overflow-hidden mt-8 relative">
        <table className="min-w-full text-left">
          <thead className="bg-black/20 border-b border-white/10 text-slate-300">
            <tr>
              <th className="p-4 text-sm font-medium text-gray-500">Time</th>
              <th className="p-4 text-sm font-medium text-gray-500">Session</th>
              <th className="p-4 text-sm font-medium text-gray-500">Tool</th>
              <th className="p-4 text-sm font-medium text-gray-500">Latency</th>
              <th className="p-4 text-sm font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {events.map((ev, i) => (
              <tr key={i} onClick={() => setSelectedEvent(ev)} className="hover:bg-blue-900/20 cursor-pointer transition-all duration-200">
                <td className="p-4 text-sm text-gray-400">{new Date(ev.timestamp).toLocaleTimeString()}</td>
                <td className="p-4 text-sm font-medium text-slate-200">{ev.session_id.substring(0,8)}</td>
                <td className="p-4 text-sm font-mono text-blue-300/80">{ev.tool_name}</td>
                <td className="p-4 text-sm text-gray-400">{ev.latency_ms}ms</td>
                <td className="p-4">
                  <span className={`inline-block px-3 py-1 animate-in fade-in zoom-in duration-300 text-xs font-bold rounded-full border tracking-wide uppercase ${ev.status === 'OK' ? 'bg-green-500/10 text-green-400 border-green-500/20' : ev.status === 'FLAGGED' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.3)] animate-pulse' : 'bg-red-500/20 text-red-100 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse'}`}>
                    {ev.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DetailPanel event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
}
