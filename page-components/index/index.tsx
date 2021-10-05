import React, { FC } from 'react';
import { Page } from '@components/page';
import { PongGame } from '@components/pong-game';

export type Props = {};

export const IndexPage: FC<Props> = () => {
  const title = `${PACKAGE_NAME} - ${PACKAGE_VERSION} (${COMMIT_HASH_SHORT})`;

  return (
    <Page title={title} header="Index">
      <PongGame />
    </Page>
  );
};
