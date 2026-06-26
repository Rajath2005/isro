import { Waypoint, Hazard } from '../types';

export interface ProfilePoint {
  distance: number;
  elevation: number;
  slope: number;
}

export interface TrajectoryMetrics {
  totalDistance: number;
  totalDuration: number;
  batteryEstimate: number;
  profile: ProfilePoint[];
  threatAlerts: string[];
}

/**
 * Calculates high-fidelity lunar South Pole trajectory metrics, elevation profiles,
 * and safety threat alerts based on waypoint configurations and hazard maps.
 */
export function calculateTrajectory(waypoints: Waypoint[], hazards: Hazard[]): TrajectoryMetrics {
  if (waypoints.length < 2) {
    return {
      totalDistance: 0,
      totalDuration: 0,
      batteryEstimate: 0,
      profile: [{ distance: 0, elevation: -2800, slope: 0 }],
      threatAlerts: []
    };
  }

  const R_MOON = 1737.4; // Mean radius of the Moon in km
  let totalDistance = 0;
  const profile: ProfilePoint[] = [];
  const threatAlerts: string[] = [];

  // Start with initial waypoint
  profile.push({
    distance: 0,
    elevation: waypoints[0].elevation,
    slope: 0
  });

  // 1. Calculate trajectory distances and altimetry profiles with interpolation
  for (let i = 1; i < waypoints.length; i++) {
    const wp1 = waypoints[i - 1];
    const wp2 = waypoints[i];

    // Haversine-like calculation adapted for high polar coordinates convergence
    const avgLatRad = (((wp1.latitude + wp2.latitude) / 2) * Math.PI) / 180;
    const dLat = (wp2.latitude - wp1.latitude) * 30.32; // 1 degree of latitude is ~30.32 km on Moon
    const dLng = (wp2.longitude - wp1.longitude) * 30.32 * Math.cos(avgLatRad);
    const segmentDistance = Math.sqrt(dLat * dLat + dLng * dLng);

    const prevAccumulatedDistance = totalDistance;
    totalDistance += segmentDistance;

    // Interpolate points between waypoints to create a continuous high-density terrain profile
    const steps = 6;
    for (let s = 1; s <= steps; s++) {
      const fraction = s / steps;
      const currentDistance = prevAccumulatedDistance + segmentDistance * fraction;

      // Linear base elevation + undulating sinusoidal regolith variance
      const baseElevation = wp1.elevation + (wp2.elevation - wp1.elevation) * fraction;
      // Real-world crater undulations model using sine waves
      const undulatingRipple = Math.sin(fraction * Math.PI) * 14 * (1 + (i % 2 === 0 ? 0.2 : -0.2));
      const interpElevation = Math.round(baseElevation + undulatingRipple);

      // Determine slope gradients between interpolated steps
      const lastPoint = profile[profile.length - 1];
      const prevElev = lastPoint ? lastPoint.elevation : wp1.elevation;
      const elevDelta = interpElevation - prevElev;
      const stepDistanceMeters = (segmentDistance / steps) * 1000;

      const slopeRad = stepDistanceMeters > 0 ? Math.atan(Math.abs(elevDelta) / stepDistanceMeters) : 0;
      const slopeDeg = Number(((slopeRad * 180) / Math.PI).toFixed(1));

      profile.push({
        distance: Number(currentDistance.toFixed(2)),
        elevation: interpElevation,
        slope: Math.min(25, slopeDeg)
      });
    }
  }

  // 2. Scan path and waypoints for critical proximity to identified terrain hazards
  // We check if any waypoint is within 0.04 degrees of any hazard
  const proximityThreshold = 0.035; // ~1.06 km spatial radius near Pole
  hazards.forEach((haz) => {
    waypoints.forEach((wp) => {
      const avgLatRad = (((wp.latitude + haz.latitude) / 2) * Math.PI) / 180;
      const dLat = (wp.latitude - haz.latitude) * 30.32;
      const dLng = (wp.longitude - haz.longitude) * 30.32 * Math.cos(avgLatRad);
      const distanceToHazard = Math.sqrt(dLat * dLat + dLng * dLng);

      if (distanceToHazard < 1.2 && (haz.severity === 'Critical' || haz.severity === 'High')) {
        const hazardLabel = `WARNING: TRAJECTORY STATION "${wp.name.toUpperCase()}" SECURED AT ${distanceToHazard.toFixed(2)} KM PROXIMITY TO ${haz.severity.toUpperCase()} THREAT: [${haz.type.toUpperCase()}].`;
        if (!threatAlerts.includes(hazardLabel)) {
          threatAlerts.push(hazardLabel);
        }
      }
    });
  });

  // Calculate realistic operational estimates
  const roundedDistance = Number(totalDistance.toFixed(2));
  // Average speed of lunar explorer is ~4.5 km/h
  const totalDuration = Math.round((roundedDistance / 4.5) * 60);
  // Est battery usage is ~5.5% per km traversed
  const batteryEstimate = Math.min(100, Math.max(5, Math.round(roundedDistance * 5.5)));

  return {
    totalDistance: roundedDistance,
    totalDuration: Math.max(5, totalDuration),
    batteryEstimate: Math.max(1, batteryEstimate),
    profile,
    threatAlerts
  };
}
