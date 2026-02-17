/**
 * @file offlineDataService.js
 * @description Offline-first data service for 1A-genda.
 *
 * Implements the Google Docs / Sheets pattern:
 *   READ  → Return cached data instantly → fetch from Firestore in background → update cache → notify UI
 *   WRITE → Write to local IndexedDB → queue operation → sync when online
 *
 * Components should use these functions instead of calling Firestore directly.
 * Every function returns immediately with cached data and accepts an optional
 * `onUpdate` callback that fires when fresh server data arrives.
 *
 * @module offlineDataService
 */
import {
  getAll,
  putMany,
  put,
  getByKey,
  remove,
  getAllByIndex,
} from './localDatabase';
import { queueOperation } from './operationQueue';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { db as firestoreDB } from '../config/firebase';

// ── Helpers ──────────────────────────────────────────────────────

/**
 * Convert Firestore Timestamp fields to ISO strings for IndexedDB storage.
 * Firestore Timestamps can't be cloned into structured-clone-compatible
 * objects, so we normalise them here.
 */
const normaliseTimestamps = (data) => {
  const result = { ...data };
  for (const key of Object.keys(result)) {
    const val = result[key];
    if (val && typeof val.toDate === 'function') {
      result[key] = val.toDate().toISOString();
    }
  }
  return result;
};

/**
 * Map a Firestore QuerySnapshot to an array of plain objects with `id`.
 */
const snapshotToArray = (snapshot) =>
  snapshot.docs.map((d) => ({
    id: d.id,
    ...normaliseTimestamps(d.data()),
  }));

/**
 * Update the syncMeta store with the current timestamp.
 */
const recordSync = async (collectionName) => {
  await put('syncMeta', { collection: collectionName, lastSync: Date.now() });
};

// ── READ: Local-first, background refresh ─────────────────────

/**
 * Generic local-first read.
 *
 * 1. Return cached data from IndexedDB immediately.
 * 2. If online, fetch from Firestore in the background.
 * 3. Update the local cache and call `onUpdate` with fresh data.
 *
 * @param {object} opts
 * @param {string} opts.storeName     IndexedDB store name
 * @param {string} opts.firestoreCol  Firestore collection path
 * @param {import('firebase/firestore').QueryConstraint[]} [opts.queryConstraints]
 * @param {(update:{data:any[], source:string})=>void} [opts.onUpdate]
 * @returns {Promise<{data:any[], source:string}>}
 */
const localFirstRead = async ({ storeName, firestoreCol, queryConstraints = [], onUpdate }) => {
  // 1. Cached data
  const cached = await getAll(storeName);

  if (cached.length > 0 && onUpdate) {
    onUpdate({ data: cached, source: 'cache' });
  }

  // 2. Background refresh
  if (navigator.onLine) {
    try {
      const q = query(collection(firestoreDB, firestoreCol), ...queryConstraints);
      const snapshot = await getDocs(q);
      const serverData = snapshotToArray(snapshot);

      // 3. Update local cache
      await putMany(storeName, serverData);
      await recordSync(storeName);

      if (onUpdate) onUpdate({ data: serverData, source: 'server' });
      return { data: serverData, source: 'server' };
    } catch (err) {
      console.warn(`[OfflineData] ${storeName} server fetch failed, using cache:`, err.message);
    }
  }

  return { data: cached, source: 'cache' };
};

/**
 * Generic local-first single-doc read.
 */
const localFirstReadDoc = async ({ storeName, firestoreCol, docId, onUpdate }) => {
  const cached = await getByKey(storeName, docId);
  if (cached && onUpdate) {
    onUpdate({ data: cached, source: 'cache' });
  }

  if (navigator.onLine) {
    try {
      const docRef = doc(firestoreDB, firestoreCol, docId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const serverData = { id: snap.id, ...normaliseTimestamps(snap.data()) };
        await put(storeName, serverData);
        await recordSync(storeName);
        if (onUpdate) onUpdate({ data: serverData, source: 'server' });
        return { data: serverData, source: 'server' };
      }
    } catch (err) {
      console.warn(`[OfflineData] ${storeName}/${docId} fetch failed, using cache:`, err.message);
    }
  }

  return { data: cached || null, source: 'cache' };
};

// ── Public API ──────────────────────────────────────────────────

// ──── Tasks ─────────────────────────────────────────────────────

/**
 * Get all global tasks (local-first).
 * @param {Function} [onUpdate]
 */
export const getTasks = (onUpdate) =>
  localFirstRead({
    storeName: 'tasks',
    firestoreCol: 'globalTasks',
    queryConstraints: [orderBy('order', 'asc')],
    onUpdate,
  });

/**
 * Update a task locally + queue for Firestore sync.
 */
export const updateTaskOffline = async (taskId, changes) => {
  // Optimistic local update
  const existing = await getByKey('tasks', taskId);
  if (existing) {
    await put('tasks', { ...existing, ...changes, updatedAt: new Date().toISOString() });
  }

  // Queue operation
  await queueOperation({
    type: 'UPDATE',
    collection: 'globalTasks',
    docId: taskId,
    changes,
  });
};

/**
 * Delete a task locally + queue for Firestore sync.
 */
export const deleteTaskOffline = async (taskId) => {
  await remove('tasks', taskId);
  await queueOperation({
    type: 'DELETE',
    collection: 'globalTasks',
    docId: taskId,
  });
};

// ──── Announcements ─────────────────────────────────────────────

/**
 * Get all announcements (local-first).
 * @param {Function} [onUpdate]
 */
export const getAnnouncements = (onUpdate) =>
  localFirstRead({
    storeName: 'announcements',
    firestoreCol: 'announcements',
    queryConstraints: [orderBy('createdAt', 'desc')],
    onUpdate,
  });

// ──── Student Progress ──────────────────────────────────────────

/**
 * Get student progress for a specific user (local-first).
 * @param {string} userId
 * @param {string} taskId
 * @param {Function} [onUpdate]
 */
export const getStudentProgress = async (userId, taskId, onUpdate) => {
  // Check local cache first
  const allCached = await getAllByIndex('studentProgress', 'userId', userId);
  const cached = allCached.find((p) => p.taskId === taskId);

  if (cached && onUpdate) {
    onUpdate({ data: cached, source: 'cache' });
  }

  if (navigator.onLine) {
    try {
      const q = query(
        collection(firestoreDB, 'studentProgress'),
        where('userId', '==', userId),
        where('taskId', '==', taskId)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const serverData = snapshotToArray(snapshot);
        await putMany('studentProgress', serverData);
        await recordSync('studentProgress');
        if (onUpdate) onUpdate({ data: serverData[0], source: 'server' });
        return { data: serverData[0], source: 'server' };
      }
    } catch (err) {
      console.warn('[OfflineData] studentProgress fetch failed:', err.message);
    }
  }

  return { data: cached || null, source: 'cache' };
};

/**
 * Update student progress locally + queue for sync.
 */
export const updateStudentProgressOffline = async (progressId, changes) => {
  const existing = await getByKey('studentProgress', progressId);
  if (existing) {
    await put('studentProgress', { ...existing, ...changes, updatedAt: new Date().toISOString() });
  }

  await queueOperation({
    type: 'UPDATE',
    collection: 'studentProgress',
    docId: progressId,
    changes,
  });
};

// ──── Class Settings ────────────────────────────────────────────

/**
 * Get class settings (local-first, single document).
 * @param {Function} [onUpdate]
 */
export const getClassSettingsOffline = (onUpdate) =>
  localFirstReadDoc({
    storeName: 'settings',
    firestoreCol: 'classSettings',
    docId: 'config',
    onUpdate,
  });

// ──── Task Creation Requests ────────────────────────────────────

/**
 * Get task creation requests (local-first).
 * @param {object} [filters]
 * @param {Function} [onUpdate]
 */
export const getTaskCreationRequests = (filters = {}, onUpdate) => {
  const constraints = [orderBy('createdAt', 'desc')];
  if (filters.userId) constraints.push(where('userId', '==', filters.userId));
  if (filters.status) constraints.push(where('status', '==', filters.status));

  return localFirstRead({
    storeName: 'taskCreationRequests',
    firestoreCol: 'taskCreationRequests',
    queryConstraints: constraints,
    onUpdate,
  });
};

/**
 * Create a task creation request locally + queue for sync.
 */
export const createTaskCreationRequestOffline = async (requestData) => {
  const tempId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const record = {
    id: tempId,
    ...requestData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await put('taskCreationRequests', record);
  await queueOperation({
    type: 'CREATE',
    collection: 'taskCreationRequests',
    changes: requestData,
  });

  return { success: true, id: tempId };
};

// ──── Users ─────────────────────────────────────────────────────

/**
 * Get all users (local-first). Typically admin-only.
 * @param {Function} [onUpdate]
 */
export const getUsers = (onUpdate) =>
  localFirstRead({
    storeName: 'users',
    firestoreCol: 'users',
    onUpdate,
  });

// ──── All Student Progress (bulk) ───────────────────────────────

/**
 * Get ALL student progress records (local-first). Used by admin dashboards and trackers.
 * @param {Function} [onUpdate]
 */
export const getAllStudentProgressOffline = (onUpdate) =>
  localFirstRead({
    storeName: 'studentProgress',
    firestoreCol: 'studentProgress',
    onUpdate,
  });

/**
 * Get all progress records for a specific user (local-first).
 * Returns an array of progress docs for that user.
 * @param {string} userId
 * @param {Function} [onUpdate]
 */
export const getUserStudentProgress = async (userId, onUpdate) => {
  // 1. Read from local cache, filter by userId
  const allCached = await getAllByIndex('studentProgress', 'userId', userId);
  if (allCached.length > 0 && onUpdate) {
    onUpdate({ data: allCached, source: 'cache' });
  }

  // 2. Background refresh from Firestore
  if (navigator.onLine) {
    try {
      const q = query(
        collection(firestoreDB, 'studentProgress'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const serverData = snapshotToArray(snapshot);
      if (serverData.length > 0) {
        await putMany('studentProgress', serverData);
        await recordSync('studentProgress');
      }
      if (onUpdate) onUpdate({ data: serverData, source: 'server' });
      return { data: serverData, source: 'server' };
    } catch (err) {
      console.warn('[OfflineData] getUserStudentProgress fetch failed:', err.message);
    }
  }

  return { data: allCached, source: 'cache' };
};

// ──── Content Submission Requests ───────────────────────────────

/**
 * Get content submission requests (local-first).
 * @param {object} [filters] – { userId, status }
 * @param {Function} [onUpdate]
 */
export const getContentSubmissionRequestsOffline = (filters = {}, onUpdate) => {
  const constraints = [orderBy('createdAt', 'desc')];
  if (filters.userId) constraints.push(where('userId', '==', filters.userId));
  if (filters.status) constraints.push(where('status', '==', filters.status));

  return localFirstRead({
    storeName: 'contentSubmissionRequests',
    firestoreCol: 'contentSubmissionRequests',
    queryConstraints: constraints,
    onUpdate,
  });
};

/**
 * Create a content submission request locally + queue for sync.
 */
export const createContentSubmissionRequestOffline = async (requestData) => {
  const tempId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const record = {
    id: tempId,
    ...requestData,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await put('contentSubmissionRequests', record);
  await queueOperation({
    type: 'CREATE',
    collection: 'contentSubmissionRequests',
    changes: requestData,
  });

  return { success: true, id: tempId };
};

// ──── Task Revision Requests ────────────────────────────────────

/**
 * Get task revision requests (local-first).
 * @param {object} [filters]
 * @param {Function} [onUpdate]
 */
export const getTaskRevisionRequestsOffline = (filters = {}, onUpdate) => {
  const constraints = [orderBy('createdAt', 'desc')];
  if (filters.userId) constraints.push(where('userId', '==', filters.userId));
  if (filters.status) constraints.push(where('status', '==', filters.status));

  return localFirstRead({
    storeName: 'taskRevisionRequests',
    firestoreCol: 'taskRevisionRequests',
    queryConstraints: constraints,
    onUpdate,
  });
};

/**
 * Create a task revision request locally + queue for sync.
 */
export const createTaskRevisionRequestOffline = async (requestData) => {
  const tempId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const record = {
    id: tempId,
    ...requestData,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await put('taskRevisionRequests', record);
  await queueOperation({
    type: 'CREATE',
    collection: 'taskRevisionRequests',
    changes: requestData,
  });

  return { success: true, id: tempId };
};

// ──── Announcement Revision Requests ────────────────────────────

/**
 * Get announcement revision requests (local-first).
 * @param {object} [filters]
 * @param {Function} [onUpdate]
 */
export const getAnnouncementRevisionRequestsOffline = (filters = {}, onUpdate) => {
  const constraints = [orderBy('createdAt', 'desc')];
  if (filters.userId) constraints.push(where('userId', '==', filters.userId));
  if (filters.status) constraints.push(where('status', '==', filters.status));

  return localFirstRead({
    storeName: 'announcementRevisionRequests',
    firestoreCol: 'announcementRevisionRequests',
    queryConstraints: constraints,
    onUpdate,
  });
};

/**
 * Create an announcement revision request locally + queue for sync.
 */
export const createAnnouncementRevisionRequestOffline = async (requestData) => {
  const tempId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const record = {
    id: tempId,
    ...requestData,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await put('announcementRevisionRequests', record);
  await queueOperation({
    type: 'CREATE',
    collection: 'announcementRevisionRequests',
    changes: requestData,
  });

  return { success: true, id: tempId };
};

// ──── Active Announcements (filtered) ───────────────────────────

/**
 * Get only active announcements (local-first).
 * Filters by isActive===true after fetching.
 * @param {Function} [onUpdate]
 */
export const getActiveAnnouncementsOffline = async (onUpdate) => {
  const result = await getAnnouncements((update) => {
    const active = update.data.filter(a => a.isActive !== false);
    if (onUpdate) onUpdate({ data: active, source: update.source });
  });
  const active = result.data.filter(a => a.isActive !== false);
  return { data: active, source: result.source };
};

// ──── Update Student Progress (upsert-style, matching firestore.js) ──

/**
 * Update student progress for a specific task locally + queue for sync.
 * If no existing record, creates one. Matches the firestore.js updateStudentProgress API.
 *
 * @param {string} userId
 * @param {string} taskId
 * @param {string} status
 * @param {string} [notes]
 */
export const updateStudentProgressUpsert = async (userId, taskId, status, notes = '') => {
  // Look for existing progress
  const allCached = await getAllByIndex('studentProgress', 'userId', userId);
  const existing = allCached.find(p => p.taskId === taskId);

  const now = new Date().toISOString();
  const changes = {
    userId,
    taskId,
    status,
    notes,
    completedAt: status === 'done' ? now : null,
    updatedAt: now,
  };

  if (existing) {
    // Update existing
    await put('studentProgress', { ...existing, ...changes });
    await queueOperation({
      type: 'UPDATE',
      collection: 'studentProgress',
      docId: existing.id,
      changes,
    });
  } else {
    // Create new
    const tempId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    await put('studentProgress', { id: tempId, ...changes, createdAt: now });
    await queueOperation({
      type: 'CREATE',
      collection: 'studentProgress',
      changes,
    });
  }

  return { success: true };
};
