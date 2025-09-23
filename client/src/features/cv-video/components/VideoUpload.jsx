'use client';

import React, { useRef, useState } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export default function VideoUpload({ onVideoReady, styles }) {
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleClick = () => {
    if (inputRef.current) inputRef.current.click();
  };

  const handleChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setError(null);

    if (file.size > 50 * 1024 * 1024) {
      setError('File too large (max 50 MB).');
      return;
    }

    if (!['video/mp4', 'video/webm'].includes(file.type)) {
      setError('Invalid format. MP4 or WEBM required.');
      return;
    }

    onVideoReady(file);
  };

  return (
    <Stack spacing={1}>
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm"
        style={{ display: 'none' }}
        onChange={handleChange}
      />

      <Button
        variant="outlined"
        startIcon={<CloudUploadIcon />}
        onClick={handleClick}
        className={styles.uploadButton}
      >
        Upload Video CV
      </Button>

      {error && (
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      )}
    </Stack>
  );
}