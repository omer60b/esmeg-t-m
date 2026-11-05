import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Video, 
  ChevronLeft, 
  Copy, 
  Check, 
  Users, 
  Share2, 
  AlertCircle, 
  RefreshCw, 
  Sparkles,
  PhoneOff,
  Building2,
  User,
  ShieldCheck
} from 'lucide-react';
import { Branch } from '../types';
import { recordAttendanceLog, updateAttendanceLogOnLeave } from '../services/meetingService';

declare global {
  interface Window {
    JitsiMeetExternalAPI?: any;
  }
}

interface ZoomMeetingRoomProps {
  currentBranchId: number;
  currentPersonnel: string;
  branches: Branch[];
  isAdmin: boolean;
  appTheme?: 'sepia' | 'light' | 'dark';
  initialMeetingId?: string;
  onLeaveMeeting?: () => void;
}

export const ZoomMeetingRoom: React.FC<ZoomMeetingRoomProps> = ({
  currentBranchId,
  currentPersonnel,
  branches = [],
  isAdmin,
  initialMeetingId,
  onLeaveMeeting
}) => {
  // Derive initial values
  const currentBranch = (branches && Array.isArray(branches) && branches.length > 0)
    ? (branches.find(b => b && b.id === currentBranchId) || branches[0])
    : { id: 10, name: 'Güneşli Mağazası', code: 'M10', city: 'İstanbul' };

  // Room & User states
  const [roomId, setRoomId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlRoom = params.get('room') || params.get('meeting');
      if (urlRoom) return urlRoom;
    }
    return initialMeetingId || 'esme-genel-toplanti';
  });

  const [displayName, setDisplayName] = useState<string>(
    currentPersonnel || `${currentBranch?.name || 'Güneşli Mağazası'} Temsilcisi`
  );

  const [selectedBranchId, setSelectedBranchId] = useState<number>(
    currentBranchId || currentBranch?.id || 10
  );

  // Meeting states
  const [isInMeeting, setIsInMeeting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [participantCount, setParticipantCount] = useState<string>('Bağlanıyor…');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);

  // References
  const jitsiContainerRef = useRef<HTMLDivElement | null>(null);
  const jitsiApiRef = useRef<any>(null);
  const attendanceLogIdRef = useRef<string | null>(null);
  const attendanceJoinedAtRef = useRef<string>(new Date().toISOString());

  // Dynamic Jitsi script loader if not already present
  const ensureJitsiScript = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window.JitsiMeetExternalAPI !== 'undefined') {
        resolve(true);
        return;
      }

      // Check if script tag already exists in document
      const existingScript = document.querySelector('script[src*="meet.jit.si/external_api.js"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(true));
        existingScript.addEventListener('error', () => resolve(false));
        // Fallback timeout
        setTimeout(() => resolve(typeof window.JitsiMeetExternalAPI !== 'undefined'), 3000);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);

      setTimeout(() => resolve(typeof window.JitsiMeetExternalAPI !== 'undefined'), 5000);
    });
  }, []);

  // Update participant count from Jitsi API
  const updateParticipants = useCallback(() => {
    if (!jitsiApiRef.current) return;
    try {
      const count = jitsiApiRef.current.getNumberOfParticipants 
        ? jitsiApiRef.current.getNumberOfParticipants() 
        : null;
      if (count !== null && count !== undefined) {
        setParticipantCount(`${count} katılımcı`);
      }
    } catch (_) {}
  }, []);

  // Clean exit and leave
  const leaveMeeting = useCallback((silent = false) => {
    // Attendance logout
    if (attendanceLogIdRef.current) {
      updateAttendanceLogOnLeave(attendanceLogIdRef.current, attendanceJoinedAtRef.current).catch(() => {});
      attendanceLogIdRef.current = null;
    }

    if (jitsiApiRef.current) {
      try { jitsiApiRef.current.executeCommand('hangup'); } catch (_) {}
      try { jitsiApiRef.current.dispose(); } catch (_) {}
      jitsiApiRef.current = null;
    }

    // Clean container children
    if (jitsiContainerRef.current) {
      const container = jitsiContainerRef.current;
      Array.from(container.children).forEach(child => {
        if (!child.classList.contains('loading-overlay') && !child.classList.contains('error-overlay')) {
          child.remove();
        }
      });
    }

    setIsInMeeting(false);
    setIsLoading(true);
    setErrorMessage(null);
    setShowLeaveModal(false);
    setParticipantCount('Bağlanıyor…');

    if (!silent && onLeaveMeeting) {
      // Optional callback to return to training catalog if triggered from outside
    }
  }, [onLeaveMeeting]);

  // Join meeting handler
  const joinMeeting = async () => {
    const cleanRoomId = roomId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    if (!cleanRoomId) {
      alert('Lütfen geçerli bir Oda ID girin.');
      return;
    }

    const finalBranch = branches.find(b => b.id === selectedBranchId) || currentBranch;
    const branchName = finalBranch?.name || 'ESME Şube';
    const name = displayName.trim() || `${branchName} Temsilcisi`;

    setIsInMeeting(true);
    setIsLoading(true);
    setErrorMessage(null);
    setParticipantCount('Bağlanıyor…');

    // Ensure Jitsi script is ready
    const isLoaded = await ensureJitsiScript();
    if (!isLoaded || typeof window.JitsiMeetExternalAPI === 'undefined') {
      setIsLoading(false);
      setErrorMessage('Jitsi Video Konferans kütüphanesi yüklenemedi. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.');
      return;
    }

    const container = jitsiContainerRef.current;
    if (!container) {
      setIsLoading(false);
      setErrorMessage('Toplantı penceresi kapsayıcısı bulunamadı.');
      return;
    }

    // Create wrapper node
    const parent = document.createElement('div');
    parent.style.cssText = 'width: 100%; height: 100%; border: none;';
    container.appendChild(parent);

    try {
      const fullRoomName = 'esmeegitim-' + cleanRoomId;
      const formattedDisplayName = branchName ? `${name} • ${branchName}` : name;

      const api = new window.JitsiMeetExternalAPI('meet.jit.si', {
        roomName: fullRoomName,
        parentNode: parent,
        width: '100%',
        height: '100%',
        userInfo: {
          displayName: formattedDisplayName,
          email: '',
        },
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          prejoinPageEnabled: false,
          disableDeepLinking: true,
          enableWelcomePage: false,
          requireDisplayName: false,
          disableInviteFunctions: true,
          resolution: 720,
          constraints: {
            video: { aspectRatio: 16 / 9, height: { ideal: 720, max: 1080, min: 240 } }
          },
          toolbarButtons: [
            'microphone', 'camera', 'desktop',
            'fullscreen', 'hangup', 'chat',
            'raisehand', 'videoquality', 'filmstrip',
            'participants-pane', 'tileview', 'settings'
          ],
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_BRAND_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          DEFAULT_BACKGROUND: '#0f172a',
          MOBILE_APP_PROMO: false,
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          TOOLBAR_ALWAYS_VISIBLE: false,
        },
      });

      jitsiApiRef.current = api;

      // Event listeners
      api.addEventListener('videoConferenceJoined', () => {
        setIsLoading(false);
        updateParticipants();
      });

      api.addEventListener('participantJoined', updateParticipants);
      api.addEventListener('participantLeft', updateParticipants);

      api.addEventListener('videoConferenceLeft', () => {
        leaveMeeting(true);
      });

      // Safety timeout: hide loading if joined event is delayed
      setTimeout(() => {
        setIsLoading(false);
        updateParticipants();
      }, 4000);

      // Record corporate attendance log
      const nowIso = new Date().toISOString();
      attendanceJoinedAtRef.current = nowIso;
      recordAttendanceLog(
        cleanRoomId,
        {
          id: 'jitsi_' + Math.random().toString(36).substring(2, 8),
          name,
          branchName,
          branchId: finalBranch?.id || 10,
          role: isAdmin ? 'host' : 'participant',
          isAudioMuted: false,
          isVideoOff: false,
          isHandRaised: false,
          isScreenSharing: false,
          joinedAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        },
        `ESME Eğitim • ${cleanRoomId}`
      ).then(logId => {
        attendanceLogIdRef.current = logId;
      }).catch(() => {});

    } catch (err: any) {
      console.error('Jitsi start error:', err);
      setIsLoading(false);
      setErrorMessage(err?.message || 'Video konferans başlatılamadı.');
    }
  };

  // Copy meeting invite link
  const copyLink = () => {
    const cleanRoom = roomId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const baseUrl = window.location.href.split('?')[0];
    const inviteUrl = `${baseUrl}?room=${encodeURIComponent(cleanRoom)}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(inviteUrl).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      }).catch(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      });
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Generate random room code
  const handleGenerateRoom = () => {
    const p1 = Math.floor(100 + Math.random() * 900);
    const p2 = Math.floor(100 + Math.random() * 900);
    setRoomId(`esme-${p1}-${p2}`);
  };

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (jitsiApiRef.current) {
        try { jitsiApiRef.current.dispose(); } catch (_) {}
        jitsiApiRef.current = null;
      }
    };
  }, []);

  // Sync selected branch if prop changes
  useEffect(() => {
    if (currentBranchId) {
      setSelectedBranchId(currentBranchId);
    }
  }, [currentBranchId]);

  // Sync current personnel if prop changes
  useEffect(() => {
    if (currentPersonnel) {
      setDisplayName(currentPersonnel);
    }
  }, [currentPersonnel]);

  return (
    <div className="w-full flex-1 flex flex-col relative font-sans text-slate-100">
      
      {/* =================================================================== */}
      {/* 1. LOBBY SCREEN (GİRİŞ & ÖNİZLEME ALANI)                             */}
      {/* =================================================================== */}
      {!isInMeeting ? (
        <div className="w-full min-h-[82vh] flex flex-col items-center justify-center p-3 sm:p-6 bg-slate-950/95">
          
          {/* Top navigation row */}
          <div className="w-full max-w-md flex items-center justify-between mb-3 px-1">
            {onLeaveMeeting ? (
              <button
                type="button"
                onClick={onLeaveMeeting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition cursor-pointer border border-slate-800 shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Eğitimlere Dön</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2 bg-emerald-950/70 border border-emerald-800/80 px-3 py-1 rounded-full text-emerald-400 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ESME Canlı Toplantı Salonu</span>
            </div>
          </div>

          {/* Lobby Card */}
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  ESME Eğitim Toplantı Salonu
                </h1>
                <p className="text-xs text-slate-400 font-medium">
                  Yüksek çözünürlüklü, sesli ve görüntülü canlı koordinasyon
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 mb-6 mt-3 leading-relaxed">
              Aşağıdaki bilgileri kontrol edip <strong className="text-white">"Toplantıya Gir"</strong> butonuna basın. Aynı oda koduyla bağlanan tüm mağaza ve temsilciler birbirlerinin sesini ve görüntüsünü anında alır.
            </p>

            <div className="space-y-4">
              {/* Room ID Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Oda ID (Meeting ID)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-'))}
                    placeholder="örn: esme-egitim-101"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateRoom}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition cursor-pointer shrink-0"
                    title="Yeni Oda Kodu Üret"
                  >
                    Yeni Kod
                  </button>
                </div>
              </div>

              {/* Display Name Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Görünen Adınız
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Adınızı girin"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-red-500 pl-9"
                  />
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                </div>
              </div>

              {/* Branch Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Mağaza / Şube</span>
                  <span className="text-[10px] text-slate-500">({branches.length} Şube)</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-red-500 pl-9 cursor-pointer appearance-none"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} — {b.city || 'Merkez'} ({b.code})
                      </option>
                    ))}
                  </select>
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={joinMeeting}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-[0.98] text-white font-extrabold text-sm tracking-wide shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Video className="w-5 h-5" />
                  <span>TOPLANTIYA GİR</span>
                </button>
              </div>

              {/* Test Hint Box */}
              <div className="p-3 bg-blue-950/40 border border-blue-900/60 rounded-2xl text-[12px] text-blue-200 leading-relaxed flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-blue-100">Test İpucu:</strong> Bu sayfayı iki farklı pencerede (biri normal, biri gizli mod) açıp aynı Oda ID'sini girerek iki farklı temsilci gibi karşılıklı kamera/mikrofon testi yapabilirsiniz.
                </div>
              </div>

            </div>
          </div>
        </div>
      ) : (
        /* =================================================================== */
        /* 2. ACTIVE MEETING ROOM (JITSI MEET SFU ENTEGRASYONU)                */
        /* =================================================================== */
        <div className="fixed inset-0 z-50 flex flex-col bg-[#0f172a] text-slate-100 overflow-hidden">
          
          {/* Meeting Header */}
          <div className="h-13 sm:h-14 bg-slate-950/95 border-b border-slate-800 px-3 sm:px-5 flex items-center justify-between shrink-0 gap-3 z-20">
            {/* Info */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white shrink-0 shadow-md">
                <Video className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-xs sm:text-sm text-white truncate max-w-[180px] sm:max-w-md">
                ESME Eğitim • {roomId}
              </span>
              <span className="text-[11px] px-2.5 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 rounded-full font-bold whitespace-nowrap shrink-0">
                {participantCount}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={copyLink}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer shadow-xs"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copiedLink ? 'Kopyalandı' : 'Linki Kopyala'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowLeaveModal(true)}
                className="inline-flex items-center gap-1.5 text-xs font-black px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/30 transition cursor-pointer"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>Ayrıl</span>
              </button>
            </div>
          </div>

          {/* Jitsi Meeting Container */}
          <div className="flex-1 w-full relative min-h-0 bg-[#0f172a] overflow-hidden">
            
            {/* Jitsi Mount Node */}
            <div 
              ref={jitsiContainerRef} 
              id="jitsi-container"
              className="w-full h-full relative"
            />

            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0f172a] z-10 p-4">
                <div className="w-9 h-9 border-3 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-xs sm:text-sm text-slate-300 font-semibold animate-pulse">
                  Görüşme hazırlanıyor…
                </p>
                <p className="text-[11px] text-slate-500">
                  Kamera ve mikrofon bağlantısı kuruluyor
                </p>
              </div>
            )}

            {/* Error Overlay */}
            {errorMessage && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0f172a] z-20 p-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white mb-1">Bağlantı Hatası</h3>
                  <p className="text-xs text-red-300 max-w-md mx-auto">
                    {errorMessage}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={joinMeeting}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Tekrar Dene</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => leaveMeeting()}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer border border-slate-700"
                  >
                    Geri Dön
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Leave Confirmation Modal */}
          {showLeaveModal && (
            <div 
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
              onClick={() => setShowLeaveModal(false)}
            >
              <div 
                className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl text-white"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
                    <PhoneOff className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">Toplantıdan Ayrıl</h3>
                    <p className="text-xs text-slate-400">Görüşmeyi sonlandırmak istiyor musunuz?</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Toplantıdan ayrıldığınızda diğer temsilciler ile olan ses ve görüntü iletişiminiz güvenli bir şekilde kesilecektir.
                </p>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowLeaveModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="button"
                    onClick={() => leaveMeeting()}
                    className="px-4 py-2 rounded-xl text-xs font-black bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 transition cursor-pointer"
                  >
                    Ayrıl
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
