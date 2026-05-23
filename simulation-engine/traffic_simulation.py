import networkx as nx
import random
import time

class BengaluruTrafficGrid:
    """
    Manages the simulated directed graph of Bengaluru junctions, calculating
    congestion, queuing, travel times, and emergency/pedestrian states.
    """
    def __init__(self):
        self.graph = nx.DiGraph()
        self._init_grid()
        self.active_emergencies = {}
        self.pedestrian_requests = {}
        self.simulation_step_counter = 0

    def _init_grid(self):
        # Junction configurations
        self.junctions = {
            "silkboard": {
                "name": "Silk Board", "lat": 12.9176, "lng": 77.6244,
                "congestion": 0.85, "queue": 48, "speed": 12.5,
                "phase": "North-South Green", "pedestrian": False
            },
            "btm": {
                "name": "BTM Layout", "lat": 12.9166, "lng": 77.6101,
                "congestion": 0.62, "queue": 22, "speed": 24.0,
                "phase": "East-West Green", "pedestrian": False
            },
            "hsr": {
                "name": "HSR Layout", "lat": 12.9116, "lng": 77.6388,
                "congestion": 0.45, "queue": 15, "speed": 32.5,
                "phase": "North-South Green", "pedestrian": False
            },
            "hebbal": {
                "name": "Hebbal Flyover", "lat": 13.0358, "lng": 77.5978,
                "congestion": 0.78, "queue": 39, "speed": 18.2,
                "phase": "North-South Green", "pedestrian": False
            },
            "marathahalli": {
                "name": "Marathahalli Bridge", "lat": 12.9592, "lng": 77.6974,
                "congestion": 0.70, "queue": 31, "speed": 20.8,
                "phase": "East-West Green", "pedestrian": False
            },
            "koramangala": {
                "name": "Koramangala 80ft Rd", "lat": 12.9352, "lng": 77.6244,
                "congestion": 0.55, "queue": 18, "speed": 28.0,
                "phase": "North-South Green", "pedestrian": False
            }
        }

        # Add nodes with metadata
        for j_id, j_info in self.junctions.items():
            self.graph.add_node(j_id, **j_info)

        # Create connections (edges) with distance (in km) and congestion weights
        # Bengaluru major commuter corridors
        self.connections = [
            ("hebbal", "koramangala", 12.5),
            ("koramangala", "silkboard", 3.2),
            ("silkboard", "btm", 2.1),
            ("btm", "koramangala", 2.8),
            ("hsr", "silkboard", 2.5),
            ("marathahalli", "hsr", 5.6),
            ("hebbal", "marathahalli", 15.0),
            ("koramangala", "marathahalli", 6.2)
        ]

        for u, v, dist in self.connections:
            self.graph.add_edge(u, v, distance=dist, base_weight=dist)

    def step(self) -> dict:
        """
        Advances the traffic flow simulation by one clock cycle, shifting queue lengths,
        recomputing average speeds, and updating signal light phases.
        """
        self.simulation_step_counter += 1

        for node_id in self.graph.nodes:
            node = self.graph.nodes[node_id]
            
            # If in priority emergency corridor or pedestrian cycle, congestion shifts positively
            has_active_emergency = any(
                node_id in emg["path"] and emg["status"] == "active" 
                for emg in self.active_emergencies.values()
            )

            # Random vehicle arrival rates
            arrival = random.randint(3, 8)
            # Departure rates based on green signal phases
            departure = random.randint(4, 9) if "Green" in node["phase"] else random.randint(0, 2)

            if has_active_emergency:
                # Emergency corridor clears vehicles at maximum rate
                departure = random.randint(10, 16)
                node["phase"] = "EMERGENCY PRIORITIZED"
                
            # Queue bounds
            new_queue = max(0, node["queue"] + arrival - departure)
            node["queue"] = new_queue

            # Recalculate Congestion index (0.0 to 1.0) and speed based on queues
            capacity = 60.0
            congestion = min(0.98, round(new_queue / capacity, 2))
            node["congestion"] = max(0.1, congestion)

            # High congestion drops speed
            node["speed"] = round(max(5.0, 45.0 * (1.0 - congestion)), 1)

            # Periodically switch signal light configurations
            if self.simulation_step_counter % 8 == 0 and not has_active_emergency:
                if "North-South" in node["phase"] or "Pedestrian" in node["phase"]:
                    node["phase"] = "East-West Green"
                else:
                    node["phase"] = "North-South Green"

            # Sync node info back to internal dictionary
            self.junctions[node_id] = node

        # Update edge weights dynamically for pathfinding
        for u, v in self.graph.edges:
            congestion_factor = self.graph.nodes[u]["congestion"] + self.graph.nodes[v]["congestion"]
            dist = self.graph[u][v]["distance"]
            # Dynamic edge cost weight
            self.graph[u][v]["weight"] = dist * (1.0 + congestion_factor * 2.0)

        # Update emergency paths step simulation
        for emg_id, emg in list(self.active_emergencies.items()):
            if emg["status"] == "active":
                # Move vehicle forward through corridor
                curr_idx = len(emg["clearedJunctions"])
                if curr_idx < len(emg["path"]):
                    next_junc = emg["path"][curr_idx]
                    emg["clearedJunctions"].append(next_junc)
                    emg["etaSeconds"] = max(0, emg["etaSeconds"] - 45)
                else:
                    emg["status"] = "completed"
                    emg["etaSeconds"] = 0

        # Update pedestrian request countdowns
        for ped_id, ped in list(self.pedestrian_requests.items()):
            if ped["status"] == "pending":
                ped["etaSecondsToGreen"] = max(0, ped["etaSecondsToGreen"] - 5)
                if ped["etaSecondsToGreen"] == 0:
                    ped["status"] = "approved"
                    j_id = ped["junctionId"]
                    self.graph.nodes[j_id]["phase"] = "Pedestrian Crossing Active"
                    self.graph.nodes[j_id]["pedestrian"] = True
            elif ped["status"] == "approved":
                # Finish crossing cycle
                ped["status"] = "completed"
                j_id = ped["junctionId"]
                self.graph.nodes[j_id]["pedestrian"] = False
                self.graph.nodes[j_id]["phase"] = "North-South Green"

        return self.get_state()

    def add_emergency(self, vehicle_type: str, start: str, end: str) -> dict:
        """
        Uses NetworkX Dijkstra to find the shortest congestion-weighted path,
        creating an emergency green-light corridor.
        """
        try:
            path = nx.dijkstra_path(self.graph, start, end, weight="weight")
        except nx.NetworkXNoPath:
            # Direct link fallback
            path = [start, end]

        emg_id = f"emg-{int(time.time())}-{random.randint(100, 999)}"
        eta = len(path) * 45

        emg = {
            "id": emg_id,
            "vehicleType": vehicle_type,
            "startJunction": start,
            "endJunction": end,
            "path": path,
            "etaSeconds": eta,
            "clearedJunctions": [start],
            "status": "active"
        }

        # Override signal phase at start
        self.graph.nodes[start]["phase"] = "EMERGENCY PRIORITIZED"
        self.active_emergencies[emg_id] = emg
        return emg

    def add_pedestrian(self, junction_id: str, count: int) -> dict:
        ped_id = f"ped-{int(time.time())}-{random.randint(100, 999)}"
        ped = {
            "id": ped_id,
            "junctionId": junction_id,
            "pedestrianCount": count,
            "status": "pending",
            "requestedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "etaSecondsToGreen": 15
        }
        self.pedestrian_requests[ped_id] = ped
        return ped

    def get_state(self) -> dict:
        junctions_data = {}
        for n in self.graph.nodes:
            node = self.graph.nodes[n]
            # Format lightState dict based on phase status
            l_state = {"north": "red", "south": "red", "east": "red", "west": "red"}
            if "North-South Green" in node["phase"]:
                l_state["north"] = "green"
                l_state["south"] = "green"
            elif "East-West Green" in node["phase"]:
                l_state["east"] = "green"
                l_state["west"] = "green"
            elif "EMERGENCY" in node["phase"]:
                l_state = {"north": "green", "south": "green", "east": "green", "west": "green"}
            elif "Pedestrian" in node["phase"]:
                l_state = {"north": "red", "south": "red", "east": "red", "west": "red"}

            junctions_data[n] = {
                "id": n,
                "name": node["name"],
                "congestionIndex": node["congestion"],
                "queueLength": node["queue"],
                "averageSpeed": node["speed"],
                "currentPhase": node["phase"],
                "lightState": l_state,
                "pedestrianWaiting": node["pedestrian"]
            }

        return {
            "junctions": junctions_data
        }
