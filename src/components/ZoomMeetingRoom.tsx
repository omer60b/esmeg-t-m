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
  sendMeetingChatMessage,
  subscribeToMeetingChat,
  updateMeetingWhiteboard,
  endMeetingForAll
} from '../services/meetingService';

interface ZoomMeetingRoomProps {
  currentBranchId: number;
  currentPersonnel: string;
  branches: Branch[];
  isAdmin: boolean;
  appTheme?: 'sepia' | 'light' | 'dark';
  initialMeetingId?: string;
}

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

  // Media Stream references
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenShareVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

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
    });

    const unsubChat = subscribeToMeetingChat(meetingCode, (messages) => {
      setChatMessages(messages);
      if (activeSidePanel !== 'chat' && messages.length > 0) {
        setUnreadChatCount(prev => prev + 1);
      }
    });

    return () => {
      unsubRoom();
      unsubParticipants();
      unsubChat();
    };
  }, [isInMeeting, meetingCode, activeSidePanel]);

  // Handle Join Meeting
  const handleJoinMeeting = async () => {
    const finalBranch = branches.find(b => b.id === selectedBranchId) || currentBranch;
    const cleanCode = (meetingCode.trim() || DEFAULT_MEETING_ID).toUpperCase();
    setMeetingCode(cleanCode);

    // Ensure Room Exists or Create it
    const room = await createOrGetMeetingRoom(
      cleanCode,
      `${cleanCode} — ESME Koordinasyon ve Eğitim Toplantısı`,
      displayName,
      finalBranch.id,
      finalBranch.name
    );
    setMeetingRoom(room);

    // Register local participant
    const participant: MeetingParticipant = {
      id: localParticipantId,
      name: displayName,
      branchName: finalBranch.name,
      branchId: finalBranch.id,
      role: isAdmin || room.hostName === displayName ? 'host' : 'participant',
      isAudioMuted,
      isVideoOff,
      isHandRaised: false,
      isScreenSharing: false,
      joinedAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      avatarColor: getAvatarColor(displayName)
    };

    await joinMeetingParticipant(cleanCode, participant);
    setIsInMeeting(true);

    // Re-bind local video element if stream active
    setTimeout(() => {
      if (localVideoRef.current && localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
        localVideoRef.current.play().catch(() => {});
      }
    }, 300);
  };

  // Handle Leave Meeting
  const handleLeaveMeeting = async () => {
    if (meetingCode && localParticipantId) {
      await leaveMeetingParticipant(meetingCode, localParticipantId);
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
      setIsScreenSharing(false);
    }
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

        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
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

  // Mute All Participants (Host Only)
  const handleMuteAll = async () => {
    if (!confirm('Tüm katılımcıların mikrofonunu sessize almak istiyor musunuz?')) return;
    for (const p of participants) {
      if (p.id !== localParticipantId) {
        await updateParticipantStatus(meetingCode, p.id, { isAudioMuted: true });
      }
    }
  };

  // Add Test Participant Simulation (for immediate solo testing of the multi-participant Zoom experience)
  const handleAddTestParticipant = async () => {
    const sampleNames = [
      { name: 'Mehmet Demir', branch: 'Kadıköy Mağazası', branchId: 11 },
      { name: 'Ayşe Yıldırım', branch: 'Bakırköy Mağazası', branchId: 12 },
      { name: 'Caner Özkan', branch: 'Bağcılar Mağazası', branchId: 13 },
      { name: 'Zeynep Kaya', branch: 'Pendik Mağazası', branchId: 14 }
    ];
    const pick = sampleNames[Math.floor(Math.random() * sampleNames.length)];
    const testId = 'test_' + Math.random().toString(36).substring(2, 7);

    const testParticipant: MeetingParticipant = {
      id: testId,
      name: pick.name,
      branchName: pick.branch,
      branchId: pick.branchId,
      role: 'participant',
      isAudioMuted: Math.random() > 0.5,
      isVideoOff: Math.random() > 0.6,
      isHandRaised: Math.random() > 0.7,
      isScreenSharing: false,
      joinedAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      avatarColor: getAvatarColor(pick.name)
    };

    await joinMeetingParticipant(meetingCode, testParticipant);
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // All participants to render (local participant + remote participants from Firestore)
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

    // Filter out duplicate local participant from Firestore list if present
    const remotes = participants.filter(p => p.id !== localParticipantId);
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

  // Grid columns calculator for video stage
  const getGridClass = (count: number) => {
    if (count === 1) return 'grid-cols-1 max-w-4xl mx-auto';
    if (count === 2) return 'grid-cols-1 md:grid-cols-2';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 6) return 'grid-cols-2 lg:grid-cols-3';
    return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
  };

  // =========================================================================
  // RENDER 1: ZOOM PRE-JOIN LOBBY / BEKLEME ODASI
  // =========================================================================
  if (!isInMeeting) {
    return (
      <div className="min-h-[82vh] flex items-center justify-center p-3 sm:p-6 bg-slate-950 text-slate-100 font-sans">
        <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 flex flex-col md:flex-row gap-8 items-center">
          
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
          {/* Quick simulation button to populate other test stores */}
          <button
            type="button"
            onClick={handleAddTestParticipant}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs rounded-lg font-bold transition cursor-pointer"
            title="Tek başınıza test ederken diğer şubeleri simüle eder"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Test Şubesi Ekle</span>
          </button>

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
          ) : (
            /* STANDARD ZOOM VIDEO GRID */
            <div className={`w-full h-full grid gap-3 items-center justify-center ${getGridClass(allParticipants.length)}`}>
              {allParticipants.map((p) => {
                const isLocal = p.id === localParticipantId;
                const isSpeaking = (isLocal && localAudioLevel > 20 && !isAudioMuted) || (!isLocal && !p.isAudioMuted && Math.random() > 0.8);
                const isVideoOffState = isLocal ? isVideoOff : p.isVideoOff;
                const isAudioMutedState = isLocal ? isAudioMuted : p.isAudioMuted;

                return (
                  <div
                    key={p.id}
                    className={`relative w-full aspect-video bg-[#242424] rounded-2xl overflow-hidden border transition-all duration-200 flex items-center justify-center group ${
                      isSpeaking 
                        ? 'border-emerald-500 ring-2 ring-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                        : isPinned === p.id 
                        ? 'border-blue-500 ring-2 ring-blue-500' 
                        : 'border-white/5 hover:border-white/20'
                    }`}
                  >
                    {/* Live Video element for local user */}
                    {isLocal && (
                      <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover transform -scale-x-100 ${
                          isVideoOffState ? 'hidden' : 'block'
                        } ${isVirtualBlur ? 'blur-sm' : ''}`}
                      />
                    )}

                    {/* Camera Off Avatar Screen (Authentic Zoom Style) */}
                    {(isVideoOffState || (!isLocal && p.isVideoOff)) && (
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className={`w-20 sm:w-24 h-20 sm:h-24 rounded-full bg-gradient-to-br ${p.avatarColor || getAvatarColor(p.name)} flex items-center justify-center text-white text-2xl sm:text-3xl font-black shadow-xl ring-4 ring-black/40`}>
                          {getInitials(p.name)}
                        </div>
                        <span className="text-xs font-semibold text-slate-300">{p.name}</span>
                      </div>
                    )}

                    {/* Simulated live camera tile for remote participants who have camera on */}
                    {!isLocal && !p.isVideoOff && (
                      <div className="w-full h-full relative bg-slate-900 flex items-center justify-center overflow-hidden">
                        <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${p.avatarColor || getAvatarColor(p.name)} flex items-center justify-center text-white text-3xl font-black animate-pulse opacity-80`}>
                          {getInitials(p.name)}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      </div>
                    )}

                    {/* Hand Raised Badge (Zoom ✋) */}
                    {p.isHandRaised && (
                      <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 px-2 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1.5 shadow-lg animate-bounce">
                        <Hand className="w-3.5 h-3.5 fill-current" />
                        <span>El Kaldırdı</span>
                      </div>
                    )}

                    {/* Pin button */}
                    <button
                      type="button"
                      onClick={() => setIsPinned(isPinned === p.id ? null : p.id)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      title={isPinned === p.id ? 'Sabitlemeyi Kaldır' : 'Sabitle'}
                    >
                      <Pin className={`w-3.5 h-3.5 ${isPinned === p.id ? 'text-blue-400 fill-current' : 'text-slate-300'}`} />
                    </button>

                    {/* Bottom-left Name Tag with Audio status */}
                    <div className="absolute bottom-2.5 left-2.5 flex items-center gap-2 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-xs">
                      {isAudioMutedState ? (
                        <div className="w-4 h-4 rounded-full bg-rose-600 flex items-center justify-center text-white">
                          <MicOff className="w-2.5 h-2.5" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                          <Mic className="w-2.5 h-2.5" />
                        </div>
                      )}
                      <span className="font-bold text-white max-w-[130px] sm:max-w-[200px] truncate">
                        {p.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({p.branchName})
                      </span>
                      {p.role === 'host' && (
                        <span className="text-[9px] bg-blue-600 text-white font-extrabold px-1.5 py-0.2 rounded">
                          Ev Sahibi
                        </span>
                      )}
                    </div>

                  </div>
                );
              })}
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
                <div className="p-3 border-b border-white/5 flex gap-2">
                  <button
                    type="button"
                    onClick={handleMuteAll}
                    className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <MicOff className="w-3.5 h-3.5 text-rose-400" />
                    <span>Tümünü Sessize Al</span>
                  </button>
                  <button
                    type="button"
                    onClick={copyMeetingLink}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Davet Et</span>
                  </button>
                </div>

                {/* Participants list */}
                <div className="flex-1 overflow-y-auto divide-y divide-white/5 p-2">
                  {allParticipants.map((p) => (
                    <div key={p.id} className="py-2.5 px-2 flex items-center justify-between hover:bg-white/5 rounded-xl transition">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${p.avatarColor || getAvatarColor(p.name)} flex items-center justify-center text-white text-xs font-black shrink-0`}>
                          {getInitials(p.name)}
                        </div>
                        <div className="overflow-hidden">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white truncate max-w-[140px]">{p.name}</span>
                            {p.role === 'host' && (
                              <span className="text-[9px] bg-blue-600/40 text-blue-300 border border-blue-500/30 px-1 rounded font-bold">
                                Ev Sahibi
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 truncate block">{p.branchName}</span>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-1.5 text-slate-400">
                        {p.isHandRaised && <Hand className="w-3.5 h-3.5 text-amber-400 fill-current" />}
                        {p.isAudioMuted ? (
                          <MicOff className="w-4 h-4 text-rose-500" />
                        ) : (
                          <Mic className="w-4 h-4 text-emerald-400" />
                        )}
                        {p.isVideoOff ? (
                          <VideoOff className="w-4 h-4 text-rose-500" />
                        ) : (
                          <Video className="w-4 h-4 text-sky-400" />
                        )}
                      </div>
                    </div>
                  ))}
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
