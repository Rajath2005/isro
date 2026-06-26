import React from 'react';
import { LandingSite, Hazard, Waypoint } from '../types';
import { FileText, Download, ShieldCheck, Cpu, Snowflake, Award, Sparkles, BookOpen } from 'lucide-react';

interface ReportsViewProps {
  selectedSite: LandingSite;
  waypoints: Waypoint[];
  hazards: Hazard[];
  activeMissionName: string;
  activeMissionId: string;
  recommendations: string[];
  onExportReport: () => void;
}

export default function ReportsView({
  selectedSite,
  waypoints,
  hazards,
  activeMissionName,
  activeMissionId,
  recommendations,
  onExportReport
}: ReportsViewProps) {
  return (
    <div className="flex-1 flex flex-col md:flex-row gap-4 h-full overflow-hidden select-none">
      {/* Left Column: Mission Safety & KPI Overview */}
      <div className="w-80 shrink-0 flex flex-col gap-4 overflow-y-auto pr-1">
        {/* Quality Matrix card */}
        <div className="rounded-lg border border-[#404752] bg-[#111C28] p-4 flex flex-col gap-4">
          <div className="flex items-center space-x-2 border-b border-[#404752]/40 pb-2">
            <Award className="h-5 w-5 text-[#4CAF50]" />
            <span className="font-display font-bold text-xs text-[#e0e2ea] tracking-wider uppercase">
              MISSION BLUEPRINT QUALITY
            </span>
          </div>

          <div className="space-y-4">
            {/* Safety Score */}
            <div>
              <div className="flex justify-between text-[10px] font-mono text-[#c0c7d4] mb-1">
                <span>DESIGN SAFETY INDEX</span>
                <span className="text-[#4CAF50] font-bold">92 / 100</span>
              </div>
              <div className="w-full bg-[#1c2026] h-1.5 rounded overflow-hidden">
                <div className="bg-[#4CAF50] h-full w-[92%]"></div>
              </div>
            </div>

            {/* Scientific Yield */}
            <div>
              <div className="flex justify-between text-[10px] font-mono text-[#c0c7d4] mb-1">
                <span>SCIENTIFIC YIELD SCORE</span>
                <span className="text-[#3394f1] font-bold">96 / 100</span>
              </div>
              <div className="w-full bg-[#1c2026] h-1.5 rounded overflow-hidden">
                <div className="bg-[#3394f1] h-full w-[96%]"></div>
              </div>
            </div>

            {/* Engineering Confidence */}
            <div>
              <div className="flex justify-between text-[10px] font-mono text-[#c0c7d4] mb-1">
                <span>ENGINEERING REDUNDANCY TIER</span>
                <span className="text-[#FFC107] font-bold">TIER 1 (GOLD)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mission overview summary stats */}
        <div className="rounded-lg border border-[#404752] bg-[#111C28] p-4 flex flex-col gap-3">
          <span className="font-display font-semibold text-[10px] text-[#c0c7d4] uppercase tracking-wider block">
            TRAJECTORY MATRIX EXCERPT
          </span>
          <div className="space-y-2 font-mono text-[10px]">
            <div className="flex justify-between py-1 border-b border-[#404752]/10">
              <span className="text-[#c0c7d4]/60">Touchdown LZ</span>
              <span className="text-[#e0e2ea] font-bold">{selectedSite.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#404752]/10">
              <span className="text-[#c0c7d4]/60">Total Waypoints</span>
              <span className="text-[#e0e2ea] font-bold">{waypoints.length} stations</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#404752]/10">
              <span className="text-[#c0c7d4]/60">Identified Hazards</span>
              <span className="text-[#EF5350] font-bold">{hazards.length} alerts</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#c0c7d4]/60">Water-Ice Proximity</span>
              <span className="text-[#3394f1] font-bold">{selectedSite.iceConfidence}% probability</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: AI Generated Recommendations & Document Preview */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden h-full">
        {/* Document view wrapper */}
        <div className="rounded-lg border border-[#404752] bg-[#0b0e14] p-5 flex flex-col flex-1 overflow-y-auto blueprint-grid relative">
          <div className="flex justify-between items-center border-b border-[#404752]/60 pb-3 mb-4 shrink-0">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-[#3394f1]" />
              <div>
                <h3 className="font-display font-bold text-xs text-[#e0e2ea] tracking-wider uppercase">
                  FLIGHT RECONNAISSANCE ANALYSIS
                </h3>
                <span className="font-mono text-[9px] text-[#c0c7d4]/60 uppercase">SYSTEM ID: EXP-2026-FSTR</span>
              </div>
            </div>

            <button
              onClick={onExportReport}
              className="bg-[#3394f1] hover:bg-[#a2c9ff] text-[#001c38] font-display text-[10px] font-bold uppercase px-3.5 py-1.5 rounded transition-all cursor-pointer flex items-center space-x-1"
            >
              <Download className="h-3.5 w-3.5" />
              <span>EXPORT PLAN (.TXT)</span>
            </button>
          </div>

          {/* Report body contents */}
          <div className="flex-1 font-mono text-[11px] leading-relaxed text-[#c0c7d4] space-y-4">
            <div>
              <h4 className="font-display font-semibold text-xs text-[#3394f1] uppercase tracking-wider mb-2 flex items-center">
                <Sparkles className="h-4 w-4 mr-1.5" />
                LUNAR MISSION PLANNER AUTOMATED ANALYSIS
              </h4>
              <p className="border-l-2 border-[#3394f1]/50 pl-3 leading-normal">
                This analysis outlines the operational feasibility of the targeting mission payload inside {activeMissionName}. The trajectory model utilizes multi-band telemetry mapped via direct neutron attenuation.
              </p>
            </div>

            <div>
              <h4 className="font-display font-semibold text-xs text-[#e0e2ea] uppercase tracking-wider mb-2">
                CRITICAL RECOMMENDATIONS LOG
              </h4>
              <ul className="space-y-2 pl-2">
                {recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-[#3394f1] mr-2 shrink-0">▶</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-display font-semibold text-xs text-[#e0e2ea] uppercase tracking-wider mb-2">
                SITE CHARACTERISTICS REPORT: {selectedSite.name}
              </h4>
              <p className="leading-normal">
                The targeted landing touchdown zone possesses an exceptional terrain slope of {selectedSite.slope} degrees, ensuring the lander's multi-legged struts remain well within structural limits. Average rock abundance of {selectedSite.roughness} decreases any localized micro-terrain impact vector risks during touchdown burns. Solar harvesting capacity estimated at {selectedSite.illumination} hours/day is optimal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
