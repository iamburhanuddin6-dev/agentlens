import React, { useEffect, useState } from 'react';
import { getAuthHeader } from '../App';
import { Settings as SettingsIcon, Key, Sliders, ShieldCheck } from 'lucide-react';

export default function Settings() {
  const [config, setConfig] = useState({ agent_id: '', repo_scope: '', max_refund_threshold: 100 });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/settings', { headers: getAuthHeader() })
      .then(r => r.json())
      .then(data => data && setConfig(prev => ({...prev, ...data})))
      .catch(e => console.error(e));
  }, []);

  const save = async () => {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(config)
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-4 mb-8">
        <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
          <SettingsIcon size={32} />
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight">Platform <span className="text-blue-400">Settings</span></h1>
      </div>

      <div className="space-y-6">
        {/* API Keys */}
        <div className="glass-card p-8 rounded-3xl border border-white/10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center space-x-3 mb-6 relative z-10">
             <Key className="text-blue-400" size={24} />
             <h2 className="text-2xl font-bold text-white">API Keys</h2>
          </div>
          <div className="flex items-center space-x-4 relative z-10">
            <input type="text" disabled className="bg-black/50 border border-white/10 p-4 rounded-xl w-full font-mono text-blue-200/50 cursor-not-allowed" value="sk-agentlens-test_key_123" />
            <button className="bg-white/5 border border-white/10 text-white px-6 py-4 rounded-xl hover:bg-white/10 transition-colors font-semibold tracking-wide shadow-lg whitespace-nowrap">Regenerate Key</button>
          </div>
        </div>

        {/* Configuration */}
        <div className="glass-card p-8 rounded-3xl border border-white/10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center space-x-3 mb-6 relative z-10">
             <Sliders className="text-purple-400" size={24} />
             <h2 className="text-2xl font-bold text-white">Agent Configuration</h2>
          </div>
          <div className="space-y-5 relative z-10">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Expected Agent ID</label>
              <input type="text" className="bg-black/40 border border-white/10 text-white p-3.5 rounded-xl w-full focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600" value={config.agent_id} onChange={e => setConfig({...config, agent_id: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Repository Scope (allowed file paths)</label>
              <input type="text" className="bg-black/40 border border-white/10 text-white p-3.5 rounded-xl w-full focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600" placeholder="/src,/docs" value={config.repo_scope} onChange={e => setConfig({...config, repo_scope: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Max Refund Threshold ($)</label>
              <input type="number" className="bg-black/40 border border-white/10 text-white p-3.5 rounded-xl w-full focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600 font-mono" value={config.max_refund_threshold} onChange={e => setConfig({...config, max_refund_threshold: e.target.value})} />
            </div>
            <button onClick={save} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3.5 rounded-xl hover:from-blue-500 hover:to-indigo-500 font-bold tracking-wide mt-4 shadow-lg shadow-blue-900/50 transform transition active:scale-95 w-full sm:w-auto">
              {saved ? '✓ Successfully Saved' : 'Save Configurations'}
            </button>
          </div>
        </div>

        {/* Hardcoded Policies */}
        <div className="glass-card p-8 rounded-3xl border border-red-500/20 relative overflow-hidden group bg-red-950/10">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center space-x-3 mb-6 relative z-10">
             <ShieldCheck className="text-red-400" size={24} />
             <h2 className="text-2xl font-bold text-white">Active Injection Patterns</h2>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-red-200/80 font-mono relative z-10">
            {["ignore previous instructions", "you are now", "act as", "jailbreak", "dan mode", "---system---"].map((pattern, idx) => (
               <li key={idx} className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center shadow-inner">
                 <span className="w-2 h-2 bg-red-500 rounded-full mr-3 animate-pulse"></span>
                 "{pattern}"
               </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
