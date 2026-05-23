# 🚦 QuantumFlow AI — Frontend Client
**React, TypeScript, and Zustand Simulation Dashboard**

A futuristic, dark glassmorphic control center visualization mapping Bengaluru urban corridors.

---

## 1. Directory Structure
```
frontend/
├── src/
│   ├── components/
│   │   └── GlassCard.tsx        # Styled glass backdrop container
│   ├── layouts/
│   │   └── DashboardLayout.tsx  # Header telemetry bar and sidebar navigation
│   ├── pages/
│   │   ├── Dashboard.tsx        # Central operations center KPIs
│   │   ├── TrafficGrid.tsx      # SVG canvas mapping nodes and commuter flows
│   │   ├── Predictions.tsx      # Recharts LSTM weather congestion forecasts
│   │   ├── QuantumOptimizer.tsx # QAOA circuit telemetry and qubit configurations
│   │   ├── EmergencyMode.tsx    # Emergency dispatcher routing selector
│   │   ├── PedestrianAccess.tsx # Safe-walk crossings queue
│   │   ├── Analytics.tsx        # Long-term emission and throughput reporting
│   │   └── Login.tsx            # Operator access security screen
│   ├── store/
│   │   └── simulationStore.ts   # Zustand store, timer cycles, standalone state loop
│   ├── index.css                # Tailwind base and glowing custom effects
│   └── App.tsx                  # React Router layouts config
└── vite.config.ts               # Vite configuration and proxy mappings
```

---

## 2. Dev Scripts
1. Install node dependencies:
   ```bash
   npm install
   ```
2. Launch Vite hot-reload environment:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.
3. Build production assets:
   ```bash
   npm run build
   ```
   Generates minified files under the `/dist` directory.
