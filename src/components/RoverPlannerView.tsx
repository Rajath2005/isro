import React, { useState } from 'react';
import { LandingSite, Hazard, Waypoint } from '../types';
import MapViewer from './MapViewer';
import { 
  Compass, 
  Settings, 
  Layers, 
  MapPin, 
  SlidersHorizontal, 
  BatteryCharging, 
  Sun, 
  Radio, 
  Play, 
  Trash2, 
  Plus, 
  Activity,
  ChevronRight,
  ShieldAlert,
  FileJson,
  Download,
  BarChart2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { calculateTrajectory } from '../utils/trajectory';

interface RoverPlannerViewProps {
  selectedSite: LandingSite;
  onSelectSite: (id: string) => void;
  landingSites: LandingSite[];
  hazards: Hazard[];
  waypoints: Waypoint[];
  setWaypoints: React.Dispatch<React.SetStateAction<Waypoint[]>>;
  activeMissionId: string;
  addToast: (message: string, type: 'success' | 'warning' | 'info') => void;
}

export default function RoverPlannerView({
  selectedSite,
  onSelectSite,
  landingSites,
  hazards,
  waypoints,
  setWaypoints,
  activeMissionId,
  addToast
}: RoverPlannerViewProps) {
  // Solver constraints state
  const [avoidShadow, setAvoidShadow] = useState(true);
  const [optimizeComm, setOptimizeComm] = useState(true);
  const [maxSlope, setMaxSlope] = useState(15);
  const [speedPriority, setSpeedPriority] = useState<'Eco' | 'Balanced' | 'Performance'>('Balanced');

  // Input states for custom waypoint adding
  const [newWpName, setNewWpName] = useState('');
  const [newWpLat, setNewWpLat] = useState(-87.45);
  const [newWpLng, setNewWpLng] = useState(82.35);

  const [isSolving, setIsSolving] = useState(false);

  // Dynamic Trajectory Calculations
  const metrics = calculateTrajectory(waypoints, hazards);

  const elevations = metrics.profile.map(p => p.elevation);
  const minElev = elevations.length > 0 ? Math.min(...elevations) - 15 : -2900;
  const maxElev = elevations.length > 0 ? Math.max(...elevations) + 15 : -2700;
  const maxDist = metrics.profile.length > 0 ? metrics.profile[metrics.profile.length - 1].distance : 3.24;

  const pointsD = metrics.profile.reduce((path, pt, index) => {
    const x = maxDist > 0 ? (pt.distance / maxDist) * 100 : 0;
    const y = maxElev !== minElev ? 100 - ((pt.elevation - minElev) / (maxElev - minElev)) * 100 : 50;
    if (index === 0) return `M ${x} ${y}`;
    return `${path} L ${x} ${y}`;
  }, '');

  const areaD = `${pointsD} L 100 100 L 0 100 Z`;

  // Draw waypoint dots dynamically along the profile
  const waypointDots = waypoints.map((wp, idx) => {
    if (idx === 0) {
      return { id: wp.id, name: wp.name, x: 0, y: maxElev !== minElev ? 100 - ((wp.elevation - minElev) / (maxElev - minElev)) * 100 : 50, elev: wp.elevation };
    }
    const dist = waypoints.slice(0, idx + 1).reduce((sum, currentWp, i) => {
      if (i === 0) return 0;
      const wp1 = waypoints[i - 1];
      const wp2 = currentWp;
      const avgLatRad = (((wp1.latitude + wp2.latitude) / 2) * Math.PI) / 180;
      const dLat = (wp2.latitude - wp1.latitude) * 30.32;
      const dLng = (wp2.longitude - wp1.longitude) * 30.32 * Math.cos(avgLatRad);
      return sum + Math.sqrt(dLat * dLat + dLng * dLng);
    }, 0);

    const x = maxDist > 0 ? (dist / maxDist) * 100 : 0;
    const y = maxElev !== minElev ? 100 - ((wp.elevation - minElev) / (maxElev - minElev)) * 100 : 50;
    return { id: wp.id, name: wp.name, x: Math.min(100, Math.max(0, x)), y, elev: wp.elevation };
  });

  const handleRecalculate = () => {
    setIsSolving(true);
    addToast('A* PATH-FINDING SOLVER ONLINE. TRACING SAFEST TRAJECTORY...', 'info');

    setTimeout(() => {
      setIsSolving(false);
      addToast(`A* SOLVER SUCCESS. PATH RE-CALCULATED WITH ${maxSlope}° CRITERION.`, 'success');
    }, 1200);
  };

  const handleDownloadTelemetryJSON = () => {
    addToast('COMPILING SPACE-GRADE TELEMETRY PACKET...', 'info');
    setTimeout(() => {
      const packet = {
        mission_id: activeMissionId,
        landing_site: selectedSite,
        trajectory: {
          metrics: {
            total_distance_km: metrics.totalDistance,
            est_duration_minutes: metrics.totalDuration,
            battery_depletion_percent: metrics.batteryEstimate,
            max_tolerable_slope_degrees: maxSlope,
          },
          waypoints: waypoints.map((wp, idx) => ({
            sequence_id: idx + 1,
            label: wp.name,
            coordinates: { latitude: wp.latitude, longitude: wp.longitude },
            elevation_meters: wp.elevation,
            status_classification: wp.status
          })),
          altimetry_profile: metrics.profile,
          threat_assessments: metrics.threatAlerts
        },
        system_status: {
          s_band_signal_strength_percent: 94,
          rtg_core_heat_kelvin: 480,
          timestamp_utc: new Date().toISOString()
        }
      };

      const blob = new Blob([JSON.stringify(packet, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedSite.name.toLowerCase()}_trajectory_telemetry.json`;
      link.click();
      URL.revokeObjectURL(url);
      addToast('JSON TELEMETRY PACKET EXPORTED SUCCESSFULLY.', 'success');
    }, 1200);
  };

  const handleAddWaypoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWpName.trim()) {
      addToast('Please input a valid waypoint label.', 'warning');
      return;
    }

    const newWp: Waypoint = {
      id: `custom-wp-${Date.now()}`,
      name: newWpName,
      latitude: Number(newWpLat),
      longitude: Number(newWpLng),
      elevation: -2800 - Math.floor(Math.random() * 80),
      status: 'intermediate'
    };

    // Keep "Target" waypoint always at the end of list for path drawing order
    const targetIdx = waypoints.findIndex(wp => wp.status === 'target');
    let updatedWps = [...waypoints];
    if (targetIdx !== -1) {
      updatedWps.splice(targetIdx, 0, newWp);
    } else {
      updatedWps.push(newWp);
    }

    setWaypoints(updatedWps);
    setNewWpName('');
    addToast(`WAYPOINT "${newWp.name}" ADDED. ROTATING TRAJECTORY LINE...`, 'success');
  };

  const handleDeleteWaypoint = (id: string, name: string) => {
    setWaypoints(waypoints.filter(wp => wp.id !== id));
    addToast(`WAYPOINT "${name}" EXCLUDED. RE-PLANNING ROUTE DIRECTIVES...`, 'info');
  };

  return (
    <div className="flex-1 flex gap-4 h-full overflow-hidden select-none">
      {/* Left Column: Solvers, Waypoints stack, and Constraints panel */}
      <div className="w-96 shrink-0 flex flex-col gap-4 overflow-y-auto pr-1">
        
        {/* Trajectory statistics banner */}
        <div className="rounded-lg border border-[#404752] bg-[#111C28] p-4 flex flex-col gap-1.5 shrink-0 shadow-lg">
          <div className="flex justify-between items-center">
            <span className="font-display font-black text-[10px] text-[#c0c7d4] uppercase tracking-wider">
              TRAJECTORY METRICS
            </span>
            <button
              onClick={handleDownloadTelemetryJSON}
              className="px-2 py-1 bg-[#3394f1]/10 hover:bg-[#3394f1]/20 border border-[#3394f1]/40 rounded font-mono text-[8px] font-bold text-[#a2c9ff] flex items-center gap-1 cursor-pointer transition-colors focus:ring-1 focus:ring-[#3394f1]"
              title="Download Space-Grade Telemetry Packet"
            >
              <FileJson className="h-3 w-3" />
              <span>PACKET JSON</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-1">
            <div className="bg-[#1c2026]/40 border border-[#404752]/30 p-2 rounded text-center">
              <span className="text-[9px] text-[#c0c7d4]/60 font-semibold uppercase tracking-wider block">DISTANCE</span>
              <span className="font-mono text-xs font-black text-[#e0e2ea] block mt-1">{metrics.totalDistance} km</span>
            </div>
            <div className="bg-[#1c2026]/40 border border-[#404752]/30 p-2 rounded text-center">
              <span className="text-[9px] text-[#c0c7d4]/60 font-semibold uppercase tracking-wider block">DURATION</span>
              <span className="font-mono text-xs font-black text-[#e0e2ea] block mt-1">{metrics.totalDuration} min</span>
            </div>
            <div className="bg-[#1c2026]/40 border border-[#404752]/30 p-2 rounded text-center">
              <span className="text-[9px] text-[#c0c7d4]/60 font-semibold uppercase tracking-wider block">BATTERY</span>
              <span className="font-mono text-xs font-black text-[#4CAF50] block mt-1">{metrics.batteryEstimate}%</span>
            </div>
          </div>
        </div>

        {/* Proximity Alerts Feed */}
        <AnimatePresence>
          {metrics.threatAlerts.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-lg border border-[#EF5350]/40 bg-[#EF5350]/5 p-3 flex flex-col gap-1.5 shrink-0 overflow-hidden shadow-md"
            >
              <div className="flex items-center space-x-1.5 text-[#EF5350]">
                <ShieldAlert className="h-4 w-4 animate-pulse" />
                <span className="font-display font-black text-[9px] tracking-wider uppercase">
                  A* SOLVER TRAJECTORY WARNINGS
                </span>
              </div>
              <div className="space-y-1.5 max-h-[100px] overflow-y-auto font-mono text-[8.5px] text-[#FFCDD2]/95 leading-normal pr-1">
                {metrics.threatAlerts.map((alert, idx) => (
                  <div key={idx} className="border-l-2 border-[#EF5350] pl-2 py-0.5 bg-[#EF5350]/10 rounded-r">
                    {alert}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Waypoints coordinates list stack */}
        <div className="rounded-lg border border-[#404752] bg-[#111C28] p-4 flex flex-col shrink-0">
          <span className="font-display font-semibold text-[10px] text-[#c0c7d4] uppercase tracking-wider block mb-3">
            ROUTE COORDINATES DIRECTIVE
          </span>

          {/* List */}
          <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
            {waypoints.map((wp, idx) => {
              const isImmutable = wp.status === 'start' || wp.status === 'target';
              return (
                <div key={wp.id} className="flex justify-between items-center bg-[#1c2026]/30 border border-[#404752]/20 rounded p-2 text-xs font-mono">
                  <div className="flex items-center space-x-2">
                    <span className="w-4 h-4 rounded-full bg-[#0b0e14] border border-[#3394f1]/50 text-[9px] font-bold flex items-center justify-center text-[#a2c9ff]">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <span className="font-bold text-[#e0e2ea] block truncate w-40">{wp.name}</span>
                      <span className="text-[8px] text-[#c0c7d4]/50">
                        {wp.latitude}°S, {wp.longitude}°E | {wp.elevation}m Elev
                      </span>
                    </div>
                  </div>

                  {!isImmutable ? (
                    <button
                      onClick={() => handleDeleteWaypoint(wp.id, wp.name)}
                      className="p-1 text-[#EF5350]/60 hover:text-[#EF5350] hover:bg-[#EF5350]/10 rounded transition-all cursor-pointer"
                      title="Remove Waypoint"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <span className="text-[8px] font-semibold text-[#c0c7d4]/40 uppercase px-1.5 tracking-wider font-mono">FIXED</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Inline Add Waypoint Form */}
          <form onSubmit={handleAddWaypoint} className="mt-3 pt-3 border-t border-[#404752]/20 flex flex-col gap-2">
            <span className="text-[9px] text-[#c0c7d4] font-semibold uppercase tracking-wider">Inject Custom Site target</span>
            <div className="grid grid-cols-3 gap-1.5">
              <input
                type="text"
                required
                placeholder="Site Name"
                value={newWpName}
                onChange={(e) => setNewWpName(e.target.value)}
                className="col-span-1 bg-[#1c2026] border border-[#404752]/60 focus:border-[#3394f1] text-[10px] text-[#e0e2ea] font-mono px-2 py-1 rounded focus:outline-none"
              />
              <input
                type="number"
                step="0.01"
                required
                placeholder="Lat"
                value={newWpLat}
                onChange={(e) => setNewWpLat(Number(e.target.value))}
                className="col-span-1 bg-[#1c2026] border border-[#404752]/60 focus:border-[#3394f1] text-[10px] text-[#e0e2ea] font-mono px-2 py-1 rounded focus:outline-none"
              />
              <input
                type="number"
                step="0.01"
                required
                placeholder="Lng"
                value={newWpLng}
                onChange={(e) => setNewWpLng(Number(e.target.value))}
                className="col-span-1 bg-[#1c2026] border border-[#404752]/60 focus:border-[#3394f1] text-[10px] text-[#e0e2ea] font-mono px-2 py-1 rounded focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#1c2026] hover:bg-[#31353b] border border-[#404752] hover:border-[#3394f1]/50 text-[#e0e2ea] text-[10px] font-display font-bold py-1.5 rounded transition-all flex items-center justify-center space-x-1 uppercase cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-[#3394f1]" />
              <span>Inject site WP</span>
            </button>
          </form>
        </div>

        {/* Constraints solving options panel */}
        <div className="rounded-lg border border-[#404752] bg-[#111C28] p-4 flex flex-col flex-1 min-h-[220px]">
          <span className="font-display font-semibold text-[10px] text-[#c0c7d4] uppercase tracking-wider block mb-3">
            A* SOLVER TRAJECTORY CONSTRAINTS
          </span>

          <div className="space-y-3.5 flex-1">
            {/* Toggles */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sun className="h-4 w-4 text-[#FFC107]" />
                <span className="text-[10px] text-[#e0e2ea] font-medium font-semibold">Avoid Deep Crater Shadows</span>
              </div>
              <input
                type="checkbox"
                checked={avoidShadow}
                onChange={(e) => setAvoidShadow(e.target.checked)}
                className="w-4 h-4 cursor-pointer accent-[#3394f1]"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Radio className="h-4 w-4 text-[#a855f7]" />
                <span className="text-[10px] text-[#e0e2ea] font-medium font-semibold">Maximize Lander LOS Signal</span>
              </div>
              <input
                type="checkbox"
                checked={optimizeComm}
                onChange={(e) => setOptimizeComm(e.target.checked)}
                className="w-4 h-4 cursor-pointer accent-[#3394f1]"
              />
            </div>

            {/* Slider */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-[#c0c7d4]/60 uppercase">Max Tolerable Slope</span>
                <span className="text-[#3394f1] font-bold">{maxSlope}°</span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                value={maxSlope}
                onChange={(e) => setMaxSlope(Number(e.target.value))}
                className="w-full accent-[#3394f1] cursor-ew-resize bg-[#1c2026] h-1 rounded"
              />
            </div>

            {/* Priority selections selector */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[9px] text-[#c0c7d4]/60 font-semibold uppercase tracking-wider block">Rover Core Speed Preference</span>
              <div className="grid grid-cols-3 gap-1">
                {(['Eco', 'Balanced', 'Performance'] as const).map((mode) => {
                  const isActive = speedPriority === mode;
                  return (
                    <button
                      key={mode}
                      onClick={() => setSpeedPriority(mode)}
                      className={`py-1.5 rounded text-[9px] font-display font-bold uppercase cursor-pointer transition-all ${
                        isActive
                          ? 'bg-[#3394f1]/20 border border-[#3394f1] text-[#a2c9ff]'
                          : 'bg-[#1c2026]/60 border border-[#404752]/40 text-[#c0c7d4]/60 hover:text-[#e0e2ea] hover:bg-[#31353b]/30'
                      }`}
                    >
                      {mode}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            onClick={handleRecalculate}
            disabled={isSolving}
            className={`w-full font-display text-xs font-bold py-2.5 rounded transition-all flex items-center justify-center space-x-2 uppercase mt-3 cursor-pointer ${
              isSolving
                ? 'bg-[#1c2026] border border-[#404752] text-[#c0c7d4]/50 cursor-not-allowed'
                : 'bg-[#FFC107] hover:bg-[#FFE082] text-[#001c38] shadow-md active:scale-[0.99]'
            }`}
          >
            <Activity className={`h-4 w-4 ${isSolving ? 'animate-spin' : ''}`} />
            <span>{isSolving ? 'CALCULATING DIRECTIVES...' : 'OPTIMIZE WAYPOINT DIRECTIVE'}</span>
          </button>
        </div>
      </div>

      {/* Right Visual Control Stage */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 h-full">
        {/* Map Viewport Container */}
        <div className="flex-1 relative min-h-[220px] xl:min-h-[350px] shrink-0 rounded-lg border border-[#404752] overflow-hidden">
          <MapViewer
            selectedSiteId={selectedSite.id}
            onSelectSite={onSelectSite}
            landingSites={landingSites}
            hazards={hazards}
            waypoints={waypoints}
            showHeatmap={false}
            showHazards={true}
            showRoverPath={true}
            activeMissionId={activeMissionId}
          />
        </div>

        {/* Dynamic Route Altimetry Profile Cross-Section */}
        <div className="min-h-[176px] xl:h-44 shrink-0 rounded-lg border border-[#404752] bg-[#111C28] p-4 flex flex-col justify-between shadow-lg">
          <div className="flex justify-between items-center mb-1">
            <span className="font-display font-bold text-[10px] text-[#c0c7d4] uppercase tracking-wider flex items-center gap-1.5">
              <BarChart2 className="h-4 w-4 text-[#3394f1]" />
              ACTIVE TRAVERSE ALTIMETRY PROFILE (DYNAMIC TOPOGRAPHY)
            </span>
            <span className="font-mono text-[9px] text-[#3394f1] font-bold">A* SPLINE INTERPOLATION</span>
          </div>

          <div className="flex-1 relative w-full border-l border-b border-[#404752]/40 mt-1 pb-4 pl-8 pr-4">
            {/* Y Axis Labels */}
            <div className="absolute left-0 top-0 bottom-4 flex flex-col justify-between text-[8px] font-mono text-[#c0c7d4]/60 pr-1.5 text-right w-7">
              <span>{maxElev.toFixed(0)}m</span>
              <span>{((maxElev + minElev) / 2).toFixed(0)}m</span>
              <span>{minElev.toFixed(0)}m</span>
            </div>
            {/* X Axis Labels */}
            <div className="absolute bottom-0 left-8 right-4 flex justify-between text-[8px] font-mono text-[#c0c7d4]/60 pt-1">
              <span>0.0 km</span>
              <span>{(maxDist * 0.25).toFixed(1)} km</span>
              <span>{(maxDist * 0.5).toFixed(1)} km</span>
              <span>{(maxDist * 0.75).toFixed(1)} km</span>
              <span>{maxDist.toFixed(1)} km</span>
            </div>

            {/* Vector graph */}
            <div className="w-full h-full relative overflow-hidden">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="plannerTerrainGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#3394f1" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#3394f1" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Horizontal guide lines */}
                <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(162, 201, 255, 0.08)" strokeDasharray="1.5,1.5" />
                <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(162, 201, 255, 0.04)" strokeDasharray="1.5,1.5" />
                <line x1="0" y1="80" x2="100" y2="80" stroke="rgba(162, 201, 255, 0.04)" strokeDasharray="1.5,1.5" />
                {/* Fill Area */}
                {areaD && <path d={areaD} fill="url(#plannerTerrainGrad)" />}
                {/* Main Line */}
                {pointsD && <path d={pointsD} fill="none" stroke="#3394f1" strokeWidth="1.5" />}
                
                {/* Floating Waypoint Dots */}
                {waypointDots.map((dot, idx) => (
                  <g key={dot.id}>
                    <circle cx={dot.x} cy={dot.y} r="1.5" fill={idx === 0 ? "#4CAF50" : idx === waypointDots.length - 1 ? "#FFC107" : "#a2c9ff"} />
                    <circle cx={dot.x} cy={dot.y} r="3.5" fill="none" stroke="#3394f1" strokeWidth="0.5" className="animate-pulse" />
                  </g>
                ))}
              </svg>

              {/* Waypoint Label Overlays */}
              {waypointDots.map((dot, idx) => (
                <div
                  key={dot.id}
                  className="absolute bg-[#1c2026]/95 border border-[#404752]/60 rounded px-1 py-0.5 text-[7px] font-mono text-[#a2c9ff] shadow-md whitespace-nowrap pointer-events-none"
                  style={{ 
                    left: `${Math.max(2, Math.min(88, dot.x))}%`, 
                    top: `${Math.max(5, Math.min(80, dot.y - 18))}%`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  <span className="text-[#e0e2ea] font-bold">{dot.name}</span> ({dot.elev}m)
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
