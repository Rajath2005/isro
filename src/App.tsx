import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import OverviewDashboard from './components/OverviewDashboard';
import IceDetectionView from './components/IceDetectionView';
import LandingSitesView from './components/LandingSitesView';
import HazardsView from './components/HazardsView';
import RoverPlannerView from './components/RoverPlannerView';
import ReportsView from './components/ReportsView';
import NewMissionModal from './components/NewMissionModal';
import { Mission, LandingSite, Hazard, Waypoint } from './types';
import { 
  initialMissions, 
  faustiniLandingSites, 
  faustiniHazards, 
  faustiniWaypoints, 
  faustiniTerrainProfile, 
  faustiniSpectrometerData, 
  faustiniRecommendations 
} from './mockData';
import { X, Sparkles, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { calculateTrajectory } from './utils/trajectory';

export default function App() {
  // Navigation & UI States
  const [currentTab, setCurrentTab] = useState('overview');
  const [orbitView, setOrbitView] = useState(false);
  const [isNewMissionOpen, setIsNewMissionOpen] = useState(false);

  // Core Data States
  const [missions, setMissions] = useState<Mission[]>(initialMissions);
  const [selectedMissionId, setSelectedMissionId] = useState('faustini-explorer');
  const [selectedSiteId, setSelectedSiteId] = useState('lz-02');
  const [waypoints, setWaypoints] = useState<Waypoint[]>(faustiniWaypoints);

  // Toast stack state
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'warning' | 'info' }>>([]);

  const addToast = (message: string, type: 'success' | 'warning' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Switch context data depending on active selection
  const activeMission = missions.find(m => m.id === selectedMissionId) || missions[0];

  // Helper lists for secondary missions (Shackleton Alpha, etc.) to keep them fully interactive
  const getMissionData = () => {
    if (selectedMissionId === 'faustini-explorer') {
      return {
        landingSites: faustiniLandingSites,
        hazards: faustiniHazards,
        waypoints: faustiniWaypoints,
        terrainProfile: faustiniTerrainProfile,
        spectrometerData: faustiniSpectrometerData,
        recommendations: faustiniRecommendations,
        coords: '87.4°S, 82.3°E',
        status: 'READY'
      };
    } else if (selectedMissionId === 'shackleton-alpha') {
      // Shackleton mock data
      const shackletonSites: LandingSite[] = [
        {
          id: 'sh-lz-01',
          name: 'SH-01',
          latitude: -89.92,
          longitude: 0.12,
          score: 91,
          slope: 2.1,
          roughness: 0.10,
          illumination: 11.2,
          tempRange: '90-120K',
          iceConfidence: 88,
          iceDepth: '1.0 - 2.0m',
          iceDistribution: 'Medium Block',
          status: 'optimal'
        },
        {
          id: 'sh-lz-02',
          name: 'SH-02',
          latitude: -89.88,
          longitude: -0.05,
          score: 79,
          slope: 4.8,
          roughness: 0.22,
          illumination: 8.5,
          tempRange: '70-140K',
          iceConfidence: 70,
          iceDepth: '1.8 - 3.5m',
          iceDistribution: 'Patchy',
          status: 'feasible'
        }
      ];

      const shackletonHazards: Hazard[] = [
        {
          id: 'sh-hz-01',
          type: 'Shackleton Wall (>25°)',
          severity: 'Critical',
          action: 'Avoid',
          latitude: -89.95,
          longitude: 0.08,
          details: 'Wall slope gradients of the interior rim exceed traction safety caps.'
        },
        {
          id: 'sh-hz-02',
          type: 'Severe Shadow Freeze',
          severity: 'High',
          action: 'Monitor',
          latitude: -89.91,
          longitude: -0.01,
          details: 'Perpetual shadow zone with extreme temperature dips of 35K. Metal embrittlement alert.'
        }
      ];

      const shackletonWaypoints: Waypoint[] = [
        { id: 'sh-wp-01', name: 'SH-01 (Start)', latitude: -89.92, longitude: 0.12, elevation: -1210, status: 'start' },
        { id: 'sh-wp-02', name: 'WP-1 (Ridge Core)', latitude: -89.90, longitude: 0.05, elevation: -1280, status: 'sample' },
        { id: 'sh-wp-03', name: 'Shackleton Target Base', latitude: -89.89, longitude: 0.01, elevation: -1250, status: 'target' }
      ];

      const shackletonProfile = [
        { distance: 0.0, elevation: -1210, slope: 1.5 },
        { distance: 0.8, elevation: -1245, slope: 2.8 },
        { distance: 1.6, elevation: -1280, slope: 4.5 },
        { distance: 2.4, elevation: -1265, slope: 1.2 },
        { distance: 3.1, elevation: -1250, slope: 0.8 }
      ];

      const shackletonSpectrometer = [
        { channel: 'Ch 1 (89.9°S)', value: 88, confidence: 90 },
        { channel: 'Ch 2 (89.5°S)', value: 74, confidence: 82 },
        { channel: 'Ch 3 (89.0°S)', value: 52, confidence: 71 },
        { channel: 'Ch 4 (88.5°S)', value: 31, confidence: 60 }
      ];

      const shackletonRecommendations = [
        "Touchdown target SH-01 exhibits excellent solar array illumination windows (>11h/day).",
        "Subsurface H₂ peaks at 89.9°S. High core confidence suggests drilling potential within crater floor.",
        "Ensure thermal insulation heater cycles are calibrated for Shackleton Deep temperature baselines."
      ];

      return {
        landingSites: shackletonSites,
        hazards: shackletonHazards,
        waypoints: shackletonWaypoints,
        terrainProfile: shackletonProfile,
        spectrometerData: shackletonSpectrometer,
        recommendations: shackletonRecommendations,
        coords: '89.9°S, 0.0°E',
        status: 'ACTIVE RUN'
      };
    } else {
      // General Fallback for Custom Commissions
      const fallbackSites: LandingSite[] = [
        {
          id: 'fb-lz-01',
          name: 'LZ-ALPHA',
          latitude: activeMission.latitude,
          longitude: activeMission.longitude,
          score: 85,
          slope: 2.5,
          roughness: 0.11,
          illumination: 8.0,
          tempRange: '80-130K',
          iceConfidence: 80,
          iceDepth: '1.2 - 2.2m',
          iceDistribution: 'Distributed',
          status: 'feasible'
        }
      ];

      return {
        landingSites: fallbackSites,
        hazards: [],
        waypoints: [
          { id: 'fb-wp-01', name: 'LZ-ALPHA (Start)', latitude: activeMission.latitude, longitude: activeMission.longitude, elevation: -2000, status: 'start' },
          { id: 'fb-wp-02', name: 'Target Core', latitude: activeMission.latitude - 0.02, longitude: activeMission.longitude + 0.03, elevation: -2040, status: 'target' }
        ],
        terrainProfile: [
          { distance: 0.0, elevation: -2000, slope: 1.2 },
          { distance: 1.2, elevation: -2025, slope: 2.1 },
          { distance: 2.5, elevation: -2040, slope: 0.5 }
        ],
        spectrometerData: [
          { channel: 'Ch 1', value: 65, confidence: 72 },
          { channel: 'Ch 2', value: 70, confidence: 75 }
        ],
        recommendations: [
          `Target core for ${activeMission.name} mapped at secondary coordinate gradients.`,
          "Perform local thermal calibration prior to physical descent."
        ],
        coords: `${activeMission.latitude}°S, ${activeMission.longitude}°E`,
        status: 'PLANNED'
      };
    }
  };

  const currentData = getMissionData();

  // Handle active site selections matching correct datasets
  useEffect(() => {
    if (currentData.landingSites.length > 0) {
      // Check if current siteId matches the new mission context
      const hasSite = currentData.landingSites.some(s => s.id === selectedSiteId);
      if (!hasSite) {
        setSelectedSiteId(currentData.landingSites[0].id);
      }
    }
    // Set waypoints based on active mission structure
    setWaypoints(currentData.waypoints);
  }, [selectedMissionId]);

  const activeSite = currentData.landingSites.find((s) => s.id === selectedSiteId) || currentData.landingSites[0];
  const trajectoryResult = calculateTrajectory(waypoints, currentData.hazards);

  const handleAddMission = (newMission: Mission) => {
    setMissions((prev) => [newMission, ...prev]);
    setSelectedMissionId(newMission.id);
  };

  // Export File simulator (triggers native file download!)
  const handleExportPlan = () => {
    addToast('COMPILING MISSION OVERVIEW FILES...', 'info');
    setTimeout(() => {
      const content = `=========================================
AI LUNAR EXPLORATION MISSION BLUEPRINT
=========================================
MISSION ID: ${activeMission.code}
MISSION NAME: ${activeMission.name}
TARGET REGION: ${activeMission.region}
COORDINATES: ${currentData.coords}
PRIMARY OBJECTIVE: ${activeMission.objective}

TOUCHDOWN LANDING ZONE SUMMARY:
- Designated Target: ${activeSite.name}
- Landing Suitability Score: ${activeSite.score}/100
- Terrain Slope: ${activeSite.slope} degrees
- Subsurface Water-Ice Confidence: ${activeSite.iceConfidence}%

A* OPTIMIZED TRAJECTORY DIRECTIVE:
- Total Traverse Distance: ${trajectoryResult.totalDistance} km
- Est. Traversal Duration: ${trajectoryResult.totalDuration} minutes
- Est. Energy Usage: ${trajectoryResult.batteryEstimate}%

SYSTEM ANALYSIS RECOMMENDATIONS:
${currentData.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

=========================================
GENERATED VIA AI LUNAR MISSION PLANNER
=========================================`;

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${activeMission.name.toLowerCase().replace(/\s+/g, '_')}_mission_plan.txt`;
      link.click();
      URL.revokeObjectURL(url);

      addToast('MISSION BLUEPRINT DOCUMENT EXPORTED SUCCESSFULLY.', 'success');
    }, 1500);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#08131E] text-[#e0e2ea] font-sans">
      {/* 1. Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          if (tab === 'reports') {
            setCurrentTab('reports');
          } else {
            setCurrentTab(tab);
          }
        }}
        missionStatus={currentData.status}
        targetRegion={currentData.coords}
        lastUpdate={activeMission.launchWindow || activeMission.completedDate || 'ACTIVE LINK'}
        missions={missions}
        selectedMissionId={selectedMissionId}
        onSelectMission={setSelectedMissionId}
        onOpenNewMission={() => setIsNewMissionOpen(true)}
      />

      {/* 2. Main Content Stack */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Header
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          orbitView={orbitView}
          setOrbitView={setOrbitView}
          missionName={activeMission.name}
          region={activeMission.region}
        />

        {/* Dynamic Inner Tab Viewport */}
        <main className="flex-1 p-6 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab + selectedMissionId}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="w-full h-full"
            >
              {currentTab === 'overview' && (
                <OverviewDashboard
                  selectedSite={activeSite}
                  onSelectSite={setSelectedSiteId}
                  landingSites={currentData.landingSites}
                  hazards={currentData.hazards}
                  waypoints={waypoints}
                  terrainProfile={trajectoryResult.profile}
                  totalDistance={trajectoryResult.totalDistance}
                  totalDuration={trajectoryResult.totalDuration}
                  batteryEstimate={trajectoryResult.batteryEstimate}
                  onNavigateTab={setCurrentTab}
                  activeMissionName={activeMission.name}
                  activeMissionId={selectedMissionId}
                  onExportReport={handleExportPlan}
                />
              )}

              {currentTab === 'ice' && (
                <IceDetectionView
                  selectedSite={activeSite}
                  onSelectSite={setSelectedSiteId}
                  landingSites={currentData.landingSites}
                  hazards={currentData.hazards}
                  waypoints={waypoints}
                  spectrometerData={currentData.spectrometerData}
                  activeMissionId={selectedMissionId}
                  addToast={addToast}
                />
              )}

              {currentTab === 'landing' && (
                <LandingSitesView
                  selectedSite={activeSite}
                  onSelectSite={setSelectedSiteId}
                  landingSites={currentData.landingSites}
                  hazards={currentData.hazards}
                  waypoints={waypoints}
                  activeMissionId={selectedMissionId}
                  addToast={addToast}
                />
              )}

              {currentTab === 'hazards' && (
                <HazardsView
                  selectedSite={activeSite}
                  onSelectSite={setSelectedSiteId}
                  landingSites={currentData.landingSites}
                  hazards={currentData.hazards}
                  waypoints={waypoints}
                  activeMissionId={selectedMissionId}
                  addToast={addToast}
                />
              )}

              {currentTab === 'planner' && (
                <RoverPlannerView
                  selectedSite={activeSite}
                  onSelectSite={setSelectedSiteId}
                  landingSites={currentData.landingSites}
                  hazards={currentData.hazards}
                  waypoints={waypoints}
                  setWaypoints={setWaypoints}
                  activeMissionId={selectedMissionId}
                  addToast={addToast}
                />
              )}

              {currentTab === 'reports' && (
                <ReportsView
                  selectedSite={activeSite}
                  waypoints={waypoints}
                  hazards={currentData.hazards}
                  activeMissionName={activeMission.name}
                  activeMissionId={selectedMissionId}
                  recommendations={currentData.recommendations}
                  onExportReport={handleExportPlan}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* 3. New Mission Commissioning step Modal */}
      <NewMissionModal
        isOpen={isNewMissionOpen}
        onClose={() => setIsNewMissionOpen(false)}
        onAddMission={handleAddMission}
        addToast={addToast}
      />

      {/* 4. Telemetry Toast Stack */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none select-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const isSuccess = toast.type === 'success';
            const isWarning = toast.type === 'warning';
            const iconBorder = isSuccess ? 'border-[#4CAF50]' : isWarning ? 'border-[#FFC107]' : 'border-[#3394f1]';
            const bgGradient = isSuccess ? 'bg-[#102219]/95 border-[#4CAF50]/40' : isWarning ? 'bg-[#291f09]/95 border-[#FFC107]/40' : 'bg-[#0d1c2c]/95 border-[#3394f1]/40';
            const textClass = isSuccess ? 'text-[#a5d6a7]' : isWarning ? 'text-[#ffe082]' : 'text-[#a2c9ff]';

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 80, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`w-80 border rounded p-4 flex gap-3 shadow-2xl backdrop-blur-md pointer-events-auto cursor-pointer ${bgGradient}`}
                onClick={() => removeToast(toast.id)}
              >
                <div className={`w-1.5 h-full rounded-l absolute left-0 top-0 bottom-0 ${isSuccess ? 'bg-[#4CAF50]' : isWarning ? 'bg-[#FFC107]' : 'bg-[#3394f1]'}`}></div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-[9px] text-[#c0c7d4]/60 uppercase tracking-widest flex items-center">
                      <Terminal className="h-3 w-3 mr-1" />
                      SYSTEM STATUS
                    </span>
                    <button className="text-[#c0c7d4]/40 hover:text-[#e0e2ea] active:scale-95">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  <p className={`font-mono text-[10px] leading-relaxed uppercase tracking-wide ${textClass}`}>
                    {toast.message}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
