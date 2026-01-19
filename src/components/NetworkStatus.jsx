import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
/**
 * Displays a network status banner when offline or reconnected.
 * Listens to browser online/offline events and shows connection state.
 * @returns {JSX.Element|null}
 */
const NetworkStatus = () => {
  const initialOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  const [isOnline, setIsOnline] = useState(initialOnline);
  const [visible, setVisible] = useState(!initialOnline ? true : false);
  const [justReconnected, setJustReconnected] = useState(false);
  const [isProbing, setIsProbing] = useState(false);
  const [probeError, setProbeError] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setIsOnline(false);
      setVisible(true);
    };

    const handleOnline = () => {
      setIsOnline(true);
      setIsProbing(false);
      setProbeError(false);
      setVisible(true);
      setJustReconnected(true);
      // Hide the banner after a short success message
      setTimeout(() => {
        setJustReconnected(false);
        setVisible(false);
      }, 3000);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed left-1/2 transform -translate-x-1/2 top-3 z-50 transition-all duration-300 pointer-events-none">
      <div
        className={`pointer-events-auto flex items-center justify-center gap-3 px-4 py-2 rounded-full shadow-lg text-white transition-all duration-250 ${isOnline ? 'bg-emerald-600' : 'bg-rose-600'}`}
      >
        {justReconnected ? (
          // Show only the 'Back online' text during the reconnection success period
          <span className="text-sm font-medium">Back online</span>
        ) : (
          // Normal state: show icon + status and retry controls when offline
          <>
            {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span className="text-sm font-medium">
              {isOnline ? 'Online' : 'No internet connection'}
            </span>
            {!isOnline && (
              <button
                onClick={async () => {
                  if (isProbing) return;
                  setIsProbing(true);
                  setProbeError(false);
                  const probe = async (timeout = 5000) => {
                    const controller = new AbortController();
                    const id = setTimeout(() => controller.abort(), timeout);
                    try {
                      // Try a lightweight same-origin request; HEAD is enough
                      const res = await fetch('/favicon.ico', { method: 'HEAD', cache: 'no-store', signal: controller.signal });
                      clearTimeout(id);
                      return res && (res.ok || res.status === 200);
                    } catch (err) {
                      clearTimeout(id);
                      return false;
                    }
                  };

                  const ok = await probe(5000);
                  setIsProbing(false);
                  if (ok) {
                    setIsOnline(true);
                    setVisible(true);
                    setJustReconnected(true);
                    setTimeout(() => {
                      setJustReconnected(false);
                      setVisible(false);
                    }, 3000);
                  } else {
                    setProbeError(true);
                  }
                }}
                className="ml-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-sm flex items-center gap-2"
                disabled={isProbing}
              >
                {isProbing ? 'Checking...' : 'Retry'}
              </button>
            )}
            {probeError && (
              <span className="ml-2 text-xs text-white/80">Still offline</span>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NetworkStatus;
