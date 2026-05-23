# 🚦 QuantumFlow AI
### **Quantum-Inspired Smart Traffic Optimization Simulator**

QuantumFlow AI is an educational, interactive smart-city operations and simulation dashboard focused on optimizing urban mobility grid networks. It simulates adaptive signal phase changes, green wave priority corridor calculations, and quantum-inspired optimizations to balance traffic flows.

---

## 1. Project Highlights
* **Bengaluru Smart Corridor Mapping**: Interactive topology canvas visualizes real-time commuter bottlenecks across major intersections (Hebbal Flyover, Marathahalli Bridge, Koramangala 80ft Rd, HSR Layout, BTM Layout, Silk Board).
* **Quantum Timing Sync (Simulated)**: A simulated Quantum Approximate Optimization Algorithm (QAOA) Max-Cut formulation computes optimal phase overlaps to clear vehicle queues.
* **Emergency Green Corridors**: Dispatch prioritize signal paths for emergency vehicles using dynamic Dijkstra routing.
* **Pedestrian Access Negotiations**: Crossing queues coordinate safe walking phases without grid deadlock.
* **Dual Runtime Connection**: Automatically falls back to a high-fidelity local simulator if backend APIs are offline, ensuring a 100% reliable hackathon demonstration.

---

## 2. Tech Stack Justification
* **Frontend SPA**: React 18, TypeScript, Tailwind CSS, Zustand (state-loops), Lucide Icons, Recharts (analytics dashboards), and Framer Motion.
* **Backend REST Gateway**: Fastify Node.js (high throughput, light runtime footprints) with failsafe memory databases.
* **Simulation Core**: Python FastAPI microservice modeling coordinate graph networks using NetworkX.
* **Quantum Simulation Layer**: Conceptual Qiskit/NumPy Ising coupling optimizer models.

---

## 3. Setup and Run Instructions

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)
* [Node.js v18+](https://nodejs.org/) (for local development outside containers)

### Method A: Single Command Run (Recommended)
Launch the complete containerized stack (PostgreSQL, Redis, Backend, Python Engine, Frontend) in one command:
```bash
docker-compose up --build
```
Once build finishes, access the dashboard at:
* **Frontend**: `http://localhost/` or `http://localhost:5173/`
* **Backend API Health**: `http://localhost:5000/health`
* **Python Simulation Engine**: `http://localhost:8000/health`

### Method B: Local Standalone Development (No Docker)
You can run the application directly on your machine. Thanks to built-in simulation mocks, the frontend can operate in complete standalone isolation.

1. **Install Frontend Dependencies & Run**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser.

2. **(Optional) Run Node API Server**:
   ```bash
   cd ../backend
   npm install
   npm run dev
   ```

3. **(Optional) Run Python Simulation**:
   ```bash
   cd ../simulation-engine
   pip install -r requirements.txt
   python main.py
   ```

---

## 4. Default Demo Accounts
Authentication is secured via JWT. Use the pre-seeded credentials inside the login page:
* **Analyst Panel**: `analyst@quantumflow.ai` / Password: `analyst123`
* **Admin Dashboard**: `admin@quantumflow.ai` / Password: `admin123`
