# Quick Context Snippets for LLM Sessions

Use these snippets to quickly provide context to LLMs when working on 1A-genda.

---

## One-Liner Context

```
1A-genda: React 19 + Firebase Firestore task management app with Tailwind CSS, MUI, GSAP animations, and special visual effects for targeted users.
```

---

## Essential Tech Stack

```
Frontend: React 19.2, Vite 7.2, Tailwind CSS 4.1, MUI 7.3
Backend: Firebase Firestore + Auth (no Storage - base64 files)
Animations: GSAP 3.13, canvas-confetti
3D: Three.js 0.182 (F1 car mascot)
State: React Context (Auth, Theme, Notification)
Markdown: react-markdown + remark-gfm
PDF: jsPDF 4.0
```

---

## File Structure Quick Reference

```
src/
├── App.jsx              # Root, routing, providers
├── components/
│   ├── admin/           # AdminPanel, StudentDashboard
│   ├── student/         # KanbanBoard, TaskCard, PomodoroTimer
│   └── shared/          # Reusable (AnnouncementTicker, InfoBar, etc.)
├── context/             # AuthContext, ThemeContext, NotificationContext
├── utils/               # firestore.js, fileUpload.js, specialEffects.js
└── config/firebase.js   # Firebase initialization
```

---

## Firestore Collections

```
users             → User profiles, specialEffects flag
globalTasks       → Admin-created tasks
studentProgress   → Per-user task status
announcements     → Class announcements (markdown)
classConfig       → Semester dates, schedule, links
taskRevisions     → Revision requests
taskCreationReqs  → New task requests
announcementReqs  → Announcement edit requests
```

---

## Context Providers Usage

```javascript
// Auth
const { currentUser, userData, login, logout } = useAuth();
// userData.specialEffects → boolean for special effects

// Theme
const { theme, toggleTheme } = useTheme();
// theme is 'dark' or 'light'

// Notifications
const { showNotification } = useNotification();
// showNotification(message, type) - type: 'success' | 'error' | 'info'
```

---

## Special Effects Targeting

```javascript
// Check if user has special effects
import { hasSpecialEffects, triggerHeartConfetti } from './utils/specialEffects';

if (hasSpecialEffects(userData)) {
  triggerHeartConfetti();
}

// Components for special users:
// - HeartTrail.jsx (mouse trail)
// - BearMascot.jsx (3D bear)
// - PinkThemeManager.jsx (pink CSS vars)
// - F1Car.jsx (3D racing car)
```

---

## Common Firestore Operations

```javascript
// Import
import {
  createUserDocument,
  updateStudentProgress,
  getGlobalTasks,
  updateAnnouncement
} from './utils/firestore';

// Patterns
await createUserDocument(uid, { displayName, email, role: 'student' });
await updateStudentProgress(userId, taskId, 'done');
const tasks = await getGlobalTasks(); // Returns array
```

---

## File Upload Pattern

```javascript
import { uploadFile, sanitizeFilename } from './utils/fileUpload';

// Files stored as base64, max 2MB
const attachment = await uploadFile(file); // Returns { name, base64, type }
```

---

## Styling Quick Reference

```javascript
// Tailwind dark mode
className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"

// Pink theme (for special users, via CSS vars)
// --color-primary: carnation pink #F88379

// MUI theme import
import theme from './theme/muiTheme';
```

---

## Animation Patterns

```javascript
// GSAP
import gsap from 'gsap';
useEffect(() => {
  const tl = gsap.timeline();
  tl.to(elementRef.current, { opacity: 1, duration: 0.5 });
  return () => tl.kill();
}, []);

// Confetti
import { triggerHeartConfetti } from './utils/specialEffects';
triggerHeartConfetti({ origin: { x: 0.5, y: 0.5 } });
```

---

## PWA Info

```
- Service worker: public/service-worker.js
- Manifest: public/manifest.json
- Install prompt: src/components/shared/InstallPrompt.jsx
- Network status: src/components/NetworkStatus.jsx
```

---

## Dev Commands

```bash
npm install          # Install dependencies
npx vite --port=4000 # Dev server
npm run build        # Production build
npx eslint .         # Lint
npm run test         # Vitest
```

---

## Firebase Rules Quick Look

```javascript
// firestore.rules
- Users can read/write own profile
- Students read globalTasks, write own progress
- Admins have full access
- Role field determines permissions
```

---

## Copy-Paste Context Block

```
Project: 1A-genda (React + Firebase student task manager)
Stack: React 19.2, Vite, Firebase Firestore/Auth, Tailwind CSS 4.1, MUI 7.3, GSAP
Data: Firestore collections (users, globalTasks, studentProgress, announcements)
State: AuthContext (user), ThemeContext (dark/light), NotificationContext
Files: Base64 stored in Firestore (no Firebase Storage), max 2MB
Special FX: Heart confetti, pink theme, mouse trail for users with specialEffects: true
Dev server: npx vite --port=4000
```
