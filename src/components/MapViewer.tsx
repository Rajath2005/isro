import React, { useState, useEffect } from 'react';
import { LandingSite, Hazard, Waypoint } from '../types';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Layers, 
  Compass, 
  MapPin, 
  Activity, 
  Eye, 
  Flame, 
  ShieldAlert, 
  Map as MapIcon, 
  Award,
  CirclePlay,
  Play,
  Pause,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MapViewerProps {
  selectedSiteId: string;
  onSelectSite: (id: string) => void;
  landingSites: LandingSite[];
  hazards: Hazard[];
  waypoints: Waypoint[];
  onAddWaypoint?: (wp: Omit<Waypoint, 'id'>) => void;
  showHeatmap: boolean;
  showHazards: boolean;
  showRoverPath: boolean;
  activeMissionId: string;
  hoveredItem?: string | null;
  setHoveredItem?: (item: string | null) => void;
}

interface ScientificPOI {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: string;
  readout: string;
}

export default function MapViewer({
  selectedSiteId,
  onSelectSite,
  landingSites,
  hazards,
  waypoints,
  onAddWaypoint,
  showHeatmap: initialShowHeatmap,
  showHazards: initialShowHazards,
  showRoverPath: initialShowRoverPath,
  activeMissionId,
  hoveredItem: externalHoveredItem,
  setHoveredItem: externalSetHoveredItem
}: MapViewerProps) {
  // Local toggles for layers to allow overrides
  const [showHeatmap, setShowHeatmap] = useState(initialShowHeatmap);
  const [showHazards, setShowHazards] = useState(initialShowHazards);
  const [showRoverPath, setShowRoverPath] = useState(initialShowRoverPath);
  const [showContours, setShowContours] = useState(true);
  const [showPOIs, setShowPOIs] = useState(true);
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.65);

  // Sync with initial props when they change
  useEffect(() => {
    setShowHeatmap(initialShowHeatmap);
  }, [initialShowHeatmap]);

  useEffect(() => {
    setShowHazards(initialShowHazards);
  }, [initialShowHazards]);

  useEffect(() => {
    setShowRoverPath(initialShowRoverPath);
  }, [initialShowRoverPath]);

  // Zoom / Pan states
  const [zoom, setZoom] = useState(1.1);
  const [pan, setPan] = useState({ x: -20, y: -20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Tooltip & POI selection states
  const [hoveredNode, setHoveredNode] = useState<{
    type: 'site' | 'hazard' | 'waypoint' | 'poi';
    name: string;
    details: string;
    metrics?: string[];
    x: number;
    y: number;
  } | null>(null);

  const [selectedPOI, setSelectedPOI] = useState<ScientificPOI | null>(null);

  // Animated Rover traversal state
  const [isRoverAnimating, setIsRoverAnimating] = useState(false);
  const [roverPosition, setRoverPosition] = useState<{ x: number; y: number } | null>(null);
  const [roverIndex, setRoverIndex] = useState(0);

  // Map Limits
  const isFaustini = activeMissionId === 'faustini-explorer';
  const latMin = isFaustini ? -87.52 : -90.0;
  const latMax = isFaustini ? -87.32 : -89.8;
  const lngMin = isFaustini ? 82.05 : -0.1;
  const lngMax = isFaustini ? 82.55 : 0.1;

  // Project lat/lng to standard 0-100 Box
  const projectCoords = (lat: number, lng: number) => {
    const x = ((lng - lngMin) / (lngMax - lngMin)) * 100;
    const y = ((latMax - lat) / (latMax - latMin)) * 100; // inverted Y
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.6));
  const handleReset = () => {
    setZoom(1.1);
    setPan({ x: -20, y: -20 });
    setSelectedPOI(null);
    setIsRoverAnimating(false);
    setRoverPosition(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Projection Data
  const projectedLZs = landingSites.map(lz => ({
    ...lz,
    proj: projectCoords(lz.latitude, lz.longitude)
  }));

  const projectedHazards = hazards.map(h => ({
    ...h,
    proj: projectCoords(h.latitude, h.longitude)
  }));

  const projectedWPs = waypoints.map(wp => ({
    ...wp,
    proj: projectCoords(wp.latitude, wp.longitude)
  }));

  // Scientific POIs
  const scientificPOIs: ScientificPOI[] = isFaustini 
    ? [
        { id: 'poi-1', name: 'Drill-Site Alpha (H₂O Peak)', latitude: -87.46, longitude: 82.42, type: 'Water Ice Reserve', readout: 'Peak hydrogen attenuation. Estimated 94% volume density of exospheric ice at 0.5m depth.' },
        { id: 'poi-2', name: 'Pyroclastic Ridge (Helium-3)', latitude: -87.37, longitude: 82.16, type: 'Helium-3 Deposition', readout: 'Volcanic ejecta mantle with 15 ppm Helium-3 concentration. High economic value.' },
        { id: 'poi-3', name: 'Exospheric Cold Trap', latitude: -87.49, longitude: 82.32, type: 'Volatile Trap', readout: 'Perpetually shadowed depression containing pristine exospheric frost deposits.' }
      ]
    : [
        { id: 'poi-sh-1', name: 'Shackleton Peak (11h Solar)', latitude: -89.88, longitude: 0.08, type: 'Solar Array Base', readout: 'Continuous solar array illumination window exceeding 11 hours per diurnal cycle.' },
        { id: 'poi-sh-2', name: 'Deep Rim Volatile Trap', latitude: -89.94, longitude: -0.06, type: 'Anomalous Ice Pocket', readout: 'Subsurface radar reflections indicate high-density ice block layer (>1.8m width).' }
      ];

  const projectedPOIs = scientificPOIs.map(p => ({
    ...p,
    proj: projectCoords(p.latitude, p.longitude)
  }));

  // Create SVG path for rover trajectory
  const routePathD = projectedWPs.reduce((path, wp, index) => {
    if (index === 0) return `M ${wp.proj.x} ${wp.proj.y}`;
    return `${path} L ${wp.proj.x} ${wp.proj.y}`;
  }, '');

  // Animate Rover movement along waypoints
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRoverAnimating && projectedWPs.length > 1) {
      setRoverPosition(projectedWPs[0].proj);
      setRoverIndex(0);

      let step = 0;
      interval = setInterval(() => {
        if (step < projectedWPs.length - 1) {
          step++;
          setRoverIndex(step);
          setRoverPosition(projectedWPs[step].proj);
        } else {
          // Restart animation loop or stop
          step = 0;
          setRoverIndex(0);
          setRoverPosition(projectedWPs[0].proj);
        }
      }, 1800);
    } else {
      setRoverPosition(null);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRoverAnimating, waypoints]);

  return (
    <div className="flex-1 rounded-lg border border-[#404752] bg-[#070b12] relative overflow-hidden flex flex-col group select-none h-full shadow-2xl">
      {/* Map Header Overlay */}
      <div className="absolute top-4 left-4 z-10 bg-[#0d1620]/95 backdrop-blur border border-[#404752] rounded p-3 shadow-2xl pointer-events-auto">
        <h2 className="font-display font-black text-[11px] text-[#e0e2ea] tracking-widest uppercase mb-1 flex items-center gap-1.5">
          <Compass className="h-4 w-4 text-[#3394f1] animate-spin" style={{ animationDuration: '12s' }} />
          GIS LUNAR SURFACE VIEWPORT
        </h2>
        <div className="font-mono text-[9px] text-[#c0c7d4]/80 flex items-center space-x-2">
          <span className="text-[#3394f1] font-bold">REGION:</span>
          <span>{isFaustini ? 'FAUSTINI CRATER RIM' : 'SHACKLETON INTERIOR DEEP'}</span>
          <span className="text-[#404752]">|</span>
          <span className="text-[#a2c9ff]">
            {isFaustini ? '87.42°S, 82.31°E' : '89.90°S, 0.00°E'}
          </span>
        </div>
      </div>

      {/* Map Layers Toggle Control Bar */}
      <div className="absolute top-4 right-4 z-10 bg-[#0d1620]/95 backdrop-blur border border-[#404752] rounded p-3 shadow-2xl pointer-events-auto w-48 flex flex-col gap-2">
        <h3 className="font-display font-bold text-[9px] text-[#a2c9ff] tracking-widest uppercase border-b border-[#404752]/40 pb-1 flex items-center justify-between">
          <span>LAYERS CONTROLLER</span>
          <Layers className="h-3 w-3" />
        </h3>

        <div className="flex flex-col gap-1.5 font-display text-[9px] text-[#e0e2ea] font-medium">
          {/* Heatmap Toggle */}
          <label className="flex items-center justify-between cursor-pointer hover:text-white transition-colors">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#3394f1]/50 border border-[#3394f1]/80"></span>
              Water-Ice (H₂) Probe
            </span>
            <input 
              type="checkbox" 
              checked={showHeatmap} 
              onChange={(e) => setShowHeatmap(e.target.checked)} 
              className="w-3 h-3 accent-[#3394f1] cursor-pointer" 
            />
          </label>

          {/* Opacity slider if heatmap is active */}
          {showHeatmap && (
            <div className="pl-4 flex items-center gap-1.5 shrink-0 py-0.5">
              <span className="text-[8px] text-[#c0c7d4]/60">OPACITY:</span>
              <input 
                type="range" 
                min="0.1" 
                max="0.9" 
                step="0.1" 
                value={heatmapOpacity}
                onChange={(e) => setHeatmapOpacity(Number(e.target.value))}
                className="w-full bg-[#1c2026] h-1 rounded accent-[#3394f1] cursor-ew-resize"
              />
            </div>
          )}

          {/* Hazards Toggle */}
          <label className="flex items-center justify-between cursor-pointer hover:text-white transition-colors">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#EF5350]/30 border border-[#EF5350]/80"></span>
              Terrain Threats
            </span>
            <input 
              type="checkbox" 
              checked={showHazards} 
              onChange={(e) => setShowHazards(e.target.checked)} 
              className="w-3 h-3 accent-[#EF5350] cursor-pointer" 
            />
          </label>

          {/* Rover Path Toggle */}
          <label className="flex items-center justify-between cursor-pointer hover:text-white transition-colors">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-[#FFC107]"></span>
              Optimized Trajectory
            </span>
            <input 
              type="checkbox" 
              checked={showRoverPath} 
              onChange={(e) => setShowRoverPath(e.target.checked)} 
              className="w-3 h-3 accent-[#FFC107] cursor-pointer" 
            />
          </label>

          {/* Topographic Contours Toggle */}
          <label className="flex items-center justify-between cursor-pointer hover:text-white transition-colors">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full border border-[#8a919e]/40"></span>
              Altimetry Contours
            </span>
            <input 
              type="checkbox" 
              checked={showContours} 
              onChange={(e) => setShowContours(e.target.checked)} 
              className="w-3 h-3 accent-[#8a919e] cursor-pointer" 
            />
          </label>

          {/* Scientific POIs Toggle */}
          <label className="flex items-center justify-between cursor-pointer hover:text-white transition-colors">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#e9d5ff] border border-[#c084fc]"></span>
              Science Objectives
            </span>
            <input 
              type="checkbox" 
              checked={showPOIs} 
              onChange={(e) => setShowPOIs(e.target.checked)} 
              className="w-3 h-3 accent-[#a855f7] cursor-pointer" 
            />
          </label>
        </div>

        {/* Traversal Animation Controller */}
        {showRoverPath && (
          <button
            onClick={() => setIsRoverAnimating(!isRoverAnimating)}
            className={`w-full text-[9px] font-bold py-1 px-1.5 rounded transition-all cursor-pointer flex items-center justify-center gap-1 border ${
              isRoverAnimating 
                ? 'bg-[#FFC107]/20 border-[#FFC107] text-[#FFC107]' 
                : 'bg-[#1c2026] border-[#404752] text-[#e0e2ea] hover:border-[#FFC107]/50'
            }`}
          >
            {isRoverAnimating ? (
              <>
                <Pause className="h-2.5 w-2.5" />
                <span>HALT ANIMATED ROVER</span>
              </>
            ) : (
              <>
                <Play className="h-2.5 w-2.5" />
                <span>RUN TRAVERSAL SIMULATION</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Map Interactive GIS Toolbar */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 bg-[#0d1620]/95 backdrop-blur border border-[#404752] p-1.5 rounded-lg shadow-2xl pointer-events-auto">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-1.5 text-[#c0c7d4] hover:text-[#3394f1] hover:bg-[#1c2026] rounded transition-all cursor-pointer active:scale-90"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-1.5 text-[#c0c7d4] hover:text-[#3394f1] hover:bg-[#1c2026] rounded transition-all cursor-pointer active:scale-90"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={handleReset}
          title="Reset View"
          className="p-1.5 text-[#c0c7d4] hover:text-[#3394f1] hover:bg-[#1c2026] rounded transition-all cursor-pointer active:scale-90"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Surface GIS Core View Area */}
      <div
        className="w-full h-full relative cursor-grab active:cursor-grabbing overflow-hidden scanline-effect"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="w-full h-full transition-transform duration-75 ease-out origin-center relative"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          {/* SVG Vector Overlays */}
          <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              {/* Radial Ice gradient with dynamic opacity */}
              <radialGradient id="iceHeatmapGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#3394f1" stopOpacity={heatmapOpacity * 1.1} />
                <stop offset="40%" stopColor="#0060a8" stopOpacity={heatmapOpacity * 0.8} />
                <stop offset="70%" stopColor="#a2c9ff" stopOpacity={heatmapOpacity * 0.4} />
                <stop offset="100%" stopColor="#3394f1" stopOpacity="0" />
              </radialGradient>

              {/* Grid backdrop patterns */}
              <pattern id="gisGrid" width="8" height="8" patternUnits="userSpaceOnUse">
                <path d="M 8 0 L 0 0 0 8" fill="none" stroke="rgba(51, 148, 241, 0.05)" strokeWidth="0.08" />
              </pattern>

              <filter id="vectorGlow">
                <feGaussianBlur stdDeviation="1.2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Space Grid */}
            <rect width="100" height="100" fill="url(#gisGrid)" />

            {/* Contours (Elevation Altimetry Mapping) */}
            {showContours && (
              <g opacity="0.45" stroke="rgba(162, 201, 255, 0.15)">
                <ellipse cx="50" cy="50" rx="44" ry="41" fill="none" strokeWidth="0.4" />
                <ellipse cx="50" cy="50" rx="39" ry="36" fill="none" strokeWidth="0.35" />
                <ellipse cx="50" cy="50" rx="34" ry="31" fill="none" strokeWidth="0.3" strokeDasharray="1,1" />
                <ellipse cx="48" cy="48" rx="28" ry="25" fill="none" strokeWidth="0.25" />
                <ellipse cx="48" cy="48" rx="22" ry="19" fill="none" strokeWidth="0.2" />
                <ellipse cx="48" cy="48" rx="16" ry="13" fill="none" strokeWidth="0.15" />
                {/* Secondary craters */}
                <circle cx="22" cy="30" r="6" fill="none" strokeWidth="0.25" />
                <circle cx="22" cy="30" r="4.5" fill="none" strokeWidth="0.2" />
                <circle cx="82" cy="62" r="10" fill="none" strokeWidth="0.3" />
                <circle cx="82" cy="62" r="8" fill="none" strokeWidth="0.2" />
              </g>
            )}

            {/* Deep crater shadow core */}
            <ellipse cx="48" cy="48" rx="22" ry="19" fill="#04070e" opacity="0.8" />

            {/* Heatmap Overlay */}
            {showHeatmap && (
              <ellipse
                cx={isFaustini ? "47" : "50"}
                cy={isFaustini ? "45" : "52"}
                rx={isFaustini ? "24" : "19"}
                ry={isFaustini ? "20" : "16"}
                fill="url(#iceHeatmapGradient)"
                filter="url(#vectorGlow)"
              />
            )}

            {/* Hazards threat overlays */}
            {showHazards && (
              <g>
                {/* Steep Slide Slope Crater Rim hazard */}
                <path
                  d="M 18,34 Q 35,22 55,24 Q 45,30 30,31 Z"
                  fill="rgba(239, 83, 80, 0.18)"
                  stroke="#EF5350"
                  strokeWidth="0.4"
                  filter="url(#vectorGlow)"
                  className="animate-pulse"
                />
                {/* Boulder sliding ejecta blanket */}
                <path
                  d="M 64,42 Q 80,45 76,64 Q 68,52 64,42 Z"
                  fill="rgba(239, 83, 80, 0.15)"
                  stroke="#EF5350"
                  strokeWidth="0.35"
                />
                {/* Radio line-of-sight blockage zone */}
                <ellipse
                  cx="52"
                  cy="75"
                  rx="14"
                  ry="5"
                  fill="rgba(168, 85, 247, 0.15)"
                  stroke="#a855f7"
                  strokeWidth="0.3"
                  strokeDasharray="1,1.5"
                />
              </g>
            )}

            {/* Optimized Rover Path trajectory */}
            {showRoverPath && routePathD && (
              <g>
                <path
                  d={routePathD}
                  fill="none"
                  stroke="#FFC107"
                  strokeWidth="0.9"
                  strokeDasharray="2.5, 2"
                  strokeLinecap="round"
                />
                {/* Micro trajectory point dots */}
                {projectedWPs.map((wp) => (
                  <circle
                    key={`dot-${wp.id}`}
                    cx={wp.proj.x}
                    cy={wp.proj.y}
                    r="0.5"
                    fill="#FFC107"
                  />
                ))}
              </g>
            )}

            {/* Rover Simulated Positioning marker along waypoints */}
            {showRoverPath && isRoverAnimating && roverPosition && (
              <g>
                <circle
                  cx={roverPosition.x}
                  cy={roverPosition.y}
                  r="2.5"
                  fill="none"
                  stroke="#FFC107"
                  strokeWidth="0.4"
                  className="animate-ping"
                  style={{ transformOrigin: `${roverPosition.x}px ${roverPosition.y}px` }}
                />
                <circle
                  cx={roverPosition.x}
                  cy={roverPosition.y}
                  r="1.4"
                  fill="#FFC107"
                  stroke="#070b12"
                  strokeWidth="0.4"
                  filter="url(#vectorGlow)"
                />
                <text
                  x={roverPosition.x}
                  y={roverPosition.y - 3}
                  fill="#FFC107"
                  fontSize="2.4"
                  fontFamily="monospace"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  ROVER
                </text>
              </g>
            )}

            {/* Interactive Landing Sites */}
            {projectedLZs.map((lz) => {
              const isSelected = selectedSiteId === lz.id;
              const statusColor = lz.status === 'optimal' ? '#4CAF50' : lz.status === 'feasible' ? '#3394f1' : '#EF5350';
              const isHovered = externalHoveredItem === lz.id;

              return (
                <g
                  key={lz.id}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectSite(lz.id);
                  }}
                  onMouseEnter={(e) => {
                    setHoveredNode({
                      type: 'site',
                      name: lz.name,
                      details: `Touchdown target. Ice Conf: ${lz.iceConfidence}%, Gradient: ${lz.slope}°, Solar: ${lz.illumination}h`,
                      metrics: [`SCORE: ${lz.score}/100`, `TEMP: ${lz.tempRange}`, `DEPTH: ${lz.iceDepth}`],
                      x: lz.proj.x,
                      y: lz.proj.y
                    });
                    externalSetHoveredItem?.(lz.id);
                  }}
                  onMouseLeave={() => {
                    setHoveredNode(null);
                    externalSetHoveredItem?.(null);
                  }}
                >
                  {/* Outer safety radius circle */}
                  <circle
                    cx={lz.proj.x}
                    cy={lz.proj.y}
                    r={isSelected ? "5" : "3.5"}
                    fill={isSelected ? `${statusColor}1A` : 'none'}
                    stroke={isSelected ? statusColor : `${statusColor}40`}
                    strokeWidth="0.25"
                    strokeDasharray={isSelected ? undefined : "1,1"}
                  />

                  {/* Core Pin */}
                  <circle
                    cx={lz.proj.x}
                    cy={lz.proj.y}
                    r={isSelected || isHovered ? "1.5" : "1.1"}
                    fill={isSelected ? statusColor : '#070b12'}
                    stroke={statusColor}
                    strokeWidth="0.4"
                  />

                  {/* Landing Site Badge Label */}
                  <g transform={`translate(${lz.proj.x + 2.2}, ${lz.proj.y - 2})`}>
                    <rect
                      x="-1"
                      y="-3"
                      width="9"
                      height="4.8"
                      rx="0.5"
                      fill={isSelected ? statusColor : '#0d1620'}
                      stroke={isSelected ? '#070b12' : statusColor}
                      strokeWidth="0.25"
                      opacity="0.9"
                    />
                    <text
                      x="3.5"
                      y="0.5"
                      fill={isSelected ? '#070b12' : '#e0e2ea'}
                      fontSize="2.8"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {lz.name}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Interactive Threat Hazards nodes */}
            {showHazards && projectedHazards.map((h) => {
              const sevColor = h.severity === 'Critical' ? '#EF5350' : h.severity === 'High' ? '#ff7043' : '#FFC107';
              return (
                <g
                  key={h.id}
                  className="cursor-help"
                  onMouseEnter={() => {
                    setHoveredNode({
                      type: 'hazard',
                      name: h.type,
                      details: h.details,
                      metrics: [`SEVERITY: ${h.severity}`, `MITIGATION: ${h.action}`],
                      x: h.proj.x,
                      y: h.proj.y
                    });
                  }}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  <polygon
                    points={`${h.proj.x},${h.proj.y - 1.2} ${h.proj.x - 1.2},${h.proj.y + 1} ${h.proj.x + 1.2},${h.proj.y + 1}`}
                    fill="#070b12"
                    stroke={sevColor}
                    strokeWidth="0.45"
                  />
                  <circle cx={h.proj.x} cy={h.proj.y + 0.3} r="0.2" fill={sevColor} />
                </g>
              );
            })}

            {/* Interactive Scientific POIs */}
            {showPOIs && projectedPOIs.map((poi) => {
              const isSelected = selectedPOI?.id === poi.id;
              return (
                <g
                  key={poi.id}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPOI(poi);
                  }}
                  onMouseEnter={() => {
                    setHoveredNode({
                      type: 'poi',
                      name: poi.name,
                      details: poi.type,
                      metrics: ['CLICK FOR SCI READOUT'],
                      x: poi.proj.x,
                      y: poi.proj.y
                    });
                  }}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  {/* POI Diamond marker */}
                  <polygon
                    points={`${poi.proj.x},${poi.proj.y - 1.4} ${poi.proj.x + 1.2},${poi.proj.y} ${poi.proj.x},${poi.proj.y + 1.4} ${poi.proj.x - 1.2},${poi.proj.y}`}
                    fill={isSelected ? '#c084fc' : '#070b12'}
                    stroke="#a855f7"
                    strokeWidth="0.45"
                    filter={isSelected ? 'url(#vectorGlow)' : undefined}
                  />
                  <circle cx={poi.proj.x} cy={poi.proj.y} r="0.4" fill={isSelected ? '#070b12' : '#a855f7'} />
                </g>
              );
            })}

            {/* Rover Path Waypoints Labels */}
            {showRoverPath && projectedWPs.map((wp, idx) => {
              const isStart = wp.status === 'start';
              const isTarget = wp.status === 'target';
              let color = '#3394f1';
              if (isStart) color = '#4CAF50';
              else if (isTarget) color = '#FFC107';

              return (
                <g
                  key={wp.id}
                  className="cursor-help"
                  onMouseEnter={() => {
                    setHoveredNode({
                      type: 'waypoint',
                      name: wp.name,
                      details: `Rover station coordinates: ${wp.latitude}°S, ${wp.longitude}°E`,
                      metrics: [`ELEVATION: ${wp.elevation}m`, `INDEX: Station ${idx + 1}`],
                      x: wp.proj.x,
                      y: wp.proj.y
                    });
                  }}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  <circle
                    cx={wp.proj.x}
                    cy={wp.proj.y}
                    r="0.8"
                    fill={color}
                    stroke="#070b12"
                    strokeWidth="0.3"
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Dynamic Popover HUD for Selected POI */}
      <AnimatePresence>
        {selectedPOI && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="absolute bottom-4 left-4 right-4 z-10 bg-[#0d1620]/95 border border-[#c084fc]/50 p-3 rounded shadow-2xl backdrop-blur flex justify-between items-center gap-4 border-l-4 border-l-[#a855f7]"
          >
            <div className="flex-1 min-w-0">
              <span className="text-[8px] font-mono text-[#c084fc] font-bold tracking-widest block uppercase">
                SCIENTIFIC TARGET EVALUATION
              </span>
              <h4 className="font-display font-black text-xs text-[#e0e2ea] mt-0.5">{selectedPOI.name}</h4>
              <p className="text-[10px] text-[#c0c7d4] mt-1 leading-relaxed font-mono">
                {selectedPOI.readout}
              </p>
            </div>
            <button
              onClick={() => setSelectedPOI(null)}
              className="px-2.5 py-1 text-[9px] font-bold bg-[#1c2026] text-[#e0e2ea] border border-[#404752] hover:border-[#a855f7] rounded cursor-pointer transition-colors shrink-0 font-display uppercase"
            >
              DISMISS SCI
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Overlay Hover Tooltip */}
      <AnimatePresence>
        {hoveredNode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bg-[#0b0f17]/95 border border-[#3394f1]/50 p-2.5 rounded shadow-2xl pointer-events-none z-30 w-52 backdrop-blur-md"
            style={{
              // Let's place tooltip carefully so it doesn't escape map container
              left: `${Math.min(75, Math.max(2, hoveredNode.x))}%`,
              top: `${Math.min(70, Math.max(5, hoveredNode.y - 15))}%`,
            }}
          >
            <div className="flex justify-between items-center border-b border-[#3394f1]/20 pb-1 mb-1.5">
              <span className="font-display font-black text-[9px] text-[#e0e2ea] uppercase tracking-wider truncate max-w-[130px]">
                {hoveredNode.name}
              </span>
              <span className="font-mono text-[7px] text-[#3394f1] font-bold uppercase tracking-widest">
                {hoveredNode.type}
              </span>
            </div>
            <p className="text-[9px] text-[#c0c7d4] font-mono leading-relaxed mb-1.5">
              {hoveredNode.details}
            </p>
            {hoveredNode.metrics && hoveredNode.metrics.length > 0 && (
              <div className="flex flex-col gap-0.5 pt-1.5 border-t border-[#404752]/30">
                {hoveredNode.metrics.map((m, i) => (
                  <span key={i} className="text-[8px] font-mono text-[#a2c9ff] font-bold block uppercase tracking-wide">
                    {m}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Footer Telemetry Status */}
      <div className="absolute bottom-4 right-4 z-10 bg-[#0d1620]/90 backdrop-blur border border-[#404752] rounded px-3 py-1.5 text-[9px] font-mono text-[#c0c7d4] flex items-center space-x-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#4CAF50] shadow-[0_0_6px_rgba(76,175,80,0.8)] animate-pulse"></span>
        <span className="tracking-wider text-xs font-semibold">ANTENNA CARRIER S-BAND: SECURE</span>
      </div>
    </div>
  );
}
