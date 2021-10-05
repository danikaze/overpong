export function randomInt(): number;

export function randomInt(max: number): number;

export function randomInt(min: number, max: number): number;

export function randomInt(min?: number, max?: number): number {
  if (min === undefined) {
    return Math.round(Math.random() * Number.MAX_SAFE_INTEGER);
  }
  const range = max === undefined ? min : max - min;
  return (Math.round(Math.random() * Number.MAX_SAFE_INTEGER) % range) + min;
}

export function random(): number;

export function random(max: number): number;

export function random(min: number, max: number): number;

export function random(min?: number, max?: number): number {
  if (min === undefined) {
    return Math.random() * Number.MAX_SAFE_INTEGER;
  }
  const range = max === undefined ? min : max - min;
  return ((Math.random() * Number.MAX_SAFE_INTEGER) % range) + min;
}
