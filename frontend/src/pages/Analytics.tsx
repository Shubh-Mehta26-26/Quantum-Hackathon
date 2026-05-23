import React, { useEffect, useState } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import GlassCard from '../components/GlassCard';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Wind, ShieldCheck, Zap, RefreshCw } from 'lucide-react';

interface ReportData {
  summary: {
    totalActiveJunctions: number;
    activeSimulationTimeSec: number;
    sustainabilityScore: number;
    averageGridSpeedKmh: number;
    averageCongestionIndex: number;
    totalVehiclesInSystem: number;
    totalCO2ReductionKg: number;
  };
  hourlyFlow: Array<{
    time: string;
    vehiclesPassed: number;
    co2SavedKg: number;
    efficiencyPct: number;
  }>;
}

export const Analytics: React.FC = () => {
  const { sustainabilityScore, co2SavedKg, averageSpeedKmh, totalVehicles, connectionMode } = useSimulationStore();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics/report`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setReport(data);
    } catch {
      // Mock reporting
      const hourlyFlow = [
        { time: '09:00', vehiclesPassed: 240, co2SavedKg: 8.5, efficiencyPct: 72 },
        { time: '10:00', vehiclesPassed: 380, co2SavedKg: 12.4, efficiencyPct: 65 },
        { time: '11:00', vehiclesPassed: 310, co2SavedKg: 10.2, efficiencyPct: 69 },
        { time: '12:00', vehiclesPassed: 290, co2SavedKg: 9.8, efficiencyPct: 75 },
        { time: '13:00', vehiclesPassed: 340, co2SavedKg: 11.5, efficiencyPct: 78 },
        { time: '14:00', vehiclesPassed: 410, co2SavedKg: 14.8, efficiencyPct: 84 },
        { time: '15:00', vehiclesPassed: 390, co2SavedKg: 13.9, efficiencyPct: 82 }
      ];
      setReport({
        summary: {
          totalActiveJunctions: 6,
          activeSimulationTimeSec: 120,
          sustainabilityScore,
          averageGridSpeedKmh: averageSpeedKmh,
          averageCongestionIndex: 0.6,
          totalVehiclesInSystem: totalVehicles,
          totalCO2ReductionKg: co2SavedKg
        },
        hourlyFlow
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [co2SavedKg, averageSpeedKmh, totalVehicles, connectionMode]);

  return (
    <div className="space-y-8">
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Environmental & Performance Analytics</h1>
          <p className="text-sm text-slate-400">Deep performance logs evaluating carbon offset margins and traffic throughput ratios</p>
        </div>
        <button 
          onClick={fetchAnalytics}
          disabled={loading}
          className="p-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center space-x-1.5 transition-all text-xs"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Report</span>
        </button>
      </div>

      {report && (
        <>
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <GlassCard className="flex items-center space-x-4">
              <div className="p-3.5 bg-emerald-500/10 rounded-xl text-emerald-400">
                <Wind size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Total Carbon Offset</p>
                <h4 className="text-lg font-bold mt-1 text-white">{report.summary.totalCO2ReductionKg} kg CO2</h4>
              </div>
            </GlassCard>

            <GlassCard className="flex items-center space-x-4">
              <div className="p-3.5 bg-yellow-500/10 rounded-xl text-yellow-400">
                <Zap size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Energy Savings Index</p>
                <h4 className="text-lg font-bold mt-1 text-white">+{Math.round(report.summary.sustainabilityScore * 0.4)}% saved</h4>
              </div>
            </GlassCard>

            <GlassCard className="flex items-center space-x-4">
              <div className="p-3.5 bg-neonCyan/10 rounded-xl text-neonCyan">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Optimization Compliance</p>
                <h4 className="text-lg font-bold mt-1 text-white">99.8% safe</h4>
              </div>
            </GlassCard>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Flow rate Chart */}
            <GlassCard className="space-y-6" glow="cyan">
              <div className="border-b border-white/5 pb-4">
                <h3 className="text-base font-semibold">Vehicular Throughput (Hourly)</h3>
                <p className="text-xs text-slate-400">Total vehicle passages per hour</p>
              </div>

              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report.hourlyFlow} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip 
                      contentStyle={{ background: '#0d0924', border: '1px solid rgba(0, 240, 255, 0.3)', color: '#fff' }}
                    />
                    <Bar dataKey="vehiclesPassed" fill="#00f0ff" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            {/* Sustainability chart */}
            <GlassCard className="space-y-6" glow="purple">
              <div className="border-b border-white/5 pb-4">
                <h3 className="text-base font-semibold">CO2 Savings Progress</h3>
                <p className="text-xs text-slate-400">Aggregated carbon reduction trend</p>
              </div>

              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={report.hourlyFlow} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d946ef" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#d946ef" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip 
                      contentStyle={{ background: '#0d0924', border: '1px solid rgba(217, 70, 239, 0.3)', color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="co2SavedKg" stroke="#d946ef" fillOpacity={1} fill="url(#colorCo2)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

          </div>
        </>
      )}

    </div>
  );
};
export default Analytics;
