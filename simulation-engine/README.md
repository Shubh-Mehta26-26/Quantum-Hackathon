# 🚦 QuantumFlow AI — Simulation Engine
**Python FastAPI Graph Modeling & Qiskit QAOA Core**

This microservice uses NetworkX directed graphs to model path weights and Dijkstra shortest-path calculations. It integrates a conceptual quantum-inspired Ising coupling solver.

---

## 1. Directory Structure
```
simulation-engine/
├── main.py                # FastAPI HTTP routing endpoints
├── traffic_simulation.py  # NetworkX directed graph representation of Bengaluru roads
├── optimizer.py           # QAOA (Quantum Approximate Optimization Algorithm) model
├── requirements.txt       # Python packages list
└── Dockerfile             # Alpine-based Python container build
```

---

## 2. Mathematical Models Used

### A. Graph Congestion Routing
Junctions are treated as vertices ($V$) and corridors as directed edges ($E$). Edge traversal costs are dynamically calculated using:
$$Cost(e) = Distance(e) \times (1.0 + (Congestion_{start} + Congestion_{end}) \times 2.0)$$
Emergency routing solves for the minimum cost path using Dijkstra's algorithm.

### B. QAOA Max-Cut Solver
Traffic phase optimization is modeled as a combinatorial Ising spin glass system. Qubits represent binary light phases. Congestion constraints are mapped as entangling Hamiltonian phase rotations using $R_{zz}(\theta)$ gates on Qiskit Aer simulators, collapsing to the state vector output.

---

## 3. Running Locally
1. Install Python packages:
   ```bash
   pip install -r requirements.txt
   ```
2. Start the FastAPI development server:
   ```bash
   python main.py
   ```
   The service will listen on `http://localhost:8000`.
