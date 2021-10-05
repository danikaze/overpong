import {
  BallState,
  BallUpdateCallback,
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
  protected static readonly BALL_SIZE = { w: 15, h: 15 };

  protected static readonly BALL_SPEED = 300;
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

    this.state = {
      ball: {
        x: BALL_INITIAL_X,
        y: BALL_INITIAL_Y,
        ...PongGame.BALL_SIZE,
        sx: Math.sign(Math.random() - 0.5) * PongGame.BALL_SPEED,
        sy: Math.sign(Math.random() - 0.5) * PongGame.BALL_SPEED,
        onUpdate: data.onBallUpdate,
      },
      player1: {
        x: 50,
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
        x: PongGame.FIELD_WIDTH - 50 - PongGame.RACKET_SIZE.w,
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
    console.log(ev.code, ev.type, this.isKeyPressed);
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

    if (ball.y <= MIN_Y || ball.y >= MAX_Y) {
      ball.sy *= -1;
    }

    if (
      this.isBallColliding(this.state.player1) ||
      this.isBallColliding(this.state.player2)
    ) {
      ball.sx *= -1;
    } else if (ball.x <= MIN_X) {
      this.goal(this.state.player2);
    } else if (ball.x >= MAX_X) {
      this.goal(this.state.player1);
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
    ball.sx = Math.sign(Math.random() - 0.5) * PongGame.BALL_SPEED;
    ball.sy = Math.sign(Math.random() - 0.5) * PongGame.BALL_SPEED;
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
