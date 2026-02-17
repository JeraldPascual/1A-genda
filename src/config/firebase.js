// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const storage = getStorage(app);

// Initialize Firestore with persistent local cache for offline-first support.
// Uses the modern API (replaces deprecated enableIndexedDbPersistence).
// Multi-tab manager allows persistence across multiple browser tabs.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
  experimentalForceLongPolling: false, // Use WebSockets when online
  experimentalAutoDetectLongPolling: true, // Auto-switch to long polling if WebSocket fails
});

// Suppress Firestore reconnection logging in production
if (import.meta.env.PROD) {
  const originalConsoleWarn = console.warn;
  console.warn = (...args) => {
    const message = args[0]?.toString() || '';
    if (
      message.includes('WebChannelConnection') ||
      message.includes('transport errored') ||
      message.includes('RPC') ||
      message.includes('cleardot.gif')
    ) {
      return; // Suppress Firestore reconnection noise
    }
    originalConsoleWarn.apply(console, args);
  };
}

export default app;
