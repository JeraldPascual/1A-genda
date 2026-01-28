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
  } catch (e) {
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
