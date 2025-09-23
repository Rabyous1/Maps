'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function VideoPreview({ video, styles }) {
  const [url, setUrl] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!video) return;

    let objectUrl;

    if (video instanceof Blob || video instanceof File) {
      objectUrl = URL.createObjectURL(video);
      setUrl(objectUrl);
    } else {
      setUrl(video);
    }

    setIsReady(false);
    setShowLoader(true);

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [video]);

  useEffect(() => {
    if (!url || !videoRef.current) return;

    const vid = videoRef.current;

    const handleLoadedMetadata = () => {
      const waitUntilReady = setInterval(() => {
        if (vid.readyState >= 4) {
          clearInterval(waitUntilReady);
          setTimeout(() => {
            setIsReady(true);
            setShowLoader(false);
          }, 800); 
        }
      }, 100);
    };

    vid.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      vid.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [url]);

  if (!video) return null;

  return (
    <div>
      {showLoader && (
        <div className={styles.preparingSubTitle}>
          Preparing the video…
        </div>
      )}

      <video
        ref={videoRef}
        src={url}
        controls
        preload="auto"
        className={styles.canvasStyled}
      />
    </div>
  );
}
