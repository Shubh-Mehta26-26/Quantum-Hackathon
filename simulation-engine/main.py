from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
import os
import random

from traffic_simulation import BengaluruTrafficGrid
from optimizer import TrafficQuantumOptimizer

app = FastAPI(
    title="QuantumFlow AI - Simulation Engine",
    description="Educational Python microservice simulating Bengaluru mobility grid and conceptual QAOA quantum circuits."
)

grid = BengaluruTrafficGrid()
optimizer = TrafficQuantumOptimizer(num_nodes=6)

class EmergencyRequest(BaseModel):
    vehicleType: str
    startJunction: str
    endJunction: str

class PedestrianRequest(BaseModel):
    junctionId: str
    pedestrianCount: int

class OptimizeRequest(BaseModel):
    mode: str = "qaoa"

@app.get("/health")
def health_check():
    return {"status": "online", "engine": "FastAPI + NetworkX"}

@app.get("/simulate/step")
def simulate_step():
    updated_state = grid.step()
    return updated_state

@app.get("/simulate/predict")
def simulate_predict(hours: int = Query(12, ge=1, le=48)):
    predictions = []
    
    weather_forecasts = ["Sunny", "Cloudy", "Rainy", "Overcast"]
    weather = random.choice(weather_forecasts)
    base_temp = 22 if weather == "Rainy" else 28
    
    current_state = grid.get_state()
    avg_congestion = sum(j["congestionIndex"] for j in current_state["junctions"].values()) / 6.0
    
    for i in range(hours):
        hour_val = (15 + i) % 24
        
        if (8 <= hour_val <= 11) or (17 <= hour_val <= 20):
            multiplier = 1.3
        elif (22 <= hour_val) or (hour_val <= 5):
            multiplier = 0.5
        else:
            multiplier = 0.9

        weather_coeff = 1.25 if weather == "Rainy" else 1.0
        predicted_idx = min(0.98, avg_congestion * multiplier * weather_coeff + random.uniform(-0.05, 0.05))
        predicted_idx = max(0.1, predicted_idx)

        predictions.append({
            "hour": f"{hour_val:02d}:00",
            "congestionIndex": round(predicted_idx, 2),
            "weather": weather,
            "temperature": base_temp + random.randint(-2, 2),
            "recommendedMode": "Quantum Optimization Mode" if predicted_idx > 0.7 else "Standard Loop"
        })

    return {"predictions": predictions}

@app.post("/simulate/emergency")
def simulate_emergency(req: EmergencyRequest):
    junctions_list = ["silkboard", "btm", "hsr", "hebbal", "marathahalli", "koramangala"]
    if req.startJunction not in junctions_list or req.endJunction not in junctions_list:
        raise HTTPException(status_code=404, detail="Junction ID not found in grid network")
    
    result = grid.add_emergency(req.vehicleType, req.startJunction, req.endJunction)
    return result

@app.post("/simulate/pedestrian")
def simulate_pedestrian(req: PedestrianRequest):
    junctions_list = ["silkboard", "btm", "hsr", "hebbal", "marathahalli", "koramangala"]
    if req.junctionId not in junctions_list:
        raise HTTPException(status_code=404, detail="Junction ID not found in grid network")
        
    result = grid.add_pedestrian(req.junctionId, req.pedestrianCount)
    return result

@app.post("/quantum/optimize")
def quantum_optimize(req: OptimizeRequest):
    current_state = grid.get_state()
    # Map congestion parameters as qubit couplers weight factors
    congestion_map = {j_id: j_info["congestionIndex"] for j_id, j_info in current_state["junctions"].items()}
    
    result = optimizer.optimize_grid(congestion_map, mode=req.mode)
    
    # Conceptually apply quantum solutions to grid timing parameters
    for node_id, new_delay in result["phaseDelays"].items():
        if node_id in grid.graph.nodes:
            # Reduce actual queuing sizes as result of timing alignments
            node = grid.graph.nodes[node_id]
            node["queue"] = max(2, int(node["queue"] * 0.75))
            node["congestion"] = max(0.1, round(node["queue"] / 60.0, 2))
            node["speed"] = round(max(5.0, 45.0 * (1.0 - node["congestion"])), 1)
            
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
