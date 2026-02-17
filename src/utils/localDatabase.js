/**
 * @file localDatabase.js
 * @description IndexedDB wrapper for offline-first data persistence using the `idb` library.
 *
 * Schema stores all major Firestore collections locally so the app can render
 * fully offline (Google Docs / Sheets behavior). Data is written here first,
 * then synced to Firestore via the operation queue.
 *
 * Collections mirrored:
 *  - tasks (globalTasks)
 *  - announcements
 *  - studentProgress
 *  - settings (classSettings)
 *  - users
 *  - taskCreationRequests
 *  - taskRevisionRequests
 *  - contentSubmissionRequests
 *  - announcementRevisionRequests
 *
 * Internal stores:
 *  - operations  — pending write operations queued for sync
 *  - syncMeta    — last-sync timestamps per collection
 *
 * @module localDatabase
 */
import { openDB } from 'idb';

const DB_NAME = '1agenda-offline';
const DB_VERSION = 1;

/**
 * Open (or create) the local IndexedDB database.
 * Automatically handles schema upgrades via the `upgrade` callback.
 *
 * @returns {Promise<import('idb').IDBPDatabase>}
 */
export const initDB = () =>
  openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // ── Data stores (mirror Firestore collections) ──────────────

      if (!db.objectStoreNames.contains('tasks')) {
        const store = db.createObjectStore('tasks', { keyPath: 'id' });
        store.createIndex('batch', 'batch');
        store.createIndex('status', 'status');
        store.createIndex('order', 'order');
        store.createIndex('updatedAt', 'updatedAt');
      }

      if (!db.objectStoreNames.contains('announcements')) {
        const store = db.createObjectStore('announcements', { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt');
      }

      if (!db.objectStoreNames.contains('studentProgress')) {
        const store = db.createObjectStore('studentProgress', { keyPath: 'id' });
        store.createIndex('userId', 'userId');
        store.createIndex('taskId', 'taskId');
      }

      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('users')) {
        const store = db.createObjectStore('users', { keyPath: 'id' });
        store.createIndex('email', 'email');
      }

      if (!db.objectStoreNames.contains('taskCreationRequests')) {
        const store = db.createObjectStore('taskCreationRequests', { keyPath: 'id' });
        store.createIndex('userId', 'userId');
        store.createIndex('status', 'status');
        store.createIndex('createdAt', 'createdAt');
      }

      if (!db.objectStoreNames.contains('taskRevisionRequests')) {
        const store = db.createObjectStore('taskRevisionRequests', { keyPath: 'id' });
        store.createIndex('userId', 'userId');
        store.createIndex('status', 'status');
        store.createIndex('taskId', 'taskId');
      }

      if (!db.objectStoreNames.contains('contentSubmissionRequests')) {
        const store = db.createObjectStore('contentSubmissionRequests', { keyPath: 'id' });
        store.createIndex('userId', 'userId');
        store.createIndex('status', 'status');
        store.createIndex('contentType', 'contentType');
      }

      if (!db.objectStoreNames.contains('announcementRevisionRequests')) {
        const store = db.createObjectStore('announcementRevisionRequests', { keyPath: 'id' });
        store.createIndex('userId', 'userId');
        store.createIndex('status', 'status');
        store.createIndex('announcementId', 'announcementId');
      }

      // ── Internal stores ─────────────────────────────────────────

      if (!db.objectStoreNames.contains('operations')) {
        const store = db.createObjectStore('operations', { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp');
        store.createIndex('synced', 'synced');
      }

      if (!db.objectStoreNames.contains('syncMeta')) {
        db.createObjectStore('syncMeta', { keyPath: 'collection' });
      }
    },
  });

// ── Singleton ───────────────────────────────────────────────────
let _dbPromise = null;

/**
 * Get the shared database instance (lazy singleton).
 * @returns {Promise<import('idb').IDBPDatabase>}
 */
export const getDB = () => {
  if (!_dbPromise) {
    _dbPromise = initDB();
  }
  return _dbPromise;
};

// ── Generic helpers ─────────────────────────────────────────────

/**
 * Get all records from a store.
 * @param {string} storeName
 * @returns {Promise<any[]>}
 */
export const getAll = async (storeName) => {
  const db = await getDB();
  return db.getAll(storeName);
};

/**
 * Get a single record by primary key.
 * @param {string} storeName
 * @param {string} key
 * @returns {Promise<any|undefined>}
 */
export const getByKey = async (storeName, key) => {
  const db = await getDB();
  return db.get(storeName, key);
};

/**
 * Put (upsert) a single record.
 * @param {string} storeName
 * @param {object} value
 * @returns {Promise<IDBValidKey>}
 */
export const put = async (storeName, value) => {
  const db = await getDB();
  return db.put(storeName, value);
};

/**
 * Put many records in a single transaction (bulk upsert).
 * @param {string} storeName
 * @param {object[]} items
 * @returns {Promise<void>}
 */
export const putMany = async (storeName, items) => {
  const db = await getDB();
  const tx = db.transaction(storeName, 'readwrite');
  await Promise.all(items.map((item) => tx.store.put(item)));
  await tx.done;
};

/**
 * Delete a record by primary key.
 * @param {string} storeName
 * @param {string} key
 * @returns {Promise<void>}
 */
export const remove = async (storeName, key) => {
  const db = await getDB();
  return db.delete(storeName, key);
};

/**
 * Clear all records from a store.
 * @param {string} storeName
 * @returns {Promise<void>}
 */
export const clearStore = async (storeName) => {
  const db = await getDB();
  return db.clear(storeName);
};

/**
 * Get all records matching an index value.
 * @param {string} storeName
 * @param {string} indexName
 * @param {IDBValidKey} value
 * @returns {Promise<any[]>}
 */
export const getAllByIndex = async (storeName, indexName, value) => {
  const db = await getDB();
  return db.getAllFromIndex(storeName, indexName, value);
};
