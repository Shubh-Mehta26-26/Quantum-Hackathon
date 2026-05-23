# 🚦 QuantumFlow AI — Backend Service
**Fastify Node.js Telemetry API**

This service handles authentication, logs junction states, manages emergency routes, and acts as the gatekeeper proxying calls to the Python simulation engine.

---

## 1. Directory Structure
```
backend/
├── src/
│   └── server.ts          # Core Fastify server, DB routing, and simulation mock fallbacks
├── Dockerfile             # Multi-stage production container setup
├── tsconfig.json          # TypeScript configurations
└── package.json           # Node scripts and dependencies
```

---

## 2. API Endpoints

### Authentication
* `POST /api/auth/register` - Create user accounts (Role: admin, analyst, viewer)
* `POST /api/auth/login` - Validate credentials and return JWT authorization token
* `GET /api/auth/profile` - Returns active JWT user payload (Requires JWT header)

### Grid Telemetry & Operations
* `GET /api/traffic/live` - Returns traffic metrics (queues, congestion, speeds, active dispatches)
* `GET /api/traffic/predictions` - Requests weather-adjusted forecasts from the Python service
* `POST /api/simulate/emergency` - Configures congestion-weighted Dijkstra green wave paths
* `POST /api/simulate/pedestrian` - Triggers pedestrian safe-walking timers at specific nodes
* `POST /api/quantum/optimize` - Runs QAOA Max-Cut calculations to sync traffic signals

---

## 3. Running Locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
   The backend will run on `http://localhost:5000`. If PostgreSQL or Redis are not running, it automatically switches to standalone memory mocks.
