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
import { TrainingDocument, TrainingCompletion, TrainingCategory } from '../types';
import { initialTrainings } from '../data/trainingData';

const STORAGE_TRAININGS_KEY = 'esme_akademi_trainings_v2';
const STORAGE_COMPLETIONS_KEY = 'esme_akademi_completions_v1';
const STORAGE_LEGACY_COMPLETIONS_KEY = 'esme_training_completions';
const STORAGE_DELETED_IDS_KEY = 'esme_deleted_training_ids_v1';
const STORAGE_CUSTOM_ADMINS_KEY = 'esme_custom_admins';
const STORAGE_ADMIN_PASSWORDS_KEY = 'esme_admin_passwords';

const TRAINING_CATALOG_DOC = doc(db, 'appData', 'trainings_catalog');
const TRAINING_COMPLETIONS_DOC = doc(db, 'appData', 'training_completions');
const ADMIN_ACCOUNTS_DOC = doc(db, 'appData', 'admin_accounts');
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
    if (defaultMap.has(t.id)) {
      const existing = defaultMap.get(t.id)!;
      defaultMap.set(t.id, {
        ...existing,
        ...t,
        category: t.category || existing.category
      });
    } else {
      customMap.set(t.id, { ...t, isCustom: true });
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
    const raw = localStorage.getItem(STORAGE_TRAININGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return mergeTrainingsList(parsed);
      }
    }
  } catch (err) {
    console.error('Failed to parse stored trainings:', err);
  }
  return initialTrainings;
}

/**
 * Save trainings to localStorage and Firestore (both catalog doc and individual docs)
 */
export async function saveTrainings(trainings: TrainingDocument[]): Promise<boolean> {
  try {
    const merged = mergeTrainingsList(trainings);
    localStorage.setItem(STORAGE_TRAININGS_KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('trainings_updated', { detail: merged }));
    trainingChannel?.postMessage({ type: 'TRAININGS_UPDATED', trainings: merged });

    // Sync to Firestore catalog document
    try {
      const cleanPayload = JSON.parse(JSON.stringify(merged));
      await setDoc(TRAINING_CATALOG_DOC, {
        trainings: cleanPayload,
        deletedIds: Array.from(getDeletedIds()),
        updatedAt: new Date().toISOString()
      });
    } catch (fsErr) {
      handleFirestoreError(fsErr, OperationType.WRITE, 'appData/trainings_catalog');
    }

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

  // Also write individual document to `trainings/{id}` collection for guaranteed real-time sync
  try {
    const cleanItem = JSON.parse(JSON.stringify(normalizedItem));
    await setDoc(doc(db, 'trainings', normalizedItem.id), cleanItem);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `trainings/${normalizedItem.id}`);
  }

  return saveTrainings(updated);
}

/**
 * Delete a training document and sync deletion to Firestore
 */
export async function deleteTraining(id: string): Promise<boolean> {
  const deletedIds = getDeletedIds();
  deletedIds.add(id);
  saveDeletedIds(deletedIds);

  const current = getStoredTrainings();
  const updated = current.filter(t => t.id !== id);

  try {
    await deleteDoc(doc(db, 'trainings', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `trainings/${id}`);
  }

  return saveTrainings(updated);
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

    // Clear custom docs in `trainings` collection
    try {
      const snap = await getDocs(TRAININGS_COLLECTION);
      for (const d of snap.docs) {
        await deleteDoc(doc(db, 'trainings', d.id));
      }
    } catch {}

    const cleanPayload = JSON.parse(JSON.stringify(initialTrainings));
    await setDoc(TRAINING_CATALOG_DOC, {
      trainings: cleanPayload,
      deletedIds: [],
      updatedAt: new Date().toISOString()
    });
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

/**
 * Subscribe to real-time training updates from Firestore, localStorage & BroadcastChannel
 */
export function subscribeToTrainingUpdates(
  onTrainingsUpdate: (trainings: TrainingDocument[]) => void,
  onCompletionsUpdate: (completions: TrainingCompletion[]) => void
): () => void {
  let latestCatalogItems: TrainingDocument[] = [];
  let latestCollectionItems: TrainingDocument[] = [];

  const emitCombinedTrainings = (remoteDeletedIds?: string[]) => {
    if (remoteDeletedIds && Array.isArray(remoteDeletedIds)) {
      saveDeletedIds(new Set(remoteDeletedIds));
    }
    const deletedSet = getDeletedIds();
    // Combine catalog items and individual collection items (collection items take precedence as they are individual upserts)
    const map = new Map<string, TrainingDocument>();
    latestCatalogItems.forEach(t => {
      if (t && t.id && !deletedSet.has(t.id)) map.set(t.id, t);
    });
    latestCollectionItems.forEach(t => {
      if (t && t.id && !deletedSet.has(t.id)) map.set(t.id, t);
    });

    if (map.size > 0 || latestCatalogItems.length > 0 || latestCollectionItems.length > 0) {
      const merged = mergeTrainingsList(Array.from(map.values()), deletedSet);
      localStorage.setItem(STORAGE_TRAININGS_KEY, JSON.stringify(merged));
      onTrainingsUpdate(merged);
    }
  };

  // 1. Firestore Catalog Doc Listener
  const unsubCatalog = onSnapshot(TRAINING_CATALOG_DOC, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      if (data && Array.isArray(data.trainings)) {
        latestCatalogItems = data.trainings;
        emitCombinedTrainings(data.deletedIds);
      }
    }
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, 'appData/trainings_catalog');
  });

  // 2. Firestore Individual Trainings Collection Listener (ensures instant sync even for large payloads)
  const unsubCollection = onSnapshot(TRAININGS_COLLECTION, (snap) => {
    const docs: TrainingDocument[] = [];
    snap.forEach((d) => {
      const item = d.data() as TrainingDocument;
      if (item && item.id && item.title) {
        docs.push(item);
      }
    });
    latestCollectionItems = docs;
    if (docs.length > 0 || latestCatalogItems.length > 0) {
      emitCombinedTrainings();
    }
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, 'trainings');
  });

  // 3. Firestore Completions Listener
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

  // 4. Firestore Admin Accounts Listener
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

  // 5. Local CustomEvents, Cross-tab Storage Events & BroadcastChannel
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

  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === STORAGE_TRAININGS_KEY) {
      onTrainingsUpdate(getStoredTrainings());
    } else if (e.key === STORAGE_COMPLETIONS_KEY) {
      onCompletionsUpdate(getStoredCompletions());
    }
  };

  const handleBroadcastMessage = (e: MessageEvent) => {
    if (e.data?.type === 'TRAININGS_UPDATED' && Array.isArray(e.data.trainings)) {
      onTrainingsUpdate(e.data.trainings);
    } else if (e.data?.type === 'COMPLETIONS_UPDATED' && Array.isArray(e.data.completions)) {
      onCompletionsUpdate(e.data.completions);
    }
  };

  window.addEventListener('trainings_updated', handleLocalTrainingsEvent);
  window.addEventListener('completions_updated', handleLocalCompletionsEvent);
  window.addEventListener('storage', handleStorageEvent);
  trainingChannel?.addEventListener('message', handleBroadcastMessage);

  return () => {
    unsubCatalog();
    unsubCollection();
    unsubCompletions();
    unsubAdmins();
    window.removeEventListener('trainings_updated', handleLocalTrainingsEvent);
    window.removeEventListener('completions_updated', handleLocalCompletionsEvent);
    window.removeEventListener('storage', handleStorageEvent);
    trainingChannel?.removeEventListener('message', handleBroadcastMessage);
  };
}

/**
 * Initial remote fetch
 */
export async function fetchRemoteTrainings(): Promise<{ trainings?: TrainingDocument[]; completions?: TrainingCompletion[] }> {
  try {
    const [snapCat, snapCol, snapComp, snapAdmins] = await Promise.all([
      getDoc(TRAINING_CATALOG_DOC).catch(() => null),
      getDocs(TRAININGS_COLLECTION).catch(() => null),
      getDoc(TRAINING_COMPLETIONS_DOC).catch(() => null),
      getDoc(ADMIN_ACCOUNTS_DOC).catch(() => null)
    ]);

    const map = new Map<string, TrainingDocument>();
    let deletedSet = getDeletedIds();

    if (snapCat && snapCat.exists()) {
      const data = snapCat.data();
      if (data && Array.isArray(data.deletedIds)) {
        deletedSet = new Set(data.deletedIds);
        saveDeletedIds(deletedSet);
      }
      if (data && Array.isArray(data.trainings)) {
        data.trainings.forEach((t: TrainingDocument) => {
          if (t && t.id && !deletedSet.has(t.id)) map.set(t.id, t);
        });
      }
    }

    if (snapCol && !snapCol.empty) {
      snapCol.forEach((d) => {
        const item = d.data() as TrainingDocument;
        if (item && item.id && item.title && !deletedSet.has(item.id)) {
          map.set(item.id, item);
        }
      });
    }

    let remoteTrainings: TrainingDocument[] | undefined;
    if (map.size > 0) {
      remoteTrainings = mergeTrainingsList(Array.from(map.values()), deletedSet);
      localStorage.setItem(STORAGE_TRAININGS_KEY, JSON.stringify(remoteTrainings));
    }

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

    return { trainings: remoteTrainings, completions: remoteCompletions };
  } catch (err) {
    console.warn('Initial remote fetch error:', err);
    return {};
  }
}
