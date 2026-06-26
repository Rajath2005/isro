import React, { useState, useEffect } from 'react';
import { LandingSite, Hazard, Waypoint } from '../types';
import MapViewer from './MapViewer';
import { 
  Snowflake, 
  Sliders, 
  Play, 
  RefreshCw, 
  BarChart4, 
  Compass, 
  ShieldAlert, 
  Database, 
  TrendingUp, 
  Layers 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface IceDetectionViewProps {
  selectedSite: LandingSite;
  onSelectSite: (id: string) => void;
  landingSites: LandingSite[];
  hazards: Hazard[];
  waypoints: Waypoint[];
  spectrometerData: Array<{ channel: string; value: number; confidence: number }>;
  activeMissionId: string;
  addToast: (message: string, type: 'success' | 'warning' | 'info') => void;
}

export default function IceDetectionView({
  selectedSite,
  onSelectSite,
  landingSites,
  hazards,
  waypoints,
  spectrometerData: initialSpectrometerData,
  activeMissionId,
  addToast
}: IceDetectionViewProps) {
  const [threshold, setThreshold] = useState(70);
  const [isScanning, setIsScanning] = useState(false);
  const [spectrometerData, setSpectrometerData] = useState(initialSpectrometerData);

  // Calibration stats
  const [iceDensity, setIceDensity] = useState(38.4);
  const [peakAtten, setPeakAtten] = useState(112);

  const handleStartSweep = () => {
    setIsScanning(true);
    addToast('INITIATING SUBSURFACE SPECTROSCOPY SWEEP...', 'info');

    setTimeout(() => {
      setIsScanning(false);
      // Give realistic jiggles to values on completion
      const variance = (Math.random() - 0.5) * 8;
      const newPeak = Math.round(112 + variance);
      setPeakAtten(newPeak);
      setIceDensity(Number((38.4 + (variance / 5)).toFixed(1)));
      
      addToast(`SPECTROSCOPIC SWEEP COMPLETED. PEAK ATTENUATION CALIBRATED AT ${newPeak} cps.`, 'success');
    }, 2000);
  };

  // Recalculate estimated parameters on threshold / scan changes
  const iceVolumeEst = Math.max(12.4, (120 - threshold) * 0.82 + (iceDensity - 38.4)).toFixed(2);
  const depthEstimate = selectedSite.iceDepth || '0.4m - 1.2m';

  return (
    <div className="flex-1 flex gap-4 h-full overflow-hidden select-none">
      {/* Left Control Column */}
      <div className="w-84 shrink-0 flex flex-col gap-4 overflow-y-auto pr-1">
        {/* Controls Panel */}
        <div className="rounded-lg border border-[#404752] bg-[#111C28] p-4 flex flex-col gap-4 shadow-lg">
          <div className="flex items-center space-x-2 border-b border-[#404752]/40 pb-2">
            <Snowflake className="h-5 w-5 text-[#3394f1]" />
            <span className="font-display font-bold text-xs text-[#e0e2ea] tracking-wider uppercase">
              HYDROGEN PROBABILITY ANALYZER
            </span>
          </div>

          {/* Probability threshold slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-[#c0c7d4] font-semibold uppercase tracking-wider">Detection Threshold</span>
              <span className="font-mono text-xs font-bold text-[#3394f1]">{threshold}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="95"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full accent-[#3394f1] cursor-ew-resize bg-[#1c2026] h-1.5 rounded"
            />
            <span className="text-[9px] text-[#c0c7d4]/50 leading-normal block font-mono">
              Filters neutron channels below selected confidence tier.
            </span>
          </div>

          <div className="h-px bg-[#404752]/40"></div>

          {/* Subsurface Geological Ice stats */}
          <div className="space-y-3.5">
            <div className="flex justify-between items-center text-[10px] font-mono border-b border-[#404752]/20 pb-1.5">
              <span className="text-[#c0c7d4]/60 uppercase">Est. Ice Volume</span>
              <span className="text-[#e0e2ea] font-bold">{iceVolumeEst} WT% H₂O</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono border-b border-[#404752]/20 pb-1.5">
              <span className="text-[#c0c7d4]/60 uppercase">Peak Absorption</span>
              <span className="text-[#3394f1] font-bold">{peakAtten} cps (Ch 5)</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono border-b border-[#404752]/20 pb-1.5">
              <span className="text-[#c0c7d4]/60 uppercase">Est. Core Depth</span>
              <span className="text-[#a2c9ff] font-bold">{depthEstimate}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono">
              <span className="text-[#c0c7d4]/60 uppercase">Spectrometer Temp</span>
              <span className="text-[#4CAF50] font-bold tracking-widest">48.2K (NOMINAL)</span>
            </div>
          </div>

          {/* Spectroscopy Sweep button */}
          <button
            onClick={handleStartSweep}
            disabled={isScanning}
            className={`w-full font-display text-xs font-bold py-2.5 rounded transition-all flex items-center justify-center space-x-2 uppercase cursor-pointer ${
              isScanning
                ? 'bg-[#1c2026] border border-[#404752] text-[#c0c7d4]/50 cursor-not-allowed'
                : 'bg-[#FFC107] hover:bg-[#FFE082] text-[#001c38] shadow-md active:scale-[0.99]'
            }`}
          >
            <RefreshCw className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'FILTERING DATA SPECTRUM...' : 'RUN SPECTROSCOPIC SWEEP'}</span>
          </button>
        </div>

        {/* Dynamic Channel Mapping Details table */}
        <div className="rounded-lg border border-[#404752] bg-[#111C28] p-4 flex flex-col flex-1 min-h-[220px] shadow-lg">
          <span className="font-display font-semibold text-[10px] text-[#c0c7d4] uppercase tracking-wider block mb-2.5">
            SPECTROSCOPY DETECTOR CHANNELS
          </span>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[180px]">
            {spectrometerData.map((ch, idx) => {
              const isFiltered = ch.confidence < threshold;
              return (
                <div 
                  key={ch.channel} 
                  className={`flex justify-between items-center p-2 rounded border text-[10px] font-mono transition-all ${
                    isFiltered 
                      ? 'bg-[#1c2026]/20 border-[#404752]/10 opacity-40' 
                      : 'bg-[#1c2026]/50 border-[#404752]/30 text-[#e0e2ea]'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${isFiltered ? 'bg-[#c0c7d4]/40' : 'bg-[#3394f1]'}`}></span>
                    <span>CH-{String(idx + 1).padStart(2, '0')}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span>{ch.value} cps</span>
                    <span className={isFiltered ? 'text-[#EF5350]' : 'text-[#4CAF50]'}>
                      {ch.confidence}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-[#404752]/20 pt-2.5 mt-2 flex justify-between text-[8px] font-mono text-[#c0c7d4]/50 uppercase tracking-wider">
            <span>Scan Width: 120m</span>
            <span>Refraction: attenuation</span>
          </div>
        </div>
      </div>

      {/* Center Spectroscopy visualizer bars and Map */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 h-full">
        {/* Spectrograph panel */}
        <div className="min-h-[176px] xl:h-44 rounded-lg border border-[#404752] bg-[#111C28] p-4 flex flex-col shrink-0 shadow-lg">
          <span className="font-display font-bold text-[10px] text-[#c0c7d4] uppercase tracking-wider block mb-2">
            NEUTRON ATTENUATION SPECTROGRAPHIC FLUX
          </span>

          <div className="flex-1 flex items-end justify-between border-b border-l border-[#404752]/40 pb-2 pl-4 pr-1 relative">
            {/* Dynamic scanning glass overlay effect */}
            {isScanning && (
              <div className="absolute inset-0 bg-[#3394f1]/5 flex items-center justify-center backdrop-blur-[1px] rounded z-10">
                <div className="flex flex-col items-center space-y-2">
                  <BarChart4 className="h-5 w-5 text-[#3394f1] animate-bounce" />
                  <span className="font-mono text-[9px] text-[#a2c9ff] animate-pulse">RECALIBRATING SPECTRA...</span>
                </div>
              </div>
            )}

            {/* Render bar chart */}
            {spectrometerData.map((data, idx) => {
              const isFiltered = data.confidence < threshold;
              const heightPct = (data.value / 120) * 100;
              return (
                <div key={data.channel} className="flex-1 flex flex-col items-center h-full justify-end group px-0.5 relative">
                  <div className="w-full relative flex flex-col justify-end" style={{ height: `${heightPct}%` }}>
                    {/* Hover tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-[#1c2026] border border-[#404752] rounded px-2 py-0.5 text-[8.5px] font-mono text-[#a2c9ff] opacity-0 group-hover:opacity-100 transition-opacity z-20 whitespace-nowrap shadow-2xl">
                      {data.value} cps ({data.confidence}% confidence)
                    </div>
                    {/* Bar */}
                    <motion.div
                      className={`w-full rounded-t transition-all duration-300 ${
                        isFiltered
                          ? 'bg-[#1c2026] border border-[#404752]/40'
                          : 'bg-[#3394f1] group-hover:bg-[#a2c9ff] shadow-[0_0_10px_rgba(51,148,241,0.25)]'
                      }`}
                      initial={{ height: 0 }}
                      animate={{ height: "100%" }}
                      transition={{ duration: 0.8 }}
                      style={{ height: '100%' }}
                    ></motion.div>
                  </div>
                  {/* Label */}
                  <span className="text-[7.5px] font-mono text-[#c0c7d4]/60 mt-1 uppercase tracking-tighter">
                    CH{idx + 1}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between items-center mt-1.5">
            <span className="text-[8px] font-mono text-[#c0c7d4]/40">90.0°S OFFSET</span>
            <span className="text-[8px] font-mono text-[#c0c7d4]/40 uppercase tracking-widest">Spectrograph Sweep Width</span>
            <span className="text-[8px] font-mono text-[#c0c7d4]/40">86.0°S OFFSET</span>
          </div>
        </div>

        {/* Interactive Map */}
        <div className="flex-1 relative min-h-[220px] xl:min-h-[350px] shrink-0">
          <MapViewer
            selectedSiteId={selectedSite.id}
            onSelectSite={onSelectSite}
            landingSites={landingSites}
            hazards={hazards}
            waypoints={waypoints}
            showHeatmap={true}
            showHazards={false}
            showRoverPath={false}
            activeMissionId={activeMissionId}
          />
        </div>
      </div>
    </div>
  );
}
