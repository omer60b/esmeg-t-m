import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from './firebaseService';
import { TrainingDocument, TrainingCompletion, TrainingCategory } from '../types';
import { initialTrainings } from '../data/trainingData';

const STORAGE_TRAININGS_KEY = 'esme_akademi_trainings_v2';
const STORAGE_COMPLETIONS_KEY = 'esme_akademi_completions_v1';

const TRAINING_CATALOG_DOC = doc(db, 'appData', 'trainings_catalog');
const TRAINING_COMPLETIONS_DOC = doc(db, 'appData', 'training_completions');

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
 * Get current trainings from localStorage, or return initialTrainings
 */
export function getStoredTrainings(): TrainingDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_TRAININGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge with initialTrainings to make sure default 11 are always intact and up to date
        const map = new Map<string, TrainingDocument>();
        initialTrainings.forEach(t => map.set(t.id, t));
        parsed.forEach((t: TrainingDocument) => {
          if (t.isCustom) {
            map.set(t.id, t);
          } else {
            // keep any admin edits to default trainings but enforce category
            const existing = map.get(t.id);
            if (existing) {
              map.set(t.id, { ...existing, ...t, category: existing.category });
            }
          }
        });
        const result = Array.from(map.values());
        return normalizeTrainings(result);
      }
    }
  } catch (err) {
    console.error('Failed to parse stored trainings:', err);
  }
  return initialTrainings;
}

/**
 * Save trainings to localStorage and Firestore
 */
export async function saveTrainings(trainings: TrainingDocument[]): Promise<boolean> {
  try {
    localStorage.setItem(STORAGE_TRAININGS_KEY, JSON.stringify(trainings));
    window.dispatchEvent(new CustomEvent('trainings_updated', { detail: trainings }));

    // Sync to Firestore
    try {
      const cleanPayload = JSON.parse(JSON.stringify(trainings));
      await setDoc(TRAINING_CATALOG_DOC, {
        trainings: cleanPayload,
        updatedAt: new Date().toISOString()
      }, { merge: true });
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
 * Add or update a training document
 */
export async function upsertTraining(training: TrainingDocument): Promise<boolean> {
  const current = getStoredTrainings();
  const index = current.findIndex(t => t.id === training.id);
  let updated: TrainingDocument[];

  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...training, updatedAt: new Date().toISOString() };
  } else {
    updated = [
      {
        ...training,
        isCustom: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      ...current
    ];
  }

  return saveTrainings(updated);
}

/**
 * Delete a custom training document
 */
export async function deleteTraining(id: string): Promise<boolean> {
  const current = getStoredTrainings();
  const updated = current.filter(t => t.id !== id);
  return saveTrainings(updated);
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
    const updated = [completion, ...list.filter(c => !(c.trainingId === completion.trainingId && c.personnelName.toLowerCase() === completion.personnelName.toLowerCase() && c.branchId === completion.branchId))];
    localStorage.setItem(STORAGE_COMPLETIONS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('completions_updated', { detail: updated }));

    try {
      const cleanPayload = JSON.parse(JSON.stringify(updated));
      await setDoc(TRAINING_COMPLETIONS_DOC, {
        completions: cleanPayload,
        updatedAt: new Date().toISOString()
      }, { merge: true });
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
 * Subscribe to real-time training updates from Firestore
 */
export function subscribeToTrainingUpdates(
  onTrainingsUpdate: (trainings: TrainingDocument[]) => void,
  onCompletionsUpdate: (completions: TrainingCompletion[]) => void
): () => void {
  const unsubCatalog = onSnapshot(TRAINING_CATALOG_DOC, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      if (data && Array.isArray(data.trainings) && data.trainings.length > 0) {
        const normalized = normalizeTrainings(data.trainings);
        localStorage.setItem(STORAGE_TRAININGS_KEY, JSON.stringify(normalized));
        onTrainingsUpdate(normalized);
      }
    }
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, 'appData/trainings_catalog');
  });

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

  return () => {
    unsubCatalog();
    unsubCompletions();
  };
}

/**
 * Initial remote fetch
 */
export async function fetchRemoteTrainings(): Promise<{ trainings?: TrainingDocument[]; completions?: TrainingCompletion[] }> {
  try {
    const snapCat = await getDoc(TRAINING_CATALOG_DOC);
    let remoteTrainings: TrainingDocument[] | undefined;
    if (snapCat.exists()) {
      const data = snapCat.data();
      if (data && Array.isArray(data.trainings)) {
        remoteTrainings = normalizeTrainings(data.trainings);
        localStorage.setItem(STORAGE_TRAININGS_KEY, JSON.stringify(remoteTrainings));
      }
    }

    const snapComp = await getDoc(TRAINING_COMPLETIONS_DOC);
    let remoteCompletions: TrainingCompletion[] | undefined;
    if (snapComp.exists()) {
      const data = snapComp.data();
      if (data && Array.isArray(data.completions)) {
        remoteCompletions = data.completions;
        localStorage.setItem(STORAGE_COMPLETIONS_KEY, JSON.stringify(remoteCompletions));
      }
    }

    return { trainings: remoteTrainings, completions: remoteCompletions };
  } catch (err) {
    console.warn('Initial remote fetch error:', err);
    return {};
  }
}
