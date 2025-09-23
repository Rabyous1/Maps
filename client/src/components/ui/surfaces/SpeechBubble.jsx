import React from 'react';
import { Box, Typography } from '@mui/material';

const SpeechBubble = ({ text, styles }) => {
    return (
        <Box className={styles.bubbleSpeech}>
            <Typography
                variant="body1"
                className={styles.bubbleText}
            >
                {text}
            </Typography>
        </Box>
    );
};

export default SpeechBubble;