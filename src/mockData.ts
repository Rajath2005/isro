import { Mission, LandingSite, Hazard, Waypoint } from './types';

export const initialMissions: Mission[] = [
  {
    id: 'shackleton-alpha',
    code: 'MSN-2025-A1',
    name: 'Shackleton Alpha',
    region: 'South Pole • Shackleton Crater',
    objective: 'Ice Core Extraction',
    latitude: -89.9,
    longitude: 0.0,
    status: 'active',
    elapsedTime: 'T+ 45:12:00',
  },
  {
    id: 'faustini-explorer',
    code: 'MSN-2026-B2',
    name: 'Faustini Explorer',
    region: 'South Pole • Faustini Crater',
    objective: 'Surface Topology Mapping',
    latitude: -87.4,
    longitude: 82.3,
    status: 'planning',
    launchWindow: '2026-Q3',
    readiness: 74,
  },
  {
    id: 'malapert-massif',
    code: 'MSN-2023-X1',
    name: 'Malapert Massif',
    region: 'South Pole • Malapert Massif',
    objective: 'Lander Grounding Test',
    latitude: -86.0,
    longitude: 2.7,
    status: 'completed',
    completedDate: 'Oct 2023',
  },
  {
    id: 'peary-crater-scan',
    code: 'MSN-2022-P4',
    name: 'Peary Crater Scan',
    region: 'North Pole • Peary Crater',
    objective: 'Radar Water-Ice Profiling',
    latitude: 88.6,
    longitude: 33.0,
    status: 'completed',
    completedDate: 'Jun 2022',
  },
  {
    id: 'tycho-survey',
    code: 'MSN-2021-T1',
    name: 'Tycho Survey',
    region: 'Lunar Near Side • Tycho Crater',
    objective: 'Impact Melt Sheet Analysis',
    latitude: -43.3,
    longitude: -11.2,
    status: 'aborted',
    completedDate: 'Pre-Launch',
  }
];

export const faustiniLandingSites: LandingSite[] = [
  {
    id: 'lz-01',
    name: 'LZ-01',
    latitude: -87.38,
    longitude: 82.15,
    score: 88,
    slope: 3.5,
    roughness: 0.12,
    illumination: 7.2,
    tempRange: '60-140K',
    iceConfidence: 75,
    iceDepth: '1.5 - 3.0m',
    iceDistribution: 'Patchy',
    status: 'feasible'
  },
  {
    id: 'lz-02',
    name: 'LZ-02',
    latitude: -87.42,
    longitude: 82.31,
    score: 96,
    slope: 1.8,
    roughness: 0.08,
    illumination: 9.6,
    tempRange: '80-130K',
    iceConfidence: 94,
    iceDepth: '0.8 - 1.5m',
    iceDistribution: 'High Density Block',
    status: 'optimal'
  },
  {
    id: 'lz-03',
    name: 'LZ-03',
    latitude: -87.45,
    longitude: 82.45,
    score: 82,
    slope: 4.2,
    roughness: 0.15,
    illumination: 8.4,
    tempRange: '50-120K',
    iceConfidence: 82,
    iceDepth: '1.2 - 2.5m',
    iceDistribution: 'Dispersed',
    status: 'optimal'
  },
  {
    id: 'lz-04',
    name: 'LZ-04',
    latitude: -87.49,
    longitude: 82.20,
    score: 61,
    slope: 8.5,
    roughness: 0.32,
    illumination: 4.1,
    tempRange: '40-100K',
    iceConfidence: 89,
    iceDepth: '0.5 - 1.0m',
    iceDistribution: 'High Layered',
    status: 'hazardous'
  }
];

export const faustiniHazards: Hazard[] = [
  {
    id: 'hz-01',
    type: 'Crater Edge (>20°)',
    severity: 'Critical',
    action: 'Avoid',
    latitude: -87.35,
    longitude: 82.10,
    details: 'Steep slopes exceeding rover traction mechanical limits. Extreme risk of sliding.'
  },
  {
    id: 'hz-02',
    type: 'Loose Regolith',
    severity: 'High',
    action: 'Re-route',
    latitude: -87.43,
    longitude: 82.18,
    details: 'Extremely fine, low-bearing strength dust. High risk of rover wheel sinkage.'
  },
  {
    id: 'hz-03',
    type: 'LOS Blockage (Comm)',
    severity: 'High',
    action: 'Relay Req.',
    latitude: -87.46,
    longitude: 82.38,
    details: 'Crater rim topography completely obstructs line-of-sight back to lander transceiver.'
  },
  {
    id: 'hz-04',
    type: 'Boulder Cluster',
    severity: 'Medium',
    action: 'Navigate',
    latitude: -87.40,
    longitude: 82.28,
    details: 'Dense concentration of ejecta blocks measuring 0.5m to 2.2m in diameter.'
  },
  {
    id: 'hz-05',
    type: 'Shadow Zone',
    severity: 'Medium',
    action: 'Monitor',
    latitude: -87.47,
    longitude: 82.25,
    details: 'Permanently shadowed region. Ultra-cold temperatures down to 40K. Power depletion danger.'
  },
  {
    id: 'hz-06',
    type: 'Minor Dust Dep.',
    severity: 'Low',
    action: 'Log',
    latitude: -87.39,
    longitude: 82.48,
    details: 'Electrostatic lunar dust levitation zone. Minor impact on optical sensor systems.'
  }
];

export const faustiniWaypoints: Waypoint[] = [
  { id: 'wp-01', name: 'LZ-02 (Start)', latitude: -87.42, longitude: 82.31, elevation: -2810, status: 'start' },
  { id: 'wp-02', name: 'WP-1 (Sample Site Alpha)', latitude: -87.44, longitude: 82.35, elevation: -2856, status: 'sample' },
  { id: 'wp-03', name: 'WP-2 (Radar Mapping)', latitude: -87.45, longitude: 82.40, elevation: -2785, status: 'intermediate' },
  { id: 'wp-04', name: 'Target Alpha (Drill Hole)', latitude: -87.47, longitude: 82.45, elevation: -2832, status: 'target' }
];

export const faustiniTerrainProfile = [
  { distance: 0.0, elevation: -2810, slope: 1.2 },
  { distance: 0.3, elevation: -2805, slope: 1.5 },
  { distance: 0.6, elevation: -2822, slope: 3.1 },
  { distance: 0.9, elevation: -2841, slope: 4.8 },
  { distance: 1.2, elevation: -2856, slope: 2.3 }, // WP-1
  { distance: 1.5, elevation: -2848, slope: 1.1 },
  { distance: 1.8, elevation: -2815, slope: 6.2 },
  { distance: 2.1, elevation: -2785, slope: 5.4 }, // WP-2
  { distance: 2.4, elevation: -2802, slope: 3.2 },
  { distance: 2.7, elevation: -2828, slope: 4.1 },
  { distance: 3.0, elevation: -2832, slope: 1.8 }, // Target Alpha
  { distance: 3.24, elevation: -2825, slope: 1.0 }
];

export const faustiniSpectrometerData = [
  { channel: 'Ch 1 (90.0°S)', value: 45, confidence: 68 },
  { channel: 'Ch 2 (89.5°S)', value: 58, confidence: 72 },
  { channel: 'Ch 3 (89.0°S)', value: 72, confidence: 79 },
  { channel: 'Ch 4 (88.5°S)', value: 89, confidence: 88 },
  { channel: 'Ch 5 (88.0°S)', value: 112, confidence: 95 }, // Peak suppression
  { channel: 'Ch 6 (87.5°S)', value: 95, confidence: 91 },
  { channel: 'Ch 7 (87.0°S)', value: 68, confidence: 80 },
  { channel: 'Ch 8 (86.5°S)', value: 48, confidence: 71 },
  { channel: 'Ch 9 (86.0°S)', value: 31, confidence: 65 }
];

// AI recommendations pre-loaded
export const faustiniRecommendations = [
  "Lander touchdown site LZ-02 possesses optimal stability with <2° gradient and nominal ejecta block hazards.",
  "Neutron suppression levels suggest subsurface water ice abundance peak at 88.0°S, with highly concentrated hydrogen pockets.",
  "Rover route should avoid Shadow Zone S-3 during low sun elevations to prevent deep thermal cooling of electronics.",
  "Target Alpha (WP-04) holds 82% ice core extraction probability. Recommend initiating secondary drill cycle within Q4 launch phase.",
  "Ensure line-of-sight repeater deployed at WP-1 to preserve high-rate S-band communication back to primary Lander receiver."
];
