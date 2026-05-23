import React, { useState } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import GlassCard from '../components/GlassCard';
import { Atom, Sparkles, TrendingUp } from 'lucide-react';

export const QuantumOptimizer: React.FC = () => {
  const { quantumLogs, runQuantumOptimizer } = useSimulationStore();
  const [optimizing, setOptimizing] = useState(false);
  const [optMode, setOptMode] = useState<'qaoa' | 'grover'>('qaoa');

  const latestLog = quantumLogs[0];

  const handleOptimize = async () => {
    setOptimizing(true);
    // Simulate gate operation delay
    setTimeout(async () => {
      await runQuantumOptimizer(optMode);
      setOptimizing(false);
    }, 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Quantum-Inspired Optimization</h1>
        <p className="text-sm text-slate-400">Synchronize Bengaluru traffic phases solving global combinatorial optimization models via simulated QAOA circuits</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Core Controls card */}
        <GlassCard className="space-y-6 lg:col-span-1" glow="purple">
          <div className="border-b border-white/5 pb-4">
            <h3 className="text-base font-semibold">Circuit Parameters</h3>
            <p className="text-xs text-slate-400">Define solver coefficients and mode</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Optimization Algorithm</label>
              <div className="grid grid-cols-2 gap-2 bg-black/40 p-1.5 rounded-xl border border-slate-800">
                <button
                  onClick={() => setOptMode('qaoa')}
                  className={`py-2 text-xs rounded-lg font-semibold transition-all ${optMode === 'qaoa' ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  QAOA (Max-Cut)
                </button>
                <button
                  onClick={() => setOptMode('grover')}
                  className={`py-2 text-xs rounded-lg font-semibold transition-all ${optMode === 'grover' ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Grover Search
                </button>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-xs text-slate-400 space-y-2">
              <h4 className="font-semibold text-slate-300">Model Mapping:</h4>
              <p>• <strong>6 Qubits:</strong> Representing 6 junctions phase binary state configuration (0: Standard, 1: Accelerated).</p>
              <p>• <strong>Coupling weights:</strong> Congestion indices determine entanglement coefficients (Ising coupling matrix).</p>
            </div>

            <button
              onClick={handleOptimize}
              disabled={optimizing}
              className="w-full py-4.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold text-sm shadow-purple-glow/30 hover:shadow-purple-glow/50 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {optimizing ? (
                <>
                  <Atom className="animate-spin text-neonCyan" size={18} />
                  <span>Solving Quantum State...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Execute Quantum Sync</span>
                </>
              )}
            </button>
          </div>
        </GlassCard>

        {/* Live Qubit state and circuit display */}
        <GlassCard className="lg:col-span-2 space-y-6 relative flex flex-col justify-between" glow="cyan">
          
          {optimizing && (
            <div className="absolute inset-0 bg-black/80 rounded-2xl flex flex-col items-center justify-center space-y-4 z-20">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-neonCyan border-t-transparent animate-spin"></div>
                <Atom className="absolute top-4 left-4 text-neonPurple animate-pulse" size={32} />
              </div>
              <p className="text-sm font-mono text-glow-cyan text-neonCyan animate-pulse">Running circuit simulation. Hamiltonian parameters mapping...</p>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h3 className="text-base font-semibold">Qubit Circuit Telemetry</h3>
              <span className="text-xs text-slate-400 font-mono">Aer Simulator Feed</span>
            </div>

            {latestLog ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                
                {/* Circuit specs */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Coherence Scorecard</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                      <span className="text-[10px] text-slate-400 block">Qubits count</span>
                      <strong className="text-lg text-neonCyan">{latestLog.qubitsUsed}</strong>
                    </div>
                    <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                      <span className="text-[10px] text-slate-400 block">Gate Depth</span>
                      <strong className="text-lg text-neonPurple">{latestLog.gateDepth}</strong>
                    </div>
                    <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                      <span className="text-[10px] text-slate-400 block">Coherence Time</span>
                      <strong className="text-sm font-mono text-white">{latestLog.circuitTelemetry.coherenceTimeMs} ms</strong>
                    </div>
                    <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                      <span className="text-[10px] text-slate-400 block">Error Rate</span>
                      <strong className="text-sm font-mono text-white">{latestLog.circuitTelemetry.readoutErrorRate}</strong>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center space-x-3">
                    <TrendingUp size={24} />
                    <div>
                      <p className="text-xs font-semibold">Corridor Efficiency Gain</p>
                      <h4 className="text-lg font-bold">+{latestLog.efficiencyGain}% throughput</h4>
                    </div>
                  </div>
                </div>

                {/* Circuit graph representation */}
                <div className="flex flex-col justify-center items-center bg-black/40 border border-slate-800 rounded-xl p-6 relative">
                  <span className="absolute top-2 left-2 text-[8px] font-mono text-slate-500 uppercase">State Vector Output</span>
                  <div className="text-3xl font-extrabold text-neonCyan text-glow-cyan font-mono my-4">
                    {latestLog.bestBitstring}
                  </div>
                  <p className="text-[10px] text-slate-400 text-center uppercase tracking-wider font-mono">
                    Solving: Max-Cut Traffic Alignment
                  </p>
                  
                  {/* Qubit schematic map */}
                  <div className="flex space-x-2 mt-6">
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <span className="text-[9px] text-slate-500 font-mono">q{idx}</span>
                        <span className={`w-3.5 h-3.5 rounded-full border border-slate-700 mt-1 shadow-cyan-glow flex items-center justify-center text-[8px] font-bold ${latestLog.bestBitstring[idx + 1] === '1' ? 'bg-neonCyan text-black' : 'bg-black/50 text-slate-400'}`}>
                          {latestLog.bestBitstring[idx + 1]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-20 text-slate-500 text-sm">
                <Atom className="mx-auto mb-2 text-slate-600 animate-pulse" size={48} />
                No optimization logs generated yet. Click "Execute Quantum Sync" to calculate optimized grid parameters.
              </div>
            )}
          </div>

          {/* History tracker */}
          {latestLog && (
            <div className="mt-8 border-t border-white/5 pt-4 text-xs font-mono text-slate-500">
              Active engine: {latestLog.engine}
            </div>
          )}
        </GlassCard>

      </div>
    </div>
  );
};
export default QuantumOptimizer;
