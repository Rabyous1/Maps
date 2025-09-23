
'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import { useCurrentUser } from '../../user/hooks/users.hooks';
import { useSocket } from '@/context/SocketContext';

const VideoCallContext = createContext();

export function VideoCallProvider({ children }) {
  const { socket } = useSocket();
  const { data: currentUser } = useCurrentUser();

  const [callStatus, _setCallStatus] = useState('idle'); // 'idle' | 'calling' | 'ringing' | 'in-progress'
  const callStatusRef = useRef(callStatus);
  const setCallStatus = (s) => {
    callStatusRef.current = s;
    _setCallStatus(s);
  };

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const [callStartedAt, setCallStartedAt] = useState(null);
  const [candidateToRate, setCandidateToRate] = useState(null);


  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  useEffect(() => { localStreamRef.current = localStream; }, [localStream]);
  useEffect(() => { remoteStreamRef.current = remoteStream; }, [remoteStream]);

  const peerUserId = useRef(null);
  const peerRef = useRef(null);
  const incomingSignal = useRef(null);
  const incomingWindowRef = useRef(null);

  const startedEmittedRef = useRef(false);


  const TAB_ID = useRef(`${Date.now()}_${Math.random().toString(36).slice(2)}`);
  const INCOMING_LOCK_KEY = 'vc_incoming_lock_v3';
  const BC_NAME = 'vc_channel_v3';
  const bcRef = useRef(typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(BC_NAME) : null);

  const callTypeRef = useRef(null); // 'video' | 'audio'
  const [showPostCallDialog, setShowPostCallDialog] = useState(false);

  function makeFingerprint(from, signal) {
    try {
      const s = typeof signal === 'string' ? signal : JSON.stringify(signal || {});
      let hash = 0;
      for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) | 0;
      return `${from}:${hash}`;
    } catch (e) {
      return `${from}:${Date.now()}`;
    }
  }

  function tryAcquireIncomingLock(from, fingerprint) {
    const LOCK_EXPIRY_MS = 15_000;
    try {
      const curRaw = localStorage.getItem(INCOMING_LOCK_KEY);
      if (curRaw) {
        try {
          const cur = JSON.parse(curRaw);
          if (cur && cur.ts && Date.now() - cur.ts > LOCK_EXPIRY_MS) {
            const payload = { tabId: TAB_ID.current, from, ts: Date.now(), fp: fingerprint };
            localStorage.setItem(INCOMING_LOCK_KEY, JSON.stringify(payload));
            if (bcRef.current) bcRef.current.postMessage({ type: 'lock_acquired', payload });
            return true;
          }
          return false;
        } catch (e) {
          const payload = { tabId: TAB_ID.current, from, ts: Date.now(), fp: fingerprint };
          localStorage.setItem(INCOMING_LOCK_KEY, JSON.stringify(payload));
          if (bcRef.current) bcRef.current.postMessage({ type: 'lock_acquired', payload });
          return true;
        }
      }
      const payload = { tabId: TAB_ID.current, from, ts: Date.now(), fp: fingerprint };
      localStorage.setItem(INCOMING_LOCK_KEY, JSON.stringify(payload));
      if (bcRef.current) bcRef.current.postMessage({ type: 'lock_acquired', payload });
      return true;
    } catch (e) {
      return true;
    }
  }

  function releaseIncomingLock() {
    try {
      const cur = JSON.parse(localStorage.getItem(INCOMING_LOCK_KEY) || 'null');
      if (!cur || cur.tabId === TAB_ID.current) {
        localStorage.removeItem(INCOMING_LOCK_KEY);
        if (bcRef.current) bcRef.current.postMessage({ type: 'lock_released', tabId: TAB_ID.current });
      }
    } catch (e) {
      try { localStorage.removeItem(INCOMING_LOCK_KEY); } catch (ee) {}
      if (bcRef.current) bcRef.current.postMessage({ type: 'lock_released', tabId: TAB_ID.current });
    }
  }

  function stopLocalTracks() {
    const s = localStreamRef.current;
    if (!s) return;
    try {
      const tracks = typeof s.getTracks === 'function' ? s.getTracks() : [];
      tracks.forEach((t) => {
        try { t.stop(); } catch (e) {}
      });
    } catch (e) {
      console.warn('[VC] stopLocalTracks error', e);
    }
    try { setLocalStream(null); } catch (e) {}
  }

  function stopRemoteTracks() {
    const s = remoteStreamRef.current;
    if (!s) return;
    try {
      const tracks = typeof s.getTracks === 'function' ? s.getTracks() : [];
      tracks.forEach((t) => {
        try { t.stop(); } catch (e) {}
      });
    } catch (e) {
      console.warn('[VC] stopRemoteTracks error', e);
    }
    try { setRemoteStream(null); } catch (e) {}
  }

  function cleanup() {
    stopLocalTracks();
    stopRemoteTracks();

    setCallStatus('idle');
    incomingSignal.current = null;
    if (peerRef.current) {
      try { peerRef.current.destroy(); } catch (e) {}
      peerRef.current = null;
    }
    peerUserId.current = null;

    // close popup if opener holds reference
    if (incomingWindowRef.current && !incomingWindowRef.current.closed) {
      try { incomingWindowRef.current.close(); } catch (e) {}
      incomingWindowRef.current = null;
    }

    try { sessionStorage.removeItem('vc_incoming'); } catch (e) {}

    try {
      if (bcRef.current) bcRef.current.postMessage({ type: 'close_popup', payload: { tabId: TAB_ID.current } });
    } catch (e) {}

    releaseIncomingLock();

    // reset start tracking
    startedEmittedRef.current = false;
    setCallStartedAt(null);
  }

  // function endCall() {
  //   if (peerUserId.current && socket) {
  //     try { socket.emit('call:end', { to: peerUserId.current }); } catch (e) {}
  //   }
  //    if (currentUser?.role === 'Recruiter') {
  //   setShowPostCallDialog(true); 
  // }
  //   cleanup();
  // }
function endCall() {
  if (peerUserId.current && socket) {
    socket.emit('call:end', { to: peerUserId.current });
  }

  if (currentUser?.roles?.includes('Recruteur')) {
    // Store candidate info BEFORE cleanup
    setCandidateToRate({
      id: peerUserId.current,
    });
    setShowPostCallDialog(true);
  }

  cleanup();
}







  // --- caller (startCall) ---
  async function startCall(targetUserId, withVideo = true, deviceId = null, fullName, profilePicture) {
    callTypeRef.current = withVideo ? 'video' : 'audio';
    if (!currentUser) return;
    setCallStatus('calling');
    peerUserId.current = targetUserId;
    startedEmittedRef.current = false;
    setCallStartedAt(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: withVideo ? (deviceId ? { deviceId: { exact: deviceId } } : true) : false,
        audio: true,
      });
      setLocalStream(stream);

      const peer = new Peer({ initiator: true, trickle: false, stream });
      peerRef.current = peer;

      peer.on('signal', (signal) => {
        if (socket) socket.emit('call:start', { to: targetUserId, signal, isVideo: withVideo , fullName, profilePicture });
      });

      peer.on('stream', (remote) => {
        setRemoteStream(remote);
        setCallStatus('in-progress');

        // emit call:started once (authoritative timestamp)
        if (!startedEmittedRef.current) {
          const startedAt = Date.now();
          try { if (socket) socket.emit('call:started', { to: targetUserId, startedAt }); } catch (e) {}
          setCallStartedAt(startedAt);
          startedEmittedRef.current = true;
        }
      });

      peer.on('error', (err) => {
        console.error('[VC] peer error', err);
        cleanup();
      });
    } catch (err) {
      console.error('[VC] startCall error', err);
      cleanup();
    }
  }

  // --- callee (answerCall) ---
  async function answerCall(callerUserId, withVideo = true, deviceId = null) {
    callTypeRef.current = withVideo ? 'video' : 'audio';
    setCallStatus('in-progress');
    peerUserId.current = callerUserId;
    startedEmittedRef.current = false;
    setCallStartedAt(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: withVideo ? (deviceId ? { deviceId: { exact: deviceId } } : true) : false,
        audio: true,
      });
      setLocalStream(stream);

      const peer = new Peer({ initiator: false, trickle: false, stream });
      peerRef.current = peer;

      peer.on('signal', (signal) => {
        if (socket) socket.emit('call:signal', { to: callerUserId, signal });
      });

      peer.on('stream', (remote) => {
        setRemoteStream(remote);

        // emit call:started to let caller know the exact start instant (only once)
        if (!startedEmittedRef.current) {
          const startedAt = Date.now();
          try { if (socket) socket.emit('call:started', { to: callerUserId, startedAt }); } catch (e) {}
          setCallStartedAt(startedAt);
          startedEmittedRef.current = true;
        }
      });

      peer.on('error', (err) => {
        console.error('[VC] peer error', err);
        cleanup();
      });

      if (incomingSignal.current?.signal) {
        try {
          peer.signal(incomingSignal.current.signal);
          if (socket) socket.emit('call:accepted', { to: callerUserId });
        } catch (e) {
          console.error('[VC] signaling error on answer', e);
        }
      }
    } catch (err) {
      console.error('[VC] answerCall error', err);
      cleanup();
    }
  }

  // convenience wrapper to answer the currently pending incoming without passing id
  async function answerIncoming(withVideo = true, deviceId = null) {
    const from = incomingSignal.current?.from;
    if (!from) return;
    await answerCall(from, withVideo, deviceId);
    incomingSignal.current = null;
    releaseIncomingLock();
  }

  // reject incoming call (callee or UI)
  function rejectCall() {
    const from = incomingSignal.current?.from;
    const fp = incomingSignal.current?.fingerprint;

    const payload = { to: from, from: currentUser?.id || null, fp, ts: Date.now() };
    console.log('[VC] rejectCall emitting payload:', payload);

    try {
      if (socket && from) socket.emit('call:reject', payload);
      if (socket && from) socket.emit('call:rejected', payload); // backup event name
    } catch (e) { console.warn('[VC] socket emit reject failed', e); }

    try {
      localStorage.setItem('vc_call_rejected', JSON.stringify({ from, fp, ts: Date.now() }));
    } catch (e) {}

    try {
      if (incomingWindowRef.current && !incomingWindowRef.current.closed) {
        incomingWindowRef.current.postMessage({ type: 'vc:reject', from, fp }, window.location.origin);
      }
    } catch (e) {}

    incomingSignal.current = null;
    releaseIncomingLock();
    setCallStatus('idle');
  }

  // BroadcastChannel listener
  useEffect(() => {
    const bc = bcRef.current;
    if (!bc) return;
    const handler = (ev) => {
      const msg = ev.data || {};
      if (msg?.type === 'incoming_handled' && msg?.payload?.tabId !== TAB_ID.current) {
        if (incomingWindowRef.current && !incomingWindowRef.current.closed) {
          try { incomingWindowRef.current.close(); } catch (e) {}
          incomingWindowRef.current = null;
        }
      }

      if (msg?.type === 'close_popup') {
        if (incomingWindowRef.current && !incomingWindowRef.current.closed) {
          try { incomingWindowRef.current.close(); } catch (e) {}
          incomingWindowRef.current = null;
        }
      }

      if (msg?.type === 'call_rejected' || msg?.type === 'call:rejected') {
        const payload = msg.payload || {};
        if (payload?.from && peerUserId.current === payload.from) {
          cleanup();
        }
        if (payload?.fp && incomingSignal.current?.fingerprint === payload.fp) {
          cleanup();
        }
      }
    };
    bc.addEventListener('message', handler);
    return () => {
      try { bc.removeEventListener('message', handler); } catch (e) {}
    };
  }, []);

  // storage listener
  useEffect(() => {
    const onStorage = (ev) => {
      try {
        if (!ev) return;
        if (ev.key === 'vc_call_rejected') {
          const payload = JSON.parse(ev.newValue || 'null');
          if (!payload) return;
          if (payload.from && peerUserId.current === payload.from) {
            cleanup();
          }
          if (payload.fp && incomingSignal.current?.fingerprint === payload.fp) {
            cleanup();
          }
        }
      } catch (e) {}
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // window message listener (popup -> opener)
  useEffect(() => {
    const onMessage = (ev) => {
      try {
        if (!ev) return;
        if (ev.origin !== window.location.origin) return;
        const d = ev.data || {};
        if (d?.type === 'vc:reject' || d?.type === 'vc:end') {
          cleanup();
        }
      } catch (e) {}
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  // socket listeners
  useEffect(() => {
    if (!socket) return;

    const recentFingerprints = new Set();
    const addFingerprint = (f) => {
      recentFingerprints.add(f);
      setTimeout(() => recentFingerprints.delete(f), 30_000);
    };

    const onIncoming = ({ from, signal, isVideo, fullName, profilePicture }) => {
      if (callStatusRef.current !== 'idle') {
        if (socket) socket.emit('call:reject', { to: from });
        return;
      }

      const fingerprint = makeFingerprint(from, signal);
      if (recentFingerprints.has(fingerprint)) return;
      addFingerprint(fingerprint);

      const acquired = tryAcquireIncomingLock(from, fingerprint);
      if (!acquired) return;

      incomingSignal.current = { from, signal, isVideo, fullName, profilePicture, fingerprint };

      try {
        sessionStorage.setItem(
          'vc_incoming',
          JSON.stringify({ from, signal, isVideo, fullName, profilePicture, fingerprint })
        );
      } catch (e) {}

      try {
        if (!incomingWindowRef.current || incomingWindowRef.current.closed) {
          incomingWindowRef.current = window.open(
            `/call-receiver?from=${encodeURIComponent(from)}&isVideo=${isVideo}&fullName=${encodeURIComponent(fullName || '')}&profilePicture=${encodeURIComponent(profilePicture || '')}&fp=${encodeURIComponent(fingerprint)}`,
            '_blank',
            'width=420,height=700'
          );

          if (bcRef.current) {
            bcRef.current.postMessage({
              type: 'incoming_handled',
              payload: { tabId: TAB_ID.current, from, fingerprint }
            });
          }

          const interval = setInterval(() => {
            if (!incomingWindowRef.current || incomingWindowRef.current.closed) {
              clearInterval(interval);
              incomingWindowRef.current = null;
              releaseIncomingLock();
            }
          }, 1000);
        } else {
          incomingWindowRef.current.focus();
        }

        setCallStatus('ringing');
      } catch (e) {
        console.error('[VC] open popup error', e);
        releaseIncomingLock();
        incomingSignal.current = null;
      }
    };

    const onSignal = (signal) => {
      try { if (peerRef.current) peerRef.current.signal(signal); } catch (e) { console.error('[VC] onSignal error', e); }
    };

    const onAccepted = ({ from }) => {
      if (peerUserId.current === from) setCallStatus('in-progress');
      releaseIncomingLock();
    };

    const onEnded = () => {
      cleanup();
    };

    const onReject = (payload) => {
      if (payload === undefined || payload === null) {
        if (callStatusRef.current === 'calling' || peerUserId.current) {
          cleanup();
          return;
        }
      }

      let fromId = null;
      try {
        if (typeof payload === 'string') fromId = payload;
        else if (payload) fromId = payload.from || payload.to || payload.caller || payload.callee || payload.user || payload?.data?.from || null;
      } catch (e) {}

      if (fromId && peerUserId.current === fromId) {
        cleanup();
        return;
      }

      if (payload?.fp && incomingSignal.current?.fingerprint === payload.fp) {
        cleanup();
        return;
      }

      if (payload === 'rejected' || payload?.status === 'rejected' || payload?.action === 'reject' || payload?.action === 'end') {
        cleanup();
        return;
      }

      if (payload?.to && peerUserId.current === payload.to) {
        cleanup();
        return;
      }
    };

    const onCallStarted = (payload) => {
      if (!payload) return;
      if (payload.startedAt) {
        setCallStartedAt(payload.startedAt);
        startedEmittedRef.current = true;
      } else {
        setCallStartedAt(Date.now());
      }
      if (callStatusRef.current !== 'in-progress') setCallStatus('in-progress');
    };

    socket.on('call:incoming', onIncoming);
    socket.on('call:signal', onSignal);
    socket.on('call:accepted', onAccepted);
    socket.on('call:ended', onEnded);

    socket.on('call:reject', onReject);
    socket.on('call:rejected', onReject);
    socket.on('call:decline', onReject);
    socket.on('call:rejected_by_user', onReject);

    socket.on('call:started', onCallStarted);

    return () => {
      socket.off('call:incoming', onIncoming);
      socket.off('call:signal', onSignal);
      socket.off('call:accepted', onAccepted);
      socket.off('call:ended', onEnded);
      socket.off('call:reject', onReject);
      socket.off('call:rejected', onReject);
      socket.off('call:decline', onReject);
      socket.off('call:rejected_by_user', onReject);
      socket.off('call:started', onCallStarted);
      releaseIncomingLock();
    };
  }, [socket]);

  useEffect(() => { callStatusRef.current = callStatus; }, [callStatus]);

  useEffect(() => {
    return () => {
      if (bcRef.current) {
        try { bcRef.current.close(); } catch (e) {}
        bcRef.current = null;
      }
      releaseIncomingLock();
    };
  }, []);

  function getCallFrom() {
    return incomingSignal.current?.from || peerUserId.current || null;
  }
function getIsVideoCall() {
  if (incomingSignal.current?.isVideo !== undefined) return incomingSignal.current.isVideo;
  if (callTypeRef.current !== null) return callTypeRef.current === 'video';
  return null;
}

console.log(incomingSignal.current,"incomingSignal.current");

  return (
    <VideoCallContext.Provider
      value={{
        startCall,
        answerCall,
        answerIncoming,
        rejectCall,
        endCall,
        callStatus,
        localStream,
        remoteStream,
        callFrom: getCallFrom(),
        callFromName: incomingSignal.current?.fullName || null,
        callFromPicture: incomingSignal.current?.profilePicture || null,
        isVideoCall: getIsVideoCall(),
        _incomingSignalRef: incomingSignal,
        callStartedAt,
        showPostCallDialog,
    setShowPostCallDialog,
    candidateToRate,   // 👈 expose
    setCandidateToRate
      }}
    >
      {children}
    </VideoCallContext.Provider>
  );
}
export function useVideoCall() {
  const ctx = useContext(VideoCallContext);
  if (!ctx) throw new Error('useVideoCall must be inside VideoCallProvider');
  return ctx;
}
