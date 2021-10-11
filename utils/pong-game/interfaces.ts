import { Vector2D } from '@utils/vector-2d';

export type RacketUpdateCallback = (y: number) => void;
export type ScoreUpdateCallback = (p1score: number, p2score: number) => void;
export type BallUpdateCallback = (x: number, y: number) => void;
export type DebugUpdateCallback = <T extends {}>(data: T) => void;

export type PongGameData = PongGameCallbacks;

export interface PongGameCallbacks {
  onRacket1Update: RacketUpdateCallback;
  onRacket2Update: RacketUpdateCallback;
  onScoreUpdate: ScoreUpdateCallback;
  onBallUpdate: BallUpdateCallback;
  onDebugUpdate?: DebugUpdateCallback;
}

export interface GameState {
  ball: BallState;
  player1: PlayerState;
  player2: PlayerState;
}

export interface BallState {
  x: number;
  y: number;
  w: number;
  h: number;
  speed: Vector2D;
  onUpdate: BallUpdateCallback;
}

export interface PlayerState {
  x: number;
  y: number;
  w: number;
  h: number;
  acc: number;
  speed: number;
  score: number;
  keys: {
    up: string;
    down: string;
  };
  onUpdate: RacketUpdateCallback;
}
