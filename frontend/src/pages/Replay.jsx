import React, { useState } from 'react';
import DetailPanel from '../components/DetailPanel';
import { getAuthHeader } from '../App';
import { History, Search, Play, Maximize2 } from 'lucide-react';

export default function Replay() {
  const [sessionId, setSessionId] = useState('');
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const investigate = async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, { headers: getAuthHeader() });
      const data = await res.json();
      if(res.ok) {
        setEvents(data);
      } else {
        setEvents([]);
      }
      setLoaded(true);
    } catch(e) { console.error(e) }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-4 mb-8">
        <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
          <History size={32} />
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight">Trace <span className="text-purple-400">Replay</span></h1>
      </div>
      
      <div className="glass-card p-6 rounded-2xl mb-12 border border-white/10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 max-w-3xl items-center relative overflow-hidden backdrop-blur-xl">
        <div className="absolute -right-20 -top-20 w-40 h-40 bg-purple-500/20 rounded-full blur-[50px]"></div>
        <div className="relative flex-grow w-full flex items-center">
           <Search className="absolute left-4 text-slate-500" size={20} />
           <input 
             type="text" 
             className="w-full bg-black/50 border border-white/10 text-white pl-12 pr-4 py-4 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600 font-mono relative z-10" 
             placeholder="Paste Agent Session ID (e.g. sess-1234)..."
             value={sessionId}
             onChange={e => setSessionId(e.target.value)}
             onKeyDown={e => e.key === 'Enter' && investigate()}
           />
        </div>
        <button onClick={investigate} className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-purple-500 hover:to-indigo-500 font-bold tracking-wide shadow-lg shadow-purple-900/50 transform transition active:scale-95 flex items-center justify-center space-x-2 relative z-10 whitespace-nowrap">
          <Play fill="currentColor" size={16} />
          <span>Fetch Replay</span>
        </button>
      </div>

      {loaded && (
        <div className="relative border-l-2 border-white/10 ml-8 pl-12 py-4 space-y-12 before:absolute before:top-0 before:left-[-2px] before:h-full before:w-[2px] before:bg-gradient-to-b before:from-purple-500/50 before:to-transparent">
          {events.length === 0 && (
             <div className="glass-panel p-8 text-center text-slate-400 rounded-2xl border border-white/5">
                <Maximize2 className="mx-auto mb-4 opacity-50" size={32} />
                No events found for this session. Is the ID correct?
             </div>
          )}
          {events.map((ev, i) => (
            <div key={i} className="relative group animate-in slide-in-from-left-4 fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              {/* Timeline dot */}
              <div className={`absolute -left-[58px] top-4 w-6 h-6 rounded-full border-4 border-black shadow-[0_0_15px_rgba(0,0,0,0.5)] z-10 transition-transform group-hover:scale-125 ${ev.status === 'OK' ? 'bg-blue-500 shadow-blue-500/50' : 'bg-red-500 shadow-red-500/50'}`}></div>
              
              {/* Connection line horizontal */}
              <div className="absolute -left-[45px] top-7 w-[45px] h-[2px] bg-white/10 group-hover:bg-white/30 transition-colors"></div>

              <div 
                onClick={() => setSelectedEvent(ev)}
                className={`glass-card p-6 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${ev.status !== 'OK' ? 'border-red-500/30 bg-red-900/10 hover:border-red-500/50' : 'border-white/10 hover:border-white/20'}`}
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-3">
                     <span className={`px-2 py-0.5 rounded text-xs font-black uppercase tracking-widest ${ev.status === 'OK' ? 'bg-blue-500/20 text-blue-300' : 'bg-red-500/20 text-red-300'}`}>Step {i + 1}</span>
                     <div className="font-mono font-bold text-slate-200 text-lg">{ev.tool_name}</div>
                  </div>
                  <div className="text-xs font-medium text-slate-500 bg-white/5 px-3 py-1 rounded-full">{new Date(ev.timestamp).toLocaleTimeString()}</div>
                </div>
                
                <div className="bg-black/50 p-4 rounded-xl border border-white/5 space-y-3 font-mono text-sm shadow-inner overflow-hidden">
                   <div className="flex space-x-4">
                      <span className="text-purple-400 font-semibold uppercase text-xs mt-0.5">IN</span>
                      <span className="text-slate-300 truncate opacity-80">{ev.input_json}</span>
                   </div>
                   <div className="w-full h-px bg-white/5"></div>
                   <div className="flex space-x-4">
                      <span className="text-blue-400 font-semibold uppercase text-xs mt-0.5">Out</span>
                      <span className="text-slate-300 truncate opacity-80">{ev.output_json}</span>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <DetailPanel event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
}
