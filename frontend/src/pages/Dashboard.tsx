import React from 'react';
import { 
  Activity, 
  Wind, 
  Gauge, 
  Car, 
  AlertCircle,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { useSimulationStore } from '../store/simulationStore';
import GlassCard from '../components/GlassCard';

export const Dashboard: React.FC = () => {
  const { 
    junctions, 
    sustainabilityScore, 
    co2SavedKg, 
    averageSpeedKmh, 
    totalVehicles,
    emergencyRoutes,
    pedestrianRequests,
    quantumLogs
  } = useSimulationStore();

  const junctionList = Object.values(junctions);
  
  // Calculate average congestion percentage
  const avgCongestion = junctionList.reduce((acc, curr) => acc + curr.congestionIndex, 0) / (junctionList.length || 1);
  const avgCongestionPct = Math.round(avgCongestion * 100);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bengaluru Operations Center</h1>
          <p className="text-sm text-slate-400">Integrated Smart City Mobility & Signals Dashboard</p>
        </div>
        <div className="flex items-center space-x-2 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-3 py-1.5 font-semibold">
          <Sparkles size={14} className="animate-spin" />
          <span>Quantum Core Online</span>
        </div>
      </div>

      {/* 1. KPI SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Congestion KPI */}
        <GlassCard glow="cyan" hoverEffect>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Average Congestion</p>
              <h3 className="text-3xl font-extrabold mt-2 text-glow-cyan text-neonCyan">{avgCongestionPct}%</h3>
            </div>
            <div className="p-3 bg-neonCyan/10 rounded-xl text-neonCyan">
              <Activity size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-400 space-x-2">
            <span className={avgCongestion > 0.7 ? 'text-red-400' : 'text-emerald-400'}>
              {avgCongestion > 0.7 ? 'Critical Load' : 'Stable Flow'}
            </span>
            <span>•</span>
            <span>6 key intersections</span>
          </div>
        </GlassCard>

        {/* Sustainability KPI */}
        <GlassCard glow="purple" hoverEffect>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">CO2 Reductions</p>
              <h3 className="text-3xl font-extrabold mt-2 text-glow-purple text-neonPurple">{co2SavedKg} kg</h3>
            </div>
            <div className="p-3 bg-neonPurple/10 rounded-xl text-neonPurple">
              <Wind size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-400 space-x-2">
            <span className="text-emerald-400 font-semibold">Sustainability Index: {sustainabilityScore}/100</span>
          </div>
        </GlassCard>

        {/* Speed KPI */}
        <GlassCard hoverEffect>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Grid Speed</p>
              <h3 className="text-3xl font-extrabold mt-2">{averageSpeedKmh} km/h</h3>
            </div>
            <div className="p-3 bg-white/5 rounded-xl text-slate-300">
              <Gauge size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-400 space-x-2">
            <TrendingUp size={14} className="text-emerald-400" />
            <span className="text-emerald-400 font-semibold">+8.4% efficiency improvement</span>
          </div>
        </GlassCard>

        {/* Vehicles KPI */}
        <GlassCard hoverEffect>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Vehicles in Grid</p>
              <h3 className="text-3xl font-extrabold mt-2">{totalVehicles}</h3>
            </div>
            <div className="p-3 bg-white/5 rounded-xl text-slate-300">
              <Car size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-400 space-x-2">
            <span>Average delay: {Math.max(10, Math.round(avgCongestion * 60))}s / vehicle</span>
          </div>
        </GlassCard>

      </div>

      {/* 2. JUNCTIONS OVERVIEW & LOGS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Junction status card */}
        <GlassCard className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <h3 className="text-base font-semibold">Junction Congestion Levels</h3>
            <span className="text-xs text-slate-400">Live Telemetry Feed</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {junctionList.map((j) => (
              <div key={j.id} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-sm">{j.name}</h4>
                    <p className="text-xs text-slate-400">{j.currentPhase}</p>
                  </div>
                  {/* Traffic Light State Indicator */}
                  <div className="flex space-x-1.5 p-1 bg-black/40 rounded-lg border border-slate-800">
                    <span className={`w-3.5 h-3.5 rounded-full ${j.lightState.north === 'green' || j.lightState.east === 'green' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`}></span>
                  </div>
                </div>

                {/* Progress bar congestion index */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-medium text-slate-400">
                    <span>Congestion Load</span>
                    <span className={j.congestionIndex > 0.75 ? 'text-red-400 font-bold' : j.congestionIndex > 0.5 ? 'text-amber-400' : 'text-emerald-400'}>
                      {Math.round(j.congestionIndex * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        j.congestionIndex > 0.75 
                          ? 'bg-gradient-to-r from-red-500 to-rose-600' 
                          : j.congestionIndex > 0.5 
                            ? 'bg-gradient-to-r from-amber-400 to-amber-600' 
                            : 'bg-gradient-to-r from-emerald-400 to-teal-500'
                      }`}
                      style={{ width: `${j.congestionIndex * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Junction queues & speeds */}
                <div className="flex justify-between text-xs text-slate-400 pt-1">
                  <span>Queued vehicles: <strong className="text-white">{j.queueLength}</strong></span>
                  <span>Avg Speed: <strong className="text-white">{j.averageSpeed} km/h</strong></span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Real-time System log console */}
        <GlassCard className="space-y-6 flex flex-col h-[460px]">
          <div className="flex justify-between items-center border-b border-white/5 pb-4 shrink-0">
            <h3 className="text-base font-semibold">Optimization Event Log</h3>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neonCyan opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-neonCyan"></span>
            </span>
          </div>

          <div className="flex-grow overflow-y-auto space-y-4 pr-1 text-xs font-mono">
            {/* 1. Rendering Active Emergencies */}
            {emergencyRoutes.filter(r => r.status === 'active').map((r) => (
              <div key={r.id} className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl space-y-1">
                <div className="flex items-center space-x-1.5 font-bold">
                  <AlertCircle size={14} className="animate-bounce" />
                  <span>EMERGENCY INTERCEPT: {r.vehicleType.toUpperCase()}</span>
                </div>
                <p>Path: {r.path.join(' ➔ ')}</p>
                <p className="text-[10px] opacity-75">Establishing Green Corridor, ETA: {r.etaSeconds}s</p>
              </div>
            ))}

            {/* 2. Pedestrian crossings */}
            {pedestrianRequests.filter(p => p.status !== 'completed').map((p) => (
              <div key={p.id} className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl space-y-1">
                <div className="flex items-center space-x-1.5 font-bold">
                  <AlertCircle size={14} />
                  <span>PEDESTRIAN CROSSING REQ</span>
                </div>
                <p>Junction: {junctions[p.junctionId]?.name || p.junctionId} ({p.pedestrianCount} people)</p>
                <p className="text-[10px] opacity-75">Status: {p.status.toUpperCase()} | ETA: {p.etaSecondsToGreen}s</p>
              </div>
            ))}

            {/* 3. Quantum Logs */}
            {quantumLogs.slice(0, 3).map((l, idx) => (
              <div key={idx} className="p-3 bg-purple-500/10 border border-purple-500/20 text-neonPurple rounded-xl space-y-1">
                <div className="flex items-center space-x-1.5 font-bold">
                  <Sparkles size={14} />
                  <span>QUANTUM OPTIMIZATION</span>
                </div>
                <p>Gain: <strong className="text-white">+{l.efficiencyGain}%</strong> | Bitstate: {l.bestBitstring}</p>
                <p className="text-[10px] opacity-75">Engine: {l.engine}</p>
              </div>
            ))}

            {/* Default simulation active log */}
            <div className="p-3 bg-white/5 border border-white/5 text-slate-400 rounded-xl">
              <span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span> Signal cycles scanning corridor loops (60s phase intervals)...
            </div>
            
            <div className="p-3 bg-white/5 border border-white/5 text-slate-400 rounded-xl">
              <span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span> Telemetry collector: CO2 emission index offset calculated.
            </div>
          </div>
        </GlassCard>

      </div>

    </div>
  );
};
export default Dashboard;
