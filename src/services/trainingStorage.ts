import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot, 
  collection, 
  getDocs, 
  deleteDoc 
} from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from './firebaseService';
import { TrainingDocument, TrainingCompletion, TrainingCategory, TrainingAnnouncement, SupportMessage } from '../types';
import { initialTrainings } from '../data/trainingData';

const STORAGE_TRAININGS_KEY = 'esme_akademi_trainings_v2';
const STORAGE_COMPLETIONS_KEY = 'esme_akademi_completions_v1';
const STORAGE_LEGACY_COMPLETIONS_KEY = 'esme_training_completions';
const STORAGE_DELETED_IDS_KEY = 'esme_deleted_training_ids_v1';
const STORAGE_CUSTOM_ADMINS_KEY = 'esme_custom_admins';
const STORAGE_ADMIN_PASSWORDS_KEY = 'esme_admin_passwords';
const STORAGE_ANNOUNCEMENTS_KEY = 'esme_training_announcements_v1';
const STORAGE_SUPPORT_MESSAGES_KEY = 'esme_support_messages_v1';

const TRAINING_CATALOG_DOC = doc(db, 'appData', 'trainings_catalog');
const TRAINING_META_DOC = doc(db, 'appData', 'trainings_meta');
const TRAINING_COMPLETIONS_DOC = doc(db, 'appData', 'training_completions');
const ADMIN_ACCOUNTS_DOC = doc(db, 'appData', 'admin_accounts');
const TRAINING_ANNOUNCEMENTS_DOC = doc(db, 'appData', 'training_announcements');
const SUPPORT_MESSAGES_DOC = doc(db, 'appData', 'support_messages');
const TRAININGS_COLLECTION = collection(db, 'trainings');

// BroadcastChannel for instant multi-tab sync on the same browser
const trainingChannel = typeof BroadcastChannel !== 'undefined' 
  ? new BroadcastChannel('esme_trainings_realtime_channel') 
  : null;

function getDeletedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_DELETED_IDS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch {}
  return new Set();
}

function saveDeletedIds(ids: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_DELETED_IDS_KEY, JSON.stringify(Array.from(ids)));
  } catch {}
}

// Legacy/automatic preloaded sample videos that should be excluded so only admin videos appear
export const AUTOMATIC_PRELOADED_VIDEOS = new Set([
  '0kP0aW4l6bM',
  'inWWhr5tnEA',
  '60ItHLz5WEA',
  'kJQP7kiw5Fk',
  'L_LUpnjgPso',
  '3JZ_D3ELwOQ',
  'fJ9rUzIMcZQ',
  'M576WGiDBdQ',
  '21X5lGlDOfg',
  'JGwWNGJdvx8',
  'lTRiuFIWV54',
  'uelHwf8o7_U'
]);

export function isAutomaticPreloadedVideo(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const clean = url.trim();
  if (!clean) return false;
  if (clean.includes('commondatastorage.googleapis.com') || clean.includes('gtv-videos-bucket')) {
    return true;
  }
  for (const id of AUTOMATIC_PRELOADED_VIDEOS) {
    if (clean.includes(id)) return true;
  }
  return false;
}

/**
 * Ensures a training object is safe to write to a single Firestore document (< 850KB)
 */
function sanitizeTrainingForFirestore(t: TrainingDocument): TrainingDocument {
  const isAutoPreload = isAutomaticPreloadedVideo(t.videoUrl);
  const cleanVideoUrl = isAutoPreload ? '' : (t.videoUrl ?? '');
  const hasVideo = Boolean(cleanVideoUrl && cleanVideoUrl.trim() !== '');
  const copy: TrainingDocument = JSON.parse(JSON.stringify({
    ...t,
    videoType: hasVideo ? (t.videoType || 'link') : 'none',
    videoUrl: cleanVideoUrl,
    videoTitle: hasVideo ? (t.videoTitle || '') : '',
    videoDuration: hasVideo ? (t.videoDuration || '') : '',
    pdfPath: t.pdfPath ?? ''
  }));

  // Guard against base64 files exceeding Firestore's 1MB document limit
  if (copy.videoUrl && copy.videoUrl.startsWith('data:') && copy.videoUrl.length > 650000) {
    copy.videoUrl = '';
    copy.videoType = 'none';
  }
  if (copy.pdfPath && copy.pdfPath.startsWith('data:') && copy.pdfPath.length > 650000) {
    copy.pdfPath = '/assets/aistudio/Bilgi___lem_ve_Kasa_Y_netimi_Genel_E_itim_Talimat__085ba22b.pdf';
  }
  return copy;
}

/**
 * Strips heavy base64 blobs from catalog summary array so `appData/trainings_catalog` never exceeds 1MB
 */
function sanitizeCatalogForFirestore(list: TrainingDocument[]): TrainingDocument[] {
  return list.map(t => {
    const item = sanitizeTrainingForFirestore(t);
    const isAutoPreload = isAutomaticPreloadedVideo(item.videoUrl);
    if (isAutoPreload) {
      item.videoUrl = '';
      item.videoType = 'none';
      item.videoTitle = '';
      item.videoDuration = '';
    }
    if (item.videoUrl && item.videoUrl.startsWith('data:') && item.videoUrl.length > 100000) {
      item.videoUrl = '';
    }
    if (item.pdfPath && item.pdfPath.startsWith('data:') && item.pdfPath.length > 100000) {
      item.pdfPath = '/assets/aistudio/Bilgi___lem_ve_Kasa_Y_netimi_Genel_E_itim_Talimat__085ba22b.pdf';
    }
    return item;
  });
}

export function normalizeTrainings(items: TrainingDocument[]): TrainingDocument[] {
  const defaultCategoryMap = new Map<string, TrainingCategory>();
  initialTrainings.forEach(t => defaultCategoryMap.set(t.id, t.category));

  return items.map(t => {
    if (!t.isCustom && defaultCategoryMap.has(t.id)) {
      return { ...t, category: defaultCategoryMap.get(t.id)! };
    }
    return t;
  });
}

/**
 * Merge any incoming trainings array with initialTrainings & custom trainings
 * so new custom trainings are placed at the top and default trainings preserve admin edits
 */
export function mergeTrainingsList(
  incoming: TrainingDocument[],
  deletedIds: Set<string> = getDeletedIds()
): TrainingDocument[] {
  const customMap = new Map<string, TrainingDocument>();
  const defaultMap = new Map<string, TrainingDocument>();

  initialTrainings.forEach(t => {
    if (!deletedIds.has(t.id)) {
      defaultMap.set(t.id, t);
    }
  });

  incoming.forEach((t: TrainingDocument) => {
    if (!t || !t.id || deletedIds.has(t.id)) return;

    const isAutoPreload = isAutomaticPreloadedVideo(t.videoUrl);
    const sanitizedVideoUrl = isAutoPreload ? undefined : (t.videoUrl && t.videoUrl.trim() !== '' ? t.videoUrl.trim() : undefined);
    const sanitizedVideoType = sanitizedVideoUrl ? (t.videoType || 'link') : 'none';
    const sanitizedVideoTitle = sanitizedVideoUrl ? t.videoTitle : undefined;
    const sanitizedVideoDuration = sanitizedVideoUrl ? t.videoDuration : undefined;

    if (defaultMap.has(t.id)) {
      const existing = defaultMap.get(t.id)!;
      // If incoming video was an auto-preload dummy, discard it and keep empty
      const mergedVideoUrl = (sanitizedVideoUrl !== undefined) ? sanitizedVideoUrl : (isAutoPreload ? undefined : existing.videoUrl);
      const mergedVideoType = mergedVideoUrl ? (t.videoType || 'link') : 'none';

      defaultMap.set(t.id, {
        ...existing,
        ...t,
        videoType: mergedVideoType,
        videoUrl: mergedVideoUrl,
        videoTitle: mergedVideoUrl ? (sanitizedVideoTitle || existing.videoTitle) : undefined,
        videoDuration: mergedVideoUrl ? (sanitizedVideoDuration || existing.videoDuration) : undefined,
        pdfPath: t.pdfPath !== undefined ? t.pdfPath : existing.pdfPath,
        category: t.category || existing.category
      });
    } else if (!initialTrainings.some(def => def.id === t.id)) {
      customMap.set(t.id, {
        ...t,
        videoType: sanitizedVideoType,
        videoUrl: sanitizedVideoUrl,
        videoTitle: sanitizedVideoTitle,
        videoDuration: sanitizedVideoDuration,
        pdfPath: t.pdfPath || undefined,
        isCustom: true
      });
    }
  });

  // Sort custom trainings newest first
  const customList = Array.from(customMap.values()).sort((a, b) => {
    const timeA = a.updatedAt || a.createdAt || '';
    const timeB = b.updatedAt || b.createdAt || '';
    return timeB.localeCompare(timeA);
  });

  const combined = [...customList, ...Array.from(defaultMap.values())];
  return normalizeTrainings(combined);
}

/**
 * Get current trainings from localStorage, or return initialTrainings
 */
export function getStoredTrainings(): TrainingDocument[] {
  try {
    const deletedIds = getDeletedIds();
    const raw = localStorage.getItem(STORAGE_TRAININGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const merged = mergeTrainingsList(parsed, deletedIds);
        localStorage.setItem(STORAGE_TRAININGS_KEY, JSON.stringify(merged));
        return merged;
      }
    }
    const merged = mergeTrainingsList([], deletedIds);
    localStorage.setItem(STORAGE_TRAININGS_KEY, JSON.stringify(merged));
    return merged;
  } catch (err) {
    console.error('Failed to parse stored trainings:', err);
  }
  return initialTrainings;
}

/**
 * Save trainings to localStorage and Firestore (both meta, catalog doc, and individual docs)
 */
export async function saveTrainings(trainings: TrainingDocument[]): Promise<boolean> {
  try {
    const deletedIds = getDeletedIds();
    const merged = mergeTrainingsList(trainings, deletedIds);
    localStorage.setItem(STORAGE_TRAININGS_KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('trainings_updated', { detail: merged }));
    trainingChannel?.postMessage({ type: 'TRAININGS_UPDATED', trainings: merged });

    const now = new Date().toISOString();
    const deletedArray = Array.from(deletedIds);

    await Promise.allSettled([
      setDoc(TRAINING_META_DOC, {
        deletedIds: deletedArray,
        updatedAt: now
      }).catch(err => handleFirestoreError(err, OperationType.WRITE, 'appData/trainings_meta')),

      setDoc(TRAINING_CATALOG_DOC, {
        trainings: sanitizeCatalogForFirestore(merged),
        deletedIds: deletedArray,
        updatedAt: now
      }).catch(err => handleFirestoreError(err, OperationType.WRITE, 'appData/trainings_catalog'))
    ]);

    return true;
  } catch (err) {
    console.error('Error saving trainings:', err);
    return false;
  }
}

/**
 * Add or update a training document and sync immediately to Firestore
 */
export async function upsertTraining(training: TrainingDocument): Promise<boolean> {
  const deletedIds = getDeletedIds();
  if (deletedIds.has(training.id)) {
    deletedIds.delete(training.id);
    saveDeletedIds(deletedIds);
  }

  const current = getStoredTrainings();
  const index = current.findIndex(t => t.id === training.id);
  const now = new Date().toISOString();
  const isDefault = initialTrainings.some(t => t.id === training.id);

  const normalizedItem: TrainingDocument = {
    ...training,
    isCustom: !isDefault,
    createdAt: training.createdAt || now,
    updatedAt: now
  };

  let updated: TrainingDocument[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = normalizedItem;
  } else {
    updated = [normalizedItem, ...current];
  }

  // Update local storage and notify current browser immediately
  const merged = mergeTrainingsList(updated, deletedIds);
  localStorage.setItem(STORAGE_TRAININGS_KEY, JSON.stringify(merged));
  window.dispatchEvent(new CustomEvent('trainings_updated', { detail: merged }));
  trainingChannel?.postMessage({ type: 'TRAININGS_UPDATED', trainings: merged });

  const cleanItem = sanitizeTrainingForFirestore(normalizedItem);
  const deletedArray = Array.from(deletedIds);

  // Write individual document to `trainings/{id}`, `appData/trainings_meta`, and `appData/trainings_catalog`
  await Promise.allSettled([
    setDoc(doc(db, 'trainings', normalizedItem.id), cleanItem).catch(err =>
      handleFirestoreError(err, OperationType.WRITE, `trainings/${normalizedItem.id}`)
    ),
    setDoc(TRAINING_META_DOC, {
      deletedIds: deletedArray,
      lastAction: 'upsert',
      targetId: normalizedItem.id,
      updatedAt: now
    }).catch(err => handleFirestoreError(err, OperationType.WRITE, 'appData/trainings_meta')),
    setDoc(TRAINING_CATALOG_DOC, {
      trainings: sanitizeCatalogForFirestore(merged),
      deletedIds: deletedArray,
      updatedAt: now
    }).catch(err => handleFirestoreError(err, OperationType.WRITE, 'appData/trainings_catalog'))
  ]);

  return true;
}

/**
 * Delete a training document and sync deletion to Firestore in real time for all users
 */
export async function deleteTraining(id: string): Promise<boolean> {
  try {
    const deletedIds = getDeletedIds();
    deletedIds.add(id);
    saveDeletedIds(deletedIds);

    const current = getStoredTrainings().filter(t => t.id !== id);
    localStorage.setItem(STORAGE_TRAININGS_KEY, JSON.stringify(current));
    window.dispatchEvent(new CustomEvent('trainings_updated', { detail: current }));
    trainingChannel?.postMessage({ type: 'TRAININGS_UPDATED', trainings: current });

    const now = new Date().toISOString();
    const deletedArray = Array.from(deletedIds);

    await Promise.allSettled([
      deleteDoc(doc(db, 'trainings', id)).catch(err =>
        handleFirestoreError(err, OperationType.DELETE, `trainings/${id}`)
      ),
      setDoc(TRAINING_META_DOC, {
        deletedIds: deletedArray,
        lastAction: 'delete',
        targetId: id,
        updatedAt: now
      }).catch(err => handleFirestoreError(err, OperationType.WRITE, 'appData/trainings_meta')),
      setDoc(TRAINING_CATALOG_DOC, {
        trainings: sanitizeCatalogForFirestore(current),
        deletedIds: deletedArray,
        updatedAt: now
      }).catch(err => handleFirestoreError(err, OperationType.WRITE, 'appData/trainings_catalog'))
    ]);

    return true;
  } catch (error) {
    console.error('Firebase silme hatası:', error);
    return false;
  }
}

/**
 * Reset trainings to factory defaults and sync to Firestore
 */
export async function resetTrainingsToDefault(): Promise<TrainingDocument[]> {
  try {
    localStorage.removeItem(STORAGE_DELETED_IDS_KEY);
    localStorage.setItem(STORAGE_TRAININGS_KEY, JSON.stringify(initialTrainings));
    window.dispatchEvent(new CustomEvent('trainings_updated', { detail: initialTrainings }));
    trainingChannel?.postMessage({ type: 'TRAININGS_UPDATED', trainings: initialTrainings });

    // Clear all custom/modified docs in `trainings` collection
    try {
      const snap = await getDocs(TRAININGS_COLLECTION);
      await Promise.allSettled(snap.docs.map(d => deleteDoc(doc(db, 'trainings', d.id))));
    } catch {}

    const now = new Date().toISOString();
    await Promise.allSettled([
      setDoc(TRAINING_META_DOC, {
        deletedIds: [],
        lastAction: 'reset',
        updatedAt: now
      }),
      setDoc(TRAINING_CATALOG_DOC, {
        trainings: sanitizeCatalogForFirestore(initialTrainings),
        deletedIds: [],
        updatedAt: now
      })
    ]);
  } catch (err) {
    console.error('Error resetting trainings:', err);
  }
  return initialTrainings;
}

/**
 * Get stored completions (tebellüğ records)
 */
export function getStoredCompletions(): TrainingCompletion[] {
  try {
    const raw = localStorage.getItem(STORAGE_COMPLETIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Failed to read completions:', err);
  }
  return [];
}

/**
 * Save a new training completion record
 */
export async function recordTrainingCompletion(completion: TrainingCompletion): Promise<boolean> {
  try {
    const list = getStoredCompletions();
    const updated = [
      completion,
      ...list.filter(
        c =>
          !(
            c.trainingId === completion.trainingId &&
            c.personnelName.toLowerCase() === completion.personnelName.toLowerCase() &&
            c.branchId === completion.branchId
          )
      )
    ];
    localStorage.setItem(STORAGE_COMPLETIONS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('completions_updated', { detail: updated }));
    trainingChannel?.postMessage({ type: 'COMPLETIONS_UPDATED', completions: updated });

    try {
      const cleanPayload = JSON.parse(JSON.stringify(updated));
      await setDoc(TRAINING_COMPLETIONS_DOC, {
        completions: cleanPayload,
        updatedAt: new Date().toISOString()
      });
    } catch (fsErr) {
      handleFirestoreError(fsErr, OperationType.WRITE, 'appData/training_completions');
    }

    return true;
  } catch (err) {
    console.error('Error recording completion:', err);
    return false;
  }
}

/**
 * Update an existing training completion / certificate record and sync to Firestore
 */
export async function updateTrainingCompletion(updatedComp: TrainingCompletion): Promise<TrainingCompletion[]> {
  try {
    const list = getStoredCompletions();
    const updated = list.map(c => (c.id === updatedComp.id ? updatedComp : c));
    localStorage.setItem(STORAGE_COMPLETIONS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('completions_updated', { detail: updated }));
    trainingChannel?.postMessage({ type: 'COMPLETIONS_UPDATED', completions: updated });

    try {
      const cleanPayload = JSON.parse(JSON.stringify(updated));
      await setDoc(TRAINING_COMPLETIONS_DOC, {
        completions: cleanPayload,
        updatedAt: new Date().toISOString()
      });
    } catch (fsErr) {
      handleFirestoreError(fsErr, OperationType.WRITE, 'appData/training_completions');
    }

    return updated;
  } catch (err) {
    console.error('Error updating completion:', err);
    return getStoredCompletions();
  }
}

/**
 * Delete a single training completion record and sync to Firestore
 */
export async function deleteTrainingCompletion(completionId: string): Promise<TrainingCompletion[]> {
  try {
    const list = getStoredCompletions();
    const updated = list.filter(c => c.id !== completionId);
    localStorage.setItem(STORAGE_COMPLETIONS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('completions_updated', { detail: updated }));
    trainingChannel?.postMessage({ type: 'COMPLETIONS_UPDATED', completions: updated });

    try {
      const cleanPayload = JSON.parse(JSON.stringify(updated));
      await setDoc(TRAINING_COMPLETIONS_DOC, {
        completions: cleanPayload,
        updatedAt: new Date().toISOString()
      });
    } catch (fsErr) {
      handleFirestoreError(fsErr, OperationType.WRITE, 'appData/training_completions');
    }

    return updated;
  } catch (err) {
    console.error('Error deleting completion:', err);
    return getStoredCompletions();
  }
}

/**
 * Clear ALL training completions (tebellüğ records) from localStorage, BroadcastChannel, and Firestore
 */
export async function clearAllCompletions(): Promise<boolean> {
  try {
    localStorage.setItem(STORAGE_COMPLETIONS_KEY, JSON.stringify([]));
    localStorage.removeItem(STORAGE_LEGACY_COMPLETIONS_KEY);
    window.dispatchEvent(new CustomEvent('completions_updated', { detail: [] }));
    trainingChannel?.postMessage({ type: 'COMPLETIONS_UPDATED', completions: [] });

    try {
      await setDoc(TRAINING_COMPLETIONS_DOC, {
        completions: [],
        updatedAt: new Date().toISOString()
      });
    } catch (fsErr) {
      handleFirestoreError(fsErr, OperationType.WRITE, 'appData/training_completions');
    }

    return true;
  } catch (err) {
    console.error('Error clearing completions:', err);
    return false;
  }
}

/**
 * Sync custom admin accounts and master password overrides to Firestore
 */
export async function syncAdminAccountsToFirestore(
  customAdmins: any[],
  masterPasswords: Record<string, string>
): Promise<void> {
  try {
    localStorage.setItem(STORAGE_CUSTOM_ADMINS_KEY, JSON.stringify(customAdmins));
    localStorage.setItem(STORAGE_ADMIN_PASSWORDS_KEY, JSON.stringify(masterPasswords));
    window.dispatchEvent(new CustomEvent('admin_accounts_updated', { detail: { customAdmins, masterPasswords } }));
    trainingChannel?.postMessage({ type: 'ADMIN_ACCOUNTS_UPDATED', customAdmins, masterPasswords });

    await setDoc(ADMIN_ACCOUNTS_DOC, {
      customAdmins: JSON.parse(JSON.stringify(customAdmins)),
      masterPasswords: JSON.parse(JSON.stringify(masterPasswords)),
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'appData/admin_accounts');
  }
}

const defaultAnnouncements: TrainingAnnouncement[] = [
  {
    id: 'ann_default_1',
    title: 'Acil Operasyonel Duyuru: Kasa Kapanış & Tebellüğ Kontrolleri',
    content: 'Tüm Esme AVM şubelerimizde görevli kasa ve depo personellerinin güncel yönergeleri okuyup 5 soruluk yeterlilik sınavını tamamlayarak dijital tebellüğ sertifikalarını almaları zorunludur.',
    priority: 'acil',
    author: 'Ömer BAŞ & Turgut CESUR',
    createdAt: '2026-01-15T09:00:00.000Z',
    updatedAt: '2026-01-15T09:00:00.000Z',
    isActive: true
  }
];

export function getStoredAnnouncements(): TrainingAnnouncement[] {
  try {
    const raw = localStorage.getItem(STORAGE_ANNOUNCEMENTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Failed to read announcements:', err);
  }
  return defaultAnnouncements;
}

export async function saveAnnouncements(announcements: TrainingAnnouncement[]): Promise<boolean> {
  try {
    localStorage.setItem(STORAGE_ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
    window.dispatchEvent(new CustomEvent('announcements_updated', { detail: announcements }));
    trainingChannel?.postMessage({ type: 'ANNOUNCEMENTS_UPDATED', announcements });

    try {
      await setDoc(TRAINING_ANNOUNCEMENTS_DOC, {
        announcements: JSON.parse(JSON.stringify(announcements)),
        updatedAt: new Date().toISOString()
      });
    } catch (fsErr) {
      handleFirestoreError(fsErr, OperationType.WRITE, 'appData/training_announcements');
    }
    return true;
  } catch (err) {
    console.error('Error saving announcements:', err);
    return false;
  }
}

export function getStoredSupportMessages(): SupportMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_SUPPORT_MESSAGES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Failed to read support messages:', err);
  }
  return [];
}

export async function saveSupportMessages(messages: SupportMessage[]): Promise<boolean> {
  try {
    localStorage.setItem(STORAGE_SUPPORT_MESSAGES_KEY, JSON.stringify(messages));
    window.dispatchEvent(new CustomEvent('support_messages_updated', { detail: messages }));
    trainingChannel?.postMessage({ type: 'SUPPORT_MESSAGES_UPDATED', messages });

    try {
      await setDoc(SUPPORT_MESSAGES_DOC, {
        messages: JSON.parse(JSON.stringify(messages)),
        updatedAt: new Date().toISOString()
      });
    } catch (fsErr) {
      handleFirestoreError(fsErr, OperationType.WRITE, 'appData/support_messages');
    }
    return true;
  } catch (err) {
    console.error('Error saving support messages:', err);
    return false;
  }
}

export function subscribeToSupportMessages(
  onUpdate: (messages: SupportMessage[]) => void
): () => void {
  const unsubFs = onSnapshot(
    SUPPORT_MESSAGES_DOC,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data && Array.isArray(data.messages)) {
          localStorage.setItem(STORAGE_SUPPORT_MESSAGES_KEY, JSON.stringify(data.messages));
          onUpdate(data.messages);
        }
      }
    },
    () => {}
  );

  const handleLocal = (e: Event) => {
    const ce = e as CustomEvent<SupportMessage[]>;
    if (ce.detail && Array.isArray(ce.detail)) {
      onUpdate(ce.detail);
    } else {
      onUpdate(getStoredSupportMessages());
    }
  };

  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_SUPPORT_MESSAGES_KEY) {
      onUpdate(getStoredSupportMessages());
    }
  };

  const handleBroadcast = (e: MessageEvent) => {
    if (e.data?.type === 'SUPPORT_MESSAGES_UPDATED' && Array.isArray(e.data.messages)) {
      onUpdate(e.data.messages);
    }
  };

  window.addEventListener('support_messages_updated', handleLocal);
  window.addEventListener('storage', handleStorage);
  trainingChannel?.addEventListener('message', handleBroadcast);

  return () => {
    unsubFs();
    window.removeEventListener('support_messages_updated', handleLocal);
    window.removeEventListener('storage', handleStorage);
    trainingChannel?.removeEventListener('message', handleBroadcast);
  };
}


/**
 * Subscribe to real-time training updates from Firestore, localStorage & BroadcastChannel
 */
export function subscribeToTrainingUpdates(
  onTrainingsUpdate: (trainings: TrainingDocument[]) => void,
  onCompletionsUpdate: (completions: TrainingCompletion[]) => void,
  onAnnouncementsUpdate?: (announcements: TrainingAnnouncement[]) => void
): () => void {
  let latestCatalogItems: TrainingDocument[] = [];
  let latestCollectionItems: TrainingDocument[] = [];
  let hasCollectionSnapshot = false;
  let hasCatalogSnapshot = false;

  const emitCombinedTrainings = () => {
    const deletedSet = getDeletedIds();
    const collectionIds = new Set(latestCollectionItems.map(t => t.id));
    const defaultIds = new Set(initialTrainings.map(t => t.id));

    const map = new Map<string, TrainingDocument>();

    // Include catalog items only if not deleted; if collection snapshot is active,
    // custom trainings that were removed from the `trainings` collection are treated as deleted.
    latestCatalogItems.forEach(t => {
      if (!t || !t.id || deletedSet.has(t.id)) return;
      const isDefault = defaultIds.has(t.id);
      if (!isDefault && hasCollectionSnapshot && !collectionIds.has(t.id)) {
        return;
      }
      map.set(t.id, t);
    });

    // Individual collection documents always take latest precedence
    latestCollectionItems.forEach(t => {
      if (!t || !t.id || deletedSet.has(t.id)) return;
      const prev = map.get(t.id);
      if (prev) {
        const prevTime = prev.updatedAt || prev.createdAt || '';
        const currTime = t.updatedAt || t.createdAt || '';
        map.set(t.id, currTime >= prevTime ? t : prev);
      } else {
        map.set(t.id, t);
      }
    });

    if (hasCollectionSnapshot || hasCatalogSnapshot) {
      const merged = mergeTrainingsList(Array.from(map.values()), deletedSet);
      localStorage.setItem(STORAGE_TRAININGS_KEY, JSON.stringify(merged));
      onTrainingsUpdate(merged);
    }
  };

  // 1. Firestore Lightweight Meta Listener (tracks deletions and resets instantaneously)
  const unsubMeta = onSnapshot(TRAINING_META_DOC, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      if (data && Array.isArray(data.deletedIds)) {
        saveDeletedIds(new Set(data.deletedIds));
        emitCombinedTrainings();
      }
    }
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, 'appData/trainings_meta');
  });

  // 2. Firestore Catalog Doc Listener
  const unsubCatalog = onSnapshot(TRAINING_CATALOG_DOC, (snap) => {
    hasCatalogSnapshot = true;
    if (snap.exists()) {
      const data = snap.data();
      if (data && Array.isArray(data.deletedIds)) {
        const mergedDeleted = new Set([...Array.from(getDeletedIds()), ...data.deletedIds]);
        saveDeletedIds(mergedDeleted);
      }
      if (data && Array.isArray(data.trainings)) {
        latestCatalogItems = data.trainings;
      }
    }
    emitCombinedTrainings();
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, 'appData/trainings_catalog');
  });

  // 3. Firestore Individual Trainings Collection Listener (instant real-time sync for add, edit, delete)
  const unsubCollection = onSnapshot(TRAININGS_COLLECTION, (snap) => {
    hasCollectionSnapshot = true;
    const docs: TrainingDocument[] = [];
    snap.forEach((d) => {
      const item = d.data() as TrainingDocument;
      if (item && item.id && item.title) {
        docs.push(item);
      }
    });
    latestCollectionItems = docs;
    emitCombinedTrainings();
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, 'trainings');
  });

  // 4. Firestore Completions Listener
  const unsubCompletions = onSnapshot(TRAINING_COMPLETIONS_DOC, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      if (data && Array.isArray(data.completions)) {
        localStorage.setItem(STORAGE_COMPLETIONS_KEY, JSON.stringify(data.completions));
        onCompletionsUpdate(data.completions);
      }
    }
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, 'appData/training_completions');
  });

  // 5. Firestore Admin Accounts Listener
  const unsubAdmins = onSnapshot(ADMIN_ACCOUNTS_DOC, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      if (data) {
        if (Array.isArray(data.customAdmins)) {
          localStorage.setItem(STORAGE_CUSTOM_ADMINS_KEY, JSON.stringify(data.customAdmins));
        }
        if (data.masterPasswords && typeof data.masterPasswords === 'object') {
          localStorage.setItem(STORAGE_ADMIN_PASSWORDS_KEY, JSON.stringify(data.masterPasswords));
        }
        window.dispatchEvent(new CustomEvent('admin_accounts_updated', {
          detail: {
            customAdmins: data.customAdmins,
            masterPasswords: data.masterPasswords
          }
        }));
      }
    }
  }, () => {});

  // 6. Firestore Announcements Listener
  const unsubAnnouncements = onSnapshot(TRAINING_ANNOUNCEMENTS_DOC, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      if (data && Array.isArray(data.announcements)) {
        localStorage.setItem(STORAGE_ANNOUNCEMENTS_KEY, JSON.stringify(data.announcements));
        onAnnouncementsUpdate?.(data.announcements);
      }
    }
  }, () => {});

  // 7. Local CustomEvents, Cross-tab Storage Events & BroadcastChannel
  const handleLocalTrainingsEvent = (e: Event) => {
    const customEvent = e as CustomEvent<TrainingDocument[]>;
    if (customEvent.detail && Array.isArray(customEvent.detail)) {
      onTrainingsUpdate(customEvent.detail);
    } else {
      onTrainingsUpdate(getStoredTrainings());
    }
  };

  const handleLocalCompletionsEvent = (e: Event) => {
    const customEvent = e as CustomEvent<TrainingCompletion[]>;
    if (customEvent.detail && Array.isArray(customEvent.detail)) {
      onCompletionsUpdate(customEvent.detail);
    } else {
      onCompletionsUpdate(getStoredCompletions());
    }
  };

  const handleLocalAnnouncementsEvent = (e: Event) => {
    const customEvent = e as CustomEvent<TrainingAnnouncement[]>;
    if (customEvent.detail && Array.isArray(customEvent.detail)) {
      onAnnouncementsUpdate?.(customEvent.detail);
    } else {
      onAnnouncementsUpdate?.(getStoredAnnouncements());
    }
  };

  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === STORAGE_TRAININGS_KEY || e.key === STORAGE_DELETED_IDS_KEY) {
      onTrainingsUpdate(getStoredTrainings());
    } else if (e.key === STORAGE_COMPLETIONS_KEY) {
      onCompletionsUpdate(getStoredCompletions());
    } else if (e.key === STORAGE_ANNOUNCEMENTS_KEY) {
      onAnnouncementsUpdate?.(getStoredAnnouncements());
    }
  };

  const handleBroadcastMessage = (e: MessageEvent) => {
    if (e.data?.type === 'TRAININGS_UPDATED' && Array.isArray(e.data.trainings)) {
      onTrainingsUpdate(e.data.trainings);
    } else if (e.data?.type === 'COMPLETIONS_UPDATED' && Array.isArray(e.data.completions)) {
      onCompletionsUpdate(e.data.completions);
    } else if (e.data?.type === 'ANNOUNCEMENTS_UPDATED' && Array.isArray(e.data.announcements)) {
      onAnnouncementsUpdate?.(e.data.announcements);
    }
  };

  window.addEventListener('trainings_updated', handleLocalTrainingsEvent);
  window.addEventListener('completions_updated', handleLocalCompletionsEvent);
  window.addEventListener('announcements_updated', handleLocalAnnouncementsEvent);
  window.addEventListener('storage', handleStorageEvent);
  trainingChannel?.addEventListener('message', handleBroadcastMessage);

  return () => {
    unsubMeta();
    unsubCatalog();
    unsubCollection();
    unsubCompletions();
    unsubAdmins();
    unsubAnnouncements();
    window.removeEventListener('trainings_updated', handleLocalTrainingsEvent);
    window.removeEventListener('completions_updated', handleLocalCompletionsEvent);
    window.removeEventListener('announcements_updated', handleLocalAnnouncementsEvent);
    window.removeEventListener('storage', handleStorageEvent);
    trainingChannel?.removeEventListener('message', handleBroadcastMessage);
  };
}

/**
 * Initial remote fetch
 */
export async function fetchRemoteTrainings(): Promise<{
  trainings?: TrainingDocument[];
  completions?: TrainingCompletion[];
  announcements?: TrainingAnnouncement[];
}> {
  try {
    const [snapMeta, snapCat, snapCol, snapComp, snapAdmins, snapAnn] = await Promise.all([
      getDoc(TRAINING_META_DOC).catch(() => null),
      getDoc(TRAINING_CATALOG_DOC).catch(() => null),
      getDocs(TRAININGS_COLLECTION).catch(() => null),
      getDoc(TRAINING_COMPLETIONS_DOC).catch(() => null),
      getDoc(ADMIN_ACCOUNTS_DOC).catch(() => null),
      getDoc(TRAINING_ANNOUNCEMENTS_DOC).catch(() => null)
    ]);

    const map = new Map<string, TrainingDocument>();
    const defaultIds = new Set(initialTrainings.map(t => t.id));
    let deletedSet = getDeletedIds();

    if (snapMeta && snapMeta.exists()) {
      const metaData = snapMeta.data();
      if (metaData && Array.isArray(metaData.deletedIds)) {
        deletedSet = new Set(metaData.deletedIds);
        saveDeletedIds(deletedSet);
      }
    }

    const collectionIds = new Set<string>();
    if (snapCol) {
      snapCol.forEach((d) => {
        const item = d.data() as TrainingDocument;
        if (item && item.id && item.title) {
          collectionIds.add(item.id);
        }
      });
    }

    if (snapCat && snapCat.exists()) {
      const data = snapCat.data();
      if (!snapMeta?.exists() && data && Array.isArray(data.deletedIds)) {
        deletedSet = new Set(data.deletedIds);
        saveDeletedIds(deletedSet);
      }
      if (data && Array.isArray(data.trainings)) {
        data.trainings.forEach((t: TrainingDocument) => {
          if (!t || !t.id || deletedSet.has(t.id)) return;
          const isDefault = defaultIds.has(t.id);
          if (!isDefault && snapCol && !collectionIds.has(t.id)) {
            return;
          }
          map.set(t.id, t);
        });
      }
    }

    if (snapCol && !snapCol.empty) {
      snapCol.forEach((d) => {
        const item = d.data() as TrainingDocument;
        if (item && item.id && item.title && !deletedSet.has(item.id)) {
          const prev = map.get(item.id);
          if (prev) {
            const prevTime = prev.updatedAt || prev.createdAt || '';
            const currTime = item.updatedAt || item.createdAt || '';
            map.set(item.id, currTime >= prevTime ? item : prev);
          } else {
            map.set(item.id, item);
          }
        }
      });
    }

    const remoteTrainings = mergeTrainingsList(Array.from(map.values()), deletedSet);
    localStorage.setItem(STORAGE_TRAININGS_KEY, JSON.stringify(remoteTrainings));

    let remoteCompletions: TrainingCompletion[] | undefined;
    if (snapComp && snapComp.exists()) {
      const data = snapComp.data();
      if (data && Array.isArray(data.completions)) {
        remoteCompletions = data.completions;
        localStorage.setItem(STORAGE_COMPLETIONS_KEY, JSON.stringify(remoteCompletions));
      }
    }

    if (snapAdmins && snapAdmins.exists()) {
      const data = snapAdmins.data();
      if (data) {
        if (Array.isArray(data.customAdmins)) {
          localStorage.setItem(STORAGE_CUSTOM_ADMINS_KEY, JSON.stringify(data.customAdmins));
        }
        if (data.masterPasswords && typeof data.masterPasswords === 'object') {
          localStorage.setItem(STORAGE_ADMIN_PASSWORDS_KEY, JSON.stringify(data.masterPasswords));
        }
      }
    }

    let remoteAnnouncements: TrainingAnnouncement[] | undefined;
    if (snapAnn && snapAnn.exists()) {
      const data = snapAnn.data();
      if (data && Array.isArray(data.announcements)) {
        remoteAnnouncements = data.announcements;
        localStorage.setItem(STORAGE_ANNOUNCEMENTS_KEY, JSON.stringify(remoteAnnouncements));
      }
    }

    return { trainings: remoteTrainings, completions: remoteCompletions, announcements: remoteAnnouncements };
  } catch (err) {
    console.warn('Initial remote fetch error:', err);
    return {};
  }
}
