import { deg2rad, getSpeed } from '@utils/math';
import { random } from '@utils/random';
import { Vector2D } from '@utils/vector-2d';
import {
  DebugUpdateCallback,
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

  protected static readonly NORMAL_OFFSET = 80;
  protected static readonly HORIZONTAL_SURFACE = new Vector2D(1, 0);
  protected static readonly VERTICAL_SURFACE = new Vector2D(0, 1);

  /**
   * Bullet speed is the maximum speed (per second)
   * of the ball to not miss collissions
   */
  protected static readonly BULLET_SPEED = 600;
  protected static readonly BALL_SPEED = 200;
  protected static readonly BALL_HIT_ACCEL = 30;
  // tslint:disable-next-line:no-magic-numbers
  protected static readonly MAX_ANGLE = deg2rad(60);

  protected static readonly RACKET_MAX_SPEED = 500;
  protected static readonly RACKET_MAX_ACCEL = 300;
  protected static readonly RACKET_ACCEL = 500;
  protected static readonly RACKET_DECCEL = 500;

  protected state: GameState;
  protected onScoreUpdate: ScoreUpdateCallback;
  protected onDebugUpdate?: DebugUpdateCallback;
  protected isKeyPressed: Record<string, boolean> = {};
  protected lastUpdate: number = 0;

  constructor(data: PongGameData) {
    const RACKET_INITIAL_Y =
      (PongGame.FIELD_HEIGHT - PongGame.RACKET_SIZE.h) / 2;
    const BALL_INITIAL_X = (PongGame.FIELD_WIDTH - PongGame.BALL_SIZE.w) / 2;
    const BALL_INITIAL_Y = (PongGame.FIELD_HEIGHT - PongGame.BALL_SIZE.h) / 2;

    this.kbEventHandler = this.kbEventHandler.bind(this);
    this.update = this.update.bind(this);

    const ballAngle = random(0, 1) === 1 ? 0 : Math.PI;
    const ballSpeed = getSpeed(PongGame.BALL_SPEED, ballAngle);
    this.state = {
      ball: {
        x: BALL_INITIAL_X,
        y: BALL_INITIAL_Y,
        ...PongGame.BALL_SIZE,
        speed: new Vector2D(ballSpeed.sx, ballSpeed.sy),
        onUpdate: data.onBallUpdate,
      },
      player1: {
        x: PongGame.RACKET_DISTANCE_FROM_WALL,
        y: RACKET_INITIAL_Y,
        acc: 0,
        speed: 0,
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
        acc: 0,
        speed: 0,
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
    this.onDebugUpdate = data.onDebugUpdate;

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

  protected updateRacket(ellapsedMs: number, player: PlayerState): void {
    const ratioSecond = ellapsedMs / 1000;
    const MIN_Y = PongGame.WALL_SIZE;
    const MAX_Y = PongGame.FIELD_HEIGHT - PongGame.WALL_SIZE - player.h;
    const goUp = this.isKeyPressed[player.keys.up];
    const goDown = this.isKeyPressed[player.keys.down];

    if (goUp || goDown) {
      if (goUp) {
        if (player.acc > 0) {
          player.acc = -PongGame.RACKET_ACCEL * ratioSecond;
        } else {
          player.acc = Math.max(
            -PongGame.RACKET_MAX_ACCEL,
            player.acc - PongGame.RACKET_ACCEL * ratioSecond
          );
        }
      }
      if (goDown) {
        if (player.acc < 0) {
          player.acc = PongGame.RACKET_ACCEL * ratioSecond;
        } else {
          player.acc = Math.min(
            PongGame.RACKET_MAX_ACCEL,
            player.acc + PongGame.RACKET_ACCEL * ratioSecond
          );
        }
      }

      player.speed = Math.max(
        -PongGame.RACKET_MAX_ACCEL,
        Math.min(PongGame.RACKET_MAX_ACCEL, player.speed + player.acc)
      );
    } else {
      player.acc = 0;
      if (player.speed > 0) {
        player.speed = Math.max(
          0,
          player.speed - PongGame.RACKET_DECCEL * ratioSecond
        );
      } else if (player.speed < 0) {
        player.speed = Math.min(
          0,
          player.speed + PongGame.RACKET_DECCEL * ratioSecond
        );
      }
    }

    const dy = ratioSecond * player.speed;
    let newY = player.y + dy;
    if (newY > MAX_Y || newY < MIN_Y) {
      newY = Math.max(MIN_Y, Math.min(newY, MAX_Y));
      player.acc = 0;
      player.speed = 0;
    }
    if (player.y === newY) return;

    player.y = newY;
    player.onUpdate(newY);
  }

  protected updateBall(ellapsedMs: number): void {
    const ball = this.state.ball;
    const MIN_X = 0;
    const MAX_X = PongGame.FIELD_WIDTH - ball.w;
    const MIN_Y = PongGame.WALL_SIZE;
    const MAX_Y = PongGame.FIELD_HEIGHT - PongGame.WALL_SIZE - ball.h;

    const bulletRatio = ball.speed.getMod() / PongGame.BULLET_SPEED;
    let repeatLogic = Math.max(bulletRatio, 1);
    while (repeatLogic > 0) {
      const ratio = Math.min(1, repeatLogic);
      const speed =
        bulletRatio > 1
          ? ball.speed.scale(PongGame.BULLET_SPEED / ball.speed.getMod())
          : ball.speed;
      const dx = (ellapsedMs * speed.x * ratio) / 1000;
      const dy = (ellapsedMs * speed.y * ratio) / 1000;
      repeatLogic--;

      ball.x = Math.max(MIN_X, Math.min(ball.x + dx, MAX_X));
      ball.y = Math.max(MIN_Y, Math.min(ball.y + dy, MAX_Y));

      // ball colliding with the walls
      if (ball.y <= MIN_Y || ball.y >= MAX_Y) {
        ball.speed = ball.speed.bounce(PongGame.HORIZONTAL_SURFACE);
      }

      const player1 = this.state.player1;
      const player2 = this.state.player2;
      const isCollidingWithP1 =
        ball.speed.x < 0 && this.isBallColliding(player1);
      const isCollidingWithP2 =
        ball.speed.x > 0 && this.isBallColliding(player2);

      // collision with rackets
      if (isCollidingWithP1 || isCollidingWithP2) {
        const collidingRacket = isCollidingWithP1 ? player1 : player2;
        const collisionPoint = new Vector2D(
          ball.x + ball.w / 2,
          ball.y + ball.h / 2
        );
        const backRacket = new Vector2D(
          ball.x + PongGame.NORMAL_OFFSET * (isCollidingWithP1 ? -1 : 1),
          collidingRacket.y + collidingRacket.h / 2
        );
        const normal = collisionPoint.substract(backRacket);
        normal.normalize();

        ball.speed = ball.speed.bounceWithNormal(normal);
        if (isCollidingWithP1) {
          ball.speed.clampAngle(-PongGame.MAX_ANGLE, PongGame.MAX_ANGLE);
        } else if (ball.speed.y < 0) {
          ball.speed.clampAngle(-Math.PI, -Math.PI + PongGame.MAX_ANGLE);
        } else {
          ball.speed.clampAngle(Math.PI - PongGame.MAX_ANGLE, Math.PI);
        }
        const accel = ball.speed.clone();
        accel.normalize();
        ball.speed = ball.speed.add(accel.scale(PongGame.BALL_HIT_ACCEL));

        // player2 goal
      } else if (ball.x <= MIN_X) {
        this.goal(player2);

        // player1 goal
      } else if (ball.x >= MAX_X) {
        this.goal(player1);
      }
    }

    ball.onUpdate(ball.x, ball.y);
  }

  protected goal(player: PlayerState): void {
    player.score++;
    this.onScoreUpdate(this.state.player1.score, this.state.player2.score);
    this.resetBall();
    this.resetRackets(this.state.player1);
    this.resetRackets(this.state.player2);
  }

  protected resetBall(): void {
    const ball = this.state.ball;
    const BALL_INITIAL_X = (PongGame.FIELD_WIDTH - ball.w) / 2;
    const BALL_INITIAL_Y = (PongGame.FIELD_HEIGHT - ball.h) / 2;

    const angleRad = random(0, 1) === 1 ? 0 : Math.PI;
    const speed = getSpeed(PongGame.BALL_SPEED, angleRad);
    ball.x = BALL_INITIAL_X;
    ball.y = BALL_INITIAL_Y;
    ball.speed.set(new Vector2D(speed.sx, speed.sy));
    ball.onUpdate(ball.x, ball.y);
  }

  protected resetRackets(player: PlayerState): void {
    const RACKET_INITIAL_Y =
      (PongGame.FIELD_HEIGHT - PongGame.RACKET_SIZE.h) / 2;
    player.y = RACKET_INITIAL_Y;
    player.acc = 0;
    player.speed = 0;
    player.onUpdate(RACKET_INITIAL_Y);
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
