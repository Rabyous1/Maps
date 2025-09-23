'use client';
import React, { useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

export default function VideoGuide({ styles }) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    setExpanded(prev => !prev);
  };

  return (
    <>
      <section>
        <h3 className={styles.cvSubTitle}>Video CV</h3>
        <h2 className={styles.cvTitle}>Create your Video CV in just a few clicks!</h2>
        <p className={styles.content}>
          Show your personality and communication skills by recording a short video introduction.
          Just hit record and talk freely about your experiences, and what makes you the right fit for the job.
          Take your time, prepare your environment and record as many takes as you need. When you're happy with your final video, click Submit.
        </p>
      </section>

      {/* Always show this section */}
      <section>
        <h3 className={styles.sectionTitle}>Technical Requirements</h3>
        <div className={styles.step}>
          <ul>
            <li className={styles.content}>Modern browser (Chrome recommended)</li>
            <li className={styles.content}>Webcam and microphone (built-in or external)</li>
            <li className={styles.content}>Stable internet connection</li>
          </ul>
        </div>
      </section>

      {/* Only show these when expanded */}
      {expanded && (
        <>
          <section>
            <h3 className={styles.sectionTitle}>Tips for Success</h3>
            <ul>
              <li className={styles.content}>Speak clearly and confidently.</li>
              <li className={styles.content}>Keep your video between 60–120 seconds.</li>
              <li className={styles.content}>Smile and look into the camera.</li>
              <li className={styles.content}>Share your passion and what makes you unique.</li>
            </ul>
          </section>

          <section>
            <h3 className={styles.sectionTitle}>Privacy & Security</h3>
            <p className={styles.content}>
              We will never sell or use your data for any commercial purposes. No data is passed on to 3rd parties or sold.
              Your Video CV is only accessible to you and the employers.
            </p>
          </section>

          <p className={styles.content}>
            This Video CV is provided for free forever by <strong>Maps</strong> to help job seekers ❤️
          </p>
        </>
      )}
      <button
  onClick={toggleExpanded}
  className={styles.seeMoreButton}
>
  {expanded ? (
    <>
      See Less <ExpandLessIcon fontSize="small" />
    </>
  ) : (
    <>
      See More <ExpandMoreIcon fontSize="small" />
    </>
  )}
</button>
    </>
  );
}
