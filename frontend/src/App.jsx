import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Activity, ShieldAlert, History, Settings as SettingsIcon, LogOut } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Security from './pages/Security';
import Replay from './pages/Replay';
import Settings from './pages/Settings';
import Login from './pages/Login';
import './index.css';

export function getAuthHeader() {
  const token = localStorage.getItem('token');
  return { 'Authorization': `Bearer ${token}` };
}

function Sidebar({ onLogout }) {
  const location = useLocation();
  const nav = [
    { name: 'Dashboard', path: '/', icon: Activity },
    { name: 'Security', path: '/security', icon: ShieldAlert },
    { name: 'Replay', path: '/replay', icon: History },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <div className="w-64 glass-panel text-white min-h-screen p-4 border-r border-white/10 flex flex-col z-10 relative">
      <h2 className="text-2xl font-bold mb-8 tracking-wider">AgentLens</h2>
      <nav className="flex-1 space-y-2">
        {nav.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
              <item.icon size={20} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
      <div className="mt-auto pt-4 border-t border-gray-800 text-sm flex items-center justify-between">
        <span className="text-gray-400">Authenticated User</span>
        <button onClick={onLogout} title="Log Out" className="text-gray-400 hover:text-white transition-colors">
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}

function Layout({ children, onLogout }) {
  return (
    <div className="flex h-screen overflow-hidden font-sans text-slate-200">
      <Sidebar onLogout={onLogout} />
      <main className="flex-1 overflow-y-auto p-8 relative">
        {children}
      </main>
    </div>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  if (!token) return <Login onLogin={setToken} />;

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  }

  return (
    <BrowserRouter>
      <Layout onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/security" element={<Security />} />
          <Route path="/replay" element={<Replay />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
