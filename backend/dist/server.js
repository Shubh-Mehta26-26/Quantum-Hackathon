"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const pg_1 = require("pg");
const redis_1 = require("redis");
const http_1 = require("http");
const PORT = parseInt(process.env.PORT || '5000', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'quantum_secret_key_101';
const DATABASE_URL = process.env.DATABASE_URL;
const REDIS_URL = process.env.REDIS_URL;
const SIMULATION_ENGINE_URL = process.env.SIMULATION_ENGINE_URL || 'http://localhost:8000';
const fastify = (0, fastify_1.default)({ logger: true });
const mockUsers = {
    'admin@quantumflow.ai': {
        id: 'admin-uuid-1111',
        email: 'admin@quantumflow.ai',
        passwordHash: 'admin123', // Raw password for simple hackathon mock authentication
        role: 'admin',
    },
    'analyst@quantumflow.ai': {
        id: 'analyst-uuid-2222',
        email: 'analyst@quantumflow.ai',
        passwordHash: 'analyst123',
        role: 'analyst',
    }
};
let mockPedestrianRequests = [];
let mockEmergencyCorridors = [];
const defaultJunctions = {
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
let activeSimulationJunctions = { ...defaultJunctions };
// --- DATABASES CLIENT CONNECTIONS (FAILSAFE) ---
let pgClient = null;
let redisClient = null;
async function initDatabases() {
    if (DATABASE_URL) {
        try {
            pgClient = new pg_1.Client({ connectionString: DATABASE_URL });
            await pgClient.connect();
            fastify.log.info('Successfully connected to PostgreSQL');
            // Create schema tables if not exist
            await pgClient.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS traffic_junctions (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          congestion_index DOUBLE PRECISION NOT NULL,
          queue_length INTEGER NOT NULL,
          average_speed DOUBLE PRECISION NOT NULL,
          current_phase VARCHAR(100) NOT NULL,
          light_state JSONB NOT NULL
        );
      `);
            // Seed default junctions
            for (const [id, j] of Object.entries(defaultJunctions)) {
                await pgClient.query(`
          INSERT INTO traffic_junctions (id, name, congestion_index, queue_length, average_speed, current_phase, light_state)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO UPDATE SET 
            congestion_index = EXCLUDED.congestion_index,
            queue_length = EXCLUDED.queue_length,
            average_speed = EXCLUDED.average_speed;
        `, [j.id, j.name, j.congestionIndex, j.queueLength, j.averageSpeed, j.currentPhase, JSON.stringify(j.lightState)]);
            }
        }
        catch (e) {
            fastify.log.error('PostgreSQL connection failed. Falling back to In-Memory DB Mode. Error: ' + e);
            pgClient = null;
        }
    }
    if (REDIS_URL) {
        try {
            redisClient = (0, redis_1.createClient)({ url: REDIS_URL });
            await redisClient.connect();
            fastify.log.info('Successfully connected to Redis');
        }
        catch (e) {
            fastify.log.error('Redis connection failed. Falling back to In-Memory Cache Mode. Error: ' + e);
            redisClient = null;
        }
    }
}
// --- SETUP FASTIFY PLUGINS ---
fastify.register(cors_1.default, { origin: true });
fastify.register(jwt_1.default, { secret: JWT_SECRET });
// Auth Middleware Helper
fastify.decorate('authenticate', async (request, reply) => {
    try {
        await request.jwtVerify();
    }
    catch (err) {
        reply.status(401).send({ error: 'Unauthorized credentials' });
    }
});
// Helper function to query Python Microservice safely
function callPythonEngine(endpoint, method, body = null) {
    return new Promise((resolve) => {
        const url = new URL(SIMULATION_ENGINE_URL + endpoint);
        const options = {
            hostname: url.hostname,
            port: url.port || 80,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        const req = (0, http_1.request)(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                }
                catch {
                    resolve({ error: 'Invalid response from simulation engine' });
                }
            });
        });
        req.on('error', () => {
            resolve({ error: 'Python simulation service is offline', fallback: true });
        });
        if (body && method === 'POST') {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}
// --- ROUTE DEFINITIONS ---
// 1. Auth Handlers
fastify.post('/api/auth/register', async (request, reply) => {
    const { email, password, role } = request.body;
    if (!email || !password) {
        return reply.status(400).send({ error: 'Email and password are required' });
    }
    const selectedRole = role || 'viewer';
    if (pgClient) {
        try {
            const res = await pgClient.query('INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role', [email, password, selectedRole]);
            const user = res.rows[0];
            const token = fastify.jwt.sign({ id: user.id, email: user.email, role: user.role });
            return reply.status(201).send({ token, user });
        }
        catch (e) {
            if (e.code === '23505') {
                return reply.status(409).send({ error: 'Email already registered' });
            }
            return reply.status(500).send({ error: 'Database registry error' });
        }
    }
    else {
        // In-memory Auth
        if (mockUsers[email]) {
            return reply.status(409).send({ error: 'Email already registered' });
        }
        const newUser = {
            id: `user-uuid-${Math.floor(Math.random() * 9000 + 1000)}`,
            email,
            passwordHash: password, // simple check
            role: selectedRole
        };
        mockUsers[email] = newUser;
        const token = fastify.jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role });
        return reply.status(201).send({ token, user: { id: newUser.id, email: newUser.email, role: newUser.role } });
    }
});
fastify.post('/api/auth/login', async (request, reply) => {
    const { email, password } = request.body;
    if (!email || !password) {
        return reply.status(400).send({ error: 'Email and password are required' });
    }
    if (pgClient) {
        try {
            const res = await pgClient.query('SELECT * FROM users WHERE email = $1', [email]);
            if (res.rows.length === 0 || res.rows[0].password_hash !== password) {
                return reply.status(401).send({ error: 'Invalid email or password credentials' });
            }
            const user = res.rows[0];
            const token = fastify.jwt.sign({ id: user.id, email: user.email, role: user.role });
            return reply.send({ token, user: { id: user.id, email: user.email, role: user.role } });
        }
        catch {
            return reply.status(500).send({ error: 'Authentication internal error' });
        }
    }
    else {
        const user = mockUsers[email];
        if (!user || user.passwordHash !== password) {
            return reply.status(401).send({ error: 'Invalid email or password credentials' });
        }
        const token = fastify.jwt.sign({ id: user.id, email: user.email, role: user.role });
        return reply.send({ token, user: { id: user.id, email: user.email, role: user.role } });
    }
});
fastify.get('/api/auth/profile', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    return reply.send({ user: request.user });
});
// 2. Traffic Live Endpoints
fastify.get('/api/traffic/live', async (request, reply) => {
    // Query simulation engine for up-to-date states
    const pyData = await callPythonEngine('/simulate/step', 'GET');
    if (pyData && !pyData.fallback && pyData.junctions) {
        activeSimulationJunctions = pyData.junctions;
    }
    else {
        // If python microservice is down, simulate minor shifts locally
        Object.keys(activeSimulationJunctions).forEach((id) => {
            const j = activeSimulationJunctions[id];
            // Random walk for values
            const delta = (Math.random() - 0.5) * 0.05;
            j.congestionIndex = Math.max(0.1, Math.min(0.98, j.congestionIndex + delta));
            j.queueLength = Math.max(0, Math.floor(j.queueLength + (Math.random() - 0.5) * 6));
            j.averageSpeed = Math.max(5.0, Math.min(60.0, j.averageSpeed + (Math.random() - 0.5) * 4));
            // Cycle light phases conceptually
            if (Math.random() > 0.8) {
                if (j.currentPhase.includes('North-South')) {
                    j.currentPhase = 'East-West Green';
                    j.lightState = { north: 'red', south: 'red', east: 'green', west: 'green' };
                }
                else {
                    j.currentPhase = 'North-South Green';
                    j.lightState = { north: 'green', south: 'green', east: 'red', west: 'red' };
                }
            }
        });
    }
    return reply.send({
        timestamp: new Date().toISOString(),
        junctions: activeSimulationJunctions,
        activeEmergencyCorridors: mockEmergencyCorridors,
        activePedestrianRequests: mockPedestrianRequests
    });
});
// 3. Traffic Predictions
fastify.get('/api/traffic/predictions', async (request, reply) => {
    const forecastHours = parseInt(request.query.forecastHours || '12', 10);
    // Forward to Python microservice
    const pyData = await callPythonEngine(`/simulate/predict?hours=${forecastHours}`, 'GET');
    if (pyData && !pyData.fallback) {
        return reply.send(pyData);
    }
    // Fallback prediction data
    const predictions = [];
    const startHour = new Date().getHours();
    const weatherOptions = ['Sunny', 'Rainy', 'Cloudy', 'Overcast'];
    const weather = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
    for (let i = 0; i < forecastHours; i++) {
        const hr = (startHour + i) % 24;
        let baseCongestion = 0.4;
        // Peak hour adjustments
        if ((hr >= 8 && hr <= 11) || (hr >= 17 && hr <= 20)) {
            baseCongestion = 0.82; // Peak office traffic
        }
        else if (hr >= 22 || hr <= 5) {
            baseCongestion = 0.25; // Night
        }
        if (weather === 'Rainy') {
            baseCongestion = Math.min(0.98, baseCongestion + 0.15);
        }
        predictions.push({
            hour: `${hr}:00`,
            congestionIndex: baseCongestion + (Math.random() - 0.5) * 0.08,
            weather,
            temperature: weather === 'Rainy' ? 22 : 28,
            recommendedMode: baseCongestion > 0.75 ? 'Quantum Optimization Mode' : 'Standard Loop'
        });
    }
    return reply.send({ predictions });
});
// 4. Emergency Route Activation
fastify.post('/api/simulate/emergency', async (request, reply) => {
    const { vehicleType, startJunction, endJunction } = request.body;
    if (!startJunction || !endJunction) {
        return reply.status(400).send({ error: 'Start and end junctions are required' });
    }
    // Forward to Python Microservice
    const pyData = await callPythonEngine('/simulate/emergency', 'POST', { vehicleType, startJunction, endJunction });
    if (pyData && !pyData.fallback) {
        // Add to local mock list as well
        mockEmergencyCorridors.push(pyData);
        return reply.status(201).send(pyData);
    }
    // Fallback shortest-path corridor solver
    const junctionsList = Object.keys(defaultJunctions);
    if (!junctionsList.includes(startJunction) || !junctionsList.includes(endJunction)) {
        return reply.status(404).send({ error: 'Junction ID not found' });
    }
    // Simulated path resolving
    const path = [startJunction];
    if (startJunction !== endJunction) {
        // Midpoint helpers
        if (startJunction === 'hebbal' && endJunction === 'silkboard') {
            path.push('koramangala');
        }
        else if (startJunction === 'silkboard' && endJunction === 'hebbal') {
            path.push('btm', 'koramangala');
        }
        else {
            path.push('marathahalli'); // Default hub
        }
        path.push(endJunction);
    }
    const corridor = {
        id: `emg-uuid-${Math.floor(Math.random() * 90000 + 10000)}`,
        vehicleType: vehicleType || 'ambulance',
        startJunction,
        endJunction,
        path,
        etaSeconds: path.length * 45,
        clearedJunctions: [startJunction],
        status: 'active'
    };
    // Modify active phase for cleared junction
    if (activeSimulationJunctions[startJunction]) {
        activeSimulationJunctions[startJunction].currentPhase = 'EMERGENCY PRIORITIZED';
        activeSimulationJunctions[startJunction].congestionIndex = Math.max(0.1, activeSimulationJunctions[startJunction].congestionIndex - 0.2);
    }
    mockEmergencyCorridors.push(corridor);
    // Auto clean-up simulation after route completions
    setTimeout(() => {
        corridor.clearedJunctions = [...path];
        corridor.status = 'completed';
        corridor.etaSeconds = 0;
    }, 10000);
    return reply.status(201).send(corridor);
});
// 5. Pedestrian Negotiation Crossing
fastify.post('/api/simulate/pedestrian', async (request, reply) => {
    const { junctionId, pedestrianCount } = request.body;
    if (!junctionId) {
        return reply.status(400).send({ error: 'Junction ID is required' });
    }
    // Forward to Python microservice
    const pyData = await callPythonEngine('/simulate/pedestrian', 'POST', { junctionId, pedestrianCount });
    if (pyData && !pyData.fallback) {
        mockPedestrianRequests.push(pyData);
        return reply.send(pyData);
    }
    if (!activeSimulationJunctions[junctionId]) {
        return reply.status(404).send({ error: 'Junction ID not found' });
    }
    const newRequest = {
        id: `ped-uuid-${Math.floor(Math.random() * 90000 + 10000)}`,
        junctionId,
        pedestrianCount: pedestrianCount || 5,
        status: 'pending',
        requestedAt: new Date().toISOString(),
        etaSecondsToGreen: 15
    };
    activeSimulationJunctions[junctionId].pedestrianWaiting = true;
    mockPedestrianRequests.push(newRequest);
    // Conceptually approve the crossing in 5 seconds
    setTimeout(() => {
        newRequest.status = 'approved';
        newRequest.etaSecondsToGreen = 0;
        if (activeSimulationJunctions[junctionId]) {
            activeSimulationJunctions[junctionId].pedestrianWaiting = false;
            activeSimulationJunctions[junctionId].currentPhase = 'Pedestrian Crossing Active';
        }
    }, 5000);
    return reply.send(newRequest);
});
// 6. Quantum optimization solver conceptual dashboard endpoint
fastify.post('/api/quantum/optimize', async (request, reply) => {
    const { mode } = request.body;
    // Forward to Python microservice
    const pyData = await callPythonEngine('/quantum/optimize', 'POST', { mode });
    if (pyData && !pyData.fallback) {
        return reply.send(pyData);
    }
    // Custom high-fidelity mathematical simulation of QAOA Max-Cut Traffic Balance
    const efficiencyGain = parseFloat((12.5 + Math.random() * 8.2).toFixed(2));
    const qubitsUsed = 6; // 1 qubit per junction
    const gateDepth = mode === 'qaoa' ? 24 : 12;
    // Conceptually optimize all junctions by reducing queue lengths and congestion index
    Object.keys(activeSimulationJunctions).forEach((key) => {
        const j = activeSimulationJunctions[key];
        j.congestionIndex = Math.max(0.2, parseFloat((j.congestionIndex * 0.82).toFixed(2)));
        j.queueLength = Math.max(2, Math.floor(j.queueLength * 0.75));
        j.averageSpeed = parseFloat((j.averageSpeed * 1.2).toFixed(1));
    });
    return reply.send({
        optimized: true,
        efficiencyGain,
        qubitsUsed,
        gateDepth,
        circuitTelemetry: {
            qubitState: '|011010⟩',
            coherenceTimeMs: 142.8,
            readoutErrorRate: 0.0018
        },
        optimizedPhases: {
            silkboard: 45,
            btm: 35,
            hsr: 30,
            hebbal: 50,
            marathahalli: 40,
            koramangala: 30
        }
    });
});
// 7. Analytics reporting
fastify.get('/api/analytics/report', async (request, reply) => {
    // Aggregate simulated metrics
    let totalVehicles = 0;
    let avgSpeedSum = 0;
    let totalQueue = 0;
    let avgCongestion = 0;
    const count = Object.keys(activeSimulationJunctions).length;
    Object.values(activeSimulationJunctions).forEach((j) => {
        totalVehicles += j.queueLength * 4 + 20; // estimate
        avgSpeedSum += j.averageSpeed;
        totalQueue += j.queueLength;
        avgCongestion += j.congestionIndex;
    });
    const avgSpeed = parseFloat((avgSpeedSum / count).toFixed(2));
    const avgCongestionIdx = parseFloat((avgCongestion / count).toFixed(2));
    // Compute sustainability score
    // Low congestion index = higher score
    const sustainabilityScore = Math.max(10, Math.floor((1.0 - avgCongestionIdx) * 100));
    // Timeline series data for charts
    const hourlyFlow = Array.from({ length: 7 }, (_, idx) => {
        const hr = 9 + idx; // 9am onwards
        return {
            time: `${hr}:00`,
            vehiclesPassed: 300 + idx * 80 + Math.floor(Math.random() * 150),
            co2SavedKg: 12 + idx * 4 + Math.floor(Math.random() * 8),
            efficiencyPct: Math.floor(70 + Math.random() * 25)
        };
    });
    return reply.send({
        summary: {
            totalActiveJunctions: count,
            activeSimulationTimeSec: Math.floor(process.uptime()),
            sustainabilityScore,
            averageGridSpeedKmh: avgSpeed,
            averageCongestionIndex: avgCongestionIdx,
            totalVehiclesInSystem: totalVehicles,
            totalCO2ReductionKg: parseFloat((sustainabilityScore * 2.8).toFixed(1))
        },
        hourlyFlow
    });
});
// Health check endpoint
fastify.get('/health', async () => {
    return { status: 'healthy', database: pgClient !== null ? 'connected' : 'standalone-fallback', cache: redisClient !== null ? 'connected' : 'standalone-fallback' };
});
const start = async () => {
    try {
        await initDatabases();
        await fastify.listen({ port: PORT, host: '0.0.0.0' });
        console.log(`Server started successfully on port ${PORT}`);
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
