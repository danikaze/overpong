import { PongGame } from '@utils/pong-game';
import { PongGameData } from '@utils/pong-game/interfaces';
import { useEffect, useRef } from 'react';

export function usePongGame() {
  let game: PongGame;

  const refs = {
    racket1: useRef<HTMLDivElement>(null),
    racket2: useRef<HTMLDivElement>(null),
    score1: useRef<HTMLDivElement>(null),
    score2: useRef<HTMLDivElement>(null),
    ball: useRef<HTMLDivElement>(null),
    debug: useRef<HTMLDivElement>(null),
  };

  useEffect(() => {
    if (!refs.racket1.current) return;

    const racket1 = refs.racket1.current!;
    const racket2 = refs.racket2.current!;
    const score1 = refs.score1.current!;
    const score2 = refs.score2.current!;
    const ball = refs.ball.current!;

    const gameOptions: PongGameData = {
      onRacket1Update: (y) => {
        racket1.style.top = `${y}px`;
      },
      onRacket2Update: (y) => {
        racket2.style.top = `${y}px`;
      },
      onScoreUpdate: (p1score, p2score) => {
        score1.innerText = String(p1score);
        score2.innerText = String(p2score);
      },
      onBallUpdate: (x, y) => {
        ball.style.top = `${y}px`;
        ball.style.left = `${x}px`;
      },
    };

    if (!IS_PRODUCTION) {
      gameOptions.onDebugUpdate = (data) => {
        if (!refs.debug.current) return;
        refs.debug.current.innerHTML = `<pre>${JSON.stringify(
          data,
          null,
          2
        )}</pre>`;
      };
    }

    game = new PongGame(gameOptions);

    return () => {
      game.dispose();
    };
  }, [refs.racket1.current]);

  return {
    refs,
  };
}
