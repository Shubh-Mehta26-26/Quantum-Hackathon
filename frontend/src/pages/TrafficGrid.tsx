import React, { useState } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import GlassCard from '../components/GlassCard';
import { Activity, Gauge, Car, HelpCircle, Footprints, AlertTriangle } from 'lucide-react';

interface Position {
  x: number;
  y: number;
}

// Nodes coordinates on custom 800x500 grid
const nodePositions: Record<string, Position> = {
  hebbal: { x: 400, y: 50 },
  marathahalli: { x: 700, y: 220 },
  koramangala: { x: 350, y: 250 },
  btm: { x: 150, y: 400 },
  silkboard: { x: 450, y: 420 },
  hsr: { x: 650, y: 380 }
};

const links = [
  { from: 'hebbal', to: 'koramangala' },
  { from: 'koramangala', to: 'silkboard' },
  { from: 'silkboard', to: 'btm' },
  { from: 'btm', to: 'koramangala' },
  { from: 'hsr', to: 'silkboard' },
  { from: 'marathahalli', to: 'hsr' },
  { from: 'hebbal', to: 'marathahalli' },
  { from: 'koramangala', to: 'marathahalli' }
];

export const TrafficGrid: React.FC = () => {
  const { junctions, emergencyRoutes, requestPedestrianCrossing, triggerEmergencyCorridor } = useSimulationStore();
  const [selectedJunc, setSelectedJunc] = useState<string | null>('silkboard');
  const [pedestrianCount, setPedestrianCount] = useState(10);

  const selectedData = selectedJunc ? junctions[selectedJunc] : null;

  // Find if a junction has an active emergency vehicle on it
  const isJunctionUnderEmergency = (id: string) => {
    return emergencyRoutes.some(
      (route) => route.status === 'active' && route.path.includes(id) && !route.clearedJunctions.includes(id)
    );
  };

  const getStatusColor = (congestion: number) => {
    if (congestion > 0.75) return '#ef4444'; // Red
    if (congestion > 0.5) return '#f59e0b';  // Amber
    return '#10b981';                         // Emerald Green
  };

  const handlePedestrianRequest = () => {
    if (selectedJunc) {
      requestPedestrianCrossing(selectedJunc, pedestrianCount);
    }
  };

  const handleEmergencyTrigger = () => {
    if (selectedJunc) {
      // Find a route start and end
      const start = selectedJunc;
      const end = selectedJunc === 'hebbal' ? 'silkboard' : 'hebbal';
      triggerEmergencyCorridor('ambulance', start, end);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bengaluru Urban Mobility Grid</h1>
        <p className="text-sm text-slate-400">Interactive corridor routing visualization mapping live signal flows</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SVG Interactive Canvas */}
        <GlassCard className="lg:col-span-2 overflow-hidden flex flex-col items-center justify-center p-4 relative" glow="cyan">
          {/* Overlay Grid Map Legend */}
          <div className="absolute top-4 left-4 bg-black/50 border border-slate-800 rounded-xl p-3 text-xs space-y-1.5 z-10 font-mono">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] inline-block shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
              <span>High Congestion (&gt;75%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] inline-block"></span>
              <span>Moderate Traffic (50%-75%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] inline-block"></span>
              <span>Optimal Flow (&lt;50%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block animate-ping"></span>
              <span>Emergency Priority Path</span>
            </div>
          </div>

          <svg viewBox="0 0 800 500" className="w-full h-[450px] font-sans">
            
            {/* Draw Path Connections */}
            {links.map((link, idx) => {
              const start = nodePositions[link.from];
              const end = nodePositions[link.to];
              const fromJunc = junctions[link.from];
              
              if (!start || !end) return null;
              
              const isRouteEmergency = emergencyRoutes.some(
                (route) => route.status === 'active' && route.path.includes(link.from) && route.path.includes(link.to)
              );

              const strokeColor = isRouteEmergency ? '#3b82f6' : 'rgba(255, 255, 255, 0.15)';
              const strokeWidth = isRouteEmergency ? 4 : 2;
              
              // Calculate animation dash speed based on congestion (denser/slower for high congestion)
              const congestionVal = fromJunc ? fromJunc.congestionIndex : 0.5;
              const dasharray = isRouteEmergency ? "10, 5" : "5, 10";
              const animDuration = isRouteEmergency ? "3s" : `${8 - (1.0 - congestionVal) * 5}s`;

              return (
                <g key={idx}>
                  <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                  />
                  {/* Animated Dashes for commuter vehicles flow */}
                  <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke={isRouteEmergency ? '#60a5fa' : strokeColor}
                    strokeWidth={strokeWidth + 1}
                    strokeDasharray={dasharray}
                    className="pointer-events-none"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      values="100;0"
                      dur={animDuration}
                      repeatCount="indefinite"
                    />
                  </line>
                </g>
              );
            })}

            {/* Draw Nodes */}
            {Object.keys(nodePositions).map((jId) => {
              const pos = nodePositions[jId];
              const jData = junctions[jId];
              if (!jData) return null;

              const isEmergency = isJunctionUnderEmergency(jId);
              const nodeColor = getStatusColor(jData.congestionIndex);
              const isSelected = selectedJunc === jId;

              return (
                <g 
                  key={jId} 
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={() => setSelectedJunc(jId)}
                  className="cursor-pointer group"
                >
                  {/* Glowing Ring */}
                  <circle
                    r={isSelected ? 26 : 20}
                    fill="none"
                    stroke={isEmergency ? '#3b82f6' : nodeColor}
                    strokeWidth={isSelected ? 3 : 2}
                    className={`${isEmergency ? 'animate-ping' : 'opacity-60 group-hover:opacity-100 transition-opacity'}`}
                    style={{
                      filter: `drop-shadow(0 0 6px ${isEmergency ? '#3b82f6' : nodeColor})`
                    }}
                  />
                  
                  {/* Junction Solid Base */}
                  <circle
                    r={isSelected ? 20 : 15}
                    fill="#0f0b29"
                    stroke={isSelected ? '#fff' : 'rgba(255, 255, 255, 0.2)'}
                    strokeWidth={1.5}
                  />

                  {/* Junction Congestion Center Color */}
                  <circle
                    r={isSelected ? 10 : 8}
                    fill={nodeColor}
                  />

                  {/* Label */}
                  <text
                    y={isSelected ? -34 : -26}
                    textAnchor="middle"
                    fill={isSelected ? '#00f0ff' : '#cbd5e1'}
                    fontSize={isSelected ? '12px' : '10px'}
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    className="select-none pointer-events-none font-mono"
                  >
                    {jData.name}
                  </text>
                  
                  {/* Pedestrian Alert Sign */}
                  {jData.pedestrianWaiting && (
                    <g transform="translate(16, -16)">
                      <circle r="7" fill="#f59e0b" />
                      <text y="2.5" textAnchor="middle" fill="#000" fontSize="8px" fontWeight="bold">P</text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </GlassCard>

        {/* Selected Junction Details Sidebar */}
        <GlassCard className="space-y-6">
          <div className="border-b border-white/5 pb-4">
            <h3 className="text-base font-semibold">Intersection Controller</h3>
            <p className="text-xs text-slate-400">Interface for individual junction configuration</p>
          </div>

          {selectedData ? (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-bold text-neonCyan">{selectedData.name}</h4>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">
                  Active phase: <span className="text-white">{selectedData.currentPhase}</span>
                </p>
              </div>

              {/* Grid Statistics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center space-x-1.5 text-slate-400">
                    <Activity size={14} className="text-neonCyan" />
                    <span className="text-[10px] uppercase font-semibold">Congestion</span>
                  </div>
                  <p className="text-lg font-bold mt-1">{Math.round(selectedData.congestionIndex * 100)}%</p>
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center space-x-1.5 text-slate-400">
                    <Car size={14} className="text-neonPurple" />
                    <span className="text-[10px] uppercase font-semibold">Queue Size</span>
                  </div>
                  <p className="text-lg font-bold mt-1">{selectedData.queueLength} cars</p>
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center space-x-1.5 text-slate-400">
                    <Gauge size={14} />
                    <span className="text-[10px] uppercase font-semibold">Avg Speed</span>
                  </div>
                  <p className="text-lg font-bold mt-1">{selectedData.averageSpeed} km/h</p>
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center space-x-1.5 text-slate-400">
                    <Footprints size={14} className="text-amber-400" />
                    <span className="text-[10px] uppercase font-semibold">Pedestrian</span>
                  </div>
                  <p className="text-lg font-bold mt-1">{selectedData.pedestrianWaiting ? 'Waiting' : 'None'}</p>
                </div>
              </div>

              {/* Pedestrian Crossing simulation command */}
              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-3">
                <h5 className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center space-x-1.5">
                  <Footprints size={14} />
                  <span>Pedestrian Crossing Request</span>
                </h5>
                <p className="text-[11px] text-slate-400">Triggers safe walking phase and signal delay recalculations.</p>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={pedestrianCount}
                    onChange={(e) => setPedestrianCount(parseInt(e.target.value) || 5)}
                    className="w-16 p-2 rounded-lg bg-black/40 border border-slate-800 text-center text-xs text-white"
                  />
                  <button
                    onClick={handlePedestrianRequest}
                    className="flex-1 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold transition-all border border-amber-500/30"
                  >
                    Send Request
                  </button>
                </div>
              </div>

              {/* Emergency vehicle simulation command */}
              <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl space-y-3">
                <h5 className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center space-x-1.5">
                  <AlertTriangle size={14} />
                  <span>Priority Green Corridor</span>
                </h5>
                <p className="text-[11px] text-slate-400">Forces immediate green light waves pathfinding to clear routing delays.</p>
                <button
                  onClick={handleEmergencyTrigger}
                  className="w-full py-2.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-semibold transition-all border border-blue-500/30"
                >
                  Activate Priority Wave
                </button>
              </div>

            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-sm">
              <HelpCircle className="mx-auto mb-2 text-slate-600" size={32} />
              Select an intersection on the map to configure telemetry overrides.
            </div>
          )}
        </GlassCard>

      </div>
    </div>
  );
};
export default TrafficGrid;
