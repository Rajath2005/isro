import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Bell, 
  HelpCircle, 
  User, 
  Satellite, 
  Wifi, 
  Cpu, 
  Activity, 
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MissionActivity, initialActivities } from '../services/simulationService';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  orbitView: boolean;
  setOrbitView: (val: boolean) => void;
  missionName: string;
  region: string;
}

export default function Header({
  currentTab,
  setCurrentTab,
  orbitView,
  setOrbitView,
  missionName,
  region
}: HeaderProps) {
  const tabs = [
    { id: 'overview', name: 'OVERVIEW' },
    { id: 'ice', name: 'ICE MAP' },
    { id: 'landing', name: 'LANDING ZONES' },
    { id: 'hazards', name: 'HAZARDS' },
    { id: 'planner', name: 'ROUTER PLAN' },
    { id: 'reports', name: 'REPORTS' }
  ];

  // Clock state
  const [utcTime, setUtcTime] = useState<string>('');
  const [latency, setLatency] = useState<number>(1.258);
  const [cpuLoad, setCpuLoad] = useState<number>(34);

  // Notifications dropdown state
  const [showNotifications, setShowNotifications] = useState(false);
  const [activities, setActivities] = useState<MissionActivity[]>(initialActivities);
  const [unreadCount, setUnreadCount] = useState(3);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Construct a pristine aerospace UTC clock format: YYYY-MM-DD HH:MM:SS UTC
      const year = now.getUTCFullYear();
      const month = String(now.getUTCMonth() + 1).padStart(2, '0');
      const day = String(now.getUTCDate()).padStart(2, '0');
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      setUtcTime(`${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Micro jitter for telemetry
  useEffect(() => {
    const telemetryInterval = setInterval(() => {
      setLatency(1.24 + Math.random() * 0.04);
      setCpuLoad(32 + Math.floor(Math.random() * 8));
      
      // Occasionally append simulated activities
      if (Math.random() > 0.8) {
        const operators = ['NAV-SYS', 'SCI-CTRL', 'COM-RECEPT', 'SYS-DIAG'];
        const messages = [
          'S-band packet framing checks verified.',
          'IMU micro-thruster gimbal calibration aligned.',
          'Regolith drill assembly preheat nominal.',
          'A* navigation slope index recalculated.'
        ];
        const category = Math.random() > 0.85 ? 'alert' : 'system';
        
        const now = new Date();
        const timestamp = now.toTimeString().split(' ')[0];

        const newAct: MissionActivity = {
          id: `live-${Date.now()}`,
          timestamp,
          category,
          message: messages[Math.floor(Math.random() * messages.length)],
          operator: operators[Math.floor(Math.random() * operators.length)],
          severity: category === 'alert' ? 'warning' : 'info'
        };

        setActivities(prev => [newAct, ...prev.slice(0, 8)]);
        setUnreadCount(prev => prev + 1);
      }
    }, 3000);

    return () => clearInterval(telemetryInterval);
  }, []);

  const handleClearNotifications = () => {
    setUnreadCount(0);
    setShowNotifications(false);
  };

  return (
    <header className="h-[56px] border-b border-[#404752] bg-[#101720]/95 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Tab Context Navigation */}
      <div className="flex items-center space-x-2 md:space-x-4 lg:space-x-6 h-full">
        <div className="flex items-center space-x-2 border-r border-[#404752]/50 pr-4 mr-2 hidden lg:flex">
          <Satellite className="h-4.5 w-4.5 text-[#3394f1] animate-pulse" />
          <span className="font-display font-black text-xs text-[#e0e2ea] tracking-wider uppercase">
            {missionName}
          </span>
        </div>
        <nav className="flex h-full items-end space-x-1">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`h-full px-3 pb-2 text-[10.5px] font-display font-bold tracking-wider uppercase border-b-2 transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'text-[#a2c9ff] border-[#3394f1] font-black'
                    : 'text-[#c0c7d4]/60 border-transparent hover:text-[#e0e2ea] hover:border-[#8a919e]/40'
                }`}
              >
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Orbit/Telemetry Controls & UTC Clock */}
      <div className="flex items-center space-x-4 relative">
        {/* UTC Live Clock */}
        <div className="flex items-center space-x-2 bg-[#1c2430] border border-[#404752]/40 rounded px-3 py-1 text-[10.5px] font-mono text-[#a2c9ff] shadow-[inset_0_1px_4px_rgba(0,0,0,0.5)]">
          <Clock className="h-3.5 w-3.5 text-[#3394f1]" />
          <span className="font-bold tracking-wider">{utcTime || 'SYNCHRONIZING...'}</span>
        </div>

        {/* Latency & CPU Status indicator */}
        <div className="hidden xl:flex items-center space-x-4 font-mono text-[9px] text-[#c0c7d4]/70">
          <div className="flex items-center space-x-1.5">
            <Wifi className="h-3.5 w-3.5 text-[#4CAF50]" />
            <span>COMM: <span className="text-white font-bold">{latency.toFixed(3)}s</span></span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Cpu className="h-3.5 w-3.5 text-[#3394f1]" />
            <span>CPU: <span className="text-white font-bold">{cpuLoad}%</span></span>
          </div>
        </div>

        <button
          onClick={() => setOrbitView(!orbitView)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded border text-[10px] font-display tracking-widest font-bold uppercase transition-all duration-200 cursor-pointer active:scale-95 ${
            orbitView
              ? 'bg-[#3394f1]/15 border-[#3394f1] text-[#a2c9ff] shadow-[0_0_10px_rgba(51,148,241,0.25)]'
              : 'border-[#404752]/80 text-[#e0e2ea] hover:bg-[#1c2430] hover:border-[#8a919e]'
          }`}
        >
          <Compass className={`h-3.5 w-3.5 ${orbitView ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
          <span>{orbitView ? 'ORBIT LOCK' : 'ORBIT SENSOR'}</span>
        </button>

        <div className="h-4 w-px bg-[#404752]/50 mx-1"></div>

        {/* Notifications Alert Dropdown Button */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) setUnreadCount(0);
            }}
            className={`p-2 text-[#c0c7d4] hover:text-[#a2c9ff] hover:bg-[#1c2430]/80 rounded border border-transparent hover:border-[#404752]/60 transition-all cursor-pointer relative active:scale-90`}
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF5350] rounded-full ring-2 ring-[#101720] animate-pulse"></span>
            )}
          </button>

          {/* Alert List Popover */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2.5 w-80 bg-[#0d1620] border border-[#404752] rounded-lg shadow-2xl z-50 overflow-hidden flex flex-col"
              >
                <div className="p-3 border-b border-[#404752] bg-[#111C28] flex justify-between items-center">
                  <span className="font-display font-black text-[10px] text-[#e0e2ea] tracking-wider uppercase flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-[#3394f1]" />
                    RECENT MISSION EVENTS
                  </span>
                  <button 
                    onClick={handleClearNotifications}
                    className="text-[8px] font-mono text-[#c0c7d4]/50 hover:text-[#e0e2ea] uppercase cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

                <div className="max-h-[300px] overflow-y-auto divide-y divide-[#404752]/20">
                  {activities.map((act) => {
                    const isAlert = act.severity === 'warning';
                    return (
                      <div key={act.id} className="p-3 hover:bg-[#111C28]/45 transition-colors">
                        <div className="flex justify-between items-center text-[8px] font-mono mb-1">
                          <span className={`px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                            isAlert ? 'bg-[#EF5350]/10 text-[#EF5350]' : 'bg-[#3394f1]/10 text-[#a2c9ff]'
                          }`}>
                            {act.operator}
                          </span>
                          <span className="text-[#c0c7d4]/40">{act.timestamp}</span>
                        </div>
                        <p className="text-[10px] text-[#c0c7d4] font-mono leading-normal">
                          {act.message}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button className="p-2 text-[#c0c7d4] hover:text-[#a2c9ff] hover:bg-[#1c2430]/80 rounded transition-all cursor-pointer active:scale-90">
          <HelpCircle className="h-4 w-4" />
        </button>

        <button className="p-1.5 text-[#c0c7d4] hover:text-[#a2c9ff] hover:bg-[#1c2430]/80 rounded transition-all cursor-pointer active:scale-90 flex items-center space-x-1.5 border border-transparent hover:border-[#404752]/50">
          <div className="w-5 h-5 rounded-full bg-[#3394f1]/20 border border-[#3394f1]/40 flex items-center justify-center">
            <User className="h-3 w-3 text-[#3394f1]" />
          </div>
          <span className="font-mono text-[9px] text-[#c0c7d4] hidden sm:inline uppercase">SCI-702</span>
        </button>
      </div>
    </header>
  );
}
