import React from 'react';
import { 
  Rocket, 
  Snowflake, 
  MapPin, 
  Activity, 
  Settings, 
  FileSpreadsheet, 
  Moon,
  Clock,
  Compass,
  Cpu,
  Plus,
  ChevronDown
} from 'lucide-react';
import { Mission } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  missionStatus: string;
  targetRegion: string;
  lastUpdate: string;
  missions: Mission[];
  selectedMissionId: string;
  onSelectMission: (id: string) => void;
  onOpenNewMission: () => void;
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  missionStatus,
  targetRegion,
  lastUpdate,
  missions,
  selectedMissionId,
  onSelectMission,
  onOpenNewMission
}: SidebarProps) {
  const menuItems = [
    { id: 'overview', name: 'Dashboard', icon: Activity },
    { id: 'ice', name: 'Ice Detection', icon: Snowflake },
    { id: 'landing', name: 'Landing Sites', icon: MapPin },
    { id: 'planner', name: 'Rover Planner', icon: Cpu },
    { id: 'hazards', name: 'Data Layers', icon: Rocket },
    { id: 'reports', name: 'Reports', icon: FileSpreadsheet },
  ];

  const currentMission = missions.find(m => m.id === selectedMissionId) || missions[0];

  return (
    <aside className="w-[240px] h-screen bg-[#111C28] border-r border-[#404752] flex flex-col justify-between shrink-0 select-none z-20">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#404752] bg-[#0d1620]">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-[#3394f1]/10 border border-[#3394f1]/40 flex items-center justify-center animate-pulse">
            <Moon className="h-4.5 w-4.5 text-[#3394f1] fill-[#3394f1]/20" />
          </div>
          <div>
            <h2 className="font-orbitron text-sm font-black text-[#e0e2ea] tracking-wider leading-none uppercase">
              AI LUNAR
            </h2>
            <span className="font-display font-bold text-[9px] tracking-widest text-[#a2c9ff] block mt-1 uppercase">
              MISSION CONTROL
            </span>
          </div>
        </div>

        {/* Mission Selector Dropdown */}
        <div className="mt-4 relative">
          <span className="text-[8px] font-mono text-[#c0c7d4]/50 uppercase tracking-widest block mb-1">
            ACTIVE OPERATION CONTEXT
          </span>
          <div className="relative">
            <select
              value={selectedMissionId}
              onChange={(e) => onSelectMission(e.target.value)}
              className="w-full bg-[#1c2026] border border-[#404752]/80 hover:border-[#3394f1]/50 text-xs text-[#e0e2ea] font-display font-semibold px-2.5 py-1.5 pr-8 rounded focus:outline-none appearance-none cursor-pointer"
            >
              {missions.map(m => (
                <option key={m.id} value={m.id}>
                  {m.code} ({m.name.split(' ')[0]})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 h-3 w-3 text-[#c0c7d4] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Navigation links */}
      <nav className="flex-1 py-4 overflow-y-auto space-y-1">
        {menuItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-[92%] mx-auto flex items-center px-4 py-3 rounded text-xs font-display font-semibold uppercase tracking-wider transition-all duration-150 cursor-pointer active:scale-98 ${
                isActive
                  ? 'text-[#a2c9ff] bg-[#3394f1]/10 border-l-4 border-[#3394f1] font-bold shadow-[0_2px_8px_rgba(51,148,241,0.05)]'
                  : 'text-[#c0c7d4]/70 hover:text-[#e0e2ea] hover:bg-[#31353b]/30 border-l-4 border-transparent'
              }`}
            >
              <Icon className={`h-4.5 w-4.5 mr-3 shrink-0 ${isActive ? 'text-[#a2c9ff]' : 'text-[#c0c7d4]/60'}`} />
              <span>{item.name}</span>
            </button>
          );
        })}

        <div className="pt-2 border-t border-[#404752]/20 w-[92%] mx-auto">
          <button
            onClick={onOpenNewMission}
            className="w-full bg-[#3394f1]/15 hover:bg-[#3394f1]/25 border border-[#3394f1]/40 text-[#a2c9ff] text-[10px] font-display font-bold py-2 rounded transition-all cursor-pointer flex items-center justify-center space-x-1 uppercase"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>COMMISSION PLAN</span>
          </button>
        </div>
      </nav>

      {/* Footer System Telemetry */}
      <div className="p-4 border-t border-[#404752] bg-[#0d1620]/60 space-y-3">
        <div className="flex justify-between items-center text-[10px] font-mono">
          <span className="text-[#c0c7d4]/60 flex items-center uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#4CAF50] mr-2 inline-block shadow-[0_0_8px_rgba(76,175,80,0.6)] animate-ping"></span>
            STATUS
          </span>
          <span className="text-[#4CAF50] font-bold tracking-widest uppercase">
            {missionStatus}
          </span>
        </div>

        <div className="flex justify-between items-center text-[10px] font-mono">
          <span className="text-[#c0c7d4]/60 flex items-center uppercase tracking-wider">
            <Compass className="h-3 w-3 mr-2 text-[#a2c9ff]" />
            COORDS
          </span>
          <span className="text-[#e0e2ea] font-medium tracking-wide">
            {targetRegion}
          </span>
        </div>

        <div className="flex justify-between items-center text-[10px] font-mono">
          <span className="text-[#c0c7d4]/60 flex items-center uppercase tracking-wider">
            <Clock className="h-3 w-3 mr-2 text-[#a2c9ff]" />
            TIMESTAMP
          </span>
          <span className="text-[#e0e2ea] font-medium tracking-wide">
            {lastUpdate}
          </span>
        </div>
      </div>
    </aside>
  );
}
