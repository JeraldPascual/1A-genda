# Component Connections & Data Flow

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           App.jsx                                    │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    Provider Hierarchy                          │  │
│  │  AuthProvider > ThemeProvider > NotificationProvider           │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │ HeartTrail   │  │ BearMascot   │  │ PinkThemeManager         │   │
│  │ (special fx) │  │ (special fx) │  │ (special fx)             │   │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │              Sticky Header + AnnouncementTicker              │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                     Router (Routes)                          │    │
│  │  /login → Login                                              │    │
│  │  /register → Register                                        │    │
│  │  /admin → AdminPanel                                         │    │
│  │  / → StudentModularDashboard                                 │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

## Admin Panel Structure

```
AdminPanel.jsx
├── Tab: Dashboard
│   └── StudentDashboard.jsx
├── Tab: Tasks
│   ├── Task CRUD (inline)
│   └── AttachmentList.jsx
├── Tab: Announcements
│   ├── Announcement CRUD (inline)
│   └── MarkdownEditor.jsx
├── Tab: Content Submissions
│   └── ContentSubmissionPanel.jsx
├── Tab: Schedule
│   └── ScheduleTable.jsx (editable)
└── Tab: Settings
    └── Class config management
```

## Student Dashboard Structure

```
StudentModularDashboard.jsx
├── InfoBar.jsx (weather, time, theme toggle)
├── DailyQuote.jsx
├── SemesterProgress.jsx
├── KanbanBoard.jsx
│   ├── KanbanColumn.jsx (To-Do)
│   │   └── TaskCard.jsx / RequestableTaskCard.jsx
│   ├── KanbanColumn.jsx (In Progress)
│   │   └── TaskCard.jsx
│   └── KanbanColumn.jsx (Done)
│       └── TaskCard.jsx
├── PomodoroTimer.jsx
├── StudentAnalytics.jsx
├── ResourceLinks.jsx
└── GlobalSearch.jsx (Ctrl+K modal)
```

## Context Data Flow

```
AuthContext
├── currentUser (Firebase user)
├── userData (Firestore user doc)
│   └── userData.specialEffects → triggers special effect components
├── login() / logout() / register()
└── loading state

ThemeContext
├── theme ('dark' | 'light')
├── toggleTheme()
└── Manages CSS class on document.documentElement

NotificationContext
├── notification (message, type)
├── showNotification()
└── hideNotification()
```

## Firestore Data Flow

```
users (collection)
└── {userId}
    ├── displayName, email, role, section
    ├── specialEffects: boolean
    └── lastLogin, createdAt

globalTasks (collection)
└── {taskId}
    ├── title, description, category, subject
    ├── deadline, priority
    ├── attachments: [{name, base64, type}]
    └── createdAt, createdBy

studentProgress (collection)
└── {progressId}
    ├── userId, taskId
    ├── status: 'todo' | 'in_progress' | 'done'
    └── updatedAt

announcements (collection)
└── {announcementId}
    ├── title, content (markdown)
    ├── priority, category
    └── createdAt, createdBy

classConfig (collection)
└── config (single doc)
    ├── semesterStart, semesterEnd
    ├── className, schedule
    └── resourceLinks
```

## Special Effects Targeting

```
User Document                     Component Behavior
─────────────────────────────────────────────────────────────
specialEffects: true    →         HeartTrail renders
                        →         BearMascot renders
                        →         PinkThemeManager applies
                        →         triggerHeartConfetti on task done
                        →         Pink color scheme CSS vars

specialEffects: false   →         Default confetti on task done
                        →         Standard theme colors
                        →         No mascot or trail
```

## Event Flow: Task Completion

```
1. User drags task to "Done" column
   └── KanbanBoard.jsx handleDragEnd()
       ├── updateStudentProgress() → Firestore write
       └── Check hasSpecialEffects(userData)?
           ├── true → triggerHeartConfetti()
           └── false → standard confetti.burst()
```

## Event Flow: Announcement Update

```
1. Admin updates announcement
   └── AdminPanel.jsx saveAnnouncement()
       └── updateAnnouncement() → Firestore write

2. AnnouncementTicker subscribes to announcements
   └── Real-time onSnapshot listener
       └── GSAP ticker animation restarts
```

## Component Import Map

```javascript
// Main entry points
App.jsx
├── uses AuthContext, ThemeContext, NotificationContext
├── imports HeartTrail, BearMascot, PinkThemeManager (lazy)
└── imports Login, Register, AdminPanel, StudentModularDashboard (lazy)

// Shared components (can be used anywhere)
src/components/shared/
├── AnnouncementPanel, AnnouncementTicker
├── AttachmentList
├── DailyQuote
├── GlobalSearch
├── InfoBar
├── InstallPrompt
├── LinkifiedText
├── MarkdownDisplay, MarkdownEditor
└── SemesterProgress

// Admin-only components
src/components/admin/
├── AdminPanel
├── ContentSubmissionPanel
└── StudentDashboard

// Student-only components
src/components/student/
├── KanbanBoard, KanbanColumn
├── PomodoroTimer
├── RequestableTaskCard, TaskCard
├── ResourceLinks
├── ScheduleTable
├── StudentAnalytics
├── StudentModularDashboard
└── StudentProgressTracker
```
