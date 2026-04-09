import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('demo@agentlens.test');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        onLogin(data.token);
      } else {
        setError(data.detail || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black overflow-hidden relative">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>

      <div className="z-10 w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 tracking-tight">AgentLens</h1>
          <p className="text-blue-200/60 mt-3 font-medium uppercase tracking-widest text-sm">Real-Time Observability</p>
        </div>

        <div className="glass-card p-8 sm:p-10 rounded-3xl shadow-[0_0_50px_rgba(37,99,235,0.1)] border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
          
          <h2 className="text-2xl font-bold text-white mb-6">Welcome Back</h2>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 text-sm font-medium animate-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <input 
                type="email" 
                required 
                className="w-full bg-black/40 border border-white/10 text-white p-3.5 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-600 font-medium" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="name@company.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <input 
                type="password" 
                required 
                className="w-full bg-black/40 border border-white/10 text-white p-3.5 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-600 font-medium" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="••••••••"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-xl hover:from-blue-500 hover:to-indigo-500 font-bold tracking-wide mt-8 shadow-lg shadow-blue-900/50 transform transition active:scale-95 disabled:opacity-70 flex justify-center items-center"
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : 'Authenticate Access'}
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
             <p className="text-xs text-slate-500 font-medium tracking-wide">Test credentials are automatically pre-filled.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
