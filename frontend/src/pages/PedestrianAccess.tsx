import React, { useState } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import GlassCard from '../components/GlassCard';
import { Footprints, Clock, HelpCircle, CheckCircle } from 'lucide-react';

export const PedestrianAccess: React.FC = () => {
  const { junctions, pedestrianRequests, requestPedestrianCrossing } = useSimulationStore();
  const [juncId, setJuncId] = useState('silkboard');
  const [count, setCount] = useState(15);
  const [loading, setLoading] = useState(false);

  const activePeds = pedestrianRequests.filter(r => r.status !== 'completed');
  const completedPeds = pedestrianRequests.filter(r => r.status === 'completed');

  const handleRequest = () => {
    setLoading(true);
    requestPedestrianCrossing(juncId, count);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pedestrian Crossing Negotiation</h1>
        <p className="text-sm text-slate-400">Queue safe walking cross-phase timers matching vehicular congestion loads</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Trigger card */}
        <GlassCard className="space-y-6" glow="purple">
          <div className="border-b border-white/5 pb-4">
            <h3 className="text-base font-semibold">Initiate Crossing Request</h3>
            <p className="text-xs text-slate-400">Simulate pedestrian queue arrivals at intersections</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Intersection</label>
              <select
                value={juncId}
                onChange={(e) => setJuncId(e.target.value)}
                className="w-full p-3 rounded-xl bg-black/40 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-neonPurple"
              >
                {Object.values(junctions).map((j) => (
                  <option key={j.id} value={j.id} className="bg-background">{j.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Pedestrian Headcount</label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="2"
                  max="40"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value) || 5)}
                  className="flex-1 accent-neonPurple cursor-pointer"
                />
                <span className="w-12 text-center text-sm font-bold font-mono text-neonPurple">{count}</span>
              </div>
            </div>

            <button
              onClick={handleRequest}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Footprints size={16} />
              <span>{loading ? 'Submitting Crossing...' : 'Queue Crossing Signal'}</span>
            </button>
          </div>
        </GlassCard>

        {/* Crossing queues list */}
        <GlassCard className="lg:col-span-2 space-y-6 flex flex-col justify-between" glow="cyan">
          <div>
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h3 className="text-base font-semibold">Active Crossing Requests</h3>
              <span className="text-xs text-slate-400 font-mono">Pedestrian signal queue status</span>
            </div>

            <div className="space-y-4 mt-6">
              {activePeds.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-sm">
                  <HelpCircle className="mx-auto mb-2 text-slate-600" size={36} />
                  No active pedestrian requests. Initiate crossing triggers to queue safe walks.
                </div>
              ) : (
                activePeds.map((ped) => (
                  <div key={ped.id} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2 flex justify-between items-center relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-1 h-full ${ped.status === 'approved' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                    
                    <div className="pl-3">
                      <h4 className="font-bold text-sm text-slate-200">
                        Junction: {junctions[ped.junctionId]?.name || ped.junctionId}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">Wait count: {ped.pedestrianCount} pedestrians</p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-lg ${ped.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                          {ped.status}
                        </span>
                        {ped.status === 'pending' && (
                          <div className="flex items-center space-x-1 justify-end text-[10px] text-slate-400 mt-1.5 font-mono">
                            <Clock size={10} />
                            <span>ETA: {ped.etaSecondsToGreen}s</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Completed history */}
          {completedPeds.length > 0 && (
            <div className="mt-8 border-t border-white/5 pt-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Crossing Actions Log</h4>
              <div className="space-y-2">
                {completedPeds.slice(-2).map((ped) => (
                  <div key={ped.id} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300">
                    <div className="flex items-center space-x-2">
                      <CheckCircle size={14} className="text-emerald-400" />
                      <span>{ped.pedestrianCount} pedestrians completed crossing at {junctions[ped.junctionId]?.name || ped.junctionId}.</span>
                    </div>
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
export default PedestrianAccess;
