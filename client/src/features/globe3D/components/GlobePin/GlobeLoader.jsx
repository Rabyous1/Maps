'use client';

import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import animationData from './planet-animation.json';
import styles from './GlobePin.module.scss';

export default function GlobeLoader() {
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    setAnimate(true);
  }, []);

  return (
    <div className={styles.characterLoader}>
      <div className={`${styles.lottieWrapper} ${animate ? '' : 'out'}`}>
        <Lottie
          animationData={animationData}
          loop
          autoplay
          speed={1.5} // ✅ vitesse augmentée
        />
      </div>
    </div>
  );
}
