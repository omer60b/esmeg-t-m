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
import { MeetingRoom, MeetingParticipant, MeetingChatMessage } from '../types';

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
  
  try {
    const snap = await getDoc(roomRef);
    if (snap.exists()) {
      const data = snap.data() as MeetingRoom;
      return {
        ...data,
        id: cleanId
      };
    }

    const newRoom: MeetingRoom = {
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

    await setDoc(roomRef, newRoom);
    return newRoom;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `meetings/${cleanId}`);
    // Fallback in-memory object
    return {
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
    console.warn("Meeting room subscription error, using local fallback:", err);
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
    await setDoc(pRef, {
      ...participant,
      lastPing: Date.now()
    });
  } catch (err) {
    console.warn("Join participant sync error:", err);
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
    await updateDoc(pRef, { lastPing: Date.now() });
  } catch {}
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
  type: 'offer' | 'answer' | 'candidate',
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
    // Silent catch
  }
}

export function subscribeToWebRTCSignals(
  meetingId: string,
  currentUserId: string,
  onSignal: (signal: { senderId: string; receiverId: string; type: string; payload: string; id: string }) => void
): () => void {
  const cleanId = (meetingId.trim() || DEFAULT_MEETING_ID).toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const colRef = collection(db, 'meetings', cleanId, 'signals');
  const now = Date.now() - 10000; // only recent signals

  return onSnapshot(colRef, (snap) => {
    snap.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const data = change.doc.data();
        if (data.receiverId === currentUserId && data.createdAt >= now) {
          onSignal({
            id: change.doc.id,
            senderId: data.senderId,
            receiverId: data.receiverId,
            type: data.type,
            payload: data.payload
          });
        }
      }
    });
  }, (err) => {
    // Silent catch
  });
}
