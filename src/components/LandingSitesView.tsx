import React, { useState } from 'react';
import { LandingSite, Hazard, Waypoint } from '../types';
import MapViewer from './MapViewer';
import { 
  MapPin, 
  CheckCircle2, 
  TrendingUp, 
  Sun, 
  Snowflake, 
  Landmark, 
  Thermometer, 
  Award, 
  ShieldCheck, 
  Brain,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LandingSitesViewProps {
  selectedSite: LandingSite;
  onSelectSite: (id: string) => void;
  landingSites: LandingSite[];
  hazards: Hazard[];
  waypoints: Waypoint[];
  activeMissionId: string;
  addToast: (message: string, type: 'success' | 'warning' | 'info') => void;
}

export default function LandingSitesView({
  selectedSite,
  onSelectSite,
  landingSites,
  hazards,
  waypoints,
  activeMissionId,
  addToast
}: LandingSitesViewProps) {
  const [hoveredSiteId, setHoveredSiteId] = useState<string | null>(null);

  const handleVerifySite = (lzName: string) => {
    addToast(`TOUCHDOWN TARGET "${lzName}" RE-VERIFIED. PRE-BURN TARGETING SOLUTIONS SYNCED WITH LANDER ADCS.`, 'success');
  };

  // AI assessment recommendation generated dynamically per site
  const getAIRecommendation = (site: LandingSite) => {
    if (site.status === 'optimal') {
      return `AI RECOMMENDS ${site.name.toUpperCase()} DUE TO AN UNMATCHED ILLUMINATION PROFILE OF ${site.illumination} HOURS AND SAFE GRADIENT (${site.slope}°). SUITABLE FOR MULTI-STAGE SCIENTIFIC CORE DRILLING OPERATIONS.`;
    } else if (site.status === 'feasible') {
      return `${site.name.toUpperCase()} REPRESENTS A MODERATE-RISK ARCHITECTURE. WHILE THE WATER-ICE YIELD CONFIDENCE IS HIGH (${site.iceConfidence}%), THE CRATER SLOPE IS STEEP (${site.slope}°). MONITOR TRAJECTORY SLIP VECTORS ACCURATELY.`;
    } else {
      return `CRITICAL ROUGHNESS OBSERVED AT ${site.name.toUpperCase()}. REDUCED LANDING PROBABILITY DUE TO SIGNIFICANT BOULDER BLANKETS AND LOCALIZED MICROCRAST BLOCKAGES. EXTRACTION DEPLOYMENT NOT ADVISABLE.`;
    }
  };

  return (
    <div className="flex-1 flex gap-4 h-full overflow-hidden select-none">
      {/* Left List and Matrix Details Column */}
      <div className="w-84 shrink-0 flex flex-col gap-4 overflow-y-auto pr-1">
        
        {/* Landing Sites list selector list */}
        <div className="rounded-lg border border-[#404752] bg-[#111C28] p-4 flex flex-col gap-3 shrink-0 shadow-lg">
          <div className="flex items-center space-x-2 border-b border-[#404752]/40 pb-2">
            <MapPin className="h-5 w-5 text-[#4CAF50]" />
            <span className="font-display font-bold text-xs text-[#e0e2ea] tracking-wider uppercase">
              TOUCHDOWN TARGET INDEX
            </span>
          </div>

          <div className="space-y-2">
            {landingSites.map((site) => {
              const isSelected = selectedSite.id === site.id;
              const statusColor = site.status === 'optimal' ? '#4CAF50' : site.status === 'feasible' ? '#3394f1' : '#EF5350';
              const statusBg = site.status === 'optimal' ? 'rgba(76,175,80,0.1)' : site.status === 'feasible' ? 'rgba(51,148,241,0.1)' : 'rgba(239,83,80,0.1)';
              const isHovered = hoveredSiteId === site.id;

              return (
                <button
                  key={site.id}
                  onClick={() => onSelectSite(site.id)}
                  onMouseEnter={() => setHoveredSiteId(site.id)}
                  onMouseLeave={() => setHoveredSiteId(null)}
                  className={`w-full text-left p-3 rounded border transition-all cursor-pointer active:scale-99 flex justify-between items-center ${
                    isSelected
                      ? 'bg-[#3394f1]/10 border-[#3394f1] shadow-[0_2px_10px_rgba(51,148,241,0.08)]'
                      : isHovered
                      ? 'bg-[#1c2026] border-[#3394f1]/50'
                      : 'bg-[#1c2026]/40 border-[#404752]/60 hover:bg-[#1c2026]/75'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-[#e0e2ea]">{site.name}</span>
                      <span
                        className="text-[8px] px-1.5 py-0.5 rounded font-bold font-mono uppercase tracking-wider shrink-0"
                        style={{ color: statusColor, backgroundColor: statusBg }}
                      >
                        {site.status}
                      </span>
                    </div>
                    <span className="text-[9px] text-[#c0c7d4]/60 font-mono tracking-wide mt-1 block">
                      {site.latitude}°S, {site.longitude}°E
                    </span>
                  </div>

                  {/* Suitability score circular indicator */}
                  <div className="w-9 h-9 rounded-full border border-[#404752] flex items-center justify-center bg-[#0d1620] shrink-0">
                    <span className="font-mono text-xs font-black" style={{ color: site.score > 85 ? '#4CAF50' : site.score > 70 ? '#3394f1' : '#EF5350' }}>
                      {site.score}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected LZ engineering metrics card */}
        <div className="rounded-lg border border-[#404752] bg-[#111C28] p-4 flex flex-col flex-1 min-h-[300px] shadow-lg">
          <span className="font-display font-semibold text-[10px] text-[#c0c7d4] uppercase tracking-wider block mb-3">
            LZ ANALYSIS MATRIX: <span className="text-[#3394f1] font-mono font-bold">{selectedSite.name}</span>
          </span>

          <div className="space-y-3 flex-1">
            {/* Criteria List with Micro-Gauges */}
            <div className="flex items-center space-x-3.5 p-2 bg-[#1c2026]/40 rounded border border-[#404752]/20">
              <TrendingUp className="h-4.5 w-4.5 text-[#3394f1] shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline text-[9.5px]">
                  <span className="text-[#c0c7d4]/60 font-semibold uppercase tracking-wider">Surface Gradient</span>
                  <span className="font-mono font-bold text-[#e0e2ea]">{selectedSite.slope}°</span>
                </div>
                <div className="w-full bg-[#0b0e14] h-1 rounded overflow-hidden mt-1.5">
                  <div className="bg-[#4CAF50] h-full" style={{ width: `${Math.max(5, 100 - selectedSite.slope * 4.5)}%` }}></div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3.5 p-2 bg-[#1c2026]/40 rounded border border-[#404752]/20">
              <Sun className="h-4.5 w-4.5 text-[#FFC107] shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline text-[9.5px]">
                  <span className="text-[#c0c7d4]/60 font-semibold uppercase tracking-wider">Solar Illumination</span>
                  <span className="font-mono font-bold text-[#e0e2ea]">{selectedSite.illumination}h/day</span>
                </div>
                <div className="w-full bg-[#0b0e14] h-1 rounded overflow-hidden mt-1.5">
                  <div className="bg-[#FFC107] h-full" style={{ width: `${(selectedSite.illumination / 12) * 100}%` }}></div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3.5 p-2 bg-[#1c2026]/40 rounded border border-[#404752]/20">
              <Thermometer className="h-4.5 w-4.5 text-[#EF5350] shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline text-[9.5px]">
                  <span className="text-[#c0c7d4]/60 font-semibold uppercase tracking-wider">Thermal Shifts</span>
                  <span className="font-mono font-bold text-[#e0e2ea]">{selectedSite.tempRange}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3.5 p-2 bg-[#1c2026]/40 rounded border border-[#404752]/20">
              <Snowflake className="h-4.5 w-4.5 text-[#3394f1] shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline text-[9.5px]">
                  <span className="text-[#c0c7d4]/60 font-semibold uppercase tracking-wider">Ice Confidence</span>
                  <span className="font-mono font-bold text-[#3394f1]">{selectedSite.iceConfidence}%</span>
                </div>
                <span className="text-[8px] text-[#c0c7d4]/50 font-mono mt-1 block uppercase tracking-wide">
                  Depth: {selectedSite.iceDepth} | Dist: {selectedSite.iceDistribution}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleVerifySite(selectedSite.name)}
            className="w-full bg-[#4CAF50] hover:bg-[#81C784] text-[#002b00] font-display text-xs font-black uppercase py-2.5 rounded transition-all active:scale-[0.99] mt-3 cursor-pointer shadow-md flex items-center justify-center space-x-1.5"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>CONFIRM TOUCHDOWN TARGET SITE</span>
          </button>
        </div>
      </div>

      {/* Right Map Viewport Column & AI Recommendation banner */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden h-full">
        {/* Map */}
        <div className="flex-1 relative min-h-[220px]">
          <MapViewer
            selectedSiteId={selectedSite.id}
            onSelectSite={onSelectSite}
            landingSites={landingSites}
            hazards={hazards}
            waypoints={waypoints}
            showHeatmap={false}
            showHazards={false}
            showRoverPath={false}
            activeMissionId={activeMissionId}
            hoveredItem={hoveredSiteId}
            setHoveredItem={setHoveredSiteId}
          />
        </div>

        {/* AI Recommendations panel */}
        <div className="rounded-lg border border-[#c084fc]/50 bg-[#111C28] p-4 shrink-0 shadow-lg border-l-4 border-l-[#a855f7] flex items-start space-x-3">
          <Brain className="h-5 w-5 text-[#a855f7] shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-display font-black text-[9px] text-[#c084fc] tracking-widest uppercase block mb-1">
              AI LANDING ADVISORY RECONNAISSANCE
            </span>
            <p className="text-[10px] text-[#c0c7d4] font-mono leading-relaxed uppercase">
              {getAIRecommendation(selectedSite)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
