/**
 * @file SyncStatusBadge.jsx
 * @description Visual indicator for offline sync status - shows when pending operations are syncing
 */
import { useSync } from '../../context/SyncContext';
import { Cloud, CloudOff, RefreshCw, CheckCircle } from 'lucide-react';

export default function SyncStatusBadge() {
  const { pendingCount, isSyncing, isOnline, lastSyncTime } = useSync();

  // Don't show if online with no pending operations
  if (isOnline && pendingCount === 0 && !isSyncing) {
    return null;
  }

  // Offline indicator
  if (!isOnline) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-sm">
        <CloudOff className="w-4 h-4" />
        <span>Offline</span>
        {pendingCount > 0 && (
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-xs font-medium">
            {pendingCount}
          </span>
        )}
      </div>
    );
  }

  // Syncing indicator
  if (isSyncing) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm">
        <RefreshCw className="w-4 h-4 animate-spin" />
        <span>Syncing...</span>
        {pendingCount > 0 && (
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-blue-500/20 text-xs font-medium">
            {pendingCount}
          </span>
        )}
      </div>
    );
  }

  // Just synced indicator (show for 3 seconds)
  if (lastSyncTime && Date.now() - lastSyncTime < 3000) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
        <CheckCircle className="w-4 h-4" />
        <span>Synced</span>
      </div>
    );
  }

  // Pending operations (online but not syncing yet)
  if (pendingCount > 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-sm">
        <Cloud className="w-4 h-4" />
        <span>Pending</span>
        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-orange-500/20 text-xs font-medium">
          {pendingCount}
        </span>
      </div>
    );
  }

  return null;
}
