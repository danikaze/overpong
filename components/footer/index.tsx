import { FC } from 'react';

import styles from './footer.module.css';

export type Props = {};

export const Footer: FC<Props> = () => {
  return (
    <div className={styles.root}>
      {PACKAGE_VERSION} - {COMMIT_HASH_SHORT}
    </div>
  );
};
