interface NormalizedSpeed {
  sx: number;
  sy: number;
}

export function getSpeed(speed: number, radians: number): NormalizedSpeed {
  return {
    sx: Math.cos(radians) * speed,
    sy: Math.sin(radians) * speed,
  };
}

export function rad2deg(radians: number): number {
  // tslint:disable:no-magic-numbers
  return (180 * radians) / Math.PI;
}

export function deg2rad(degrees: number): number {
  // tslint:disable:no-magic-numbers
  return (degrees * Math.PI) / 180;
}
