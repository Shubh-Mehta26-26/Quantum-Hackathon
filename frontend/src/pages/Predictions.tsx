import React, { useEffect, useState } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import GlassCard from '../components/GlassCard';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { BrainCircuit, CloudRain, Sun, RefreshCw, Thermometer } from 'lucide-react';

interface PredictionItem {
  hour: string;
  congestionIndex: number;
  weather: string;
  temperature: number;
  recommendedMode: string;
}

export const Predictions: React.FC = () => {
  const { weather, connectionMode } = useSimulationStore();
  const [predictions, setPredictions] = useState<PredictionItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPredictions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/traffic/predictions?forecastHours=12`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPredictions(data.predictions);
    } catch {
      // Mock predictions matching current state parameters
      const startHour = new Date().getHours();
      const mockList: PredictionItem[] = [];
      
      for (let i = 0; i < 12; i++) {
        const currentHr = (startHour + i) % 24;
        let baseIndex = 0.35;
        
        // Peak office periods
        if ((currentHr >= 8 && currentHr <= 11) || (currentHr >= 17 && currentHr <= 20)) {
          baseIndex = 0.78;
        } else if (currentHr >= 22 || currentHr <= 5) {
          baseIndex = 0.18;
        }

        // Weather multiplier
        if (weather === 'Rainy') {
          baseIndex = Math.min(0.98, baseIndex + 0.16);
        }

        mockList.push({
          hour: `${currentHr.toString().padStart(2, '0')}:00`,
          congestionIndex: parseFloat((baseIndex + Math.random() * 0.08).toFixed(2)),
          weather,
          temperature: weather === 'Rainy' ? 22 : weather === 'Cloudy' ? 26 : 31,
          recommendedMode: baseIndex > 0.65 ? 'Quantum Optimization Mode' : 'Standard Loop'
        });
      }
      setPredictions(mockList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, [weather, connectionMode]);

  return (
    <div className="space-y-8">
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Traffic Forecasting</h1>
          <p className="text-sm text-slate-400">Deep neural net traffic index calculations adjusted for weather and peak hours</p>
        </div>
        <button 
          onClick={fetchPredictions}
          disabled={loading}
          className="p-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center space-x-1.5 transition-all text-xs"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Recalculate Models</span>
        </button>
      </div>

      {/* Weather Overlay Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <GlassCard className="flex items-center space-x-4">
          <div className="p-3.5 bg-yellow-500/10 rounded-xl text-yellow-400">
            {weather === 'Sunny' ? <Sun size={24} className="animate-spin" style={{ animationDuration: '10s' }} /> : <CloudRain size={24} />}
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Active Weather Factor</p>
            <h4 className="text-lg font-bold mt-1 text-white">{weather} Condition</h4>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center space-x-4">
          <div className="p-3.5 bg-neonCyan/10 rounded-xl text-neonCyan">
            <Thermometer size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Estimated Grid Temp</p>
            <h4 className="text-lg font-bold mt-1 text-white">
              {weather === 'Rainy' ? '22°C' : weather === 'Cloudy' ? '26°C' : '31°C'}
            </h4>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center space-x-4">
          <div className="p-3.5 bg-neonPurple/10 rounded-xl text-neonPurple">
            <BrainCircuit size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Inference Model</p>
            <h4 className="text-lg font-bold mt-1 text-white">LSTM-Corridor v3.2</h4>
          </div>
        </GlassCard>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recharts Chart */}
        <GlassCard className="lg:col-span-2 space-y-6" glow="cyan">
          <div className="border-b border-white/5 pb-4">
            <h3 className="text-base font-semibold">12-Hour Congestion Projection</h3>
            <p className="text-xs text-slate-400">Grid congestion trends indexing</p>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={predictions} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCongestion" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 1.0]} tickFormatter={(v) => `${Math.round(v * 100)}%`} />
                <Tooltip 
                  contentStyle={{ 
                    background: '#0d0924', 
                    border: '1px solid rgba(0, 240, 255, 0.3)', 
                    borderRadius: '12px',
                    color: '#fff',
                    fontFamily: 'monospace'
                  }}
                  formatter={(val: any) => [`${Math.round(val * 100)}%`, 'Congestion Index']}
                />
                <Line 
                  type="monotone" 
                  dataKey="congestionIndex" 
                  stroke="#00f0ff" 
                  strokeWidth={3} 
                  dot={{ r: 4, strokeWidth: 2, stroke: '#030014' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* AI Recommendations */}
        <GlassCard className="space-y-6">
          <div className="border-b border-white/5 pb-4">
            <h3 className="text-base font-semibold">Smart Signal Recommendations</h3>
            <p className="text-xs text-slate-400">Autonomous balancing overrides</p>
          </div>

          <div className="space-y-4">
            {predictions.slice(0, 4).map((p, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-slate-300">Hour: {p.hour}</span>
                  <span className={p.congestionIndex > 0.65 ? 'text-red-400' : 'text-emerald-400'}>
                    Load: {Math.round(p.congestionIndex * 100)}%
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  Recommendation: <strong className="text-white">{p.recommendedMode}</strong>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${p.congestionIndex > 0.65 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                    style={{ width: `${p.congestionIndex * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

      </div>

    </div>
  );
};
export default Predictions;
