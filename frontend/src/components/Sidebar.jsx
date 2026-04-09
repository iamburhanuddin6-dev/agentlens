import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShieldAlert, History, Settings, LogOut } from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();
  const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/security", icon: ShieldAlert, label: "Security" },
    { to: "/replay", icon: History, label: "Trace Replay" },
    { to: "/settings", icon: Settings, label: "Settings" }
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="w-56 bg-gray-900 text-white flex flex-col h-full fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500"></span>
          AgentLens
        </h1>
      </div>
      
      <nav className="flex-1 px-4 mt-6">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white w-full text-left">
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}
