import React, { useState, useEffect } from 'react';
import { LandingSite, Hazard, Waypoint } from '../types';
import MapViewer from './MapViewer';
import { 
  ShieldCheck, 
  Download, 
  ChevronRight, 
  Zap, 
  Clock, 
  Compass, 
  AlertOctagon,
  Radar,
  Brain,
  Award,
  TrendingUp,
  Activity,
  BarChart2,
  ListCollapse,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getTelemetryData, TelemetryData } from '../services/simulationService';

interface OverviewDashboardProps {
  selectedSite: LandingSite;
  onSelectSite: (id: string) => void;
  landingSites: LandingSite[];
  hazards: Hazard[];
  waypoints: Waypoint[];
  terrainProfile: Array<{ distance: number; elevation: number; slope: number }>;
  totalDistance: number;
  totalDuration: number;
  batteryEstimate: number;
  onNavigateTab: (tab: string) => void;
  activeMissionName: string;
  activeMissionId: string;
  onExportReport: () => void;
}

export default function OverviewDashboard({
  selectedSite,
  onSelectSite,
  landingSites,
  hazards,
  waypoints,
  terrainProfile,
  totalDistance,
  totalDuration,
  batteryEstimate,
  onNavigateTab,
  activeMissionName,
  activeMissionId,
  onExportReport
}: OverviewDashboardProps) {
  const [expandedPanel, setExpandedPanel] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryData>(getTelemetryData(selectedSite));
  const [batteryLevel, setBatteryLevel] = useState(88);

  // Recalculate telemetry on landing site switch
  useEffect(() => {
    setTelemetry(getTelemetryData(selectedSite, batteryLevel));
  }, [selectedSite, batteryLevel]);

  // Micro jitter for battery and telemetry stats
  useEffect(() => {
    const timer = setInterval(() => {
      setBatteryLevel(prev => {
        const next = prev - 0.05;
        return next < 10 ? 98 : Number(next.toFixed(2));
      });
      setTelemetry(prev => ({
        ...prev,
        cpuUsage: Math.min(95, Math.max(15, prev.cpuUsage + (Math.random() - 0.5) * 4)),
        dataRate: Math.min(20, Math.max(5, prev.dataRate + (Math.random() - 0.5) * 0.2)),
        commLatency: Math.min(2, Math.max(0.8, prev.commLatency + (Math.random() - 0.5) * 0.01))
      }));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Project terrain coordinates to SVG
  const elevations = terrainProfile.map(p => p.elevation);
  const minElev = elevations.length > 0 ? Math.min(...elevations) - 15 : -2900;
  const maxElev = elevations.length > 0 ? Math.max(...elevations) + 15 : -2700;
  const maxDist = terrainProfile.length > 0 ? terrainProfile[terrainProfile.length - 1].distance : 3.24;

  const pointsD = terrainProfile.reduce((path, pt, index) => {
    const x = maxDist > 0 ? (pt.distance / maxDist) * 100 : 0;
    const y = maxElev !== minElev ? 100 - ((pt.elevation - minElev) / (maxElev - minElev)) * 100 : 50;
    if (index === 0) return `M ${x} ${y}`;
    return `${path} L ${x} ${y}`;
  }, '');

  const areaD = `${pointsD} L 100 100 L 0 100 Z`;

  // Dynamically position POI
  const showPoi = waypoints.length > 1;
  const poiIndex = Math.min(1, waypoints.length - 1);
  const poiWp = showPoi ? waypoints[poiIndex] : null;
  const poiDist = poiWp ? (waypoints.slice(0, poiIndex + 1).reduce((sum, wp, i) => {
    if (i === 0) return 0;
    const wp1 = waypoints[i - 1];
    const wp2 = wp;
    const avgLatRad = (((wp1.latitude + wp2.latitude) / 2) * Math.PI) / 180;
    const dLat = (wp2.latitude - wp1.latitude) * 30.32;
    const dLng = (wp2.longitude - wp1.longitude) * 30.32 * Math.cos(avgLatRad);
    return sum + Math.sqrt(dLat * dLat + dLng * dLng);
  }, 0)) : 0;

  const poiX = maxDist > 0 ? (poiDist / maxDist) * 100 : 37;
  const poiY = (poiWp && maxElev !== minElev) ? 100 - ((poiWp.elevation - minElev) / (maxElev - minElev)) * 100 : 78;

  // Dynamic status color
  const statusColor = selectedSite.status === 'optimal' ? '#4CAF50' : selectedSite.status === 'feasible' ? '#3394f1' : '#EF5350';

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-5 h-full overflow-hidden select-none">
      {/* Central Interactive Block */}
      <div className="flex-1 flex flex-col gap-4 min-w-0 h-full overflow-y-auto pr-1">
        {/* Map Viewport Container */}
        <div className="flex-1 min-h-[320px] xl:min-h-[400px] shrink-0 relative">
          <MapViewer
            selectedSiteId={selectedSite.id}
            onSelectSite={onSelectSite}
            landingSites={landingSites}
            hazards={hazards}
            waypoints={waypoints}
            showHeatmap={true}
            showHazards={false}
            showRoverPath={true}
            activeMissionId={activeMissionId}
          />
        </div>

        {/* Bottom Section: Elevation Chart & Metrics */}
        <div className="min-h-[180px] xl:h-44 shrink-0 grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Elevation Profile Plot */}
          <div className="rounded-lg border border-[#404752] bg-[#111C28] p-4 flex flex-col justify-between shadow-lg">
            <div className="flex justify-between items-center mb-1">
              <span className="font-display font-bold text-[10px] text-[#c0c7d4] uppercase tracking-wider flex items-center gap-1.5">
                <BarChart2 className="h-4 w-4 text-[#3394f1]" />
                TRAVERSE ALTIMETRY PROFILE (OPTIMIZED DIRECTIVE)
              </span>
              <span className="font-mono text-[9px] text-[#3394f1] font-bold">A* SPLINES</span>
            </div>

             {/* Elevation Vector Chart */}
            <div className="flex-1 relative w-full border-l border-b border-[#404752]/40 mt-1 pb-4 pl-6 pr-2">
              {/* Y Axis Labels */}
              <div className="absolute left-0 top-0 bottom-4 flex flex-col justify-between text-[8px] font-mono text-[#c0c7d4]/60 pr-1 text-right w-5">
                <span>{maxElev.toFixed(0)}m</span>
                <span>{((maxElev + minElev) / 2).toFixed(0)}m</span>
                <span>{minElev.toFixed(0)}m</span>
              </div>
              {/* X Axis Labels */}
              <div className="absolute bottom-0 left-6 right-2 flex justify-between text-[8px] font-mono text-[#c0c7d4]/60 pt-1">
                <span>0.0 km</span>
                <span>{(maxDist * 0.33).toFixed(1)} km</span>
                <span>{(maxDist * 0.66).toFixed(1)} km</span>
                <span>{maxDist.toFixed(1)} km</span>
              </div>

              {/* Vector graph */}
              <div className="w-full h-full relative overflow-hidden">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="terrainGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#3394f1" stopOpacity="0.28" />
                      <stop offset="100%" stopColor="#3394f1" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Grid threshold line */}
                  <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(162, 201, 255, 0.08)" strokeDasharray="1.5,1.5" />
                  <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(162, 201, 255, 0.04)" strokeDasharray="1.5,1.5" />
                  <line x1="0" y1="80" x2="100" y2="80" stroke="rgba(162, 201, 255, 0.04)" strokeDasharray="1.5,1.5" />
                  {/* Fill Area */}
                  {areaD && <path d={areaD} fill="url(#terrainGrad)" />}
                  {/* Main Line */}
                  {pointsD && <path d={pointsD} fill="none" stroke="#3394f1" strokeWidth="1.5" />}
                  {/* Point of Interest */}
                  {showPoi && poiWp && (
                    <>
                      <circle cx={poiX} cy={poiY} r="1.5" fill="#a2c9ff" />
                      <circle cx={poiX} cy={poiY} r="3.5" fill="none" stroke="#3394f1" strokeWidth="0.5" className="animate-pulse" />
                    </>
                  )}
                </svg>
                {/* Micro tooltip hover overlay */}
                {showPoi && poiWp && (
                  <div 
                    className="absolute bg-[#1c2026] border border-[#404752]/80 rounded px-1.5 py-0.5 text-[8px] font-mono text-[#a2c9ff] shadow whitespace-nowrap"
                    style={{ left: `${Math.max(10, Math.min(80, poiX))}%`, top: `${Math.max(10, Math.min(80, poiY - 18))}%` }}
                  >
                    {poiWp.elevation}m Elev ({poiWp.name})
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Path traversal summary stats */}
          <div className="rounded-lg border border-[#404752] bg-[#111C28] p-4 flex flex-col justify-between shadow-lg">
            <span className="font-display font-bold text-[10px] text-[#c0c7d4] uppercase tracking-wider block mb-2">
              SOLVER TRAJECTORY METRICS
            </span>

            <div className="grid grid-cols-3 gap-3 flex-1 items-center mb-1">
              <div className="flex items-start space-x-2.5">
                <div className="w-9 h-9 rounded bg-[#3394f1]/10 flex items-center justify-center shrink-0 border border-[#3394f1]/30">
                  <Compass className="h-4.5 w-4.5 text-[#3394f1]" />
                </div>
                <div>
                  <div className="font-mono text-xs font-bold text-[#e0e2ea] leading-tight">{totalDistance} km</div>
                  <span className="text-[9px] text-[#c0c7d4]/60 font-semibold uppercase tracking-wider">Traverse Dist</span>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <div className="w-9 h-9 rounded bg-[#a2c9ff]/10 flex items-center justify-center shrink-0 border border-[#a2c9ff]/30">
                  <Clock className="h-4.5 w-4.5 text-[#a2c9ff]" />
                </div>
                <div>
                  <div className="font-mono text-xs font-bold text-[#e0e2ea] leading-tight">{totalDuration} min</div>
                  <span className="text-[9px] text-[#c0c7d4]/60 font-semibold uppercase tracking-wider">Est. Duration</span>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <div className="w-9 h-9 rounded bg-[#4CAF50]/10 flex items-center justify-center shrink-0 border border-[#4CAF50]/30 animate-pulse">
                  <Zap className="h-4.5 w-4.5 text-[#4CAF50]" />
                </div>
                <div>
                  <div className="font-mono text-xs font-bold text-[#4CAF50] leading-tight">{batteryLevel}%</div>
                  <span className="text-[9px] text-[#c0c7d4]/60 font-semibold uppercase tracking-wider">Est. Battery</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('planner')}
              className="w-full bg-[#3394f1] hover:bg-[#a2c9ff] text-[#001c38] font-display text-xs font-black uppercase py-2.5 rounded transition-all active:scale-[0.99] cursor-pointer shadow-md flex items-center justify-center space-x-1"
            >
              <span>SOLVE ROVER TRAJECTORY CONSTRAINTS</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar Telemetry */}
      <div className="w-76 shrink-0 flex flex-col gap-4 overflow-y-auto pr-1">
        
        {/* Real-time AI Confidence Assessment */}
        <div className="rounded-lg border border-[#404752] bg-[#111C28] p-4 flex flex-col shadow-lg">
          <div className="flex justify-between items-center mb-2.5">
            <span className="font-display font-bold text-[10px] text-[#c0c7d4] uppercase tracking-wider">
              REAL-TIME AI MODEL CONFIDENCE
            </span>
            <Brain className="h-4.5 w-4.5 text-[#3394f1] animate-bounce" />
          </div>

          <div className="flex items-center space-x-4">
            {/* Visual radial gauge with Framer Motion */}
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#1c2026] stroke-current"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  strokeWidth="3.5"
                />
                <motion.path
                  className="text-[#3394f1] stroke-current"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  strokeDasharray={`${telemetry.successProbability}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: `${telemetry.successProbability}, 100` }}
                  transition={{ duration: 1 }}
                />
              </svg>
              <span className="font-mono font-black text-xs text-[#e0e2ea]">{telemetry.successProbability}%</span>
            </div>
            <div>
              <div className="font-display font-extrabold text-[10px] text-[#3394f1] uppercase tracking-wide">
                MODEL SUCCESS ACCURACY
              </div>
              <span className="text-[9.5px] text-[#c0c7d4]/80 leading-relaxed block mt-0.5">
                Dynamic probability derived from surface gradient {selectedSite.slope}° and {selectedSite.iceConfidence}% water ice confidence.
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic landing site evaluation metrics */}
        <div className="rounded-lg border border-[#404752] bg-[#111C28] p-4 flex flex-col justify-between shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-display font-bold text-[10px] text-[#c0c7d4] uppercase tracking-wider block">
              TOUCHDOWN EVALUATION
            </span>
            <span className="font-mono text-[9px] text-[#4CAF50] font-bold uppercase">SELECTED: {selectedSite.name}</span>
          </div>

          <div className="space-y-2 mt-1">
            <div className="flex justify-between items-center text-[10px] font-mono border-b border-[#404752]/20 pb-1.5">
              <span className="text-[#c0c7d4]/60">SCIENCE YIELD POTENTIAL</span>
              <span className="text-[#a2c9ff] font-bold">{telemetry.scientificValue} / 100</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono border-b border-[#404752]/20 pb-1.5">
              <span className="text-[#c0c7d4]/60">TOUCHDOWN SAFETY INDEX</span>
              <span className="text-[#4CAF50] font-bold">{telemetry.safetyScore} / 100</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono">
              <span className="text-[#c0c7d4]/60">LANDING SITE GRADIENT</span>
              <span className="text-[#ff7043] font-bold">{selectedSite.slope}° (MAX 15°)</span>
            </div>
          </div>
        </div>

        {/* Overall mission risk meter */}
        <div className="rounded-lg border border-[#404752] bg-[#111C28] p-4 flex flex-col justify-between shadow-lg">
          <span className="font-display font-bold text-[10px] text-[#c0c7d4] uppercase tracking-wider block mb-3">
            MISSION EXCURSION RISKS
          </span>
          <div className="flex justify-between items-center mb-2">
            <div>
              <div className="font-display text-lg font-black text-[#4CAF50] leading-none uppercase">
                {selectedSite.status === 'optimal' ? 'LOW DANGER' : selectedSite.status === 'feasible' ? 'MODERATE RISK' : 'CRITICAL THREAT'}
              </div>
              <span className="text-[9px] text-[#c0c7d4]/60 font-semibold uppercase tracking-wider block mt-1">
                TOPOLOGY RISK ASSESSMENT
              </span>
            </div>
            <ShieldCheck className="h-8 w-8 text-[#4CAF50]" />
          </div>
          <div className="w-full bg-[#1c2026] h-1.5 rounded overflow-hidden">
            <motion.div 
              className="bg-[#4CAF50] h-full"
              initial={{ width: "0%" }}
              animate={{ width: `${selectedSite.status === 'optimal' ? 18 : selectedSite.status === 'feasible' ? 44 : 85}%` }}
              transition={{ duration: 1 }}
              style={{ backgroundColor: statusColor }}
            />
          </div>
        </div>

        {/* Expandable Engineering Telemetry Panels */}
        <div className="rounded-lg border border-[#404752] bg-[#111C28] p-4 flex flex-col flex-1 min-h-[160px] shadow-lg">
          <span className="font-display font-bold text-[10px] text-[#c0c7d4] uppercase tracking-wider block mb-2.5">
            ENGINEERING DIAGNOSTIC HUDS
          </span>
          
          <div className="space-y-1.5 mt-auto">
            {/* Sparklines Panel Toggle */}
            <div className="border border-[#404752]/40 rounded overflow-hidden">
              <button
                onClick={() => setExpandedPanel(expandedPanel === 'spark' ? null : 'spark')}
                className="w-full text-left bg-[#1c2026]/40 hover:bg-[#1c2026] px-3 py-2 text-[10px] font-bold text-[#e0e2ea] flex justify-between items-center cursor-pointer transition-colors"
              >
                <span>S-BAND MICROWAVE SIGNAL TELEMETRY</span>
                <TrendingUp className="h-3.5 w-3.5 text-[#3394f1]" />
              </button>
              <AnimatePresence>
                {expandedPanel === 'spark' && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="bg-[#0c1219] p-3 border-t border-[#404752]/30"
                  >
                    <div className="flex justify-between items-center text-[9px] font-mono text-[#c0c7d4] mb-2">
                      <span>STRENGTH: {telemetry.signalStrength}%</span>
                      <span>LATENCY: {telemetry.commLatency.toFixed(3)}s</span>
                    </div>
                    {/* Sparkline Drawing */}
                    <svg className="w-full h-8" viewBox="0 0 100 20" preserveAspectRatio="none">
                      <path
                        d="M 0,15 Q 10,8 20,12 T 40,5 T 60,10 T 80,4 T 100,8"
                        fill="none"
                        stroke="#3394f1"
                        strokeWidth="1.2"
                      />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Micro details panel */}
            <div className="border border-[#404752]/40 rounded overflow-hidden">
              <button
                onClick={() => setExpandedPanel(expandedPanel === 'rtg' ? null : 'rtg')}
                className="w-full text-left bg-[#1c2026]/40 hover:bg-[#1c2026] px-3 py-2 text-[10px] font-bold text-[#e0e2ea] flex justify-between items-center cursor-pointer transition-colors"
              >
                <span>THERMOELECTRIC GENERATOR STATUS</span>
                <Activity className="h-3.5 w-3.5 text-[#4CAF50]" />
              </button>
              <AnimatePresence>
                {expandedPanel === 'rtg' && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="bg-[#0c1219] p-3 border-t border-[#404752]/30 font-mono text-[9px] space-y-1.5 text-[#c0c7d4]"
                  >
                    <div className="flex justify-between">
                      <span>RTG CORE HEAT:</span>
                      <span className="text-white font-bold">480K</span>
                    </div>
                    <div className="flex justify-between">
                      <span>THERMAL REGULATOR:</span>
                      <span className="text-[#4CAF50] font-bold">NOMINAL AUTO</span>
                    </div>
                    <div className="flex justify-between">
                      <span>DISSIPATION LOOP:</span>
                      <span className="text-white">12.8 WT/W</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action buttons */}
            <button
              onClick={onExportReport}
              className="w-full text-center bg-[#0d1620] hover:bg-[#3394f1]/15 border border-[#3394f1]/30 hover:border-[#3394f1] text-[10.5px] text-[#3394f1] font-display font-black py-2 rounded transition-all cursor-pointer flex items-center justify-center space-x-1 uppercase mt-2 shadow"
            >
              <Download className="h-4 w-4" />
              <span>COMPILE MISSION FLIGHT DOCUMENTS</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
