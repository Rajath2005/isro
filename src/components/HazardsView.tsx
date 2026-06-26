import React, { useState } from 'react';
import { LandingSite, Hazard, Waypoint } from '../types';
import MapViewer from './MapViewer';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Play, 
  Check, 
  AlertTriangle, 
  Radio, 
  ShieldCheck, 
  RefreshCw,
  Compass,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HazardsViewProps {
  selectedSite: LandingSite;
  onSelectSite: (id: string) => void;
  landingSites: LandingSite[];
  hazards: Hazard[];
  waypoints: Waypoint[];
  activeMissionId: string;
  addToast: (message: string, type: 'success' | 'warning' | 'info') => void;
}

export default function HazardsView({
  selectedSite,
  onSelectSite,
  landingSites,
  hazards,
  waypoints,
  activeMissionId,
  addToast
}: HazardsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'All' | 'Critical' | 'High' | 'Medium' | 'Low'>('All');
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);
  const [diagnosticProgress, setDiagnosticProgress] = useState(0);

  const filteredHazards = hazards.filter((h) => {
    const matchesSearch = h.type.toLowerCase().includes(searchQuery.toLowerCase()) || h.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'All' || h.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const handleTriggerAction = (hazardName: string, actionType: string) => {
    addToast(`EXECUTED BYPASS COMMAND FOR [${hazardName}]: TRIGGERED [${actionType}] CONTINGENCY.`, 'success');
  };

  const handleRunDiagnostic = () => {
    setIsDiagnosticRunning(true);
    setDiagnosticProgress(0);
    addToast('INITIATING THERMAL & OPTICAL HAZARD RADAR SWEEP...', 'info');

    const interval = setInterval(() => {
      setDiagnosticProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDiagnosticRunning(false);
          addToast('HAZARD DIAGNOSTIC COMPLETED. CO-VARIANCE INDICES VECTOR NOMINAL.', 'success');
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="flex-1 flex gap-4 h-full overflow-hidden select-none">
      {/* Left Column - Threat Metrics & Hazards Database */}
      <div className="w-84 shrink-0 flex flex-col gap-4 overflow-y-auto pr-1">
        {/* Threat Meter Dashboard Card */}
        <div className="rounded-lg border border-[#404752] bg-[#111C28] p-4 flex flex-col gap-3.5 shrink-0 shadow-lg">
          <div className="flex justify-between items-center border-b border-[#404752]/40 pb-2">
            <span className="font-display font-bold text-xs text-[#e0e2ea] tracking-wider uppercase flex items-center">
              <ShieldAlert className="h-4.5 w-4.5 text-[#EF5350] mr-1.5 animate-pulse" />
              INTEGRITY THREAT MATRIX
            </span>
            <span className="font-mono text-xs font-black text-[#EF5350]">MODERATE (34%)</span>
          </div>

          <div className="space-y-3 mt-1">
            {/* Thread detail gauges */}
            <div>
              <div className="flex justify-between text-[9px] font-mono text-[#c0c7d4] mb-1">
                <span>TERRAIN GRADIENT SLIPPAGE</span>
                <span className="text-[#ff7043] font-bold">28%</span>
              </div>
              <div className="w-full bg-[#1c2026] h-1.5 rounded overflow-hidden">
                <motion.div 
                  className="bg-[#ff7043] h-full" 
                  initial={{ width: 0 }}
                  animate={{ width: '28%' }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[9px] font-mono text-[#c0c7d4] mb-1">
                <span>SIGNAL ATTENUATION (LOS BLOCK)</span>
                <span className="text-[#a855f7] font-bold">18%</span>
              </div>
              <div className="w-full bg-[#1c2026] h-1.5 rounded overflow-hidden">
                <motion.div 
                  className="bg-[#a855f7] h-full" 
                  initial={{ width: 0 }}
                  animate={{ width: '18%' }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[9px] font-mono text-[#c0c7d4] mb-1">
                <span>THERMAL SHADOW CRATER LOADS</span>
                <span className="text-[#3394f1] font-bold">42%</span>
              </div>
              <div className="w-full bg-[#1c2026] h-1.5 rounded overflow-hidden">
                <motion.div 
                  className="bg-[#3394f1] h-full" 
                  initial={{ width: 0 }}
                  animate={{ width: '42%' }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </div>
          </div>

          {/* Radar Diagnostic controller */}
          <div className="border-t border-[#404752]/20 pt-3">
            {isDiagnosticRunning ? (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[9px] font-mono text-[#a2c9ff] animate-pulse">
                  <span>SWEEPING SURFACES:</span>
                  <span>{diagnosticProgress}%</span>
                </div>
                <div className="w-full bg-[#1c2026] h-1 rounded overflow-hidden">
                  <div className="bg-[#FFC107] h-full transition-all duration-200" style={{ width: `${diagnosticProgress}%` }}></div>
                </div>
              </div>
            ) : (
              <button
                onClick={handleRunDiagnostic}
                className="w-full bg-[#1c2026] hover:bg-[#31353b] border border-[#404752] hover:border-[#3394f1]/50 text-[#e0e2ea] text-[10px] font-display font-black py-1.5 rounded transition-colors flex items-center justify-center space-x-1.5 uppercase cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5 text-[#3394f1]" />
                <span>DIAGNOSTIC RADAR SWEEP</span>
              </button>
            )}
          </div>
        </div>

        {/* Searchable, Filterable Hazards list database */}
        <div className="rounded-lg border border-[#404752] bg-[#111C28] p-4 flex flex-col flex-1 min-h-[300px] shadow-lg">
          <span className="font-display font-semibold text-[10px] text-[#c0c7d4] uppercase tracking-wider block mb-2">
            IDENTIFIED HAZARDS REGISTRY
          </span>

          {/* Search Input bar */}
          <div className="relative mb-3 shrink-0">
            <input
              type="text"
              placeholder="Search hazards catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1c2026] border border-[#404752]/60 hover:border-[#3394f1]/50 focus:border-[#3394f1] focus:outline-none rounded px-3 py-1.5 text-xs text-[#e0e2ea] pl-8 font-display"
            />
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-[#c0c7d4]/60" />
          </div>

          {/* Severity Pills list filters */}
          <div className="flex flex-wrap gap-1 mb-3 shrink-0">
            {(['All', 'Critical', 'High', 'Medium', 'Low'] as const).map((sev) => {
              const isActive = severityFilter === sev;
              return (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2.5 py-1 rounded text-[9px] font-display font-bold uppercase tracking-wider cursor-pointer active:scale-95 transition-all ${
                    isActive
                      ? 'bg-[#3394f1] text-[#001c38]'
                      : 'bg-[#1c2026]/80 text-[#c0c7d4]/70 border border-[#404752]/30 hover:border-[#8a919e]/40'
                  }`}
                >
                  {sev}
                </button>
              );
            })}
          </div>

          {/* Grid Table lists */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredHazards.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-[#c0c7d4]/40 font-display text-xs">
                <ShieldCheck className="h-6 w-6 text-[#c0c7d4]/20 mb-1" />
                <span>NO CORRESPONDING HAZARDS RESOLVED</span>
              </div>
            ) : (
              filteredHazards.map((haz) => {
                const isCritical = haz.severity === 'Critical';
                const isHigh = haz.severity === 'High';
                const isMedium = haz.severity === 'Medium';
                const colorClass = isCritical ? 'text-[#EF5350]' : isHigh ? 'text-[#ff7043]' : isMedium ? 'text-[#FFC107]' : 'text-[#3394f1]';

                return (
                  <div key={haz.id} className="p-3 bg-[#1c2026]/40 border border-[#404752]/30 hover:border-[#404752] rounded flex flex-col justify-between transition-colors duration-150">
                    <div className="flex justify-between items-start mb-1.5">
                      <div>
                        <span className="font-mono text-xs font-bold text-[#e0e2ea] block">{haz.type}</span>
                        <span className="text-[8px] font-mono text-[#c0c7d4]/50">
                          COORDS: {haz.latitude}°S, {haz.longitude}°E
                        </span>
                      </div>
                      <span className={`text-[8px] font-bold uppercase font-mono tracking-widest px-1.5 py-0.5 rounded bg-[#0b0e14] ${colorClass}`}>
                        {haz.severity}
                      </span>
                    </div>

                    <p className="text-[10px] text-[#c0c7d4]/70 leading-normal mb-2.5 border-l-2 border-[#404752]/50 pl-2">
                      {haz.details}
                    </p>

                    <div className="flex justify-between items-center pt-1 border-t border-[#404752]/20">
                      <span className="text-[8px] text-[#c0c7d4]/50 font-display uppercase tracking-widest font-semibold">Recommended Contingency</span>
                      <button
                        onClick={() => handleTriggerAction(haz.type, haz.action)}
                        className="text-[9px] bg-[#3394f1]/10 border border-[#3394f1]/30 hover:border-[#3394f1] text-[#3394f1] font-mono font-bold px-2 py-0.5 rounded transition-all cursor-pointer hover:bg-[#3394f1]/25 active:scale-95 uppercase tracking-wider"
                      >
                        {haz.action}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Right Map Viewport Column */}
      <div className="flex-1 relative min-h-[300px]">
        <MapViewer
          selectedSiteId={selectedSite.id}
          onSelectSite={onSelectSite}
          landingSites={landingSites}
          hazards={hazards}
          waypoints={waypoints}
          showHeatmap={false}
          showHazards={true}
          showRoverPath={false}
          activeMissionId={activeMissionId}
        />
      </div>
    </div>
  );
}
