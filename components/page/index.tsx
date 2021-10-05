import { FC } from 'react';
import Head from 'next/head';
import { Header } from '@components/header';

import styles from './page.module.css';
import { Footer } from '@components/footer';

export interface Props {
  /** Document title to appear as the tab name */
  title: string;
  /** Content for the `<meta name="description">` tag */
  description?: string;
  /** Header at the top of the page */
  header?: string;
}

export const Page: FC<Props> = ({ title, description, header, children }) => {
  const h1 = header ? <h1 className={styles.header}>{header}</h1> : undefined;
  const desc = description ? (
    <meta name="Description" content={description} />
  ) : undefined;

  return (
    <>
      <Head>
        <title>{title}</title>
        {desc}
        <meta name="theme-color" content="white" />
      </Head>
      <div className={styles.container}>
        <Header />
        <main className={styles.main}>
          {h1}
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
};
