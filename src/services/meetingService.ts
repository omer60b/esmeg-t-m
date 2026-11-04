import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  onSnapshot, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebaseService';
import { MeetingRoom, MeetingParticipant, MeetingChatMessage, MeetingAttendanceRecord } from '../types';

export const DEFAULT_MEETING_ID = 'esme-genel-toplanti';

// Generate human-friendly Zoom style meeting ID e.g. "ESME-482-910"
export function generateMeetingCode(): string {
  const p1 = Math.floor(100 + Math.random() * 900);
  const p2 = Math.floor(100 + Math.random() * 900);
  return `ESME-${p1}-${p2}`;
}

// Generate color for avatar based on name
export function getAvatarColor(name: string): string {
  const colors = [
    'from-blue-600 to-indigo-700',
    'from-emerald-600 to-teal-700',
    'from-rose-600 to-red-700',
    'from-purple-600 to-violet-700',
    'from-amber-600 to-orange-700',
    'from-cyan-600 to-blue-700'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

// Get initials (e.g. "Ahmet Yılmaz" -> "AY")
export function getInitials(name: string): string {
  if (!name) return 'ES';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Create or Get existing Meeting Room
 */
export async function createOrGetMeetingRoom(
  meetingId: string,
  title: string,
  hostName: string,
  hostBranchId: number,
  hostBranchName: string,
  passcode?: string
): Promise<MeetingRoom> {
  const cleanId = (meetingId.trim() || DEFAULT_MEETING_ID).toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const roomRef = doc(db, 'meetings', cleanId);
  
  const fallbackRoom: MeetingRoom = {
    id: cleanId,
    title: title || 'ESME Mağazalar Genel Koordinasyon ve Eğitim Toplantısı',
    hostName: hostName || 'Toplantı Yöneticisi',
    hostBranchId,
    hostBranchName,
    passcode: passcode || '',
    status: 'active',
    createdAt: new Date().toISOString(),
    allowScreenShare: true
  };

  try {
    // 2-second timeout race prevents indefinite Firestore hang
    const getPromise = getDoc(roomRef);
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('timeout')), 2000)
    );
    const snap = await Promise.race([getPromise, timeoutPromise]);

    if (snap && snap.exists()) {
      const data = snap.data() as MeetingRoom;
      // If room was previously ended by host, automatically reactivate it for new meeting
      if (data.status === 'ended') {
        const reactivated: MeetingRoom = {
          ...data,
          status: 'active',
          hostName: hostName || data.hostName,
          title: title || data.title
        };
        updateDoc(roomRef, { status: 'active', hostName: reactivated.hostName }).catch(() => {});
        return reactivated;
      }
      return {
        ...data,
        id: cleanId
      };
    }

    // Set new room with timeout race
    await Promise.race([
      setDoc(roomRef, fallbackRoom),
      new Promise<void>((resolve) => setTimeout(resolve, 2000))
    ]);
    return fallbackRoom;
  } catch (error) {
    console.warn("createOrGetMeetingRoom using resilient fallback:", error);
    return fallbackRoom;
  }
}

/**
 * Subscribe to Meeting Room info
 */
export function subscribeToMeetingRoom(
  meetingId: string,
  callback: (room: MeetingRoom | null) => void
): () => void {
  const cleanId = (meetingId.trim() || DEFAULT_MEETING_ID).toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const roomRef = doc(db, 'meetings', cleanId);

  return onSnapshot(roomRef, (snap) => {
    if (snap.exists()) {
      callback({ ...(snap.data() as MeetingRoom), id: cleanId });
    } else {
      callback(null);
    }
  }, (err) => {
    console.warn("Meeting room subscription warning:", err);
  });
}

/**
 * Join Meeting (Register participant)
 */
export async function joinMeetingParticipant(
  meetingId: string,
  participant: MeetingParticipant
): Promise<void> {
  const cleanId = (meetingId.trim() || DEFAULT_MEETING_ID).toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const pRef = doc(db, 'meetings', cleanId, 'participants', participant.id);

  try {
    await Promise.race([
      setDoc(pRef, {
        ...participant,
        lastPing: Date.now()
      }),
      new Promise<void>((resolve) => setTimeout(resolve, 2000))
    ]);
  } catch (err) {
    console.warn("Join participant sync notice:", err);
  }
}

/**
 * Update Participant Status (Mute, Video, Screen Share, Hand Raise)
 */
export async function updateParticipantStatus(
  meetingId: string,
  participantId: string,
  updates: Partial<MeetingParticipant>
): Promise<void> {
  const cleanId = (meetingId.trim() || DEFAULT_MEETING_ID).toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const pRef = doc(db, 'meetings', cleanId, 'participants', participantId);

  try {
    await updateDoc(pRef, {
      ...updates,
      lastPing: Date.now()
    });
  } catch (err) {
    console.warn("Update participant error:", err);
  }
}

/**
 * Mute or Unmute all participants in the meeting (Host/Manager action)
 */
export async function setAllParticipantsAudioMuted(
  meetingId: string,
  muted: boolean
): Promise<void> {
  const cleanId = (meetingId.trim() || DEFAULT_MEETING_ID).toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const colRef = collection(db, 'meetings', cleanId, 'participants');
  try {
    const snap = await getDocs(colRef);
    for (const docSnap of snap.docs) {
      updateDoc(docSnap.ref, { isAudioMuted: muted }).catch(() => {});
    }
  } catch (err) {
    console.warn("Set all audio muted error:", err);
  }
}

/**
 * Leave Meeting (Remove participant)
 */
export async function leaveMeetingParticipant(
  meetingId: string,
  participantId: string
): Promise<void> {
  const cleanId = (meetingId.trim() || DEFAULT_MEETING_ID).toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const pRef = doc(db, 'meetings', cleanId, 'participants', participantId);

  try {
    await deleteDoc(pRef);
  } catch (err) {
    console.warn("Leave participant error:", err);
  }
}

/**
 * Send Heartbeat Ping to mark participant as alive
 */
export async function pingParticipant(
  meetingId: string,
  participantId: string
): Promise<void> {
  const cleanId = (meetingId.trim() || DEFAULT_MEETING_ID).toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const pRef = doc(db, 'meetings', cleanId, 'participants', participantId);
  try {
    await setDoc(pRef, { lastPing: Date.now() }, { merge: true });
  } catch (err) {
    console.warn("Participant heartbeat error:", err);
  }
}

/**
 * Purge Stale and Test Participants from Firestore
 */
export async function purgeStaleAndTestParticipants(meetingId: string): Promise<void> {
  const cleanId = (meetingId.trim() || DEFAULT_MEETING_ID).toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const colRef = collection(db, 'meetings', cleanId, 'participants');
  try {
    const snap = await getDocs(colRef);
    const now = Date.now();
    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      const isTest = docSnap.id.startsWith('test_') || (data.name && String(data.name).toLowerCase().includes('test'));
      const isStale = !data.lastPing || (now - data.lastPing > 20000); // 20 saniyeden eski veya test olanları sil
      if (isTest || isStale) {
        deleteDoc(docSnap.ref).catch(() => {});
      }
    }
  } catch {}
}

/**
 * Subscribe to Participants List (Filters out stale users and test branches automatically)
 */
export function subscribeToParticipants(
  meetingId: string,
  callback: (participants: MeetingParticipant[]) => void
): () => void {
  const cleanId = (meetingId.trim() || DEFAULT_MEETING_ID).toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const colRef = collection(db, 'meetings', cleanId, 'participants');

  // Initial purge of old/stale records
  purgeStaleAndTestParticipants(cleanId);

  return onSnapshot(colRef, (snap) => {
    const list: MeetingParticipant[] = [];
    const now = Date.now();
    snap.forEach((docSnap) => {
      const data = docSnap.data() as MeetingParticipant & { lastPing?: number };
      const isTest = docSnap.id.startsWith('test_') || (data.name && String(data.name).toLowerCase().includes('test'));
      const isStale = !data.lastPing || (now - data.lastPing > 20000);

      if (isTest || isStale) {
        // Oturumunu kapatmış veya test olarak eklenmiş kullanıcıyı anında temizle
        deleteDoc(docSnap.ref).catch(() => {});
      } else {
        list.push(data);
      }
    });
    callback(list);
  }, (err) => {
    console.warn("Participants subscription error:", err);
  });
}

/**
 * Send In-Meeting Chat Message
 */
export async function sendMeetingChatMessage(
  meetingId: string,
  message: Omit<MeetingChatMessage, 'id' | 'timestamp'>
): Promise<void> {
  const cleanId = (meetingId.trim() || DEFAULT_MEETING_ID).toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const msgId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const msgRef = doc(db, 'meetings', cleanId, 'messages', msgId);

  try {
    await setDoc(msgRef, {
      ...message,
      id: msgId,
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      createdAt: Date.now()
    });
  } catch (err) {
    console.warn("Send chat message error:", err);
  }
}

/**
 * Subscribe to Chat Messages
 */
export function subscribeToMeetingChat(
  meetingId: string,
  callback: (messages: MeetingChatMessage[]) => void
): () => void {
  const cleanId = (meetingId.trim() || DEFAULT_MEETING_ID).toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const colRef = collection(db, 'meetings', cleanId, 'messages');
  const q = query(colRef, orderBy('createdAt', 'asc'), limit(100));

  return onSnapshot(q, (snap) => {
    const list: MeetingChatMessage[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        senderId: data.senderId,
        senderName: data.senderName,
        senderBranch: data.senderBranch,
        text: data.text,
        target: data.target || 'everyone',
        timestamp: data.timestamp || ''
      });
    });
    callback(list);
  }, (err) => {
    console.warn("Meeting chat subscription error:", err);
  });
}

/**
 * Update Whiteboard Canvas
 */
export async function updateMeetingWhiteboard(
  meetingId: string,
  whiteboardData: string
): Promise<void> {
  const cleanId = (meetingId.trim() || DEFAULT_MEETING_ID).toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const roomRef = doc(db, 'meetings', cleanId);

  try {
    await updateDoc(roomRef, {
      whiteboardData
    });
  } catch (err) {
    console.warn("Update whiteboard error:", err);
  }
}

/**
 * End meeting for all participants (Host only)
 */
export async function endMeetingForAll(meetingId: string): Promise<void> {
  const cleanId = (meetingId.trim() || DEFAULT_MEETING_ID).toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const roomRef = doc(db, 'meetings', cleanId);

  try {
    await updateDoc(roomRef, {
      status: 'ended'
    });
  } catch (err) {
    console.warn("End meeting error:", err);
  }
}

/**
 * WebRTC Signaling Functions for Real-Time Peer Video/Audio Streaming
 */
export async function sendWebRTCSignal(
  meetingId: string,
  senderId: string,
  receiverId: string,
  type: 'offer' | 'answer' | 'candidate' | 'heartbeat' | 'heartbeat-ack',
  payload: string
): Promise<void> {
  const cleanId = (meetingId.trim() || DEFAULT_MEETING_ID).toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const sigId = 'sig_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const sigRef = doc(db, 'meetings', cleanId, 'signals', sigId);

  try {
    await setDoc(sigRef, {
      id: sigId,
      senderId,
      receiverId,
      type,
      payload,
      createdAt: Date.now()
    });
  } catch (err) {
    console.warn("WebRTC signaling write error:", err);
  }
}

/**
 * Purge old WebRTC signals to keep the collection lean
 */
export async function purgeOldWebRTCSignals(meetingId: string): Promise<void> {
  const cleanId = (meetingId.trim() || DEFAULT_MEETING_ID).toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const colRef = collection(db, 'meetings', cleanId, 'signals');
  try {
    const snap = await getDocs(colRef);
    const expireTime = Date.now() - 30000;
    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      if (!data.createdAt || data.createdAt < expireTime) {
        deleteDoc(docSnap.ref).catch(() => {});
      }
    }
  } catch {}
}

export function subscribeToWebRTCSignals(
  meetingId: string,
  currentUserId: string,
  onSignal: (signal: { senderId: string; receiverId: string; type: string; payload: string; id: string }) => void
): () => void {
  const cleanId = (meetingId.trim() || DEFAULT_MEETING_ID).toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const colRef = collection(db, 'meetings', cleanId, 'signals');
  const startTime = Date.now() - 15000;

  return onSnapshot(colRef, (snap) => {
    snap.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const data = change.doc.data();
        if (data.receiverId === currentUserId && data.createdAt >= startTime) {
          // Once delivered to the intended receiver, delete to prevent memory build-up and duplicate delivery
          deleteDoc(change.doc.ref).catch(() => {});
          onSignal({
            id: change.doc.id,
            senderId: data.senderId,
            receiverId: data.receiverId,
            type: data.type,
            payload: data.payload
          });
        } else if (Date.now() - (data.createdAt || 0) > 45000) {
          deleteDoc(change.doc.ref).catch(() => {});
        }
      }
    });
  }, (err) => {
    console.warn("Signals subscription warning:", err);
  });
}

/**
 * Detect Device Type (Mobil, Tablet, Masaüstü)
 */
export function detectDeviceType(): 'Mobil' | 'Tablet' | 'Masaüstü' {
  if (typeof navigator === 'undefined') return 'Masaüstü';
  const ua = (navigator.userAgent || '').toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'Tablet';
  }
  if (/mobile|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop|android/i.test(ua)) {
    return 'Mobil';
  }
  if (typeof window !== 'undefined' && window.innerWidth <= 768) {
    return 'Mobil';
  }
  return 'Masaüstü';
}

const ATTENDANCE_STORAGE_KEY = 'esme_meeting_attendance_logs';

/**
 * Record attendance in Firestore & localStorage when user enters a meeting
 */
export async function recordAttendanceLog(
  meetingId: string,
  participant: MeetingParticipant,
  meetingTitle?: string
): Promise<string> {
  const cleanId = (meetingId.trim() || DEFAULT_MEETING_ID).toUpperCase();
  const recordId = `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const device = detectDeviceType();

  const record: MeetingAttendanceRecord = {
    id: recordId,
    meetingId: cleanId,
    meetingTitle: meetingTitle || 'ESME Canlı Eğitim Toplantısı',
    participantId: participant.id,
    participantName: participant.name.replace(/\s*\(Siz\)\s*$/, '').trim(),
    branchId: participant.branchId,
    branchName: participant.branchName,
    role: participant.role,
    deviceType: device,
    joinedAt: now,
    status: 'active'
  };

  // Local storage update
  try {
    const raw = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
    const list: MeetingAttendanceRecord[] = raw ? JSON.parse(raw) : [];
    list.unshift(record);
    localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(list.slice(0, 500)));
  } catch {}

  // Firestore update
  try {
    const ref = doc(db, 'meeting_attendance_logs', recordId);
    await setDoc(ref, record);
  } catch (err) {
    console.warn("Firestore record attendance log error:", err);
  }

  return recordId;
}

/**
 * Update attendance log on exit (mark leftAt, durationMinutes, completed)
 */
export async function updateAttendanceLogOnLeave(
  recordId: string,
  joinedAtIso?: string
): Promise<void> {
  if (!recordId) return;
  const now = new Date().toISOString();
  let duration = 1;
  if (joinedAtIso) {
    const diffMs = Date.now() - new Date(joinedAtIso).getTime();
    duration = Math.max(1, Math.round(diffMs / 60000));
  }

  // Update local storage
  try {
    const raw = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
    if (raw) {
      const list: MeetingAttendanceRecord[] = JSON.parse(raw);
      const idx = list.findIndex(r => r.id === recordId);
      if (idx !== -1) {
        list[idx].leftAt = now;
        list[idx].durationMinutes = duration;
        list[idx].status = 'completed';
        localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(list));
      }
    }
  } catch {}

  // Update Firestore
  try {
    const ref = doc(db, 'meeting_attendance_logs', recordId);
    await updateDoc(ref, {
      leftAt: now,
      durationMinutes: duration,
      status: 'completed'
    });
  } catch (err) {
    console.warn("Firestore update attendance log error:", err);
  }
}

/**
 * Subscribe to Attendance Logs for Administrator Reporting
 */
export function subscribeToAttendanceLogs(
  callback: (records: MeetingAttendanceRecord[]) => void
): () => void {
  // Read local storage immediately
  try {
    const raw = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
    if (raw) {
      callback(JSON.parse(raw));
    }
  } catch {}

  const colRef = collection(db, 'meeting_attendance_logs');
  return onSnapshot(colRef, (snap) => {
    const remoteList: MeetingAttendanceRecord[] = [];
    snap.forEach((d) => {
      remoteList.push({ id: d.id, ...d.data() } as MeetingAttendanceRecord);
    });

    // Sort newest first
    remoteList.sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime());

    // Merge with localStorage
    let combined = remoteList;
    try {
      const raw = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
      if (raw) {
        const localList: MeetingAttendanceRecord[] = JSON.parse(raw);
        const map = new Map<string, MeetingAttendanceRecord>();
        localList.forEach(r => map.set(r.id, r));
        remoteList.forEach(r => map.set(r.id, r));
        combined = Array.from(map.values()).sort((a, b) => 
          new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
        );
      }
    } catch {}

    callback(combined);
  }, (err) => {
    console.warn("Attendance logs subscription error, using local fallback:", err);
    try {
      const raw = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
      if (raw) callback(JSON.parse(raw));
    } catch {}
  });
}

/**
 * Clear All Attendance Logs (Admin action)
 */
export async function clearAllAttendanceLogs(): Promise<void> {
  try {
    localStorage.removeItem(ATTENDANCE_STORAGE_KEY);
  } catch {}

  try {
    const colRef = collection(db, 'meeting_attendance_logs');
    const snap = await getDocs(colRef);
    for (const d of snap.docs) {
      deleteDoc(d.ref).catch(() => {});
    }
  } catch (err) {
    console.warn("Clear attendance logs error:", err);
  }
}
