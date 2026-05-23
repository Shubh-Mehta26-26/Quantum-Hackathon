import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Activity, Eye, EyeOff } from 'lucide-react';
import { useSimulationStore } from '../store/simulationStore';
import GlassCard from '../components/GlassCard';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const setToken = useSimulationStore((state) => state.setToken);
  const [email, setEmail] = useState('analyst@quantumflow.ai');
  const [password, setPassword] = useState('analyst123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Connect to Fastify login route
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (res.ok) {
        setToken(data.token, data.user);
        navigate('/dashboard');
      } else {
        // Fallback for standalone bypass
        if (
          (email === 'admin@quantumflow.ai' && password === 'admin123') ||
          (email === 'analyst@quantumflow.ai' && password === 'analyst123')
        ) {
          const user = {
            id: email.startsWith('admin') ? 'admin-uuid' : 'analyst-uuid',
            email,
            role: email.startsWith('admin') ? 'admin' : 'analyst'
          };
          setToken('mock-jwt-token', user);
          navigate('/dashboard');
        } else {
          setError(data.error || 'Invalid credentials');
        }
      }
    } catch (err) {
      // Offline fallback
      if (
        (email === 'admin@quantumflow.ai' && password === 'admin123') ||
        (email === 'analyst@quantumflow.ai' && password === 'analyst123')
      ) {
        const user = {
          id: email.startsWith('admin') ? 'admin-uuid' : 'analyst-uuid',
          email,
          role: email.startsWith('admin') ? 'admin' : 'analyst'
        };
        setToken('mock-jwt-token', user);
        navigate('/dashboard');
      } else {
        setError('Connection failed. Only hackathon mock accounts authorized.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      
      {/* Background Neon Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neonCyan/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neonPurple/10 rounded-full blur-[120px] pointer-events-none"></div>

      <GlassCard className="w-full max-w-md p-8 border border-white/10 shadow-glass relative" glow="cyan">
        
        {/* Logo/Icon */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-gradient-to-tr from-neonCyan to-neonPurple rounded-2xl flex items-center justify-center shadow-cyan-glow mb-4">
            <Activity size={32} className="text-black font-extrabold" />
          </div>
          <h2 className="text-2xl font-bold tracking-wider bg-gradient-to-r from-neonCyan to-white bg-clip-text text-transparent">QuantumFlow AI</h2>
          <p className="text-xs text-slate-400 text-center mt-1">Smart-City Traffic Simulation Control Panel</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Operator Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-3.5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl glass-input text-sm"
                placeholder="operator@quantumflow.ai"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Access Key</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-3.5 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3 rounded-xl glass-input text-sm"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-slate-500 hover:text-white"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold text-sm shadow-purple-glow/30 hover:shadow-purple-glow/50 transition-all duration-200"
          >
            {loading ? 'Authorizing Operator...' : 'Authorize Operator'}
          </button>
        </form>

        {/* Credentials reminder */}
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Authorized Demo Accounts</p>
          <div className="text-[11px] text-slate-400 space-y-1">
            <p><span className="text-neonCyan">Analyst:</span> analyst@quantumflow.ai / analyst123</p>
            <p><span className="text-neonPurple">Admin:</span> admin@quantumflow.ai / admin123</p>
          </div>
        </div>

      </GlassCard>
    </div>
  );
};
export default Login;
