import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  BrainCircuit, 
  Atom, 
  Flame, 
  Footprints, 
  BarChart3, 
  Settings as SettingsIcon,
  Activity, 
  Wifi, 
  WifiOff, 
  CloudSun,
  Shield,
  LogOut,
  Play,
  Pause
} from 'lucide-react';
import { useSimulationStore } from '../store/simulationStore';

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-gradient-to-r from-violet-600/50 to-fuchsia-600/50 text-white border-l-4 border-neonCyan font-medium shadow-cyan-glow/20' 
        : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`}
  >
    <div className={active ? 'text-neonCyan' : ''}>{icon}</div>
    <span>{label}</span>
  </Link>
);

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    isSimulating, 
    toggleSimulation, 
    simulationSpeed, 
    setSimulationSpeed, 
    connectionMode, 
    setConnectionMode, 
    weather, 
    setWeather, 
    fetchGridState,
    token,
    user,
    setToken
  } = useSimulationStore();

  // Periodic state fetch cycle
  useEffect(() => {
    fetchGridState();
    const interval = setInterval(() => {
      fetchGridState();
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchGridState, connectionMode]);

  const handleLogout = () => {
    setToken(null, null);
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/grid', icon: <Map size={20} />, label: 'Traffic Grid' },
    { to: '/predictions', icon: <BrainCircuit size={20} />, label: 'AI Predictions' },
    { to: '/quantum', icon: <Atom size={20} />, label: 'Quantum Optimizer' },
    { to: '/emergency', icon: <Flame size={20} />, label: 'Emergency Mode' },
    { to: '/pedestrian', icon: <Footprints size={20} />, label: 'Pedestrian Access' },
    { to: '/analytics', icon: <BarChart3 size={20} />, label: 'Analytics' },
    { to: '/settings', icon: <SettingsIcon size={20} />, label: 'Settings' }
  ];

  return (
    <div className="min-h-screen flex text-slate-100 font-sans">
      
      {/* 1. SIDEBAR */}
      <aside className="w-64 glass-panel border-r border-slate-800/80 flex flex-col justify-between shrink-0 p-4">
        <div>
          {/* Logo */}
          <div className="flex items-center space-x-3 px-4 py-6 border-b border-slate-800/60 mb-6">
            <div className="p-2 bg-gradient-to-tr from-neonCyan to-neonPurple rounded-lg flex items-center justify-center shadow-cyan-glow">
              <Activity size={22} className="text-black font-extrabold animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wider bg-gradient-to-r from-neonCyan to-white bg-clip-text text-transparent">QuantumFlow</h1>
              <p className="text-[10px] text-neonPurple font-semibold uppercase tracking-widest">Traffic AI Sim</p>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <SidebarItem 
                key={item.to} 
                to={item.to} 
                icon={item.icon} 
                label={item.label} 
                active={location.pathname === item.to} 
              />
            ))}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="border-t border-slate-800/60 pt-4 mt-6">
          {token && user ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 mb-3">
              <div className="flex items-center space-x-2 overflow-hidden">
                <div className="p-2 bg-purple-600/30 rounded-lg text-neonPurple shrink-0">
                  <Shield size={16} />
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold truncate">{user.email}</p>
                  <p className="text-[9px] text-slate-400 capitalize">{user.role}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout} 
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="flex items-center justify-center space-x-2 w-full py-2.5 rounded-xl border border-neonCyan/30 hover:border-neonCyan bg-neonCyan/5 hover:bg-neonCyan/10 text-neonCyan text-xs font-semibold transition-all duration-200"
            >
              <span>Access Operations Control</span>
            </Link>
          )}
          
          <div className="text-center text-[10px] text-slate-500">
            QuantumFlow AI v1.0.0
          </div>
        </div>
      </aside>

      {/* 2. MAIN SECTION */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header Telemetry bar */}
        <header className="h-16 glass-panel border-b border-slate-800/80 flex items-center justify-between px-8 z-10 shrink-0">
          <div className="flex items-center space-x-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Smart Corridor Telemetry</h2>
            <div className="h-4 w-px bg-slate-800"></div>
            
            {/* Simulation controls */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={toggleSimulation} 
                className={`p-1.5 rounded-lg transition-all ${
                  isSimulating 
                    ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                }`}
                title={isSimulating ? 'Pause Simulator' : 'Start Simulator'}
              >
                {isSimulating ? <Pause size={15} /> : <Play size={15} />}
              </button>
              
              <div className="flex bg-white/5 rounded-lg p-0.5 border border-slate-800">
                {[1, 2, 5].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setSimulationSpeed(speed)}
                    className={`px-2 py-0.5 text-xs rounded transition-all ${
                      simulationSpeed === speed 
                        ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            
            {/* Weather Dropdown */}
            <div className="flex items-center space-x-2 text-xs bg-white/5 border border-slate-800 rounded-xl px-3 py-1.5">
              <CloudSun size={14} className="text-neonCyan" />
              <select 
                value={weather} 
                onChange={(e) => setWeather(e.target.value as any)} 
                className="bg-transparent border-none text-white focus:outline-none cursor-pointer"
              >
                <option value="Sunny" className="bg-background">Sunny</option>
                <option value="Cloudy" className="bg-background">Cloudy</option>
                <option value="Rainy" className="bg-background">Rainy</option>
              </select>
            </div>

            {/* Connection mode toggle */}
            <button
              onClick={() => setConnectionMode(connectionMode === 'live' ? 'standalone' : 'live')}
              className={`flex items-center space-x-2 text-xs rounded-xl px-3 py-1.5 border transition-all ${
                connectionMode === 'live'
                  ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400 shadow-emerald-500/5'
                  : 'border-amber-500/30 bg-amber-500/5 text-amber-400'
              }`}
            >
              {connectionMode === 'live' ? (
                <>
                  <Wifi size={14} />
                  <span>Grid Connected</span>
                </>
              ) : (
                <>
                  <WifiOff size={14} />
                  <span>Standalone Sim</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Dynamic page container */}
        <main className="flex-grow overflow-y-auto p-8 relative">
          {children}
        </main>
      </div>

    </div>
  );
};
export default DashboardLayout;
