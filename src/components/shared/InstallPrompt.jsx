/**
 * InstallPrompt component displays a smart prompt for users to add the PWA to their home screen on iOS or Android.
 * Detects device type, install state, and dismissal, and shows the prompt only when appropriate.
 *
 * Usage:
 * Place this component at the root of your app to encourage installation as a PWA. It manages its own visibility and localStorage state.
 *
 * Avoid forcing the prompt to show or bypassing the built-in detection logic to prevent user annoyance and redundant prompts.
 */
import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share } from 'lucide-react';
import { Button } from '@mui/material';

const InstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Detect device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iOS = /iphone|ipad|ipod/.test(userAgent);
    const android = /android/.test(userAgent);

    setIsIOS(iOS);
    setIsAndroid(android);

    // Check if already dismissed or installed
    const dismissed = localStorage.getItem('installPromptDismissed');
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (!dismissed && !isStandalone && (iOS || android)) {
      // Show prompt after 3 seconds
      setTimeout(() => setShowPrompt(true), 3000);
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('installPromptDismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 max-w-sm animate-slide-up"
      role="dialog"
      aria-modal="true"
      aria-label="Install app prompt"
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === 'Escape') handleDismiss();
      }}
    >
      <div className="dark:bg-dark-bg-secondary light:bg-light-bg-secondary rounded-xl p-4 shadow-2xl border dark:border-dark-border light:border-light-border backdrop-blur-lg">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 hover:bg-gray-700/50 rounded-lg transition-colors"
          aria-label="Dismiss install prompt"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleDismiss();
            }
          }}
        >
          <X className="w-4 h-4 dark:text-dark-text-muted light:text-light-text-muted" />
        </button>

        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 pr-6">
            <h3 className="font-bold dark:text-dark-text-primary light:text-light-text-primary mb-1">
              Add to Home Screen
            </h3>
            <p className="text-sm dark:text-dark-text-secondary light:text-light-text-secondary mb-2">
              Quick access to 1A-genda anytime!
            </p>
          </div>
        </div>

        <div className="text-sm dark:text-dark-text-secondary light:text-light-text-secondary space-y-2 mb-3">
          {isIOS && (
            <div className="flex items-start gap-2">
              <Share className="w-4 h-4 mt-0.5 flex-shrink-0 text-sky-400" />
              <div>
                <p className="font-medium">Tap <strong>Share</strong> button below</p>
                <p>Then select <strong>"Add to Home Screen"</strong></p>
              </div>
            </div>
          )}
          {isAndroid && (
            <div className="flex items-start gap-2">
              <Download className="w-4 h-4 mt-0.5 flex-shrink-0 text-sky-400" />
              <div>
                <p className="font-medium">Tap <strong>Menu</strong> (3 dots)</p>
                <p>Then select <strong>"Add to Home screen"</strong></p>
              </div>
            </div>
          )}
        </div>

        <Button
          fullWidth
          onClick={handleDismiss}
          variant="contained"
          className="normal-case! font-semibold! py-2.5! rounded-lg!"
          aria-label="Dismiss install prompt"
          tabIndex={0}
          sx={{
            background: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #0ea5e9 0%, #1d4ed8 100%)',
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleDismiss();
            }
          }}
        >
          Got it!
        </Button>
      </div>
    </div>
  );
};

export default InstallPrompt;
