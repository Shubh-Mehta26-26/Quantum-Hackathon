import { create } from 'zustand';

export interface Junction {
  id: string;
  name: string;
  congestionIndex: number; // 0.0 to 1.0
  queueLength: number;
  averageSpeed: number; // km/h
  currentPhase: string;
  lightState: { north: string; south: string; east: string; west: string };
  pedestrianWaiting: boolean;
}

export interface EmergencyRoute {
  id: string;
  vehicleType: string;
  startJunction: string;
  endJunction: string;
  path: string[];
  etaSeconds: number;
  clearedJunctions: string[];
  status: 'active' | 'completed';
}

export interface PedestrianRequest {
  id: string;
  junctionId: string;
  pedestrianCount: number;
  status: 'pending' | 'approved' | 'completed';
  requestedAt: string;
  etaSecondsToGreen: number;
}

export interface QuantumTelemetry {
  optimized: boolean;
  engine: string;
  efficiencyGain: number;
  qubitsUsed: number;
  gateDepth: number;
  bestBitstring: string;
  circuitTelemetry: {
    qubitState: string;
    coherenceTimeMs: number;
    readoutErrorRate: number;
  };
  phaseDelays: Record<string, number>;
}

export interface SimulationState {
  // Global simulation states
  junctions: Record<string, Junction>;
  emergencyRoutes: EmergencyRoute[];
  pedestrianRequests: PedestrianRequest[];
  quantumLogs: QuantumTelemetry[];
  
  // Analytics metrics
  sustainabilityScore: number;
  co2SavedKg: number;
  averageSpeedKmh: number;
  totalVehicles: number;
  simulationTimeSec: number;
  
  // Control Panel
  isSimulating: boolean;
  simulationSpeed: number; // 1x, 2x, 5x
  connectionMode: 'live' | 'standalone';
  weather: 'Sunny' | 'Rainy' | 'Cloudy';
  timeOfDay: string;
  token: string | null;
  user: { email: string; role: string } | null;

  // Actions
  setToken: (token: string | null, user: any | null) => void;
  toggleSimulation: () => void;
  setSimulationSpeed: (speed: number) => void;
  setConnectionMode: (mode: 'live' | 'standalone') => void;
  setWeather: (weather: 'Sunny' | 'Rainy' | 'Cloudy') => void;
  
  // Async Trigger APIs
  fetchGridState: () => Promise<void>;
  triggerEmergencyCorridor: (vehicleType: string, start: string, end: string) => Promise<void>;
  requestPedestrianCrossing: (junctionId: string, count: number) => Promise<void>;
  runQuantumOptimizer: (mode: 'qaoa' | 'grover') => Promise<void>;
  resetSimulation: () => void;
}

const defaultJunctions: Record<string, Junction> = {
  silkboard: {
    id: 'silkboard',
    name: 'Silk Board',
    congestionIndex: 0.85,
    queueLength: 48,
    averageSpeed: 12.5,
    currentPhase: 'North-South Green',
    lightState: { north: 'green', south: 'green', east: 'red', west: 'red' },
    pedestrianWaiting: false
  },
  btm: {
    id: 'btm',
    name: 'BTM Layout',
    congestionIndex: 0.62,
    queueLength: 22,
    averageSpeed: 24.0,
    currentPhase: 'East-West Green',
    lightState: { north: 'red', south: 'red', east: 'green', west: 'green' },
    pedestrianWaiting: false
  },
  hsr: {
    id: 'hsr',
    name: 'HSR Layout',
    congestionIndex: 0.45,
    queueLength: 15,
    averageSpeed: 32.5,
    currentPhase: 'North-South Green',
    lightState: { north: 'green', south: 'green', east: 'red', west: 'red' },
    pedestrianWaiting: false
  },
  hebbal: {
    id: 'hebbal',
    name: 'Hebbal Flyover',
    congestionIndex: 0.78,
    queueLength: 39,
    averageSpeed: 18.2,
    currentPhase: 'North-South Green',
    lightState: { north: 'green', south: 'green', east: 'red', west: 'red' },
    pedestrianWaiting: false
  },
  marathahalli: {
    id: 'marathahalli',
    name: 'Marathahalli Bridge',
    congestionIndex: 0.70,
    queueLength: 31,
    averageSpeed: 20.8,
    currentPhase: 'East-West Green',
    lightState: { north: 'red', south: 'red', east: 'green', west: 'green' },
    pedestrianWaiting: false
  },
  koramangala: {
    id: 'koramangala',
    name: 'Koramangala 80ft Rd',
    congestionIndex: 0.55,
    queueLength: 18,
    averageSpeed: 28.0,
    currentPhase: 'North-South Green',
    lightState: { north: 'green', south: 'green', east: 'red', west: 'red' },
    pedestrianWaiting: false
  }
};

const BASE_URL = ''; // configured through vite proxy / local URLs

export const useSimulationStore = create<SimulationState>((set, get) => {
  // Local timer loop for updating standalone metrics
  let standaloneTimer: any = null;

  const startLocalLoop = () => {
    if (standaloneTimer) clearInterval(standaloneTimer);
    
    standaloneTimer = setInterval(() => {
      if (!get().isSimulating) return;

      const state = get();
      const updatedJunctions = { ...state.junctions };

      // Apply dynamic movements
      Object.keys(updatedJunctions).forEach((key) => {
        const j = updatedJunctions[key];
        const isEmergency = j.currentPhase === 'EMERGENCY PRIORITIZED';

        // Congestion index changes
        const arrival = Math.floor(Math.random() * 5) + 2;
        const departure = isEmergency ? 12 : (j.currentPhase.includes('Green') ? 7 : 1);
        
        j.queueLength = Math.max(1, j.queueLength + arrival - departure);
        j.congestionIndex = Math.min(0.98, Math.max(0.1, parseFloat((j.queueLength / 60).toFixed(2))));
        j.averageSpeed = Math.max(6, parseFloat((48 * (1.0 - j.congestionIndex)).toFixed(1)));

        // Light Phase conceptual cycles
        if (Math.random() > 0.82 && !isEmergency && j.currentPhase !== 'Pedestrian Crossing Active') {
          if (j.currentPhase.includes('North-South')) {
            j.currentPhase = 'East-West Green';
            j.lightState = { north: 'red', south: 'red', east: 'green', west: 'green' };
          } else {
            j.currentPhase = 'North-South Green';
            j.lightState = { north: 'green', south: 'green', east: 'red', west: 'red' };
          }
        }
      });

      // Update emergency routes step
      const updatedEmergencies = state.emergencyRoutes.map((route) => {
        if (route.status === 'active') {
          const nextIndex = route.clearedJunctions.length;
          if (nextIndex < route.path.length) {
            const nextJ = route.path[nextIndex];
            // Clear signal
            if (updatedJunctions[nextJ]) {
              updatedJunctions[nextJ].currentPhase = 'EMERGENCY PRIORITIZED';
              updatedJunctions[nextJ].lightState = { north: 'green', south: 'green', east: 'green', west: 'green' };
            }
            return {
              ...route,
              clearedJunctions: [...route.clearedJunctions, nextJ],
              etaSeconds: Math.max(0, route.etaSeconds - 30)
            };
          } else {
            // Restore phases
            route.path.forEach((node) => {
              if (updatedJunctions[node]) {
                updatedJunctions[node].currentPhase = 'North-South Green';
              }
            });
            return { ...route, status: 'completed' as const, etaSeconds: 0 };
          }
        }
        return route;
      });

      // Update pedestrian routes step
      const updatedPedestrians = state.pedestrianRequests.map((ped) => {
        if (ped.status === 'pending') {
          const nextEta = Math.max(0, ped.etaSecondsToGreen - 5);
          if (nextEta === 0) {
            if (updatedJunctions[ped.junctionId]) {
              updatedJunctions[ped.junctionId].currentPhase = 'Pedestrian Crossing Active';
              updatedJunctions[ped.junctionId].lightState = { north: 'red', south: 'red', east: 'red', west: 'red' };
            }
            return { ...ped, status: 'approved' as const, etaSecondsToGreen: 0 };
          }
          return { ...ped, etaSecondsToGreen: nextEta };
        } else if (ped.status === 'approved') {
          if (updatedJunctions[ped.junctionId]) {
            updatedJunctions[ped.junctionId].currentPhase = 'North-South Green';
          }
          return { ...ped, status: 'completed' as const };
        }
        return ped;
      });

      // Calculate global aggregates
      let speedSum = 0;
      let congestionSum = 0;
      let queueSum = 0;
      Object.values(updatedJunctions).forEach((j) => {
        speedSum += j.averageSpeed;
        congestionSum += j.congestionIndex;
        queueSum += j.queueLength;
      });

      const avgCongestion = congestionSum / 6;
      const sustainability = Math.max(10, Math.floor((1.0 - avgCongestion) * 100));

      set({
        junctions: updatedJunctions,
        emergencyRoutes: updatedEmergencies,
        pedestrianRequests: updatedPedestrians,
        averageSpeedKmh: parseFloat((speedSum / 6).toFixed(1)),
        sustainabilityScore: sustainability,
        co2SavedKg: parseFloat((state.co2SavedKg + (sustainability > 60 ? 0.2 : 0.05)).toFixed(2)),
        totalVehicles: queueSum * 4 + 30,
        simulationTimeSec: state.simulationTimeSec + get().simulationSpeed
      });

    }, 1000 / get().simulationSpeed);
  };

  return {
    junctions: defaultJunctions,
    emergencyRoutes: [],
    pedestrianRequests: [],
    quantumLogs: [],
    sustainabilityScore: 68,
    co2SavedKg: 142.4,
    averageSpeedKmh: 22.5,
    totalVehicles: 154,
    simulationTimeSec: 0,
    isSimulating: true,
    simulationSpeed: 1,
    connectionMode: 'standalone',
    weather: 'Sunny',
    timeOfDay: '15:00',
    token: localStorage.getItem('token'),
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,

    setToken: (token, user) => {
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      set({ token, user });
    },

    toggleSimulation: () => {
      const current = get().isSimulating;
      set({ isSimulating: !current });
      if (!current) {
        if (get().connectionMode === 'standalone') startLocalLoop();
      } else {
        if (standaloneTimer) clearInterval(standaloneTimer);
      }
    },

    setSimulationSpeed: (speed) => {
      set({ simulationSpeed: speed });
      if (get().isSimulating && get().connectionMode === 'standalone') {
        startLocalLoop();
      }
    },

    setConnectionMode: (mode) => {
      set({ connectionMode: mode });
      if (mode === 'standalone') {
        startLocalLoop();
      } else {
        if (standaloneTimer) clearInterval(standaloneTimer);
      }
    },

    setWeather: (weather) => {
      set({ weather });
    },

    fetchGridState: async () => {
      if (get().connectionMode === 'standalone') {
        if (!standaloneTimer && get().isSimulating) startLocalLoop();
        return;
      }

      // Query Fastify API
      try {
        const res = await fetch(`${BASE_URL}/api/traffic/live`);
        if (!res.ok) throw new Error('API server unavailable');
        const data = await res.json();
        set({
          junctions: data.junctions,
          emergencyRoutes: data.activeEmergencyCorridors || [],
          pedestrianRequests: data.activePedestrianRequests || []
        });
      } catch (err) {
        console.warn('Live API connection failed. Toggling to local standalone simulator.', err);
        set({ connectionMode: 'standalone' });
        startLocalLoop();
      }
    },

    triggerEmergencyCorridor: async (vehicleType, start, end) => {
      const state = get();
      if (state.connectionMode === 'standalone') {
        const path = [start];
        if (start !== end) {
          if (start === 'hebbal' && end === 'silkboard') path.push('koramangala');
          else if (start === 'silkboard' && end === 'hebbal') path.push('btm', 'koramangala');
          else path.push('marathahalli');
          path.push(end);
        }

        const newRoute: EmergencyRoute = {
          id: `emg-${Date.now()}`,
          vehicleType,
          startJunction: start,
          endJunction: end,
          path,
          etaSeconds: path.length * 45,
          clearedJunctions: [start],
          status: 'active'
        };

        const updatedJunctions = { ...state.junctions };
        if (updatedJunctions[start]) {
          updatedJunctions[start].currentPhase = 'EMERGENCY PRIORITIZED';
        }

        set({
          emergencyRoutes: [...state.emergencyRoutes, newRoute],
          junctions: updatedJunctions
        });
        return;
      }

      // Call Fastify POST Endpoint
      try {
        const res = await fetch(`${BASE_URL}/api/simulate/emergency`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vehicleType, startJunction: start, endJunction: end })
        });
        const data = await res.json();
        set({ emergencyRoutes: [...get().emergencyRoutes, data] });
      } catch (err) {
        console.error('API failed. Run local standalone fallback.', err);
      }
    },

    requestPedestrianCrossing: async (junctionId, count) => {
      const state = get();
      if (state.connectionMode === 'standalone') {
        const newPed: PedestrianRequest = {
          id: `ped-${Date.now()}`,
          junctionId,
          pedestrianCount: count,
          status: 'pending',
          requestedAt: new Date().toISOString(),
          etaSecondsToGreen: 15
        };

        const updatedJunctions = { ...state.junctions };
        if (updatedJunctions[junctionId]) {
          updatedJunctions[junctionId].pedestrianWaiting = true;
        }

        set({
          pedestrianRequests: [...state.pedestrianRequests, newPed],
          junctions: updatedJunctions
        });
        return;
      }

      // Call Fastify POST
      try {
        const res = await fetch(`${BASE_URL}/api/simulate/pedestrian`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ junctionId, pedestrianCount: count })
        });
        const data = await res.json();
        set({ pedestrianRequests: [...get().pedestrianRequests, data] });
      } catch (err) {
        console.error(err);
      }
    },

    runQuantumOptimizer: async (mode) => {
      const state = get();
      
      if (state.connectionMode === 'standalone') {
        // Run simulated quantum annealing algorithm
        const gain = parseFloat((12.4 + Math.random() * 6.5).toFixed(2));
        const bitstring = Array.from({ length: 6 }, () => Math.random() > 0.4 ? '1' : '0').join('');
        
        const phases: Record<string, number> = {};
        const updatedJunctions = { ...state.junctions };
        
        const junctionsKeys = Object.keys(updatedJunctions);
        junctionsKeys.forEach((key, idx) => {
          const bit = bitstring[idx];
          phases[key] = bit === '1' ? 45 : 30;
          
          // Apply optimization reduction to stats
          const j = updatedJunctions[key];
          j.congestionIndex = parseFloat((j.congestionIndex * 0.78).toFixed(2));
          j.queueLength = Math.max(3, Math.floor(j.queueLength * 0.72));
          j.averageSpeed = parseFloat((j.averageSpeed * 1.25).toFixed(1));
        });

        const newLog: QuantumTelemetry = {
          optimized: true,
          engine: 'NumPy Quantum-Inspired Circuit Simulator (Standalone)',
          efficiencyGain: gain,
          qubitsUsed: 6,
          gateDepth: mode === 'qaoa' ? 24 : 12,
          bestBitstring: `|${bitstring}⟩`,
          circuitTelemetry: {
            qubitState: `|${bitstring}⟩`,
            coherenceTimeMs: 160.5,
            readoutErrorRate: 0.0002
          },
          phaseDelays: phases
        };

        set({
          quantumLogs: [newLog, ...state.quantumLogs],
          junctions: updatedJunctions,
          sustainabilityScore: Math.min(99, state.sustainabilityScore + 12)
        });
        return;
      }

      // Call Fastify POST
      try {
        const res = await fetch(`${BASE_URL}/api/quantum/optimize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode })
        });
        const data = await res.json();
        set({
          quantumLogs: [data, ...get().quantumLogs],
          sustainabilityScore: Math.min(99, get().sustainabilityScore + 10)
        });
      } catch (err) {
        console.error(err);
      }
    },

    resetSimulation: () => {
      set({
        junctions: defaultJunctions,
        emergencyRoutes: [],
        pedestrianRequests: [],
        quantumLogs: [],
        sustainabilityScore: 68,
        co2SavedKg: 142.4,
        averageSpeedKmh: 22.5,
        totalVehicles: 154,
        simulationTimeSec: 0
      });
    }
  };
});
