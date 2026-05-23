import React, { useState } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import GlassCard from '../components/GlassCard';
import { Sliders, RefreshCw, ShieldAlert } from 'lucide-react';

export const Settings: React.FC = () => {
  const { 
    simulationSpeed, 
    setSimulationSpeed, 
    resetSimulation, 
    connectionMode 
  } = useSimulationStore();

  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = () => {
    resetSimulation();
    setResetSuccess(true);
    setTimeout(() => {
      setResetSuccess(false);
    }, 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
        <p className="text-sm text-slate-400">Configure simulator runtime constants and operational views</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Core parameters */}
        <GlassCard className="space-y-6" glow="cyan">
          <div className="border-b border-white/5 pb-4 flex items-center space-x-2">
            <Sliders size={18} className="text-neonCyan" />
            <h3 className="text-base font-semibold">Simulator Constants</h3>
          </div>

          <div className="space-y-5">
            {/* Speed selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Sim Speed Factor</label>
              <div className="grid grid-cols-3 gap-2 bg-black/40 p-1 border border-slate-800 rounded-xl">
                {[1, 2, 5].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setSimulationSpeed(speed)}
                    className={`py-2 text-xs rounded-lg font-semibold transition-all ${simulationSpeed === speed ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    {speed}x speed
                  </button>
                ))}
              </div>
            </div>

            {/* Connection Mode status indicators */}
            <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold uppercase">API Link Configuration</span>
              <strong className="text-neonCyan capitalize">{connectionMode} mode active</strong>
            </div>

            {/* Accessibility parameters */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Accessibility Overrides</h4>
              
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300">
                <span>Reduced Motion Mode</span>
                <button
                  onClick={() => setReducedMotion(!reducedMotion)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${reducedMotion ? 'bg-neonCyan/20 text-neonCyan border border-neonCyan/30' : 'bg-white/5 text-slate-400'}`}
                >
                  {reducedMotion ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300">
                <span>High Contrast Interface</span>
                <button
                  onClick={() => setHighContrast(!highContrast)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${highContrast ? 'bg-neonCyan/20 text-neonCyan border border-neonCyan/30' : 'bg-white/5 text-slate-400'}`}
                >
                  {highContrast ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Database Overrides */}
        <GlassCard className="space-y-6 border border-red-500/20" glow="purple">
          <div className="border-b border-white/5 pb-4 flex items-center space-x-2">
            <ShieldAlert size={18} className="text-red-400" />
            <h3 className="text-base font-semibold">Maintenance Overrides</h3>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              Resetting coordinates will delete active dispatch records, pedestrian queues, and quantum optimization histories, reverting back to baseline congestion levels.
            </p>

            <button
              onClick={handleReset}
              className="py-3 px-4 rounded-xl border border-red-500/30 hover:border-red-500 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-xs font-semibold transition-all duration-200 flex items-center space-x-2"
            >
              <RefreshCw size={14} className={resetSuccess ? 'animate-spin' : ''} />
              <span>{resetSuccess ? 'Corridor Reset Success!' : 'Reset Corridor Sim Data'}</span>
            </button>
          </div>
        </GlassCard>

      </div>
    </div>
  );
};
export default Settings;
