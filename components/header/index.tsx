import { FC } from 'react';

import styles from './header.module.css';

export type Props = {};

export const Header: FC<Props> = () => {
  return <div className={styles.root}>{PACKAGE_NAME}</div>;
};
