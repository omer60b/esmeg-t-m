import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  MonitorUp, 
  MonitorOff, 
  MessageSquare, 
  Users, 
  Settings, 
  ShieldCheck, 
  Share2, 
  PhoneOff, 
  Smile, 
  Hand, 
  Sparkles, 
  Copy, 
  Check, 
  Maximize2, 
  Minimize2, 
  LayoutGrid, 
  User, 
  Volume2, 
  VolumeX, 
  MoreVertical, 
  X, 
  Send, 
  PenTool, 
  Eraser, 
  RotateCcw, 
  Download, 
  Info, 
  ShieldAlert, 
  Plus, 
  Building2, 
  Radio, 
  CheckCircle2, 
  AlertCircle,
  Pin
} from 'lucide-react';
import { Branch, MeetingParticipant, MeetingChatMessage, MeetingRoom } from '../types';
import { 
  DEFAULT_MEETING_ID, 
  generateMeetingCode, 
  getAvatarColor, 
  getInitials,
  createOrGetMeetingRoom,
  subscribeToMeetingRoom,
  joinMeetingParticipant,
  updateParticipantStatus,
  leaveMeetingParticipant,
  subscribeToParticipants,
  pingParticipant,
  purgeStaleAndTestParticipants,
  sendMeetingChatMessage,
  subscribeToMeetingChat,
  updateMeetingWhiteboard,
  endMeetingForAll,
  setAllParticipantsAudioMuted,
  recordAttendanceLog,
  updateAttendanceLogOnLeave,
  sendWebRTCSignal,
  subscribeToWebRTCSignals,
  purgeOldWebRTCSignals
} from '../services/meetingService';

interface ZoomMeetingRoomProps {
  currentBranchId: number;
  currentPersonnel: string;
  branches: Branch[];
  isAdmin: boolean;
  appTheme?: 'sepia' | 'light' | 'dark';
  initialMeetingId?: string;
}

// Google STUN Servers for robust peer-to-peer WebRTC traversal
const RTC_ICE_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' }
  ],
  iceCandidatePoolSize: 10
};

interface RemoteVideoPlayerProps {
  participant: MeetingParticipant;
  stream?: MediaStream;
  isSpeaking?: boolean;
  isFeatured?: boolean;
  onPin?: () => void;
  isPinned?: boolean;
}

/**
 * Dedicated Remote Video & Audio Player
 * Ensures remote video is visible when camera is on, and audio is always streamed through speakers
 */
const RemoteVideoPlayer: React.FC<RemoteVideoPlayerProps> = ({
  participant,
  stream,
  isSpeaking = false,
  isFeatured = false
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [hasLiveVideo, setHasLiveVideo] = useState(false);

  useEffect(() => {
    if (stream) {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      if (audioRef.current) {
        audioRef.current.srcObject = stream;
        audioRef.current.play().catch(() => {});
      }

      const checkTracks = () => {
        const vTracks = stream.getVideoTracks();
        const hasActive = vTracks.length > 0 && vTracks.some(t => t.enabled && t.readyState === 'live');
        setHasLiveVideo(hasActive);
      };

      checkTracks();
      stream.addEventListener('addtrack', checkTracks);
      stream.addEventListener('removetrack', checkTracks);
      return () => {
        stream.removeEventListener('addtrack', checkTracks);
        stream.removeEventListener('removetrack', checkTracks);
      };
    } else {
      setHasLiveVideo(false);
    }
  }, [stream]);

  // Audio mute sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = !!participant.isAudioMuted;
    }
    if (videoRef.current) {
      videoRef.current.muted = !!participant.isAudioMuted;
    }
  }, [participant.isAudioMuted]);

  const showVideo = !participant.isVideoOff && stream && hasLiveVideo;

  return (
    <div className="w-full h-full relative flex items-center justify-center overflow-hidden bg-[#181818]">
      {/* Explicit Audio Element ensuring remote sound is always output through speakers */}
      <audio
        ref={audioRef}
        autoPlay
        playsInline
        muted={!!participant.isAudioMuted}
      />

      {/* Real Live WebRTC Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={!!participant.isAudioMuted}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          showVideo ? 'opacity-100 block' : 'opacity-0 pointer-events-none absolute'
        }`}
      />

      {/* When video is off by participant or establishing connection, display avatar */}
      {!showVideo && (
        <div className="flex flex-col items-center justify-center gap-2.5 select-none z-10 px-4 text-center">
          <div className={`${isFeatured ? 'w-28 sm:w-36 h-28 sm:h-36 text-4xl sm:text-5xl ring-8 ring-white/10' : 'w-18 sm:w-22 h-18 sm:h-22 text-2xl sm:text-3xl ring-4 ring-black/40'} rounded-full bg-gradient-to-br ${participant.avatarColor || getAvatarColor(participant.name)} flex items-center justify-center text-white font-black shadow-2xl`}>
            {getInitials(participant.name)}
          </div>
          <div>
            <span className={`${isFeatured ? 'text-base sm:text-lg' : 'text-xs sm:text-sm'} font-extrabold text-white block truncate max-w-[220px]`}>
              {participant.name}
            </span>
            <span className="text-[11px] text-slate-400 font-medium block">
              {participant.branchName}
            </span>
            {participant.isVideoOff ? (
              <span className="text-[10px] text-slate-400 bg-black/60 px-2 py-0.5 rounded-full mt-1.5 inline-block border border-white/10">
                Kamera Kapalı
              </span>
            ) : !stream ? (
              <span className="text-[10px] text-emerald-400 bg-emerald-950/70 border border-emerald-700/60 px-2.5 py-0.5 rounded-full mt-1.5 inline-flex items-center gap-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Bağlantı Kuruluyor...
              </span>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export const ZoomMeetingRoom: React.FC<ZoomMeetingRoomProps> = ({
  currentBranchId,
  currentPersonnel,
  branches,
  isAdmin,
  appTheme = 'sepia',
  initialMeetingId
}) => {
  // Session / Room identifiers
  const [meetingCode, setMeetingCode] = useState<string>(() => {
    // Check URL search param first, then initialMeetingId, then default
    const urlParams = new URLSearchParams(window.location.search);
    const fromUrl = urlParams.get('meeting');
    return fromUrl || initialMeetingId || 'ESME-GENEL-TOPLANTI';
  });

  const currentBranch = branches.find(b => b.id === currentBranchId) || branches[0] || { id: 10, name: 'Güneşli Mağazası', code: 'M10' };

  // Lobby vs Active Meeting state
  const [isInMeeting, setIsInMeeting] = useState(false);
  const [displayName, setDisplayName] = useState<string>(currentPersonnel || `${currentBranch.name} Temsilcisi`);
  const [selectedBranchId, setSelectedBranchId] = useState<number>(currentBranchId);
  
  // Media states
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isVirtualBlur, setIsVirtualBlur] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isPinned, setIsPinned] = useState<string | null>(null);
  
  // Meeting metadata from Firestore
  const [meetingRoom, setMeetingRoom] = useState<MeetingRoom | null>(null);
  const [participants, setParticipants] = useState<MeetingParticipant[]>([]);
  const [chatMessages, setChatMessages] = useState<MeetingChatMessage[]>([]);
  
  // Active UI Drawers & Panels
  const [activeSidePanel, setActiveSidePanel] = useState<'none' | 'chat' | 'participants'>('none');
  const [showSecurityPopover, setShowSecurityPopover] = useState(false);
  const [showMeetingInfoPopover, setShowMeetingInfoPopover] = useState(false);
  const [showReactionsPopover, setShowReactionsPopover] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'speaker'>('grid');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Floating reaction badges
  const [floatingReactions, setFloatingReactions] = useState<{ id: string; emoji: string; sender: string; x: number }[]>([]);

  // Chat input
  const [chatInputText, setChatInputText] = useState('');
  const [chatRecipient, setChatRecipient] = useState<string>('everyone');
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  // Active Speaker & Audio Level (Web Audio API)
  const [localAudioLevel, setLocalAudioLevel] = useState(0);
  const [activeSpeakerId, setActiveSpeakerId] = useState<string>('local');
  const [autoSpeakerSwitch, setAutoSpeakerSwitch] = useState<boolean>(true);

  // Media Stream references
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenShareVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // WebRTC Peer Connections and Remote Media Streams
  const peerConnectionsRef = useRef<{ [peerId: string]: RTCPeerConnection }>({});
  const pendingCandidatesRef = useRef<{ [peerId: string]: RTCIceCandidateInit[] }>({});
  const [remoteStreams, setRemoteStreams] = useState<{ [peerId: string]: MediaStream }>({});

  // Whiteboard canvas references
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const [penColor, setPenColor] = useState('#ef4444');
  const [penSize, setPenSize] = useState(3);
  const [isEraser, setIsEraser] = useState(false);

  // Participant unique session ID for this browser tab
  const localParticipantId = useRef<string>(
    'p_' + Math.random().toString(36).substring(2, 9)
  ).current;

  // Attendance log reference for manager reporting
  const attendanceLogIdRef = useRef<string | null>(null);
  const attendanceJoinedAtRef = useRef<string>(new Date().toISOString());

  // WebRTC helper: Create and configure Peer Connection
  const createPeerConnection = useCallback((remotePeerId: string, isInitiator: boolean) => {
    if (peerConnectionsRef.current[remotePeerId]) {
      return peerConnectionsRef.current[remotePeerId];
    }

    const pc = new RTCPeerConnection(RTC_ICE_CONFIG);
    peerConnectionsRef.current[remotePeerId] = pc;

    // Attach local audio and video tracks if available
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        try {
          pc.addTrack(track, localStreamRef.current!);
        } catch {}
      });
    }

    // Send generated ICE candidates to remote peer via Firestore
    pc.onicecandidate = (event) => {
      if (event.candidate && meetingCode) {
        sendWebRTCSignal(
          meetingCode,
          localParticipantId,
          remotePeerId,
          'candidate',
          JSON.stringify(event.candidate.toJSON())
        ).catch(() => {});
      }
    };

    // Receive remote media tracks (Audio and Video)
    pc.ontrack = (event) => {
      const incomingStream = event.streams[0] || new MediaStream([event.track]);
      setRemoteStreams(prev => {
        const existing = prev[remotePeerId];
        if (existing) {
          if (!existing.getTracks().some(t => t.id === event.track.id)) {
            existing.addTrack(event.track);
          }
          return { ...prev, [remotePeerId]: existing };
        }
        return { ...prev, [remotePeerId]: incomingStream };
      });
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'closed' || pc.connectionState === 'failed') {
        setRemoteStreams(prev => {
          const next = { ...prev };
          delete next[remotePeerId];
          return next;
        });
      }
    };

    return pc;
  }, [meetingCode, localParticipantId]);

  // WebRTC Signal Dispatcher (Offer, Answer, Candidate)
  const handleIncomingSignal = useCallback(async (signal: { senderId: string; receiverId: string; type: string; payload: string }) => {
    const { senderId, type, payload } = signal;
    if (!payload || !meetingCode) return;

    try {
      if (type === 'offer') {
        const offerData = JSON.parse(payload);
        const pc = createPeerConnection(senderId, false);
        await pc.setRemoteDescription(new RTCSessionDescription(offerData));

        // Flush any candidates received prior to remote description
        if (pendingCandidatesRef.current[senderId]) {
          for (const cand of pendingCandidatesRef.current[senderId]) {
            await pc.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
          }
          delete pendingCandidatesRef.current[senderId];
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        await sendWebRTCSignal(
          meetingCode,
          localParticipantId,
          senderId,
          'answer',
          JSON.stringify(answer)
        );
      } else if (type === 'answer') {
        const answerData = JSON.parse(payload);
        const pc = peerConnectionsRef.current[senderId];
        if (pc && pc.signalingState === 'have-local-offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(answerData));
          if (pendingCandidatesRef.current[senderId]) {
            for (const cand of pendingCandidatesRef.current[senderId]) {
              await pc.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
            }
            delete pendingCandidatesRef.current[senderId];
          }
        }
      } else if (type === 'candidate') {
        const candidateData = JSON.parse(payload);
        const pc = peerConnectionsRef.current[senderId];
        if (pc && pc.remoteDescription && pc.remoteDescription.type) {
          await pc.addIceCandidate(new RTCIceCandidate(candidateData)).catch(() => {});
        } else {
          if (!pendingCandidatesRef.current[senderId]) {
            pendingCandidatesRef.current[senderId] = [];
          }
          pendingCandidatesRef.current[senderId].push(candidateData);
        }
      }
    } catch (err) {
      console.warn("Signal processing warning:", err);
    }
  }, [meetingCode, localParticipantId, createPeerConnection]);

  // Initialize camera and microphone in Lobby
  const initLocalMedia = useCallback(async () => {
    try {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: { echoCancellation: true, noiseSuppression: true }
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // If peer connections exist, attach or replace tracks
      Object.values(peerConnectionsRef.current).forEach(pc => {
        stream.getTracks().forEach(track => {
          const senders = pc.getSenders();
          const existing = senders.find(s => s.track && s.track.kind === track.kind);
          if (existing) {
            existing.replaceTrack(track).catch(() => {});
          } else {
            try { pc.addTrack(track, stream); } catch {}
          }
        });
      });

      // Web Audio API for speaking detection
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        audioContextRef.current = audioCtx;
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const checkAudio = () => {
          if (!analyserRef.current || isAudioMuted) {
            setLocalAudioLevel(0);
            return;
          }
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;
          setLocalAudioLevel(average);

          if (average > 25) {
            setActiveSpeakerId(localParticipantId);
          }
          requestAnimationFrame(checkAudio);
        };
        checkAudio();
      } catch (audioErr) {
        console.warn("Audio meter init error:", audioErr);
      }

    } catch (err) {
      console.warn("Camera or microphone permission not granted or unavailable, falling back to simulated audio/video:", err);
      // Graceful fallback: Video off by default
      setIsVideoOff(true);
    }
  }, [isAudioMuted, localParticipantId]);

  // Initial lobby media boot
  useEffect(() => {
    initLocalMedia();

    return () => {
      if (attendanceLogIdRef.current) {
        updateAttendanceLogOnLeave(attendanceLogIdRef.current, attendanceJoinedAtRef.current).catch(() => {});
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [initLocalMedia]);

  // Listen to Firestore meeting room, participants, and chat when inside a meeting
  useEffect(() => {
    if (!isInMeeting || !meetingCode) return;

    // Purge old stale or test records when entering
    purgeStaleAndTestParticipants(meetingCode);
    purgeOldWebRTCSignals(meetingCode);

    const unsubRoom = subscribeToMeetingRoom(meetingCode, (room) => {
      if (room) {
        setMeetingRoom(room);
        if (room.status === 'ended') {
          alert('Toplantı ev sahibi tarafından sonlandırıldı.');
          handleLeaveMeeting();
        }
      }
    });

    const unsubParticipants = subscribeToParticipants(meetingCode, (list) => {
      setParticipants(list);
      // Synchronize hardware mic if host muted or unmuted me remotely
      const myDoc = list.find(p => p.id === localParticipantId);
      if (myDoc && typeof myDoc.isAudioMuted === 'boolean') {
        setIsAudioMuted((prev) => {
          if (prev !== myDoc.isAudioMuted) {
            if (localStreamRef.current) {
              localStreamRef.current.getAudioTracks().forEach(t => {
                t.enabled = !myDoc.isAudioMuted;
              });
            }
            return myDoc.isAudioMuted;
          }
          return prev;
        });
      }
    });

    const unsubChat = subscribeToMeetingChat(meetingCode, (messages) => {
      setChatMessages(messages);
      if (activeSidePanel !== 'chat' && messages.length > 0) {
        setUnreadChatCount(prev => prev + 1);
      }
    });

    // Subscribe to WebRTC signaling for peer audio & video streaming
    const unsubSignals = subscribeToWebRTCSignals(meetingCode, localParticipantId, (signal) => {
      handleIncomingSignal(signal);
    });

    // Send active presence heartbeat every 6 seconds
    const pingInterval = setInterval(() => {
      pingParticipant(meetingCode, localParticipantId);
    }, 6000);

    // Auto-remove participant if browser tab is closed, refreshed, or navigated away
    const handleUnload = () => {
      leaveMeetingParticipant(meetingCode, localParticipantId);
    };
    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);

    return () => {
      clearInterval(pingInterval);
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
      leaveMeetingParticipant(meetingCode, localParticipantId);
      unsubRoom();
      unsubParticipants();
      unsubChat();
      unsubSignals();

      // Close all active peer connections
      Object.values(peerConnectionsRef.current).forEach(pc => {
        try { pc.close(); } catch {}
      });
      peerConnectionsRef.current = {};
      setRemoteStreams({});
    };
  }, [isInMeeting, meetingCode, activeSidePanel, localParticipantId, handleIncomingSignal]);

  // Synchronize WebRTC peer connections with remote participants
  useEffect(() => {
    if (!isInMeeting || !meetingCode) return;

    const remotes = participants.filter(p => 
      p.id !== localParticipantId && 
      !p.id.startsWith('test_') && 
      !p.name.toLowerCase().includes('test')
    );

    const remoteIds = new Set(remotes.map(p => p.id));

    // Connect to newly joined participants
    remotes.forEach(p => {
      if (!peerConnectionsRef.current[p.id]) {
        const shouldInitiate = localParticipantId > p.id;
        const pc = createPeerConnection(p.id, shouldInitiate);
        if (shouldInitiate) {
          pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true })
            .then(offer => pc.setLocalDescription(offer))
            .then(() => {
              if (pc.localDescription) {
                sendWebRTCSignal(
                  meetingCode,
                  localParticipantId,
                  p.id,
                  'offer',
                  JSON.stringify(pc.localDescription)
                ).catch(() => {});
              }
            })
            .catch(err => console.warn('WebRTC offer error:', err));
        }
      }
    });

    // Clean up connections for participants that have left
    Object.keys(peerConnectionsRef.current).forEach(peerId => {
      if (!remoteIds.has(peerId)) {
        try {
          peerConnectionsRef.current[peerId].close();
        } catch {}
        delete peerConnectionsRef.current[peerId];
        setRemoteStreams(prev => {
          const next = { ...prev };
          delete next[peerId];
          return next;
        });
      }
    });
  }, [participants, isInMeeting, meetingCode, localParticipantId, createPeerConnection]);

  // Handle Join Meeting (Immediate Optimistic Room Entry)
  const handleJoinMeeting = () => {
    try {
      const finalBranch = branches.find(b => b.id === selectedBranchId) || currentBranch || { id: 10, name: 'Güneşli Mağazası', code: 'M10' };
      const cleanCode = (meetingCode?.trim() || DEFAULT_MEETING_ID).toUpperCase();
      setMeetingCode(cleanCode);

      const safeDisplayName = displayName?.trim() || `${finalBranch.name} Sorumlusu`;
      setDisplayName(safeDisplayName);

      const initialRoom: MeetingRoom = {
        id: cleanCode.toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
        title: `${cleanCode} — ESME Koordinasyon ve Eğitim Toplantısı`,
        hostName: safeDisplayName,
        hostBranchId: finalBranch.id,
        hostBranchName: finalBranch.name,
        passcode: '',
        status: 'active',
        createdAt: new Date().toISOString(),
        allowScreenShare: true
      };

      // 1. INSTANT ROOM ENTRY: The user immediately sees the room UI
      setMeetingRoom(initialRoom);
      setIsInMeeting(true);

      // 2. Prepare local participant payload
      const participant: MeetingParticipant = {
        id: localParticipantId,
        name: safeDisplayName,
        branchName: finalBranch.name,
        branchId: finalBranch.id,
        role: isAdmin ? 'host' : 'participant',
        isAudioMuted,
        isVideoOff,
        isHandRaised: false,
        isScreenSharing: false,
        joinedAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        avatarColor: getAvatarColor(safeDisplayName)
      };

      // 3. Background Non-Blocking Firestore Sync
      createOrGetMeetingRoom(
        cleanCode,
        `${cleanCode} — ESME Koordinasyon ve Eğitim Toplantısı`,
        safeDisplayName,
        finalBranch.id,
        finalBranch.name
      ).then(room => {
        if (room) setMeetingRoom(room);
      }).catch(err => {
        console.warn("createOrGetMeetingRoom background sync warning:", err);
      });

      joinMeetingParticipant(cleanCode, participant).catch(err => {
        console.warn("joinMeetingParticipant background sync warning:", err);
      });

      // Attendance log for reporting
      const nowIso = new Date().toISOString();
      attendanceJoinedAtRef.current = nowIso;
      recordAttendanceLog(cleanCode, participant, initialRoom.title).then(logId => {
        attendanceLogIdRef.current = logId;
      }).catch(() => {});

      // 4. Ensure local video attachment
      setTimeout(() => {
        if (localVideoRef.current && localStreamRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
          localVideoRef.current.play().catch(() => {});
        }
      }, 50);
      setTimeout(() => {
        if (localVideoRef.current && localStreamRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
          localVideoRef.current.play().catch(() => {});
        }
      }, 250);
    } catch (joinError) {
      console.warn("handleJoinMeeting resilient recovery:", joinError);
      setIsInMeeting(true);
    }
  };

  // Re-bind local video stream whenever meeting or viewMode changes
  useEffect(() => {
    if (isInMeeting && localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
      localVideoRef.current.play().catch(() => {});
    }
  }, [isInMeeting, viewMode, isVideoOff]);

  // Handle Leave Meeting
  const handleLeaveMeeting = async () => {
    // Complete attendance record
    if (attendanceLogIdRef.current) {
      await updateAttendanceLogOnLeave(attendanceLogIdRef.current, attendanceJoinedAtRef.current);
      attendanceLogIdRef.current = null;
    }

    if (meetingCode && localParticipantId) {
      await leaveMeetingParticipant(meetingCode, localParticipantId);
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
      setIsScreenSharing(false);
    }

    // Close all WebRTC peer connections
    Object.values(peerConnectionsRef.current).forEach(pc => {
      try { pc.close(); } catch {}
    });
    peerConnectionsRef.current = {};
    setRemoteStreams({});

    setIsInMeeting(false);
    setActiveSidePanel('none');
    setShowWhiteboard(false);
  };

  // Handle End for All (Host only)
  const handleEndForAll = async () => {
    if (confirm('Toplantıyı tüm katılımcılar için sonlandırmak istediğinizden emin misiniz?')) {
      await endMeetingForAll(meetingCode);
      handleLeaveMeeting();
    }
  };

  // Toggle Audio (Mute / Unmute)
  const toggleAudio = async () => {
    const nextState = !isAudioMuted;
    setIsAudioMuted(nextState);

    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !nextState;
      });
    }

    if (isInMeeting && meetingCode) {
      await updateParticipantStatus(meetingCode, localParticipantId, {
        isAudioMuted: nextState
      });
    }
  };

  // Toggle Video (Camera On / Off)
  const toggleVideo = async () => {
    const nextState = !isVideoOff;
    setIsVideoOff(nextState);

    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !nextState;
      });
    }

    if (isInMeeting && meetingCode) {
      await updateParticipantStatus(meetingCode, localParticipantId, {
        isVideoOff: nextState
      });
    }
  };

  // Toggle Screen Sharing
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop sharing
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
        screenStreamRef.current = null;
      }
      setIsScreenSharing(false);

      // Revert video tracks back to camera on all peer connections
      const cameraTrack = localStreamRef.current?.getVideoTracks()[0] || null;
      Object.values(peerConnectionsRef.current).forEach(pc => {
        const senders = pc.getSenders();
        const videoSender = senders.find(s => s.track && s.track.kind === 'video');
        if (videoSender && cameraTrack) {
          videoSender.replaceTrack(cameraTrack).catch(() => {});
        }
      });

      if (isInMeeting && meetingCode) {
        await updateParticipantStatus(meetingCode, localParticipantId, {
          isScreenSharing: false
        });
      }
    } else {
      // Start sharing
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });

        screenStreamRef.current = stream;
        setIsScreenSharing(true);

        const screenTrack = stream.getVideoTracks()[0];
        // Stream screen track to all connected peers
        Object.values(peerConnectionsRef.current).forEach(pc => {
          const senders = pc.getSenders();
          const videoSender = senders.find(s => s.track && s.track.kind === 'video');
          if (videoSender && screenTrack) {
            videoSender.replaceTrack(screenTrack).catch(() => {});
          }
        });

        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          const cameraTrack = localStreamRef.current?.getVideoTracks()[0] || null;
          Object.values(peerConnectionsRef.current).forEach(pc => {
            const senders = pc.getSenders();
            const videoSender = senders.find(s => s.track && s.track.kind === 'video');
            if (videoSender && cameraTrack) {
              videoSender.replaceTrack(cameraTrack).catch(() => {});
            }
          });
          if (isInMeeting && meetingCode) {
            updateParticipantStatus(meetingCode, localParticipantId, {
              isScreenSharing: false
            });
          }
        };

        if (screenShareVideoRef.current) {
          screenShareVideoRef.current.srcObject = stream;
          screenShareVideoRef.current.play().catch(() => {});
        }

        if (isInMeeting && meetingCode) {
          await updateParticipantStatus(meetingCode, localParticipantId, {
            isScreenSharing: true
          });
        }
      } catch (err) {
        console.warn("Screen share cancelled or not allowed:", err);
      }
    }
  };

  // Toggle Hand Raise
  const toggleHandRaise = async () => {
    const nextState = !isHandRaised;
    setIsHandRaised(nextState);

    if (isInMeeting && meetingCode) {
      await updateParticipantStatus(meetingCode, localParticipantId, {
        isHandRaised: nextState
      });
    }

    if (nextState) {
      triggerReaction('✋');
    }
  };

  // Trigger Reaction Emoji
  const triggerReaction = (emoji: string) => {
    const newReaction = {
      id: Math.random().toString(),
      emoji,
      sender: displayName,
      x: 30 + Math.random() * 40
    };

    setFloatingReactions(prev => [...prev, newReaction]);
    setShowReactionsPopover(false);

    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== newReaction.id));
    }, 3500);
  };

  // Copy Meeting Invite Link
  const copyMeetingLink = () => {
    const currentOrigin = window.location.origin;
    const currentPath = window.location.pathname;
    const inviteUrl = `${currentOrigin}${currentPath}?meeting=${meetingCode}`;
    
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }).catch(() => {
      // Fallback
      prompt('Toplantı davet bağlantısı:', inviteUrl);
    });
  };

  // Send In-Meeting Chat
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim() || !meetingCode) return;

    const finalBranch = branches.find(b => b.id === selectedBranchId) || currentBranch;
    await sendMeetingChatMessage(meetingCode, {
      senderId: localParticipantId,
      senderName: displayName,
      senderBranch: finalBranch.name,
      text: chatInputText.trim(),
      target: chatRecipient
    });

    setChatInputText('');
  };

  // Host / Admin: Mute All Participants
  const handleMuteAll = async () => {
    if (!isAdmin && meetingRoom?.hostName !== displayName) return;
    await setAllParticipantsAudioMuted(meetingCode, true);
    setIsAudioMuted(true);
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(t => t.enabled = false);
    }
  };

  // Host / Admin: Unmute All Participants
  const handleUnmuteAll = async () => {
    if (!isAdmin && meetingRoom?.hostName !== displayName) return;
    await setAllParticipantsAudioMuted(meetingCode, false);
    setIsAudioMuted(false);
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(t => t.enabled = true);
    }
  };

  // Host / Admin: Toggle single participant's audio
  const handleToggleParticipantMute = async (targetId: string, currentMuted: boolean) => {
    if (!isAdmin && meetingRoom?.hostName !== displayName) return;
    if (targetId === localParticipantId) {
      toggleAudio();
      return;
    }
    await updateParticipantStatus(meetingCode, targetId, { isAudioMuted: !currentMuted });
  };

  // All participants to render (real connected participants only)
  const allParticipants: MeetingParticipant[] = React.useMemo(() => {
    const finalBranch = branches.find(b => b.id === selectedBranchId) || currentBranch;
    const localP: MeetingParticipant = {
      id: localParticipantId,
      name: `${displayName} (Siz)`,
      branchName: finalBranch.name,
      branchId: finalBranch.id,
      role: isAdmin || meetingRoom?.hostName === displayName ? 'host' : 'participant',
      isAudioMuted,
      isVideoOff,
      isHandRaised,
      isScreenSharing,
      joinedAt: '',
      avatarColor: getAvatarColor(displayName)
    };

    // Only genuine live remote participants: exclude self, test records, and stale users
    const remotes = participants.filter(p => 
      p.id !== localParticipantId && 
      !p.id.startsWith('test_') && 
      !p.name.toLowerCase().includes('test')
    );
    return [localP, ...remotes];
  }, [
    displayName, 
    branches, 
    selectedBranchId, 
    currentBranch, 
    localParticipantId, 
    isAdmin, 
    meetingRoom?.hostName, 
    isAudioMuted, 
    isVideoOff, 
    isHandRaised, 
    isScreenSharing, 
    participants
  ]);

  // Active Featured Speaker for Speaker Mode (Tek Ekran Görünümü)
  const featuredSpeaker = React.useMemo(() => {
    if (isPinned) {
      const p = allParticipants.find(item => item.id === isPinned);
      if (p) return p;
    }
    if (activeSpeakerId) {
      const p = allParticipants.find(item => item.id === activeSpeakerId);
      if (p) return p;
    }
    return allParticipants.find(p => !p.isAudioMuted) || allParticipants[0] || null;
  }, [isPinned, activeSpeakerId, allParticipants]);

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Grid columns calculator for video stage - maintains 16:9 aspect ratio and stable boxes as users join
  const getGridClass = (count: number) => {
    if (count <= 1) return 'grid-cols-1 max-w-4xl w-full mx-auto';
    if (count === 2) return 'grid-cols-1 sm:grid-cols-2 max-w-5xl w-full mx-auto';
    if (count <= 4) return 'grid-cols-1 sm:grid-cols-2 max-w-5xl w-full mx-auto';
    if (count <= 6) return 'grid-cols-2 lg:grid-cols-3 max-w-6xl w-full mx-auto';
    if (count <= 9) return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-3 max-w-6xl w-full mx-auto';
    return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 max-w-7xl w-full mx-auto';
  };

  const getTileMaxHeight = (count: number) => {
    if (count <= 1) return 'max-h-[66vh]';
    if (count <= 2) return 'max-h-[58vh]';
    if (count <= 4) return 'max-h-[36vh]';
    if (count <= 6) return 'max-h-[29vh]';
    if (count <= 9) return 'max-h-[24vh]';
    return 'max-h-[20vh]';
  };

  // =========================================================================
  // RENDER 1: ZOOM PRE-JOIN LOBBY / BEKLEME ODASI
  // =========================================================================
  if (!isInMeeting) {
    return (
      <div className="min-h-[82vh] flex items-center justify-center p-2.5 sm:p-6 bg-slate-950 text-slate-100 font-sans">
        <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-4 sm:p-8 flex flex-col md:flex-row gap-6 sm:gap-8 items-center">
          
          {/* Left: Camera & Microphone Preview Tile */}
          <div className="w-full md:w-1/2 flex flex-col items-center">
            <div className="relative w-full aspect-video bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 shadow-inner flex items-center justify-center">
              
              {/* Local video feed */}
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transform -scale-x-100 transition-all ${
                  isVideoOff ? 'hidden' : 'block'
                } ${isVirtualBlur ? 'blur-sm' : ''}`}
              />

              {/* Camera Off Avatar */}
              {isVideoOff && (
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getAvatarColor(displayName)} flex items-center justify-center text-white text-3xl font-black shadow-xl ring-4 ring-slate-800`}>
                    {getInitials(displayName)}
                  </div>
                  <span className="text-xs text-slate-400 font-medium">Kamera Kapalı</span>
                </div>
              )}

              {/* Status indicators over video */}
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-2 text-white">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Önizleme</span>
              </div>

              {/* Audio meter bar */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                <span className="text-xs font-semibold truncate max-w-[150px]">{displayName}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden flex">
                    <div 
                      className={`h-full transition-all duration-75 ${isAudioMuted ? 'bg-red-500 w-0' : 'bg-emerald-500'}`}
                      style={{ width: isAudioMuted ? '0%' : `${Math.min(100, localAudioLevel * 2)}%` }}
                    />
                  </div>
                  {isAudioMuted ? (
                    <MicOff className="w-4 h-4 text-rose-500" />
                  ) : (
                    <Mic className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Quick Media Controls for Lobby */}
            <div className="flex items-center gap-3 mt-4">
              <button
                type="button"
                onClick={toggleAudio}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                  isAudioMuted 
                    ? 'bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600/30' 
                    : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
                }`}
              >
                {isAudioMuted ? <MicOff className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4 text-emerald-400" />}
                <span>{isAudioMuted ? 'Mikrofonu Aç' : 'Mikrofon Açık'}</span>
              </button>

              <button
                type="button"
                onClick={toggleVideo}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                  isVideoOff 
                    ? 'bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600/30' 
                    : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
                }`}
              >
                {isVideoOff ? <VideoOff className="w-4 h-4 text-rose-400" /> : <Video className="w-4 h-4 text-sky-400" />}
                <span>{isVideoOff ? 'Kamerayı Başlat' : 'Kamera Açık'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsVirtualBlur(!isVirtualBlur)}
                className={`p-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                  isVirtualBlur 
                    ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/40' 
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
                title="Arka Planı Bulanıklaştır (Blur)"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right: Join Configuration Box (Zoom Style) */}
          <div className="w-full md:w-1/2 flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 font-black">
                  <Video className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                    ESME Canlı Toplantı Odası
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">
                      Canlı Toplantı
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Sesli, görüntülü ve ekran paylaşımlı interaktif toplantı odası
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3.5 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              
              {/* Meeting Code / ID */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Toplantı Kimliği / Oda Kodu:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={meetingCode}
                    onChange={(e) => setMeetingCode(e.target.value.toUpperCase())}
                    placeholder="Örn: ESME-482-910"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-wide"
                  />
                  <button
                    type="button"
                    onClick={() => setMeetingCode(generateMeetingCode())}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 transition cursor-pointer"
                    title="Yeni Oda Kodu Oluştur"
                  >
                    Yeni Kod
                  </button>
                </div>
              </div>

              {/* Display Name */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Katılımcı Adı Soyadı:
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Adınız ve Soyadınız"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Branch Selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center justify-between">
                  <span>Mağaza / Birim:</span>
                  <span className="text-[10px] text-slate-500 font-normal">({branches.length} Mağaza)</span>
                </label>
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} — {b.city || 'Merkez'} ({b.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Invite Link Sharing Box */}
              <div className="p-2.5 rounded-xl bg-blue-950/30 border border-blue-900/40 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Share2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="text-[11px] text-blue-200 truncate">
                    Davet Linki: ?meeting={meetingCode}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={copyMeetingLink}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1 shrink-0 transition cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Kopyalandı' : 'Linki Kopyala'}</span>
                </button>
              </div>
            </div>

            {/* Join Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleJoinMeeting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm tracking-wide shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2.5 transition transform hover:scale-[1.01] cursor-pointer"
              >
                <Video className="w-5 h-5" />
                <span>TOPLANTIYA KATIL</span>
              </button>
              <p className="text-center text-[11px] text-slate-500 mt-2">
                Tüm şubeler bu odaya şifresiz veya link üzerinden anında bağlanabilir.
              </p>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER 2: IN-MEETING ROOM (ZOOM AUTHENTIC EXPERIENCE)
  // =========================================================================
  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[88vh] bg-[#1a1a1a] text-slate-100 flex flex-col overflow-hidden rounded-2xl border border-slate-800 shadow-2xl select-none"
    >
      
      {/* ------------------------------------------------------------- */}
      {/* ZOOM TOP HEADER BAR                                           */}
      {/* ------------------------------------------------------------- */}
      <div className="h-12 bg-[#141414] border-b border-white/5 px-4 flex items-center justify-between z-20 shrink-0">
        
        {/* Left: Meeting Info Shield Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMeetingInfoPopover(!showMeetingInfoPopover)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer text-xs font-semibold text-slate-300"
          >
            <div className="w-5 h-5 rounded-md bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span className="hidden sm:inline font-bold text-white">{meetingCode}</span>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-1.5 py-0.5 rounded font-mono">
              Güvenli
            </span>
          </button>

          {/* Meeting Info Popover */}
          {showMeetingInfoPopover && (
            <div className="absolute top-12 left-0 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-4 z-50 text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-extrabold text-white text-sm">Toplantı Bilgileri</span>
                <button 
                  onClick={() => setShowMeetingInfoPopover(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Toplantı Adı:</span>
                <span className="font-semibold text-white">{meetingRoom?.title || 'ESME Eğitim Toplantısı'}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Toplantı Kimliği:</span>
                  <span className="font-mono font-bold text-emerald-400">{meetingCode}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Ev Sahibi:</span>
                  <span className="font-semibold text-white truncate block">{meetingRoom?.hostName || displayName}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Davet Bağlantısı:</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}${window.location.pathname}?meeting=${meetingCode}`}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-300 font-mono"
                  />
                  <button
                    onClick={copyMeetingLink}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedLink ? 'Kopyalandı' : 'Kopyala'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Center: Recording & Active Speaker status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-950/60 border border-red-800 text-red-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span className="text-[11px]">REC • Canlı Kayıt</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 bg-black/40 px-3 py-1 rounded-full border border-white/5">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>Aktif Konuşmacı:</span>
            <span className="font-bold text-white">
              {allParticipants.find(p => p.id === activeSpeakerId)?.name || displayName}
            </span>
          </div>
        </div>

        {/* Right: View mode & Fullscreen */}
        <div className="flex items-center gap-2">

          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'grid' ? 'speaker' : 'grid')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 transition cursor-pointer"
            title={viewMode === 'grid' ? 'Konuşmacı Görünümüne Geç' : 'Galeri Görünümüne Geç'}
          >
            <LayoutGrid className="w-4 h-4 text-slate-300" />
            <span className="hidden sm:inline">
              {viewMode === 'grid' ? 'Galeri' : 'Konuşmacı'}
            </span>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition cursor-pointer"
            title={isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MAIN VIDEO STAGE & SIDE PANELS                                */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Central Stage: Video Grid / Screen Share / Whiteboard */}
        <div className="flex-1 relative p-3 flex flex-col justify-center items-center overflow-y-auto">
          
          {/* Floating Reaction Emojis Animation */}
          {floatingReactions.map(r => (
            <div
              key={r.id}
              className="absolute bottom-16 pointer-events-none z-50 flex flex-col items-center animate-bounce"
              style={{ left: `${r.x}%`, animationDuration: '2.5s' }}
            >
              <span className="text-4xl drop-shadow-lg">{r.emoji}</span>
              <span className="text-[10px] bg-black/70 px-2 py-0.5 rounded-full text-white font-bold mt-1">
                {r.sender}
              </span>
            </div>
          ))}

          {/* SCREEN SHARING VIEW */}
          {isScreenSharing ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-black rounded-xl overflow-hidden relative border border-white/10">
              <div className="absolute top-3 left-4 bg-emerald-600/90 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-white z-10 flex items-center gap-2">
                <MonitorUp className="w-4 h-4" />
                <span>Ekran Paylaşımı Yapılıyor (Siz)</span>
              </div>
              <video
                ref={screenShareVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            </div>
          ) : showWhiteboard ? (
            /* ZOOM WHITEBOARD / BEYAZ TAHTA */
            <div className="w-full h-full bg-white rounded-xl overflow-hidden relative flex flex-col text-slate-900 border-4 border-slate-700 shadow-2xl">
              {/* Whiteboard Toolbar */}
              <div className="h-11 bg-slate-100 border-b border-slate-300 px-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold flex items-center gap-1.5 text-slate-800">
                    <PenTool className="w-4 h-4 text-blue-600" />
                    Beyaz Tahta
                  </span>
                  <div className="h-4 w-[1px] bg-slate-300 mx-1"></div>
                  
                  {/* Colors */}
                  {['#ef4444', '#3b82f6', '#10b981', '#1f2937', '#f59e0b'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => { setPenColor(c); setIsEraser(false); }}
                      className={`w-5 h-5 rounded-full border-2 transition cursor-pointer ${
                        penColor === c && !isEraser ? 'scale-125 border-slate-900 shadow' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  
                  {/* Pen vs Eraser */}
                  <button
                    type="button"
                    onClick={() => setIsEraser(false)}
                    className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      !isEraser ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-200'
                    }`}
                    title="Kalem"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEraser(true)}
                    className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      isEraser ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-200'
                    }`}
                    title="Silgi"
                  >
                    <Eraser className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!canvasRef.current) return;
                      const ctx = canvasRef.current.getContext('2d');
                      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                    }}
                    className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Temizle</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowWhiteboard(false)}
                    className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Canvas Area */}
              <canvas
                ref={canvasRef}
                width={1200}
                height={700}
                className="w-full h-full cursor-crosshair bg-white"
                onMouseDown={(e) => {
                  isDrawingRef.current = true;
                  const canvas = canvasRef.current;
                  if (!canvas) return;
                  const ctx = canvas.getContext('2d');
                  if (!ctx) return;
                  const rect = canvas.getBoundingClientRect();
                  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
                  const y = (e.clientY - rect.top) * (canvas.height / rect.height);
                  ctx.beginPath();
                  ctx.moveTo(x, y);
                  ctx.strokeStyle = isEraser ? '#ffffff' : penColor;
                  ctx.lineWidth = isEraser ? 24 : penSize;
                  ctx.lineCap = 'round';
                  ctx.lineJoin = 'round';
                }}
                onMouseMove={(e) => {
                  if (!isDrawingRef.current) return;
                  const canvas = canvasRef.current;
                  if (!canvas) return;
                  const ctx = canvas.getContext('2d');
                  if (!ctx) return;
                  const rect = canvas.getBoundingClientRect();
                  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
                  const y = (e.clientY - rect.top) * (canvas.height / rect.height);
                  ctx.lineTo(x, y);
                  ctx.stroke();
                }}
                onMouseUp={() => {
                  isDrawingRef.current = false;
                }}
                onMouseLeave={() => {
                  isDrawingRef.current = false;
                }}
              />
            </div>
          ) : viewMode === 'speaker' && featuredSpeaker ? (
            /* ============================================================== */
            /* VIEW MODE: SPEAKER / SPOTLIGHT (TEK EKRAN HALİNDE KONUŞMACI)   */
            /* ============================================================== */
            <div className="w-full h-full flex flex-col items-center justify-between overflow-hidden">
              
              {/* Top Filmstrip of Participants (Thumbnails) */}
              <div className="w-full flex items-center justify-start gap-2.5 overflow-x-auto py-1 px-1 bg-black/40 backdrop-blur-md rounded-2xl mb-2 border border-white/5 shrink-0 scrollbar-thin">
                {allParticipants.map((p) => {
                  const isLocal = p.id === localParticipantId;
                  const isSpeaking = (isLocal && localAudioLevel > 20 && !isAudioMuted) || (!isLocal && !p.isAudioMuted);
                  const isSelected = featuredSpeaker?.id === p.id;
                  const isAudioMutedState = isLocal ? isAudioMuted : p.isAudioMuted;

                  return (
                    <div
                      key={p.id}
                      onClick={() => setIsPinned(p.id)}
                      className={`relative w-32 sm:w-40 aspect-video rounded-xl overflow-hidden shrink-0 cursor-pointer border transition-all duration-200 bg-[#222] flex items-center justify-center ${
                        isSelected 
                          ? 'border-blue-500 ring-2 ring-blue-500 shadow-md' 
                          : isSpeaking 
                          ? 'border-emerald-500 ring-2 ring-emerald-500' 
                          : 'border-white/10 hover:border-white/30'
                      }`}
                      title={`${p.name} (${p.branchName}) — Tıkla ve Tek Ekrana Sabitle`}
                    >
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${p.avatarColor || getAvatarColor(p.name)} flex items-center justify-center text-white text-xs font-black shadow`}>
                        {getInitials(p.name)}
                      </div>

                      {/* Small badge */}
                      <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between bg-black/80 px-1.5 py-0.5 rounded text-[10px] text-white">
                        <span className="truncate max-w-[80px] font-semibold">{p.name}</span>
                        {isAudioMutedState ? (
                          <MicOff className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                        ) : (
                          <Mic className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Main Featured Big Screen (Tek Ekran) */}
              <div className="flex-1 w-full max-w-5xl aspect-video rounded-3xl overflow-hidden relative border border-white/10 shadow-2xl flex items-center justify-center bg-[#1c1c1c] group">
                
                {/* Local user on big screen */}
                {featuredSpeaker.id === localParticipantId ? (
                  <>
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover transform -scale-x-100 ${
                        isVideoOff ? 'hidden' : 'block'
                      } ${isVirtualBlur ? 'blur-sm' : ''}`}
                    />

                    {/* Camera off Avatar for local user */}
                    {isVideoOff && (
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className={`w-28 sm:w-36 h-28 sm:h-36 rounded-full bg-gradient-to-br ${featuredSpeaker.avatarColor || getAvatarColor(featuredSpeaker.name)} flex items-center justify-center text-white text-4xl sm:text-5xl font-black shadow-2xl ring-8 ring-white/5`}>
                          {getInitials(featuredSpeaker.name)}
                        </div>
                        <div className="text-center">
                          <p className="text-base sm:text-lg font-black text-white">{featuredSpeaker.name}</p>
                          <p className="text-xs text-slate-400 font-semibold">{featuredSpeaker.branchName}</p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  /* Remote user on big screen with real video and audio */
                  <RemoteVideoPlayer
                    participant={featuredSpeaker}
                    stream={remoteStreams[featuredSpeaker.id]}
                    isSpeaking={!featuredSpeaker.isAudioMuted}
                    isFeatured={true}
                  />
                )}

                {/* Active Speaker Glowing Border */}
                {((featuredSpeaker.id === localParticipantId && localAudioLevel > 20 && !isAudioMuted) || 
                  (featuredSpeaker.id !== localParticipantId && !featuredSpeaker.isAudioMuted)) && (
                  <div className="absolute inset-0 pointer-events-none ring-4 ring-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.4)] rounded-3xl animate-pulse"></div>
                )}

                {/* Top Right: Mode Indicator & Switch to Grid */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <div className="bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-bold text-emerald-400 flex items-center gap-2 shadow-lg">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    <span>Tek Ekran (Konuşmacı Görünümü)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer shadow-lg flex items-center gap-1.5"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Galeriye Dön</span>
                  </button>
                </div>

                {/* Hand Raised Banner on Main Screen */}
                {featuredSpeaker.isHandRaised && (
                  <div className="absolute top-4 left-4 bg-amber-500 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg animate-bounce">
                    <Hand className="w-4 h-4 fill-current" />
                    <span>Söz İstiyor (El Kaldırdı)</span>
                  </div>
                )}

                {/* Bottom Left: Regular Elegant Glassmorphism Name Tag */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2.5 bg-slate-950/85 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 text-xs shadow-2xl select-none">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    featuredSpeaker.isAudioMuted ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                  }`}>
                    {featuredSpeaker.isAudioMuted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                  </div>
                  <span className="font-extrabold text-white text-sm sm:text-base tracking-tight">
                    {featuredSpeaker.name}
                  </span>
                  <span className="text-xs text-slate-300 font-medium">
                    • {featuredSpeaker.branchName}
                  </span>
                  {featuredSpeaker.role === 'host' && (
                    <span className="text-[10px] bg-blue-600 text-white font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                      Yönetici
                    </span>
                  )}
                  {((featuredSpeaker.id === localParticipantId && localAudioLevel > 20 && !isAudioMuted) || 
                    (featuredSpeaker.id !== localParticipantId && !featuredSpeaker.isAudioMuted)) && (
                    <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-md animate-pulse">
                      Konuşuyor
                    </span>
                  )}
                </div>

              </div>

            </div>
          ) : (
            /* ============================================================== */
            /* VIEW MODE: BALANCED RESPONSIVE GRID (DÜZENLİ KUTUCUKLAR)       */
            /* ============================================================== */
            <div className="w-full h-full flex flex-col justify-center items-center">
              
              {/* Active Speaker Banner with 1-click switch to Single Screen */}
              {allParticipants.length > 1 && (
                <div className="mb-2.5 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="text-slate-300 font-medium">Canlı Konuşmacı:</span>
                  <span className="font-extrabold text-white">
                    {allParticipants.find(p => p.id === activeSpeakerId)?.name || featuredSpeaker?.name || displayName}
                  </span>
                  <button
                    type="button"
                    onClick={() => setViewMode('speaker')}
                    className="ml-2 px-2.5 py-0.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition cursor-pointer"
                  >
                    Tek Ekranda Göster
                  </button>
                </div>
              )}

              {/* Balanced auto-fit responsive grid */}
              <div className={`w-full grid gap-3 items-center justify-center ${getGridClass(allParticipants.length)}`}>
                {allParticipants.map((p) => {
                  const isLocal = p.id === localParticipantId;
                  const isSpeaking = (isLocal && localAudioLevel > 20 && !isAudioMuted) || (!isLocal && !p.isAudioMuted);
                  const isVideoOffState = isLocal ? isVideoOff : p.isVideoOff;
                  const isAudioMutedState = isLocal ? isAudioMuted : p.isAudioMuted;

                  return (
                    <div
                      key={p.id}
                      className={`relative w-full aspect-video bg-[#202020] rounded-2xl overflow-hidden border transition-all duration-200 flex items-center justify-center shadow-lg group ${
                        isSpeaking 
                          ? 'border-emerald-500 ring-4 ring-emerald-500/80 shadow-[0_0_25px_rgba(16,185,129,0.4)]' 
                          : isPinned === p.id 
                          ? 'border-blue-500 ring-2 ring-blue-500' 
                          : 'border-white/10 hover:border-white/25'
                      }`}
                    >
                      {/* Local user tile */}
                      {isLocal ? (
                        <>
                          <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className={`w-full h-full object-cover transform -scale-x-100 ${
                              isVideoOffState ? 'hidden' : 'block'
                            } ${isVirtualBlur ? 'blur-sm' : ''}`}
                          />

                          {/* Camera Off Avatar Screen for local user */}
                          {isVideoOffState && (
                            <div className="flex flex-col items-center justify-center gap-2 select-none">
                              <div className={`w-18 sm:w-22 h-18 sm:h-22 rounded-full bg-gradient-to-br ${p.avatarColor || getAvatarColor(p.name)} flex items-center justify-center text-white text-2xl sm:text-3xl font-black shadow-xl ring-4 ring-black/40`}>
                                {getInitials(p.name)}
                              </div>
                              <span className="text-xs font-bold text-slate-200">{p.name}</span>
                            </div>
                          )}
                        </>
                      ) : (
                        /* Remote participant live WebRTC video & audio */
                        <RemoteVideoPlayer
                          participant={p}
                          stream={remoteStreams[p.id]}
                          isSpeaking={isSpeaking}
                          isPinned={isPinned === p.id}
                          onPin={() => {
                            setIsPinned(isPinned === p.id ? null : p.id);
                            setViewMode('speaker');
                          }}
                        />
                      )}

                      {/* Hand Raised Badge (Zoom ✋) */}
                      {p.isHandRaised && (
                        <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-lg animate-bounce">
                          <Hand className="w-3.5 h-3.5 fill-current" />
                          <span>El Kaldırdı</span>
                        </div>
                      )}

                      {/* Pin button */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsPinned(isPinned === p.id ? null : p.id);
                          setViewMode('speaker');
                        }}
                        className="absolute top-3 right-3 p-1.5 rounded-xl bg-black/70 hover:bg-black/90 text-white opacity-0 group-hover:opacity-100 transition cursor-pointer"
                        title="Tek Ekranda Sabitle"
                      >
                        <Pin className={`w-3.5 h-3.5 ${isPinned === p.id ? 'text-blue-400 fill-current' : 'text-slate-300'}`} />
                      </button>

                      {/* Regular Clean Glassmorphic Name Tag */}
                      <div className="absolute bottom-2.5 left-2.5 flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs shadow-lg max-w-[88%] select-none">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${isAudioMutedState ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}>
                          {isAudioMutedState ? <MicOff className="w-2.5 h-2.5" /> : <Mic className="w-2.5 h-2.5" />}
                        </div>
                        <span className="font-extrabold text-white text-xs sm:text-sm tracking-tight truncate">
                          {p.name}
                        </span>
                        <span className="text-[10px] sm:text-xs text-slate-300 font-medium truncate hidden sm:inline">
                          • {p.branchName}
                        </span>
                        {p.role === 'host' && (
                          <span className="text-[9px] bg-blue-600 text-white font-black px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                            Yönetici
                          </span>
                        )}
                        {isSpeaking && (
                          <span className="text-[9px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.5 rounded animate-pulse shrink-0">
                            Konuşuyor
                          </span>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </div>

        {/* ----------------------------------------------------------- */}
        {/* RIGHT SIDE DRAWER: CHAT OR PARTICIPANTS                     */}
        {/* ----------------------------------------------------------- */}
        {activeSidePanel !== 'none' && (
          <div className="w-80 md:w-96 bg-[#181818] border-l border-white/10 flex flex-col z-30 shrink-0">
            
            {/* Drawer Header */}
            <div className="h-12 border-b border-white/10 px-4 flex items-center justify-between">
              <span className="font-extrabold text-sm text-white">
                {activeSidePanel === 'chat' 
                  ? 'Toplantı İçi Sohbet' 
                  : `Katılımcılar (${allParticipants.length})`}
              </span>
              <button
                type="button"
                onClick={() => setActiveSidePanel('none')}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* PARTICIPANTS DRAWER */}
            {activeSidePanel === 'participants' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Host Control Actions */}
                <div className="p-3 border-b border-white/5 space-y-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleMuteAll}
                      className="flex-1 py-1.5 px-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                      title="Tüm katılımcıların mikrofonunu kapat"
                    >
                      <MicOff className="w-3.5 h-3.5 text-rose-400" />
                      <span>Tümünü Kapat</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleUnmuteAll}
                      className="flex-1 py-1.5 px-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                      title="Tüm katılımcıların mikrofonunu aç"
                    >
                      <Mic className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Tümünü Aç</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={copyMeetingLink}
                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Davet Bağlantısını Kopyala</span>
                  </button>
                </div>

                {/* Participants list */}
                <div className="flex-1 overflow-y-auto divide-y divide-white/5 p-2">
                  {allParticipants.map((p) => {
                    const isLocal = p.id === localParticipantId;
                    const isAudioMutedState = isLocal ? isAudioMuted : p.isAudioMuted;

                    return (
                      <div key={p.id} className="py-2.5 px-2 flex items-center justify-between hover:bg-white/5 rounded-xl transition group">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${p.avatarColor || getAvatarColor(p.name)} flex items-center justify-center text-white text-xs font-black shrink-0`}>
                            {getInitials(p.name)}
                          </div>
                          <div className="overflow-hidden">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-white truncate max-w-[130px]">{p.name}</span>
                              {p.role === 'host' && (
                                <span className="text-[9px] bg-blue-600/40 text-blue-300 border border-blue-500/30 px-1 rounded font-bold">
                                  Yönetici
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 truncate block">{p.branchName}</span>
                          </div>
                        </div>

                        {/* Controls (Host can toggle mute/unmute per participant) */}
                        <div className="flex items-center gap-2 text-slate-400">
                          {p.isHandRaised && <Hand className="w-3.5 h-3.5 text-amber-400 fill-current" />}
                          <button
                            type="button"
                            onClick={() => handleToggleParticipantMute(p.id, isAudioMutedState)}
                            className="p-1 rounded-md hover:bg-white/10 text-xs transition cursor-pointer"
                            title={isAudioMutedState ? "Mikrofonu Aç" : "Mikrofonu Kapat"}
                          >
                            {isAudioMutedState ? (
                              <MicOff className="w-4 h-4 text-rose-500" />
                            ) : (
                              <Mic className="w-4 h-4 text-emerald-400" />
                            )}
                          </button>
                          {p.isVideoOff ? (
                            <VideoOff className="w-4 h-4 text-rose-500" />
                          ) : (
                            <Video className="w-4 h-4 text-sky-400" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CHAT DRAWER */}
            {activeSidePanel === 'chat' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Messages feed */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-xs">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <span>Henüz mesaj yok. İlk mesajı siz yazın!</span>
                    </div>
                  ) : (
                    chatMessages.map(msg => (
                      <div key={msg.id} className="bg-slate-900/80 p-2.5 rounded-xl border border-white/5 space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-blue-400 truncate max-w-[160px]">
                            {msg.senderName} ({msg.senderBranch})
                          </span>
                          <span className="text-slate-500">{msg.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed break-words">{msg.text}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Chat input box */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 bg-[#121212]">
                  <div className="text-[10px] text-slate-400 mb-1.5 flex items-center justify-between">
                    <span>Kime: <strong className="text-white">Herkes</strong></span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInputText}
                      onChange={(e) => setChatInputText(e.target.value)}
                      placeholder="Mesajınızı yazınız (Enter)..."
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={!chatInputText.trim()}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        )}

      </div>

      {/* ------------------------------------------------------------- */}
      {/* ZOOM BOTTOM CONTROL DOCK TOOLBAR                              */}
      {/* ------------------------------------------------------------- */}
      <div className="h-16 bg-[#141414] border-t border-white/5 px-4 sm:px-6 flex items-center justify-between z-20 shrink-0">
        
        {/* Left: Audio & Video Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          
          {/* MUTE / UNMUTE BUTTON */}
          <button
            type="button"
            onClick={toggleAudio}
            className={`group relative flex flex-col items-center justify-center w-14 sm:w-16 h-12 rounded-xl transition cursor-pointer ${
              isAudioMuted 
                ? 'bg-rose-600/20 text-rose-400 hover:bg-rose-600/30' 
                : 'hover:bg-white/10 text-slate-200'
            }`}
            title={isAudioMuted ? 'Sesi Aç (Unmute)' : 'Sesi Kapat (Mute)'}
          >
            {isAudioMuted ? (
              <MicOff className="w-5 h-5 text-rose-500" />
            ) : (
              <Mic className="w-5 h-5 text-white" />
            )}
            <span className="text-[10px] font-semibold mt-0.5">
              {isAudioMuted ? 'Sesi Aç' : 'Sesi Kapat'}
            </span>
          </button>

          {/* START / STOP VIDEO BUTTON */}
          <button
            type="button"
            onClick={toggleVideo}
            className={`group relative flex flex-col items-center justify-center w-14 sm:w-16 h-12 rounded-xl transition cursor-pointer ${
              isVideoOff 
                ? 'bg-rose-600/20 text-rose-400 hover:bg-rose-600/30' 
                : 'hover:bg-white/10 text-slate-200'
            }`}
            title={isVideoOff ? 'Videoyu Başlat' : 'Videoyu Durdur'}
          >
            {isVideoOff ? (
              <VideoOff className="w-5 h-5 text-rose-500" />
            ) : (
              <Video className="w-5 h-5 text-white" />
            )}
            <span className="text-[10px] font-semibold mt-0.5">
              {isVideoOff ? 'Videoyu Aç' : 'Durdur'}
            </span>
          </button>

        </div>

        {/* Center: In-Meeting Collaboration Dock */}
        <div className="flex items-center gap-1 sm:gap-2">
          
          {/* SECURITY BUTTON */}
          <div className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setShowSecurityPopover(!showSecurityPopover)}
              className="flex flex-col items-center justify-center w-14 sm:w-16 h-12 rounded-xl hover:bg-white/10 text-slate-200 transition cursor-pointer"
            >
              <ShieldCheck className="w-5 h-5 text-slate-200" />
              <span className="text-[10px] font-semibold mt-0.5">Güvenlik</span>
            </button>

            {/* Security Popover */}
            {showSecurityPopover && (
              <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 text-xs space-y-2">
                <span className="font-extrabold text-white text-xs block border-b border-slate-800 pb-1.5">
                  Toplantı Güvenliği
                </span>
                <label className="flex items-center justify-between text-slate-300 py-1 hover:text-white cursor-pointer">
                  <span>Toplantıyı Kilitle</span>
                  <input type="checkbox" className="accent-blue-600" />
                </label>
                <label className="flex items-center justify-between text-slate-300 py-1 hover:text-white cursor-pointer">
                  <span>Ekran Paylaşımına İzin Ver</span>
                  <input type="checkbox" defaultChecked className="accent-blue-600" />
                </label>
                <label className="flex items-center justify-between text-slate-300 py-1 hover:text-white cursor-pointer">
                  <span>Sohbeti Etkinleştir</span>
                  <input type="checkbox" defaultChecked className="accent-blue-600" />
                </label>
              </div>
            )}
          </div>

          {/* PARTICIPANTS BUTTON */}
          <button
            type="button"
            onClick={() => setActiveSidePanel(activeSidePanel === 'participants' ? 'none' : 'participants')}
            className={`relative flex flex-col items-center justify-center w-14 sm:w-16 h-12 rounded-xl transition cursor-pointer ${
              activeSidePanel === 'participants' ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-slate-200'
            }`}
          >
            <div className="relative">
              <Users className="w-5 h-5 text-slate-200" />
              <span className="absolute -top-1 -right-2 bg-slate-700 border border-white/20 text-[9px] font-black px-1 rounded-full text-white">
                {allParticipants.length}
              </span>
            </div>
            <span className="text-[10px] font-semibold mt-0.5">Katılımcı</span>
          </button>

          {/* CHAT BUTTON */}
          <button
            type="button"
            onClick={() => {
              setActiveSidePanel(activeSidePanel === 'chat' ? 'none' : 'chat');
              setUnreadChatCount(0);
            }}
            className={`relative flex flex-col items-center justify-center w-14 sm:w-16 h-12 rounded-xl transition cursor-pointer ${
              activeSidePanel === 'chat' ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-slate-200'
            }`}
          >
            <div className="relative">
              <MessageSquare className="w-5 h-5 text-slate-200" />
              {unreadChatCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-blue-600 text-[9px] font-black px-1.5 py-0.2 rounded-full text-white animate-pulse">
                  {unreadChatCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold mt-0.5">Sohbet</span>
          </button>

          {/* SHARE SCREEN (ZOOM SIGNATURE GREEN BUTTON) */}
          <button
            type="button"
            onClick={toggleScreenShare}
            className={`flex flex-col items-center justify-center px-3 sm:px-4 h-12 rounded-xl transition cursor-pointer ${
              isScreenSharing 
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
            }`}
            title="Ekranı Paylaş"
          >
            {isScreenSharing ? (
              <MonitorOff className="w-5 h-5" />
            ) : (
              <MonitorUp className="w-5 h-5" />
            )}
            <span className="text-[10px] font-extrabold mt-0.5">
              {isScreenSharing ? 'Paylaşımı Durdur' : 'Ekranı Paylaş'}
            </span>
          </button>

          {/* WHITEBOARD BUTTON */}
          <button
            type="button"
            onClick={() => setShowWhiteboard(!showWhiteboard)}
            className={`hidden md:flex flex-col items-center justify-center w-14 sm:w-16 h-12 rounded-xl transition cursor-pointer ${
              showWhiteboard ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-slate-200'
            }`}
            title="Beyaz Tahta"
          >
            <PenTool className="w-5 h-5 text-slate-200" />
            <span className="text-[10px] font-semibold mt-0.5">Beyaz Tahta</span>
          </button>

          {/* REACTIONS BUTTON (ZOOM STYLE) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowReactionsPopover(!showReactionsPopover)}
              className="flex flex-col items-center justify-center w-12 sm:w-16 h-12 rounded-xl hover:bg-white/10 text-slate-200 transition cursor-pointer"
            >
              <Smile className="w-5 h-5 text-slate-200" />
              <span className="text-[10px] font-semibold mt-0.5">Tepkiler</span>
            </button>

            {/* Reactions Popover */}
            {showReactionsPopover && (
              <div className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2.5 z-50 flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleHandRaise}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    isHandRaised ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-white hover:bg-slate-700'
                  }`}
                >
                  <Hand className="w-4 h-4 fill-current" />
                  <span>{isHandRaised ? 'Eli İndir' : 'El Kaldır'}</span>
                </button>
                <div className="h-5 w-[1px] bg-slate-700"></div>
                {['👏', '👍', '❤️', '😂', '🎉'].map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => triggerReaction(emoji)}
                    className="text-xl p-1.5 hover:scale-125 transition cursor-pointer rounded-lg hover:bg-white/10"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right: End / Leave Meeting (Red Button) */}
        <div className="flex items-center gap-2">
          {isAdmin || meetingRoom?.hostName === displayName ? (
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={handleEndForAll}
                className="px-3 sm:px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-900/30 transition cursor-pointer"
                title="Tüm katılımcılar için toplantıyı bitir"
              >
                Herkes İçin Bitir
              </button>
              <button
                type="button"
                onClick={handleLeaveMeeting}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Ayrıl
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleLeaveMeeting}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-900/30 transition cursor-pointer flex items-center gap-1.5"
            >
              <PhoneOff className="w-4 h-4" />
              <span>Ayrıl</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
