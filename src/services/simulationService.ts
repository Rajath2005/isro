import { LandingSite, Hazard } from '../types';

export interface TelemetryData {
  cpuUsage: number;
  batteryTemp: number;
  signalStrength: number;
  dataRate: number;
  commLatency: number;
  batteryLevel: number;
  waterIceProbability: number;
  scientificValue: number;
  safetyScore: number;
  successProbability: number;
}

export interface MissionActivity {
  id: string;
  timestamp: string;
  category: 'system' | 'navigation' | 'scientific' | 'alert';
  message: string;
  operator: string;
  severity: 'info' | 'warning' | 'critical';
}

export const getTelemetryData = (site: LandingSite, baseBattery: number = 88): TelemetryData => {
  // Deterministic but realistic calculation based on site stats
  const safetyScore = Math.round(100 - (site.slope * 3 + site.roughness * 40));
  const scientificValue = Math.round((site.iceConfidence * 0.7) + (site.illumination * 2.5));
  const successProbability = Math.round(safetyScore * 0.6 + site.illumination * 4);

  return {
    cpuUsage: 34 + Math.round(Math.random() * 8),
    batteryTemp: -24 + Math.round(Math.random() * 4),
    signalStrength: 94 - Math.round(Math.random() * 6),
    dataRate: 12.4 + Number((Math.random() * 0.8).toFixed(1)),
    commLatency: 1.25 + Number((Math.random() * 0.05).toFixed(3)),
    batteryLevel: baseBattery,
    waterIceProbability: site.iceConfidence,
    scientificValue: Math.min(99, scientificValue),
    safetyScore: Math.min(99, Math.max(20, safetyScore)),
    successProbability: Math.min(99, Math.max(30, successProbability)),
  };
};

export const initialActivities: MissionActivity[] = [
  {
    id: 'act-1',
    timestamp: '07:01:22',
    category: 'system',
    message: 'S-Band Telemetry link sync initialized with Chandrayaan-3 relay.',
    operator: 'COM-CTRL',
    severity: 'info'
  },
  {
    id: 'act-2',
    timestamp: '07:01:05',
    category: 'navigation',
    message: 'A* Path Solver loaded terrain grid from Faustini DEM v4.1.',
    operator: 'NAV-SYS',
    severity: 'info'
  },
  {
    id: 'act-3',
    timestamp: '06:58:12',
    category: 'alert',
    message: 'Line-of-Sight blockage warning registered at East Rim coordinates.',
    operator: 'ALRT-ENG',
    severity: 'warning'
  },
  {
    id: 'act-4',
    timestamp: '06:55:30',
    category: 'scientific',
    message: 'Neutron Spectrometer detected peak hydrogen signal attenuation of 112 cps.',
    operator: 'SCI-LEAD',
    severity: 'info'
  },
  {
    id: 'act-5',
    timestamp: '06:50:00',
    category: 'system',
    message: 'RTG core temperature nominal inside secondary heating ducts.',
    operator: 'SYS-ENG',
    severity: 'info'
  }
];

export const generateNextActivity = (lastActivityTime: string): MissionActivity => {
  const operators = ['NAV-SYS', 'SCI-LEAD', 'COM-CTRL', 'ALRT-ENG', 'SYS-ENG'];
  const categories: ('system' | 'navigation' | 'scientific' | 'alert')[] = ['system', 'navigation', 'scientific', 'alert'];
  const messages = [
    'Subsurface spectroscopy sweep completed successfully.',
    'A* trajectory recalculation completed with 0.12% slope delta.',
    'Deep shadow boundary warning flagged near coordinate bounds.',
    'S-band microwave telemetry signal verified at 94.2% fidelity.',
    'Optical terrain hazard cameras completed dark calibration.',
    'Core temperature heating loop engaged. Battery thermal dissipation stable.',
    'Power consumption optimization algorithm verified 18% reserve margin.',
    'Simulated solar array incidence angle alignment adjusted (+0.4°).',
    'Heuristic threat index updated. Terrain hazard coefficient is low.'
  ];
  
  const now = new Date();
  const timestamp = now.toISOString().split('T')[1].substring(0, 8);
  const category = categories[Math.floor(Math.random() * categories.length)];
  const severity = category === 'alert' ? 'warning' : 'info';
  
  return {
    id: `act-${Date.now()}`,
    timestamp,
    category,
    message: messages[Math.floor(Math.random() * messages.length)],
    operator: operators[Math.floor(Math.random() * operators.length)],
    severity
  };
};
