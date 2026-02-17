/**
 * @file SyncContext.jsx
 * @description React context that exposes offline-sync state to the entire app.
 *
 * Provides:
 *  - `pendingCount`  — number of operations waiting to be synced
 *  - `isSyncing`     — whether a sync is currently in progress
 *  - `lastSyncTime`  — timestamp of the last successful sync
 *  - `isOnline`      — current network connectivity state
 *  - `manualSync()`  — trigger an immediate sync attempt
 *
 * Wrap the app in `<SyncProvider>` (in App.jsx) and consume via `useSync()`.
 *
 * @module SyncContext
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getPendingCount,
  syncPendingOperations,
  startAutoSync,
  purgeOldOperations,
} from '../utils/operationQueue';

const SyncContext = createContext(null);

/**
 * Provider component — place at the top of the component tree.
 */
export const SyncProvider = ({ children }) => {
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // ── Refresh pending count ─────────────────────────────────
  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await getPendingCount();
      setPendingCount(count);
    } catch (err) {
      console.warn('[SyncContext] Failed to get pending count:', err.message);
      setPendingCount(0);
    }
  }, []);

  // ── Manual sync ───────────────────────────────────────────
  const manualSync = useCallback(async () => {
    if (!navigator.onLine) return;
    setIsSyncing(true);
    try {
      const results = await syncPendingOperations();
      setLastSyncTime(Date.now());
      await refreshPendingCount();
      return results;
    } finally {
      setIsSyncing(false);
    }
  }, [refreshPendingCount]);

  // ── Lifecycle ─────────────────────────────────────────────
  useEffect(() => {
    // Start auto-sync listeners (online event, visibilitychange)
    try {
      startAutoSync(async () => {
        setLastSyncTime(Date.now());
        await refreshPendingCount();
      });
    } catch (err) {
      console.warn('[SyncContext] Failed to start auto-sync:', err.message);
    }

    // Initial count
    refreshPendingCount();

    // Poll pending count every 10 s so the badge stays accurate
    const interval = setInterval(refreshPendingCount, 10_000);

    // Purge old synced operations once on mount
    purgeOldOperations().catch(() => {});

    // Track online/offline
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, [refreshPendingCount]);

  return (
    <SyncContext.Provider
      value={{
        pendingCount,
        isSyncing,
        lastSyncTime,
        isOnline,
        manualSync,
        refreshPendingCount,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
};

/**
 * Hook to consume sync state anywhere in the tree.
 *
 * @returns {{ pendingCount:number, isSyncing:boolean, lastSyncTime:number|null, isOnline:boolean, manualSync:()=>Promise, refreshPendingCount:()=>Promise }}
 */
export const useSync = () => {
  const ctx = useContext(SyncContext);
  if (!ctx) {
    throw new Error('useSync() must be used within a <SyncProvider>');
  }
  return ctx;
};
