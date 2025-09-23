'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useVideoCall } from './VideoCallContext';
import { useSocket } from '@/context/SocketContext';
import { useCurrentUser } from '../../user/hooks/users.hooks';
import { IconButton, Tooltip } from '@mui/material';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import ProfilePicture from '@/features/messages/components/ProfilePicture';
import ClockIcon from '@/assets/icons/globe3D/cards/Clock.svg';

export default function CallReceiverPage({ styles }) {
  const searchParams = useSearchParams();
  const { answerCall, endCall, localStream, remoteStream, _incomingSignalRef, callStartedAt, callStatus, isVideoCall } = useVideoCall();
  const { socket } = useSocket();
  const { data: currentUser } = useCurrentUser();

  const from = useMemo(() => searchParams.get('from') || '', [searchParams]);
  const isVideo = useMemo(() => searchParams.get('isVideo') === 'true', [searchParams]);
  const callerName = searchParams.get('fullName') || _incomingSignalRef.current?.fullName || from;
  const callerPicture = searchParams.get('profilePicture') || _incomingSignalRef.current?.profilePicture || null;

  const [ready, setReady] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [swap, setSwap] = useState(false); 
  const [muted, setMuted] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  console.log(callStatus, isVideoCall)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('vc_incoming');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.from === from) _incomingSignalRef.current = parsed;
      }
    } catch {
       /* ignore */ 
      }
    setReady(true);
  }, [from, _incomingSignalRef]);

  const localRef = useRef(null);
  const remoteRef = useRef(null);

  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (localRef.current && localStream) {
      try { localRef.current.srcObject = localStream; } catch (e) { try { localRef.current.srcObject = null; } catch (_) { } }
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteRef.current && remoteStream) {
      try { remoteRef.current.srcObject = remoteStream; } catch (e) { try { remoteRef.current.srcObject = null; } catch (_) { } }
    }
  }, [remoteStream]);

  const requestFullscreen = async (el) => {
    if (!el) return;
    try {
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
      else if (el.msRequestFullscreen) el.msRequestFullscreen();
    } catch (e) { console.warn('requestFullscreen failed', e); }
  };

  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) await document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
    } catch (e) { console.warn('exitFullscreen failed', e); }
  };

  const toggleFullscreen = async () => {
    if (!isFullscreen) await requestFullscreen(containerRef.current);
    else await exitFullscreen();
  };

  useEffect(() => {
    const handler = () => {
      const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
      setIsFullscreen(Boolean(fsEl));
    };
    document.addEventListener('fullscreenchange', handler);
    document.addEventListener('webkitfullscreenchange', handler);
    document.addEventListener('mozfullscreenchange', handler);
    document.addEventListener('MSFullscreenChange', handler);
    return () => {
      document.removeEventListener('fullscreenchange', handler);
      document.removeEventListener('webkitfullscreenchange', handler);
      document.removeEventListener('mozfullscreenchange', handler);
      document.removeEventListener('MSFullscreenChange', handler);
    };
  }, []);

  const handleAccept = async () => {
    if (!from) return;
    setAccepted(true);
    await answerCall(from, isVideo);
  };

  const handleReject = () => {
    const fp = _incomingSignalRef.current?.fingerprint || null;
    const callerId = from;
    const myId = currentUser?.id || null;
    const payload = { to: callerId, from: myId, fp, ts: Date.now() };

    try {
      if (socket) {
        if (socket.connected) {
          socket.emit('call:reject', payload);
          socket.emit('call:rejected', payload);
        } else {
          const onceConnect = () => {
            try {
              socket.emit('call:reject', payload);
              socket.emit('call:rejected', payload);
            } catch (e) { console.warn('[call-receiver] emit on connect failed', e); }
            socket.off('connect', onceConnect);
          };
          socket.on('connect', onceConnect);
        }
      }
    } catch (e) {
      console.warn('[call-receiver] socket emit failed', e);
    }

    try {
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage({ type: 'vc:reject', from: callerId, fp }, window.location.origin);
      }
    } catch (e) { console.warn('[call-receiver] postMessage failed', e); }

    try { localStorage.setItem('vc_call_rejected', JSON.stringify({ from: callerId, fp, ts: Date.now() })); } catch (e) { }
    try { sessionStorage.removeItem('vc_incoming'); } catch (e) { }
    try { window.close(); } catch (e) { }
  };

  const handleEndFromPopup = async () => {
    try { if (socket && from) socket.emit('call:end', { to: from }); } catch (e) { }
    try { if (window.opener && !window.opener.closed) window.opener.postMessage({ type: 'vc:end', from }, window.location.origin); } catch (e) { }
    try { await endCall(); } catch (e) { }
    try { sessionStorage.removeItem('vc_incoming'); } catch (e) { }
    try { window.close(); } catch (e) { }
  };

  const localStartRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (callStartedAt) {
      localStartRef.current = callStartedAt;
    } else if (accepted && !localStartRef.current) {
      localStartRef.current = Date.now();
    }

    const update = () => {
      const start = localStartRef.current;
      if (!start) {
        setCallSeconds(0);
        return;
      }
      const elapsed = Math.max(0, Date.now() - start);
      setCallSeconds(Math.floor(elapsed / 1000));
    };

    if (accepted || callStartedAt) {
      update();
      timerRef.current = setInterval(update, 400);
    } else {
      setCallSeconds(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [accepted, callStartedAt]);

  useEffect(() => {
    if (!localStream) return;
    const audio = localStream.getAudioTracks();
    if (audio.length) {
      const allDisabled = audio.every(t => t.enabled === false);
      setMuted(allDisabled);
    }
  }, [localStream]);

  const toggleMute = () => {
    const nextMuted = !muted;

    const flipTracks = (ms) => {
      if (!ms) return;
      ms.getAudioTracks().forEach(t => {
        t.enabled = !nextMuted;
      });
    };

    flipTracks(localStream);

    if (localRef.current && localRef.current.srcObject instanceof MediaStream) {
      flipTracks(localRef.current.srcObject);
    }

    setMuted(nextMuted);

    try {
      const ls = localStream?.getAudioTracks().map(t => ({ id: t.id, enabled: t.enabled })) || [];
      const vs = (localRef.current?.srcObject instanceof MediaStream)
        ? localRef.current.srcObject.getAudioTracks().map(t => ({ id: t.id, enabled: t.enabled })) : [];
      console.debug('[mute] nextMuted:', nextMuted, { localStreamTracks: ls, videoSrcTracks: vs });
    } catch { }
  };

  useEffect(() => {
    if (remoteRef.current && remoteStream) {
      try {
        remoteRef.current.srcObject = remoteStream;
        remoteRef.current.play().catch(() => {
          console.warn("Audio autoplay blocked, requires user gesture");
        });
      } catch (e) {
        console.warn(e);
      }
    }
  }, [remoteStream]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const onRemoteDoubleClick = () => toggleFullscreen();

  return (
    <div ref={containerRef} className={styles.pageWrapper}>
      {!ready ? (
        <p>Preparing…</p>
      ) : !accepted ? (
        <div className={styles.incomingDivContainer}>
          <h1 className={styles.incomingDivContainerTitle}>Incoming {isVideo ? 'Video' : 'Voice'} Call...</h1>
          <p className={styles.incomingCallerName}>{callerName}</p>

          <ProfilePicture
            filename={callerPicture?.split('/').pop() || ''}
            fullName={callerName || ''}
            styles={styles}
            isOnline={false}
            hasBorder
            size="l"
            forceGray={false}
          />

          <div className={styles.callActionButtons}>
            <Tooltip title="Pick up the call">
              <IconButton onClick={handleAccept} className={styles.callStartButton}>
                <CallEndIcon className={styles.callStartIcon} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Decline the call">
              <IconButton onClick={handleReject} className={styles.callEndButton}>
                <CallEndIcon className={styles.callEndIcon} />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      ) : (
        <div className={styles.callStageWrapper}>
          <div className={styles.callArea}>
            {isVideo ? (
              remoteStream ? (
                <video
                  ref={remoteRef}
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


                    {callerPicture && (
                      <ProfilePicture
                        filename={callerPicture.split('/').pop()}
                        fullName={callerName}
                        styles={styles}
                        isOnline={false}
                        hasBorder
                        forceGray={false}
                        size="l"
                      />
                    )}
                    {callerName && <p className={styles.audioCallerName}>{callerName}</p>}
                  </div>
                </div>
              )
            ) : (
              <>
                {!isVideo && remoteStream && (
                  <audio
                    ref={remoteRef}
                    autoPlay
                    playsInline
                  />
                )}

                <div
                  className={styles.remoteVideo}
                  role="status"
                  aria-live="polite"
                >
                  <div className={styles.audioPlaceholder}>
                    <p className={styles.audioPlaceholderText}>
                      Voice call in progress…
                    </p>

                    {callerName && <p className={styles.audioCallerName}>{callerName}</p>}

                    {callerPicture && (
                      <ProfilePicture
                        filename={callerPicture.split('/').pop()}
                        fullName={callerName}
                        styles={styles}
                        isOnline={false}
                        hasBorder
                        forceGray={false}
                        size="l"
                      />
                    )}
                  </div>
                </div>

              </>
            )}
            {localStream && isVideo && (
              <video
                ref={localRef}
                muted
                autoPlay
                playsInline
                onClick={() => isVideo && setSwap(s => !s)} 
                className={swap ? styles.localVideoExpanded : styles.localVideoOverlay}
              />
            )}

          </div>

          <div className={styles.callControls}>
            {/* Timer */}
            <div className={styles.callTimer}><ClockIcon className={styles.clockIcon} />{formatTime(callSeconds)}</div>

            {/* Fullscreen toggle */}
            <Tooltip title={isFullscreen ? "Quit Fullscreen" : "Full Screen"}>
              <IconButton onClick={toggleFullscreen} className={styles.fullscreenButton}>
                {isFullscreen ? <FullscreenExitIcon className={styles.micIcon} /> : <FullscreenIcon className={styles.micIcon} />}
              </IconButton>
            </Tooltip>

            {/* Mute toggle */}
            <Tooltip title={muted ? "Unmute" : "Mute"}>
              <IconButton onClick={toggleMute} className={styles.muteButton}>
                {muted ? <MicOffIcon className={styles.micIcon} /> : <MicIcon className={styles.micIcon} />}
              </IconButton>
            </Tooltip>

            {/* End call */}
            <Tooltip title="End the call">
              <IconButton onClick={handleEndFromPopup} className={styles.callEndButton}>
                <CallEndIcon className={styles.callEndIcon} />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      )}
    </div>
  );
}
