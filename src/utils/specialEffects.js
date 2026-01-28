// utils/specialEffects.js
// Modular effect utilities for user-specific visual effects

/**
 * Special Effects System
 *
 * User targeting:
 *   - Effects are enabled for users with Firestore field `specialEffects: true` (see hasSpecialEffects).
 *   - You can also target by UID or other custom fields.
 *
 * Extensibility:
 *   - To add new effect types (e.g., stars, emojis), add new trigger functions here and extend HeartTrail props.
 *   - Mouse trail is reusable for any SVG path and color.
 *
 * Toggling:
 *   - To allow users to toggle effects, update the Firestore field (e.g., via a profile settings UI).
 *   - Use hasSpecialEffects(userData) to check if effects should be active.
 *
 * Security:
 *   - Effects are only visible to the intended user (checked in App.jsx and KanbanBoard.jsx).
 */
import confetti from 'canvas-confetti';

// SVG path for a classic heart shape (matches HeartTrail)
const HEART_PATH =
  'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';

// Carnation pink
const HEART_COLOR = '#F88379';


export function triggerPinkFireworks() {
  // Dispatch event for other components (e.g., BearMascot)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('allTasksCompleted'));
  }

  const duration = 5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 45, spread: 360, ticks: 100, zIndex: 9999, gravity: 0.8 };

  const randomInRange = (min, max) => Math.random() * (max - min) + min;

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 60 * (timeLeft / duration);
    
    // Shoot from the bottom center-ish, like real fireworks rising
    // We use a lower y origin (closer to 1) and high velocity
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.2, 0.4), y: Math.random() - 0.2 }, // Top burst
      colors: ['#ec4899', '#fce7f3', '#db2777', '#be185d']
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.6, 0.8), y: Math.random() - 0.2 }, // Top burst
      colors: ['#ec4899', '#fce7f3', '#db2777', '#be185d']
    });
    
    // Bottom-up launching effect (streams)
    confetti({
      ...defaults,
      startVelocity: 60,
      gravity: 0.5,
      spread: 80,
      particleCount: 15,
      origin: { x: randomInRange(0.1, 0.9), y: 1 }, // Launch from bottom
      colors: ['#ec4899', '#db2777'],
      drift: randomInRange(-0.5, 0.5)
    });

  }, 300);
}

export function triggerHeartConfetti(options = {}) {
  const count = options.count || 29;
  const color = options.color || HEART_COLOR;
  const shape = options.shape || HEART_PATH;

  const svg = `<svg width='24' height='24' viewBox='0 0 24 24'><path fill='${color}' d='${shape}'/></svg>`;

  // Try SVG heart confetti burst
  try {
    confetti({
      particleCount: count,
      angle: 90,
      spread: 70,
      origin: { y: 0.7 },
      shape: 'svg',
      svg,
      colors: [color],
      ...options,
    });
  } catch {
    // Fallback to emoji hearts if SVG fails
    confetti({
      particleCount: count,
      angle: 90,
      spread: 70,
      origin: { y: 0.7 },
      emojis: ['❤️'],
      colors: [color],
      ...options,
    });
  }
}

/**
 * Checks if the user has special effects enabled (by Firestore field or UID).
 * @param {Object} userData - User data from context
 * @returns {boolean}
 */
export function hasSpecialEffects(userData) {
  // Example: check for Firestore field
  return userData?.specialEffects === true;
  // Or: return userData?.uid === 'SPECIAL_UID';
}

// Easily extend for more effect types in the future
