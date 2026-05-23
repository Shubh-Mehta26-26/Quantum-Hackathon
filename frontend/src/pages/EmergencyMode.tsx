import React, { useState } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import GlassCard from '../components/GlassCard';
import { ShieldAlert, Navigation, Timer, Activity, Bell, CheckCircle2 } from 'lucide-react';

export const EmergencyMode: React.FC = () => {
  const { junctions, emergencyRoutes, triggerEmergencyCorridor } = useSimulationStore();
  const [vehicle, setVehicle] = useState('ambulance');
  const [start, setStart] = useState('hebbal');
  const [end, setEnd] = useState('silkboard');
  const [loading, setLoading] = useState(false);

  const activeRoutes = emergencyRoutes.filter((r) => r.status === 'active');
  const completedRoutes = emergencyRoutes.filter((r) => r.status === 'completed');

  const handleTrigger = () => {
    if (start === end) return;
    setLoading(true);
    triggerEmergencyCorridor(vehicle, start, end);
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  const junctionsList = Object.values(junctions);

  return (
    <div className="space-y-8">
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Emergency Vehicle Prioritization</h1>
          <p className="text-sm text-slate-400">Establish prioritized green corridors to minimize travel delays for emergency response vehicles</p>
        </div>
        
        {activeRoutes.length > 0 && (
          <div className="flex items-center space-x-2 text-xs bg-red-500/15 border border-red-500/30 text-red-400 rounded-xl px-3 py-1.5 font-bold animate-pulse shadow-purple-glow">
            <Bell size={14} className="animate-bounce" />
            <span>CRITICAL PATH ACTIVE</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Core Controls */}
        <GlassCard className="space-y-6" glow="cyan">
          <div className="border-b border-white/5 pb-4">
            <h3 className="text-base font-semibold">Corridor Dispatcher</h3>
            <p className="text-xs text-slate-400">Configure vehicle and corridor route path</p>
          </div>

          <div className="space-y-4">
            {/* Vehicle selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Priority Vehicle</label>
              <div className="grid grid-cols-3 gap-2 bg-black/40 p-1 border border-slate-800 rounded-xl">
                {[
                  { id: 'ambulance', label: 'Ambulance' },
                  { id: 'fire_truck', label: 'Fire Truck' },
                  { id: 'police', label: 'Police' }
                ].map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVehicle(v.id)}
                    className={`py-2 text-[11px] rounded-lg font-semibold transition-all ${vehicle === v.id ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Path routing selections */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Start Junction</label>
                <select
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="w-full p-3 rounded-xl bg-black/40 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-neonCyan"
                >
                  {junctionsList.map((j) => (
                    <option key={j.id} value={j.id} className="bg-background">{j.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Destination</label>
                <select
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="w-full p-3 rounded-xl bg-black/40 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-neonCyan"
                >
                  {junctionsList.map((j) => (
                    <option key={j.id} value={j.id} className="bg-background">{j.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {start === end && (
              <p className="text-[11px] text-amber-400">Start and destination junctions must be different.</p>
            )}

            <button
              onClick={handleTrigger}
              disabled={loading || start === end}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2 shadow-red-500/20 hover:shadow-red-500/40"
            >
              {loading ? (
                <>
                  <ShieldAlert className="animate-spin" size={16} />
                  <span>Computing Routing Corridors...</span>
                </>
              ) : (
                <>
                  <Navigation size={16} />
                  <span>Activate Green Wave</span>
                </>
              )}
            </button>
          </div>
        </GlassCard>

        {/* Dispatch lists */}
        <GlassCard className="lg:col-span-2 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h3 className="text-base font-semibold">Active Dispatch Corridors</h3>
              <span className="text-xs text-slate-400">Green corridor tracking status</span>
            </div>

            <div className="space-y-4 mt-6">
              {activeRoutes.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-sm">
                  <Activity className="mx-auto mb-2 text-slate-600" size={36} />
                  No priority wave paths currently active in the grid.
                </div>
              ) : (
                activeRoutes.map((route) => (
                  <div key={route.id} className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-red-500 to-rose-600"></div>
                    
                    <div className="flex justify-between items-start pl-2">
                      <div>
                        <h4 className="font-bold text-sm text-red-400 uppercase">Priority dispatch: {route.vehicleType}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">Route Path: {route.path.map(j => junctions[j]?.name || j).join(' ➔ ')}</p>
                      </div>
                      <div className="flex items-center space-x-1 text-slate-300 font-mono text-xs">
                        <Timer size={14} className="text-red-400 animate-spin" />
                        <span>ETA: {route.etaSeconds}s</span>
                      </div>
                    </div>

                    {/* Progress checkpoints list */}
                    <div className="flex justify-between text-[10px] text-slate-400 pl-2">
                      <span>Junction checkpoints:</span>
                      <span className="font-mono">{route.clearedJunctions.length} / {route.path.length} cleared</span>
                    </div>
                    <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div 
                        className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full" 
                        style={{ width: `${(route.clearedJunctions.length / route.path.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Archive / Completed logs */}
          {completedRoutes.length > 0 && (
            <div className="mt-8 border-t border-white/5 pt-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Completed Operations Log</h4>
              <div className="space-y-2">
                {completedRoutes.slice(-2).map((route) => (
                  <div key={route.id} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span className="capitalize">{route.vehicleType.replace('_', ' ')} corridor completed.</span>
                    </div>
                    <span className="text-slate-500 font-mono">
                      {route.path[0]} ➔ {route.path[route.path.length - 1]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </GlassCard>

      </div>
    </div>
  );
};
export default EmergencyMode;
