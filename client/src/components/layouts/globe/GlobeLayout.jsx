'use client';

import GlobeHeader from './GlobeHeader';

export default function GlobeLayout({ children, styles, user }) {

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <GlobeHeader
          user={user}
          styles={styles}
          
        />
        <div className={styles.globeContent}>{children}</div>
      </main>
    </div>
  );
}
