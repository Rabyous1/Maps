'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { SelfieSegmentation } from '@mediapipe/selfie_segmentation';
import { Camera } from '@mediapipe/camera_utils';
import logo from '../../../../public/logo.png';
import VideoPreview from './VideoPreview';
import Select from '@/components/ui/inputs/Select';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ReplayIcon from '@mui/icons-material/Replay';
import GenericButton from '@/components/ui/inputs/Button';
import { Button } from '@mui/material';


export default function VideoRecorder({ onVideoReady, styles }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const cameraRef = useRef(null);
  const segmentationRef = useRef(null);
  const logoImageRef = useRef(null);
  const bgImageRef = useRef(null);
  const timerRef = useRef(null);
  const backgroundTypeRef = useRef('none');
  const recordedChunksRef = useRef([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordCount, setRecordCount] = useState(0);
  const [videoBlob, setVideoBlob] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [status, setStatus] = useState('ready');
  const [backgroundType, setBackgroundType] = useState('none');
  const [uploadedBgUrl, setUploadedBgUrl] = useState(null);
  const searchParams = useSearchParams();
const applicationId = searchParams.get('applicationId');
const hasAttemptLimit = !!applicationId;


  const inputRef = useRef(null);

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  useEffect(() => {
    const logoImg = new Image();
    logoImg.src = logo.src;
    logoImg.onload = () => {
      logoImageRef.current = logoImg;
    };
  }, []);
  useEffect(() => {
    backgroundTypeRef.current = backgroundType;
  }, [backgroundType]);
  useEffect(() => {
    if (videoBlob) return;
    let isMounted = true;
    const setupCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (!isMounted) return;
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      const selfieSegmentation = new SelfieSegmentation({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
      });
      selfieSegmentation.setOptions({ modelSelection: 1 });
      selfieSegmentation.onResults(onSegmentationResults);
      segmentationRef.current = selfieSegmentation;
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (
            videoRef.current &&
            videoRef.current.videoWidth > 0 &&
            videoRef.current.videoHeight > 0
          ) {
            await selfieSegmentation.send({ image: videoRef.current });
          }
        },
      });
      camera.start();
      cameraRef.current = camera;
    };
    setupCamera();
    return () => {
      isMounted = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      cameraRef.current?.stop?.();
      clearInterval(timerRef.current);
      segmentationRef.current = null;
    };
  }, [uploadedBgUrl, videoBlob]);
  const onSegmentationResults = (results) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    ctx.clearRect(0, 0, width, height);

    ctx.save(); 
    // Appliquer effet miroir au fond + image utilisateur
    ctx.translate(width, 0);
    ctx.scale(-1, 1); // miroir horizontal

    // Segmentation mask
    ctx.drawImage(results.segmentationMask, 0, 0, width, height);
    ctx.globalCompositeOperation = 'source-out';

    const bgType = backgroundTypeRef.current;
    if (bgType === 'blue') {
      ctx.fillStyle = '#234791';
      ctx.fillRect(0, 0, width, height);
    } else if (bgType === 'red') {
      ctx.fillStyle = '#b3001b';
      ctx.fillRect(0, 0, width, height);
    } else if (bgType === 'image' && bgImageRef.current) {
      ctx.drawImage(bgImageRef.current, 0, 0, width, height);
    } else {
      ctx.clearRect(0, 0, width, height);
    }

    ctx.globalCompositeOperation = 'destination-over';
    ctx.drawImage(results.image, 0, 0, width, height);

    ctx.restore(); // 🔁 on revient à l’état normal avant de dessiner le logo

    // ✅ Le logo n'est PAS affecté par l’effet miroir
    ctx.globalCompositeOperation = 'source-over';
    if (logoImageRef.current) {
      ctx.drawImage(logoImageRef.current, width - 60, 10, 50, 50);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.src = url;
      img.onload = () => {
        bgImageRef.current = img;
        setUploadedBgUrl(url);
        setBackgroundType('image');
      };
    }
  };
  const launchCountdownAndRecord = () => {
  if (hasAttemptLimit && recordCount >= 3) {
    alert('Recording limit of 3 reached.');
    return;
  }

  setStatus('countdown');
  let counter = 3;
  setCountdown(counter);
  const interval = setInterval(() => {
    counter -= 1;
    if (counter === 0) {
      clearInterval(interval);
      setCountdown(null);
      startRecording();
    } else {
      setCountdown(counter);
    }
  }, 1000);
};

  const startRecording = () => {
    setStatus('recording');
    setTimeLeft(120);
    recordedChunksRef.current = [];
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    const canvasStream = canvasRef.current.captureStream(30);
    const audioTrack = streamRef.current?.getAudioTracks()[0];
    const mixedStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...(audioTrack ? [audioTrack] : []),
    ]);
    const mediaRecorder = new MediaRecorder(mixedStream);
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data);
    };
    mediaRecorder.onstop = () => {
      clearInterval(timerRef.current);
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      setVideoBlob(blob);
      setStatus('preview');
      const file = new File([blob], 'cv-video.webm', { type: 'video/webm' });
      onVideoReady(file);

      recordedChunksRef.current = [];
    };
    mediaRecorder.start();
    setIsRecording(true);
    setRecordCount((prev) => prev + 1);
  };
  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  const handleRetry = () => {
    setVideoBlob(null);
    setStatus('ready');
    setCountdown(null);
    setTimeLeft(0);
  };
  return (
    <div className={styles.recordContainer}>
      <h3 className={styles.recordTitle}>Let's get started !</h3>
      <div className={styles.selectContainer}>
        <p className={styles.chooseBgText}>Choose Background : </p>

        <Select
          name="background"
          value={backgroundType}
          onChange={(e) => setBackgroundType(e.target.value)}
          options={[
            { value: 'none', label: 'Default' },
            { value: 'blue', label: 'Blue' },
            { value: 'red', label: 'Red' },
            { value: 'image', label: 'Custom image' },
          ]}
          placeholder="Select background"
          disabled={isRecording}
          fullWidth={false}
          styles={styles}
        />
      </div>
      {/* {backgroundType === 'image' && (
        <div>
          <input type="file" accept="image/*" onChange={handleFileUpload} />
        </div>
      )} */}
        {backgroundType === 'image' && (
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <Button
              variant="contained"
              startIcon={<CloudUploadIcon />}
              onClick={handleButtonClick}
              className={styles.uploadbgImageButton}
              disabled={isRecording}
            >
              Upload Image
            </Button>
          </>
        )}

      <div style={{ position: 'relative'}}>
        {status === 'preview' && videoBlob ? (
          <VideoPreview video={videoBlob} styles={styles}/>
        ) : (
          <>
            <video ref={videoRef} autoPlay muted playsInline style={{ display: 'none' }} />
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className={styles.canvasStyled}
            />
            {countdown !== null && (
              <div className={styles.countdown}>{countdown}</div>
            )}
            {status === 'ready' && <Badge label="✔ Ready" type="success" position="top-left" styles={styles} />}
            {status === 'recording' && (
              <>
                <Badge label="● Recording" type="error" position="top-left" styles={styles} />
                <Badge
                  label={`⏱️ ${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(
                    timeLeft % 60
                  ).padStart(2, '0')}`}
                  type="timer"
                  position="top-right"
                  styles={styles}
                />
              </>
            )}


          </>
        )}
      </div>
      <div className={styles.videoActionButton}>
        {status === 'preview' ? (
          <GenericButton onClick={handleRetry} startIcon={<RestartAltIcon />} className={styles.restartRecordButton}>
            Restart
          </GenericButton>
        ) : (
          <GenericButton
            onClick={isRecording ? stopRecording : launchCountdownAndRecord}
            startIcon={isRecording ? <StopCircleIcon /> : <PlayArrowIcon />}
            className={styles.recordButton}
          >
            {isRecording ? 'Stop' : 'Start recording'}
          </GenericButton>

        )}
        <p className={styles.attemptsText}>
           <ReplayIcon />
  {hasAttemptLimit
    ? `Remaining attempts: ${Math.max(3 - recordCount, 0)}`
    : `Feel free! You have unlimited attempts.`}
</p>

      </div>
    </div>
  );
}

function Badge({ label, type = 'success', position = 'top-left', styles }) {
  return (
    <div className={`${styles.badge} ${styles[position]} ${styles[type]}`}>
      {label}
    </div>
  );
}
