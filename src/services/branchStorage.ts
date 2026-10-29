import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from './firebaseService';
import { Branch } from '../types';
import { officialEsmeBranches } from '../mockData';

const STORAGE_BRANCHES_KEY = 'esme_branches_catalog_v2';
const BRANCHES_DOC = doc(db, 'appData', 'branches_catalog');

const branchChannel = typeof BroadcastChannel !== 'undefined'
  ? new BroadcastChannel('esme_branches_realtime_channel')
  : null;

/**
 * Returns the default 35 branches with initial password '1122'
 */
export function getDefaultBranches(): Branch[] {
  return officialEsmeBranches.map(b => ({
    ...b,
    password: b.password || '1122'
  }));
}

/**
 * Retrieves the branches from localStorage, or seeds them from defaults
 */
export function getStoredBranches(): Branch[] {
  try {
    const raw = localStorage.getItem(STORAGE_BRANCHES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(b => ({
          ...b,
          password: b.password || '1122'
        }));
      }
    }
  } catch (e) {
    console.warn('Error reading stored branches:', e);
  }

  const defaults = getDefaultBranches();
  saveBranchesToStorage(defaults, false);
  return defaults;
}

/**
 * Persists branches locally and dispatches events
 */
function saveBranchesToStorage(branches: Branch[], notify = true): void {
  try {
    localStorage.setItem(STORAGE_BRANCHES_KEY, JSON.stringify(branches));
  } catch (e) {
    console.error('Error saving branches to localStorage:', e);
  }

  if (notify) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('branches_updated', { detail: { branches } }));
    }
    if (branchChannel) {
      try {
        branchChannel.postMessage({ type: 'BRANCHES_UPDATED', branches });
      } catch {}
    }
  }
}

/**
 * Syncs branches to Firestore
 */
export async function syncBranchesToFirestore(branches: Branch[]): Promise<void> {
  try {
    await setDoc(BRANCHES_DOC, {
      branches,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'appData/branches_catalog');
  }
}

/**
 * Saves and syncs branches both locally and to Firestore
 */
export async function saveBranches(branches: Branch[]): Promise<void> {
  saveBranchesToStorage(branches, true);
  await syncBranchesToFirestore(branches);
}

/**
 * Adds or updates a branch
 */
export async function upsertBranch(branchData: Partial<Branch> & { name: string }): Promise<Branch[]> {
  const current = getStoredBranches();
  const branchPassword = (branchData.password && branchData.password.trim()) ? branchData.password.trim() : '1122';

  let updatedList: Branch[];

  if (branchData.id) {
    const exists = current.some(b => b.id === branchData.id);
    if (exists) {
      updatedList = current.map(b => {
        if (b.id !== branchData.id) return b;
        return {
          ...b,
          ...branchData,
          password: branchPassword
        };
      });
    } else {
      const newBranch: Branch = {
        id: branchData.id,
        name: branchData.name.trim(),
        code: branchData.code?.trim() || String(branchData.id).padStart(3, '0'),
        city: branchData.city?.trim() || 'Merkez',
        password: branchPassword,
        isCustom: true,
        createdAt: new Date().toISOString()
      };
      updatedList = [...current, newBranch];
    }
  } else {
    // Generate new unique ID
    const maxId = current.reduce((max, b) => (b.id > max ? b.id : max), 0);
    const newId = maxId + 1;
    const autoCode = branchData.code?.trim() || String(newId).padStart(3, '0');

    const newBranch: Branch = {
      id: newId,
      name: branchData.name.trim(),
      code: autoCode,
      city: branchData.city?.trim() || 'Merkez',
      password: branchPassword,
      isCustom: true,
      createdAt: new Date().toISOString()
    };
    updatedList = [...current, newBranch];
  }

  await saveBranches(updatedList);
  return updatedList;
}

/**
 * Updates just the password for a specific branch
 */
export async function updateBranchPassword(branchId: number, newPassword: string): Promise<Branch[]> {
  const current = getStoredBranches();
  const password = newPassword.trim() || '1122';
  const updated = current.map(b => {
    if (b.id !== branchId) return b;
    return { ...b, password };
  });

  await saveBranches(updated);
  return updated;
}

/**
 * Resets all branch passwords to a uniform password (e.g. 1122)
 */
export async function resetAllBranchPasswords(password = '1122'): Promise<Branch[]> {
  const current = getStoredBranches();
  const updated = current.map(b => ({
    ...b,
    password: password.trim() || '1122'
  }));

  await saveBranches(updated);
  return updated;
}

/**
 * Deletes a branch by ID
 */
export async function deleteBranch(branchId: number): Promise<Branch[]> {
  const current = getStoredBranches();
  const updated = current.filter(b => b.id !== branchId);
  await saveBranches(updated);
  return updated;
}

/**
 * Restores the initial official 35 branches with 1122 password
 */
export async function resetBranchesToDefault(): Promise<Branch[]> {
  const defaults = getDefaultBranches();
  await saveBranches(defaults);
  return defaults;
}

/**
 * Fetches branches from Firestore on startup
 */
export async function fetchRemoteBranches(): Promise<Branch[]> {
  try {
    const snap = await getDoc(BRANCHES_DOC);
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data.branches) && data.branches.length > 0) {
        const remoteBranches = data.branches.map((b: any) => ({
          ...b,
          password: b.password || '1122'
        }));
        saveBranchesToStorage(remoteBranches, true);
        return remoteBranches;
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'appData/branches_catalog');
  }
  return getStoredBranches();
}

/**
 * Real-time listener for branch updates across clients and tabs
 */
export function subscribeToBranchUpdates(onUpdate: (branches: Branch[]) => void): () => void {
  // 1. BroadcastChannel listener (instant cross-tab on same browser)
  const handleBcMessage = (event: MessageEvent) => {
    if (event.data?.type === 'BRANCHES_UPDATED' && Array.isArray(event.data.branches)) {
      onUpdate(event.data.branches);
    }
  };

  if (branchChannel) {
    branchChannel.addEventListener('message', handleBcMessage);
  }

  // 2. Window CustomEvent listener
  const handleCustomEvent = (e: Event) => {
    const ce = e as CustomEvent;
    if (ce.detail?.branches && Array.isArray(ce.detail.branches)) {
      onUpdate(ce.detail.branches);
    }
  };
  window.addEventListener('branches_updated', handleCustomEvent);

  // 3. Firestore onSnapshot (cross-device real-time sync)
  const unsubscribeFirestore = onSnapshot(BRANCHES_DOC, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (Array.isArray(data.branches) && data.branches.length > 0) {
        const branches = data.branches.map((b: any) => ({
          ...b,
          password: b.password || '1122'
        }));
        saveBranchesToStorage(branches, false);
        onUpdate(branches);
      }
    }
  }, (err) => {
    console.warn('Firestore branch sync error (offline or unauthenticated):', err);
  });

  return () => {
    if (branchChannel) {
      branchChannel.removeEventListener('message', handleBcMessage);
    }
    window.removeEventListener('branches_updated', handleCustomEvent);
    unsubscribeFirestore();
  };
}
