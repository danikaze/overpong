import clsx from 'clsx';
import React, { FC, ReactNode, RefObject } from 'react';
import { usePongGame } from './hooks';

import styles from './pong-game.module.scss';

export type Props = {};

export const PongGame: FC<Props> = () => {
  const { refs } = usePongGame();

  return (
    <div className={styles.root}>
      {renderWalls()}
      {renderMiddleLine()}
      {renderScore(refs.score1, refs.score2)}
      {renderRackets(refs.racket1, refs.racket2)}
      {renderBall(refs.ball)}
      {renderDebugInfo(refs.debug)}
    </div>
  );
};

function renderWalls(): ReactNode {
  return (
    <>
      <div className={clsx(styles.wall, styles.top)} />
      <div className={clsx(styles.wall, styles.bottom)} />
    </>
  );
}

function renderMiddleLine(): ReactNode {
  return <div className={styles.middleLine} />;
}

function renderScore(
  ref1: RefObject<HTMLDivElement>,
  ref2: RefObject<HTMLDivElement>
): ReactNode {
  return (
    <>
      <div className={clsx(styles.score, styles.p1)} ref={ref1}>
        0
      </div>
      <div className={clsx(styles.score, styles.p2)} ref={ref2}>
        0
      </div>
    </>
  );
}

function renderRackets(
  racket1ref: RefObject<HTMLDivElement>,
  racket2ref: RefObject<HTMLDivElement>
): ReactNode {
  return (
    <>
      <div className={clsx(styles.racket, styles.p1)} ref={racket1ref} />
      <div className={clsx(styles.racket, styles.p2)} ref={racket2ref} />
    </>
  );
}

function renderBall(ballRef: RefObject<HTMLDivElement>): ReactNode {
  return <div className={styles.ball} ref={ballRef} />;
}

function renderDebugInfo(ref: RefObject<HTMLDivElement>): ReactNode {
  if (IS_PRODUCTION) return null;
  return <div className={styles.debug} ref={ref} />;
}
