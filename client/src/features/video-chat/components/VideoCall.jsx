'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useVideoCall } from './VideoCallContext';
import { IconButton, Tooltip } from '@mui/material';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ClockIcon from '@/assets/icons/globe3D/cards/Clock.svg';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import ProfilePicture from '@/features/messages/components/ProfilePicture';

export default function VideoCall({ styles, targetUser }) {
  const {
    callStatus,
    localStream,
    remoteStream,
    answerCall,
    rejectCall,
    endCall,
    callFrom,
    isVideoCall,
    callStartedAt,
  } = useVideoCall();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [swap, setSwap] = useState(false); // false: remote big, local small
  const [muted, setMuted] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const localStartRef = useRef(null);
  const timerRef = useRef(null);
  const displayedName = targetUser?.fullName;
  const displayedPicture = targetUser?.profilePicture;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!localVideoRef.current) return;
    try { localVideoRef.current.srcObject = localStream ?? null; } catch (e) { try { localVideoRef.current.srcObject = null; } catch (_) { } }
  }, [localStream]);

  useEffect(() => {
    if (!remoteVideoRef.current) return;
    try { remoteVideoRef.current.srcObject = remoteStream ?? null; } catch (e) { try { remoteVideoRef.current.srcObject = null; } catch (_) { } }
  }, [remoteStream]);

  // timer (unchanged)
  useEffect(() => {
    const update = () => {
      const start = callStartedAt || localStartRef.current;
      if (!start) { setCallSeconds(0); return; }
      setCallSeconds(Math.floor(Math.max(0, Date.now() - start) / 1000));
    };
    if (callStatus === 'in-progress') {
      if (!callStartedAt && !localStartRef.current) localStartRef.current = Date.now();
      update();
      timerRef.current = setInterval(update, 400);
    } else {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      if (callStatus === 'idle' || callStatus === 'calling') { localStartRef.current = null; setCallSeconds(0); }
    }
    return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
  }, [callStatus, callStartedAt]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const toggleMute = () => {
    if (!localStream) return;
    const tracks = localStream.getAudioTracks();
    if (!tracks.length) return;
    const currentlyMuted = tracks.every(t => t.enabled === false);
    const nextMuted = !currentlyMuted;
    tracks.forEach(t => t.enabled = !nextMuted);
    setMuted(nextMuted);
  };


  const onRemoteDoubleClick = () => requestFullscreen(remoteVideoRef.current?.parentElement ?? remoteVideoRef.current);

  if (callStatus === 'idle') return null;
  const requestFullscreen = async (el) => {
    if (!el) return;
    try {
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
      else if (el.msRequestFullscreen) el.msRequestFullscreen();
    } catch (e) {
      console.warn('requestFullscreen failed', e);
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) await document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
    } catch (e) {
      console.warn('exitFullscreen failed', e);
    }
  };

  const toggleFullscreen = async () => {
    if (!isFullscreen) {
      await requestFullscreen(containerRef.current);
      setIsFullscreen(true);
    } else {
      await exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className={styles.pageWrapper} ref={containerRef}>
      <div className={styles.callStageWrapper}>
        <div className={styles.callArea}>


          {isVideoCall ? (
            remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                muted={false}
                onDoubleClick={onRemoteDoubleClick}
                className={swap ? styles.remoteVideoSmall : styles.remoteVideo}
              />
            ) : (
              <div
                className={swap ? styles.remoteVideoSmall : styles.remoteVideo}
                onDoubleClick={onRemoteDoubleClick}
                role="status"
                aria-live="polite"
              >
                <div className={styles.videoPlaceholder}>
                  <p className={styles.videoPlaceholderText}>
                    {callStatus === 'calling' ? 'Calling…' :
                      callStatus === 'ringing' ? 'Incoming video call' : 'Waiting for video…'}
                  </p>
                </div>
              </div>
            )
          ) : (
            <div
              className={swap ? styles.remoteVideoSmall : styles.remoteVideo}
              role="status"
              aria-live="polite"
            >
              <div className={styles.audioPlaceholder}>
                <p className={styles.audioPlaceholderText}>
                  Voice call in progress…
                </p>
                {displayedName && (
                  <p className={styles.audioCallerName}>
                    {displayedName}
                  </p>
                )}
                <ProfilePicture
                  filename={displayedPicture?.split("/").pop()}
                  fullName={displayedName}
                  styles={styles}
                  isOnline={false}
                  hasBorder
                  forceGray={false}
                  size='l'
                />

              </div>
            </div>
          )}

          {isVideoCall && localStream && (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              onClick={() => setSwap(s => !s)}
              className={swap ? styles.localVideoExpanded : styles.localVideoOverlay}
            />
          )}

          {!isVideoCall && callStatus === 'in-progress' && (
            <div
              className={styles.localAudioOverlay}
            >
              <p className={styles.localAudioText}>You (Audio Only)</p>
            </div>
          )}


        </div>

        {/* controls */}
        <div className={styles.callControls}>
          {callStatus === 'in-progress' && (
            <div className={styles.callTimer}><ClockIcon className={styles.clockIcon} />{formatTime(callSeconds)}</div>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            {callStatus === 'ringing' && (
              <>
                <button onClick={() => answerCall(callFrom, isVideoCall)} className={styles.callStartButton}>Accept Call</button>
                <button onClick={() => rejectCall()} className={styles.callEndButton}>Reject Call</button>
              </>
            )}

            {callStatus === 'in-progress' && (
              <>
                <Tooltip title={isFullscreen ? "Quit Fullscreen" : "Full Screen"}>
                  <IconButton onClick={toggleFullscreen} className={styles.fullscreenButton}>
                    {isFullscreen ? <FullscreenExitIcon className={styles.micIcon} /> : <FullscreenIcon className={styles.micIcon} />}
                  </IconButton>
                </Tooltip>
                <Tooltip title={muted ? "Unmute" : "Mute"}>
                  <IconButton onClick={toggleMute} className={styles?.muteButton}>
                    {muted ? <MicOffIcon /> : <MicIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="End Call">
                  <IconButton onClick={endCall} className={styles?.callEndButton}>
                    <CallEndIcon className={styles?.callEndIcon} />
                  </IconButton>
                </Tooltip>
              </>
            )}

            {callStatus === 'calling' && (
              <Tooltip title="Cancel Call">
                <IconButton onClick={endCall} className={styles?.callEndButton}>
                  <CallEndIcon className={styles?.callEndIcon} />
                </IconButton>
              </Tooltip>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
