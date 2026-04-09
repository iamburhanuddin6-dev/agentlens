import React, { useState } from 'react';
import { getAuthHeader } from '../App';
import { Sparkles, Terminal, Activity, FileJson, X } from 'lucide-react';

export default function DetailPanel({ event, onClose }) {
  const [explanation, setExplanation] = useState(event?.explanation || null);
  const [loading, setLoading] = useState(false);

  if (!event) return null;

  const handleExplain = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ event_id: event.event_id })
      });
      const data = await res.json();
      setExplanation(data.explanation);
    } catch (e) {
      console.error(e);
      setExplanation("Error fetching explanation.");
    }
    setLoading(false);
  };

  const isAnomalous = event.status === 'FLAGGED' || event.status === 'INJECTED';

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[500px] bg-black/60 backdrop-blur-2xl shadow-[-20px_0_50px_rgba(0,0,0,0.5)] border-l border-white/10 p-8 overflow-y-auto transform transition-transform duration-500 z-50">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <Activity className="text-blue-400" />
          <h3 className="text-2xl font-black tracking-tight text-white">Event Detail</h3>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10">
          <X size={20} />
        </button>
      </div>
      
      {/* Status Hero */}
      <div className="mb-8 p-6 rounded-2xl border bg-black/40 relative overflow-hidden group">
        <div className={`absolute top-0 left-0 w-1 h-full ${event.status === 'OK' ? 'bg-green-500' : event.status === 'FLAGGED' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
        <div className="flex items-center justify-between mb-4">
          <span className={`px-3 py-1 text-xs font-black uppercase tracking-widest rounded-full border ${
              event.status === 'OK' ? 'bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 
              event.status === 'FLAGGED' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 
              'bg-red-500/20 text-red-300 border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse'
            }`}>
            {event.status}
          </span>
          <div className="font-mono text-xs text-slate-500 bg-white/5 px-2 py-1 rounded">Execution: {event.latency_ms}ms</div>
        </div>
        
        <div className="font-mono text-slate-400 text-sm mb-2"><span className="text-slate-600">ID:</span> {event.event_id}</div>
        <div className="font-mono text-blue-300 text-lg font-bold"><span className="text-slate-500 text-sm font-sans mr-2">Tool Call:</span>{event.tool_name}</div>
      </div>

      {/* Explainer Module */}
      {isAnomalous && (
        <div className="mb-8 bg-red-950/20 border border-red-500/20 p-6 rounded-2xl relative overflow-hidden backdrop-blur-md">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/10 rounded-full blur-[30px]"></div>
          
          <h4 className="font-black text-red-400 mb-3 text-lg flex items-center">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
            Anomaly Triggered
          </h4>
          
          <div className="space-y-2 mb-5">
            {event.flag_rule && <p className="text-sm text-red-200/80 bg-red-500/10 p-3 rounded-xl border border-red-500/10"><strong>Rule {event.flag_rule}:</strong> {event.flag_reason}</p>}
            {event.injection_type && <p className="text-sm text-red-200/80 bg-red-500/10 p-3 rounded-xl border border-red-500/10"><strong>{event.injection_type}:</strong> {event.injection_match}</p>}
          </div>
          
          <button onClick={handleExplain} disabled={loading} className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-slate-800 to-slate-900 border border-white/10 shadow-lg rounded-xl text-sm font-bold text-white hover:border-white/20 transition-all active:scale-[0.98]">
            <Sparkles size={16} className="text-purple-400" />
            <span>{loading ? 'Analyzing with AI...' : 'Explain Anomaly (AI)'}</span>
          </button>
          
          {explanation && (
            <div className="mt-4 p-5 bg-black/60 rounded-xl shadow-inner text-sm text-slate-300 border border-purple-500/30 leading-relaxed font-medium animate-in slide-in-from-top-2">
              <span className="text-purple-400 font-bold block mb-2 uppercase tracking-wider text-xs">AI Deep Dive</span>
              {explanation}
            </div>
          )}
        </div>
      )}

      {/* Payloads */}
      <div className="space-y-6">
        <div>
          <h4 className="font-bold mb-3 flex items-center space-x-2 text-slate-300">
            <Terminal size={16} className="text-green-400" />
            <span>Input Payload</span>
          </h4>
          <div className="relative group">
             <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none"></div>
             <pre className="bg-[#0b0f19] border border-white/5 text-green-400/90 p-5 rounded-xl text-xs overflow-x-auto font-mono shadow-inner leading-relaxed">
               {event.input_json}
             </pre>
          </div>
        </div>
        
        <div>
          <h4 className="font-bold mb-3 flex items-center space-x-2 text-slate-300">
            <FileJson size={16} className="text-blue-400" />
            <span>Output Payload</span>
          </h4>
          <div className="relative group">
             <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none"></div>
             <pre className="bg-[#0b0f19] border border-white/5 text-blue-400/90 p-5 rounded-xl text-xs overflow-x-auto font-mono shadow-inner leading-relaxed">
               {event.output_json}
             </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
