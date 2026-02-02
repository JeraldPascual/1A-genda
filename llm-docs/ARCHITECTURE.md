# 1A-genda Architecture

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | Frontend framework |
| Vite | 7.2.4 | Build tool |
| Firebase | 12.6.0 | Backend (Firestore + Auth) |
| Material-UI | 7.3.5 | UI components |
| Tailwind CSS | 4.1.17 | Utility CSS |
| GSAP | 3.13.0 | Animations |
| Three.js | 0.182.0 | 3D graphics |
| Recharts | 3.5.1 | Charts |
| jsPDF | 4.0.0 | PDF export |
| canvas-confetti | 1.9.4 | Confetti effects |
| lucide-react | 0.555.0 | Icon system |
| react-markdown | 10.1.0 | Markdown rendering |

## Provider Hierarchy

```jsx
<ThemeProvider>
  <AuthProvider>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </AuthProvider>
</ThemeProvider>
```

## Context Providers

| Provider | File | Purpose | Key Exports |
|----------|------|---------|-------------|
| ThemeContext | `src/context/ThemeContext.jsx` | Dark/light mode | `theme`, `toggleTheme` |
| AuthContext | `src/context/AuthContext.jsx` | Authentication | `user`, `userData`, `signIn`, `signUp`, `signOut`, `isAdmin` |
| NotificationContext | `src/context/NotificationContext.jsx` | Toast notifications | `showNotification` |

## Firestore Collections

| Collection | Purpose | Access |
|------------|---------|--------|
| `users` | User profiles (displayName, email, role, batch) | Read: authenticated; Write: owner or admin |
| `globalTasks` | All tasks created by admin | Read: authenticated; Write: admin only |
| `studentProgress` | Individual student task completion | Read: authenticated; Write: owner only |
| `announcements` | Active announcements | Read: authenticated; Write: admin only |
| `classConfig` | Global class configuration | Read: authenticated; Write: admin only |
| `taskCreationRequests` | Student requests for new tasks | Read: authenticated; Create: owner; Manage: admin |
| `taskRevisionRequests` | Student requests for task changes | Read: authenticated; Create: owner; Manage: admin |
| `announcementRevisionRequests` | Student requests for announcement changes | Read: authenticated; Create: owner; Manage: admin |
| `contentSubmissions` | Student content proposals | Read: authenticated; Create: owner; Manage: admin |

## Directory Structure

```
src/
├── main.jsx                 # App entry point, wraps App with providers
├── App.jsx                  # Root component, routing, auth, theme, loading
├── App.css                  # Legacy CSS (mostly unused)
├── index.css                # Global styles, CSS variables, scrollbars, glass effects
│
├── components/              # All UI components
│   ├── Login.jsx            # Login form with remember me, password reset
│   ├── Register.jsx         # Registration with role/batch selection
│   ├── NetworkStatus.jsx    # Offline/online detection banner
│   │
│   ├── admin/               # Admin-only components
│   │   ├── AdminPanel.jsx           # Main admin dashboard (tabs: tasks, announcements, requests)
│   │   ├── ContentSubmissionPanel.jsx # Submit new tasks/announcements
│   │   └── StudentDashboard.jsx     # Student demographics and stats overview
│   │
│   ├── student/             # Student-specific components
│   │   ├── KanbanBoard.jsx          # Personal task board (To Do → Completed)
│   │   ├── KanbanColumn.jsx         # Column component for KanbanBoard
│   │   ├── TaskCard.jsx             # Individual task card
│   │   ├── RequestableTaskCard.jsx  # Task card with revision request capability
│   │   ├── StudentModularDashboard.jsx # Tabbed student dashboard
│   │   ├── ScheduleTable.jsx        # Weekly class schedule display
│   │   ├── ResourceLinks.jsx        # External resource cards
│   │   ├── StudentAnalytics.jsx     # Progress charts and statistics
│   │   ├── StudentProgressTracker.jsx # Admin view of all student progress
│   │   └── PomodoroTimer.jsx        # Pomodoro productivity timer
│   │
│   ├── shared/              # Reusable components for both roles
│   │   ├── AnnouncementPanel.jsx    # Full announcement list with revision requests
│   │   ├── AnnouncementTicker.jsx   # Scrolling announcement banner (GSAP)
│   │   ├── AttachmentList.jsx       # File attachments display with download
│   │   ├── BearMascot.jsx           # Animated SVG bear mascot (special users)
│   │   ├── DailyQuote.jsx           # Daily motivational quote display
│   │   ├── DashboardPreview.jsx     # Dashboard preview component
│   │   ├── F1Car.jsx                # 3D F1 car using Three.js (special users)
│   │   ├── GlobalSearch.jsx         # Global search modal (Ctrl+K)
│   │   ├── HeartTrail.jsx           # Mouse trail effect (special users)
│   │   ├── InfoBar.jsx              # Weather, date, time bar (Open-Meteo API)
│   │   ├── InstallPrompt.jsx        # PWA install prompt
│   │   ├── LinkifiedText.jsx        # Auto-linkify URLs in text
│   │   ├── MarkdownDisplay.jsx      # Render markdown content
│   │   ├── MarkdownEditor.jsx       # Markdown editor with toolbar
│   │   ├── PinkThemeManager.jsx     # Pink theme for special users
│   │   └── SemesterProgress.jsx     # Visual semester progress indicator
│   │
│   └── ui/                  # UI primitives
│       └── multi-step-loader.jsx    # Animated loading overlay (GSAP)
│
├── config/
│   └── firebase.js          # Firebase initialization (Auth, Firestore)
│
├── context/                 # React Context providers
│   ├── AuthContext.jsx      # Authentication state, signIn/signUp/signOut
│   ├── ThemeContext.jsx     # Dark/light theme state
│   └── NotificationContext.jsx # Global toast notifications (Snackbar)
│
├── data/
│   └── quotes.json          # 98 motivational quotes for DailyQuote
│
├── lib/
│   └── utils.js             # cn() utility for class names (Tailwind)
│
├── theme/
│   └── muiTheme.js          # Material-UI theme configuration
│
└── utils/                   # Utility modules
    ├── fileUpload.js        # File upload (base64), validation, size limits
    ├── firestore.js         # All Firestore CRUD operations (~800 lines)
    ├── pdfExport.js         # PDF generation for tasks, progress, announcements
    └── specialEffects.js    # Confetti, fireworks, heart effects
```

## Key Patterns

1. **Lazy Loading:** Components loaded on-demand via `React.lazy()`
2. **Role-Based Rendering:** Different dashboards for admin vs student
3. **Modular Utilities:** Separated concerns in `utils/` directory
4. **Base64 File Storage:** Files stored as base64 in Firestore (no Firebase Storage)
5. **CSS Variables:** Theme colors via CSS variables for dark/light mode
6. **Glass Morphism:** `glass-effect` class for frosted glass UI elements
7. **Dual Styling:** Tailwind utilities + MUI components together

## Environment Variables

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_ADMIN_EMAIL=admin@example.com  # Restricts admin registration
```

## Styling Architecture

### CSS Variables (from index.css)
```css
:root {
  --color-text-primary: #1e293b;
  --color-bg-primary: #fafafa;
  /* ... */
}
:root.dark {
  --color-text-primary: #f8fafc;
  --color-bg-primary: #0f172a;
  /* ... */
}
```

### Tailwind Dark Mode
- Use `dark:` prefix for dark mode styles
- Use `light:` prefix for light mode styles
- Theme toggled via `ThemeContext`

## Security Considerations

1. **Firestore Rules**: Role-based access control in `firestore.rules`
2. **Admin Restriction**: Only specific email can register as admin
3. **File Validation**: Dangerous file types blocked in `fileUpload.js`
4. **File Size Limits**: 2MB max per file (base64 in Firestore)
5. **Filename Sanitization**: Path traversal prevention

## PWA Features

- **Service Worker**: `public/service-worker.js`
- **Manifest**: `public/manifest.json`
- **Install Prompt**: `src/components/shared/InstallPrompt.jsx`
- **Offline Detection**: `src/components/NetworkStatus.jsx`
