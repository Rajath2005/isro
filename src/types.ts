export interface Mission {
  id: string;
  code: string;
  name: string;
  region: string;
  objective: string;
  latitude: number;
  longitude: number;
  status: 'active' | 'planning' | 'completed' | 'aborted';
  elapsedTime?: string;
  completedDate?: string;
  launchWindow?: string;
  readiness?: number;
}

export interface LandingSite {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  score: number;
  slope: number;
  roughness: number;
  illumination: number; // hours per day
  tempRange: string;
  iceConfidence: number;
  iceDepth: string;
  iceDistribution: string;
  status: 'optimal' | 'feasible' | 'hazardous';
}

export interface Hazard {
  id: string;
  type: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  action: 'Avoid' | 'Re-route' | 'Relay Req.' | 'Navigate' | 'Monitor' | 'Log';
  latitude: number;
  longitude: number;
  details: string;
}

export interface Waypoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  elevation: number;
  status: 'start' | 'sample' | 'target' | 'intermediate';
}

export interface MissionReport {
  generatedAt: string;
  operator: string;
  summary: string;
  safetyScore: number;
  scientificValueScore: number;
  recommendations: string[];
}
