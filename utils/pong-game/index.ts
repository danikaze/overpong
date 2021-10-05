import { getSpeed } from '@utils/math';
import { random } from '@utils/random';
import {
  GameState,
  PlayerState,
  PongGameData,
  ScoreUpdateCallback,
} from './interfaces';

export class PongGame {
  protected static readonly WALL_SIZE = 15;
  protected static readonly FIELD_WIDTH = 900;
  protected static readonly FIELD_HEIGHT = 600;
  protected static readonly RACKET_SIZE = { w: 15, h: 100 };
  protected static readonly RACKET_DISTANCE_FROM_WALL = 50;
  protected static readonly BALL_SIZE = { w: 15, h: 15 };

  protected static readonly NORMAL_OFFSET = 50;

  protected static readonly BALL_SPEED = 200;
  protected static readonly RACKET_SPEED = 500;

  protected state: GameState;
  protected onScoreUpdate: ScoreUpdateCallback;
  protected isKeyPressed: Record<string, boolean> = {};
  protected lastUpdate: number = 0;

  constructor(data: PongGameData) {
    const RACKET_INITIAL_Y =
      (PongGame.FIELD_HEIGHT - PongGame.RACKET_SIZE.h) / 2;
    const BALL_INITIAL_X = (PongGame.FIELD_WIDTH - PongGame.BALL_SIZE.w) / 2;
    const BALL_INITIAL_Y = (PongGame.FIELD_HEIGHT - PongGame.BALL_SIZE.h) / 2;

    this.kbEventHandler = this.kbEventHandler.bind(this);
    this.update = this.update.bind(this);

    const ballAngle = random(-Math.PI, Math.PI);
    this.state = {
      ball: {
        x: BALL_INITIAL_X,
        y: BALL_INITIAL_Y,
        ...PongGame.BALL_SIZE,
        angleRad: ballAngle,
        ...getSpeed(PongGame.BALL_SPEED, ballAngle),
        onUpdate: data.onBallUpdate,
      },
      player1: {
        x: PongGame.RACKET_DISTANCE_FROM_WALL,
        y: RACKET_INITIAL_Y,
        ...PongGame.RACKET_SIZE,
        score: 0,
        keys: {
          up: 'KeyQ',
          down: 'KeyA',
        },
        onUpdate: data.onRacket1Update,
      },
      player2: {
        x:
          PongGame.FIELD_WIDTH -
          PongGame.RACKET_DISTANCE_FROM_WALL -
          PongGame.RACKET_SIZE.w,
        y: RACKET_INITIAL_Y,
        ...PongGame.RACKET_SIZE,
        score: 0,
        keys: {
          up: 'ArrowUp',
          down: 'ArrowDown',
        },
        onUpdate: data.onRacket2Update,
      },
    };

    this.onScoreUpdate = data.onScoreUpdate;

    this.state.ball.onUpdate(BALL_INITIAL_X, BALL_INITIAL_Y);
    this.state.player1.onUpdate(RACKET_INITIAL_Y);
    this.state.player2.onUpdate(RACKET_INITIAL_Y);

    this.setEventListeners();
    requestAnimationFrame(this.update);
  }

  public dispose(): void {
    document.removeEventListener('keyup', this.kbEventHandler);
    document.removeEventListener('keydown', this.kbEventHandler);
  }

  protected update(timestamp: number): void {
    const delta = timestamp - this.lastUpdate;
    this.lastUpdate = timestamp;

    this.updateRacket(delta, this.state.player1);
    this.updateRacket(delta, this.state.player2);
    this.updateBall(delta);

    requestAnimationFrame(this.update);
  }

  protected setEventListeners(): void {
    document.addEventListener('keyup', this.kbEventHandler);
    document.addEventListener('keydown', this.kbEventHandler);
  }

  protected kbEventHandler(ev: KeyboardEvent): void {
    const keyCode = ev.code;
    if (!['KeyQ', 'KeyA', 'ArrowUp', 'ArrowDown'].includes(keyCode)) {
      return;
    }

    this.isKeyPressed[keyCode] = ev.type === 'keydown';
  }

  protected updateRacket(delta: number, player: PlayerState): void {
    const MIN_Y = PongGame.WALL_SIZE;
    const MAX_Y = PongGame.FIELD_HEIGHT - PongGame.WALL_SIZE - player.h;
    const px = (delta * PongGame.RACKET_SPEED) / 1000;
    const goUp = this.isKeyPressed[player.keys.up];
    const goDown = this.isKeyPressed[player.keys.down];
    const dy = (goUp ? -px : 0) + (goDown ? px : 0);
    const y = Math.max(MIN_Y, Math.min(player.y + dy, MAX_Y));

    if (player.y === y) return;

    player.y = y;
    player.onUpdate(y);
  }

  protected updateBall(delta: number): void {
    const ball = this.state.ball;
    const MIN_X = 0;
    const MAX_X = PongGame.FIELD_WIDTH - ball.w;
    const MIN_Y = PongGame.WALL_SIZE;
    const MAX_Y = PongGame.FIELD_HEIGHT - PongGame.WALL_SIZE - ball.h;

    const dx = (delta * ball.sx) / 1000;
    const dy = (delta * ball.sy) / 1000;
    ball.x = Math.max(MIN_X, Math.min(ball.x + dx, MAX_X));
    ball.y = Math.max(MIN_Y, Math.min(ball.y + dy, MAX_Y));

    // ball colliding with the walls
    if (ball.y <= MIN_Y || ball.y >= MAX_Y) {
      ball.angleRad *= -1;
      const speed = getSpeed(PongGame.BALL_SPEED, ball.angleRad);
      ball.sx = speed.sx;
      ball.sy = speed.sy;
    }

    const player1 = this.state.player1;
    const player2 = this.state.player2;
    // collision with racket 1
    if (this.isBallColliding(player1)) {
      // const ballCenterY = ball.y + ball.h / 2;
      // const collidingRatio = 2 * ((ball.y - player1.y) / player1.h - 0.5);

      ball.angleRad =
        ball.angleRad > 0 ? -ball.angleRad + Math.PI : -ball.angleRad - Math.PI;
      const speed = getSpeed(PongGame.BALL_SPEED, ball.angleRad);
      ball.sx = speed.sx;
      ball.sy = speed.sy;

      // collision with racket 2
    } else if (this.isBallColliding(player2)) {
      ball.angleRad =
        ball.angleRad > 0 ? Math.PI - ball.angleRad : -Math.PI - ball.angleRad;
      const speed = getSpeed(PongGame.BALL_SPEED, ball.angleRad);
      ball.sx = speed.sx;
      ball.sy = speed.sy;

      // player2 goal
    } else if (ball.x <= MIN_X) {
      this.goal(player2);

      // player1 goal
    } else if (ball.x >= MAX_X) {
      this.goal(player1);
    }

    ball.onUpdate(ball.x, ball.y);
  }

  protected goal(player: PlayerState): void {
    player.score++;
    this.onScoreUpdate(this.state.player1.score, this.state.player2.score);
    this.resetBall();
  }

  protected resetBall(): void {
    const ball = this.state.ball;
    const BALL_INITIAL_X = (PongGame.FIELD_WIDTH - ball.w) / 2;
    const BALL_INITIAL_Y = (PongGame.FIELD_HEIGHT - ball.h) / 2;

    ball.x = BALL_INITIAL_X;
    ball.y = BALL_INITIAL_Y;
    ball.angleRad = random(-Math.PI, Math.PI);
    const speed = getSpeed(PongGame.BALL_SPEED, ball.angleRad);
    ball.sx = speed.sx;
    ball.sy = speed.sy;
  }

  protected isBallColliding(player: PlayerState): boolean {
    const ball = this.state.ball;

    return !(
      ball.x > player.x + player.w ||
      ball.x + ball.w < player.x ||
      ball.y > player.y + player.h ||
      ball.y + ball.h < player.y
    );
  }
}
