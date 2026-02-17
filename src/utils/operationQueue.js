/**
 * @file operationQueue.js
 * @description Operation-based sync queue for offline writes.
 *
 * Every write (create, update, delete) is saved as a discrete operation in
 * IndexedDB. When the user is online the queue is automatically flushed to
 * Firestore. If the user is offline the operations persist across restarts
 * and are replayed when connectivity returns.
 *
 * This is the 1A-genda equivalent of how Google Docs/Sheets queues edits
 * offline and syncs them transparently.
 *
 * @module operationQueue
 */
import { getDB } from './localDatabase';
import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { db as firestoreDB } from '../config/firebase';

// ── Operation format ────────────────────────────────────────────
/**
 * @typedef {Object} Operation
 * @property {number}  [id]         Auto-incremented by IndexedDB
 * @property {'CREATE'|'UPDATE'|'DELETE'} type
 * @property {string}  collection   Firestore collection name
 * @property {string}  [docId]      Firestore document ID (null for CREATE when server-generated)
 * @property {object}  [changes]    Field-level changes (CREATE/UPDATE)
 * @property {number}  timestamp    Date.now() when queued
 * @property {string}  [userId]     UID of the acting user
 * @property {boolean} synced       false → pending, true → flushed
 * @property {number}  [syncedAt]   Timestamp when successfully synced
 */

// ── Core API ────────────────────────────────────────────────────

/**
 * Queue a new operation for eventual sync.
 * Also writes the change to the local IndexedDB data store immediately
 * so the UI can render optimistically.
 *
 * @param {Omit<Operation,'id'|'synced'|'syncedAt'|'timestamp'>} operation
 * @returns {Promise<IDBValidKey>} The auto-generated operation ID
 */
export const queueOperation = async (operation) => {
  const db = await getDB();
  return db.add('operations', {
    ...operation,
    timestamp: Date.now(),
    synced: false,
  });
};

/**
 * Get all operations that have not been synced yet.
 * @returns {Promise<Operation[]>}
 */
export const getPendingOperations = async () => {
  const db = await getDB();
  const all = await db.getAll('operations');
  return all.filter(op => !op.synced);
};

/**
 * Get the total count of pending (unsynced) operations.
 * @returns {Promise<number>}
 */
export const getPendingCount = async () => {
  const pending = await getPendingOperations();
  return pending.length;
};

/**
 * Flush all pending operations to Firestore, one at a time, in order.
 *
 * @returns {Promise<{synced:number, failed:number, errors:Array}>}
 */
export const syncPendingOperations = async () => {
  const db = await getDB();
  const pending = await getPendingOperations();
  const results = { synced: 0, failed: 0, errors: [] };

  for (const op of pending) {
    try {
      switch (op.type) {
        case 'CREATE': {
          if (op.docId) {
            // Specific doc ID
            const docRef = doc(firestoreDB, op.collection, op.docId);
            await setDoc(docRef, {
              ...op.changes,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          } else {
            // Auto-generated doc ID
            await addDoc(collection(firestoreDB, op.collection), {
              ...op.changes,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
          break;
        }
        case 'UPDATE': {
          const docRef = doc(firestoreDB, op.collection, op.docId);
          await updateDoc(docRef, {
            ...op.changes,
            updatedAt: serverTimestamp(),
          });
          break;
        }
        case 'DELETE': {
          const docRef = doc(firestoreDB, op.collection, op.docId);
          await deleteDoc(docRef);
          break;
        }
        default:
          console.warn('[OperationQueue] Unknown operation type:', op.type);
      }

      // Mark synced
      await db.put('operations', { ...op, synced: true, syncedAt: Date.now() });
      results.synced++;
    } catch (err) {
      console.error('[OperationQueue] Failed to sync:', op, err);
      results.failed++;
      results.errors.push({ op, error: err.message });
    }
  }

  return results;
};

/**
 * Purge synced operations older than `maxAge` milliseconds.
 * Keeps the IndexedDB from growing unbounded.
 *
 * @param {number} [maxAge=7 * 24 * 60 * 60 * 1000]  Default 7 days
 * @returns {Promise<number>} Number of purged operations
 */
export const purgeOldOperations = async (maxAge = 7 * 24 * 60 * 60 * 1000) => {
  const db = await getDB();
  const all = await db.getAll('operations');
  const cutoff = Date.now() - maxAge;
  let purged = 0;

  const tx = db.transaction('operations', 'readwrite');
  for (const op of all) {
    if (op.synced && op.syncedAt && op.syncedAt < cutoff) {
      await tx.store.delete(op.id);
      purged++;
    }
  }
  await tx.done;
  return purged;
};

// ── Auto-sync listeners ────────────────────────────────────────

let _autoSyncStarted = false;

/**
 * Register event listeners that automatically flush the queue when
 * the browser comes back online or the tab becomes visible.
 *
 * Safe to call multiple times — listeners are only registered once.
 *
 * @param {Function} [onSyncComplete]  Optional callback after sync finishes
 */
export const startAutoSync = (onSyncComplete) => {
  if (_autoSyncStarted) return;
  _autoSyncStarted = true;

  const flush = async () => {
    if (!navigator.onLine) return;
    const pending = await getPendingOperations();
    if (pending.length === 0) return;

    const results = await syncPendingOperations();

    // Purge old synced ops to keep DB lean
    await purgeOldOperations();

    if (onSyncComplete) onSyncComplete(results);
  };

  // Sync when connectivity returns
  window.addEventListener('online', flush);

  // Safari doesn't support Background Sync API, so also sync on
  // tab focus as a cross-browser fallback.
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) flush();
  });

  // Also try immediately on startup
  flush();
};
