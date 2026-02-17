/**
 * @file SyncStatusBadge.jsx
 * @description Fixed-position notification for offline/sync status.
 * Shows a persistent banner at the bottom when offline, with sync indicators.
 */
import { useState, useEffect } from 'react';
import { useSync } from '../../context/SyncContext';
import { CloudOff, RefreshCw, Wifi } from 'lucide-react';

export default function SyncStatusBadge() {
  const { pendingCount, isSyncing, isOnline, lastSyncTime } = useSync();
  const [showSynced, setShowSynced] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const [showOfflineBadge, setShowOfflineBadge] = useState(true);

  // Track when we come back online from offline
  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setShowOfflineBadge(true); // Show offline badge when going offline
    }
    if (isOnline && wasOffline) {
      setShowSynced(true);
      setWasOffline(false);
      setShowOfflineBadge(false); // Hide offline badge when back online
      const timer = setTimeout(() => setShowSynced(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  // Show "Synced" briefly after sync completes
  useEffect(() => {
    if (lastSyncTime && isOnline && pendingCount === 0) {
      setShowSynced(true);
      const timer = setTimeout(() => setShowSynced(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastSyncTime, isOnline, pendingCount]);

  // === OFFLINE STATE ===
  // Only show if offline AND (has pending changes OR showOfflineBadge is true)
  // Auto-dismiss after 5s if no pending changes
  if (!isOnline && (pendingCount > 0 || showOfflineBadge)) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl glass-effect dark:bg-zinc-900/90 dark:text-white dark:border-zinc-700/50 light:bg-white/90 light:text-gray-900 light:border-gray-200/50">
          <CloudOff className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold">You're offline</span>
            <span className="text-xs opacity-70">
              {pendingCount > 0
                ? `${pendingCount} change${pendingCount > 1 ? 's' : ''} will sync when online`
                : '1A-genda works offline'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // === SYNCING STATE ===
  if (isSyncing) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl bg-blue-600 dark:bg-blue-700 text-white">
          <RefreshCw className="w-5 h-5 animate-spin flex-shrink-0" />
          <span className="text-sm font-semibold">Syncing changes...</span>
        </div>
      </div>
    );
  }

  // === JUST CAME BACK ONLINE ===
  if (showSynced) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl bg-emerald-600 dark:bg-emerald-700 text-white">
          <Wifi className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-semibold">Back online — all synced</span>
        </div>
      </div>
    );
  }

  // === PENDING OPS (online but not yet synced) ===
  if (pendingCount > 0) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl glass-effect dark:bg-zinc-900/90 dark:text-white dark:border-zinc-700/50 light:bg-white/90 light:text-gray-900 light:border-gray-200/50">
          <RefreshCw className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span className="text-sm font-medium">
            {pendingCount} pending change{pendingCount > 1 ? 's' : ''}
          </span>
        </div>
      </div>
    );
  }

  // Nothing to show when online with 0 pending
  return null;
}
