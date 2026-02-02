# Feature-to-File Mapping

## Authentication

| Feature | File(s) |
|---------|---------|
| Login form | `src/components/Login.jsx` |
| Registration | `src/components/Register.jsx` |
| Auth state management | `src/context/AuthContext.jsx` |
| Firebase initialization | `src/config/firebase.js` |
| User CRUD | `src/utils/firestore.js` (createUserDocument, getUserData, updateUserLastLogin) |

## Task Management

| Feature | File(s) |
|---------|---------|
| Task CRUD (admin) | `src/components/admin/AdminPanel.jsx`, `src/utils/firestore.js` |
| Personal Kanban board | `src/components/student/KanbanBoard.jsx` |
| Kanban column | `src/components/student/KanbanColumn.jsx` |
| Task card | `src/components/student/TaskCard.jsx` |
| Task revision requests | `src/components/student/RequestableTaskCard.jsx`, `src/utils/firestore.js` |
| Task creation requests | `src/components/student/KanbanBoard.jsx`, `src/utils/firestore.js` |
| Student progress tracking | `src/utils/firestore.js` (studentProgress collection) |

## Announcements

| Feature | File(s) |
|---------|---------|
| Announcement CRUD | `src/components/admin/AdminPanel.jsx`, `src/utils/firestore.js` |
| Scrolling ticker | `src/components/shared/AnnouncementTicker.jsx` |
| Full announcement panel | `src/components/shared/AnnouncementPanel.jsx` |
| Revision requests | `src/components/shared/AnnouncementPanel.jsx`, `src/utils/firestore.js` |

## File Uploads

| Feature | File(s) |
|---------|---------|
| Base64 file upload | `src/utils/fileUpload.js` |
| Attachment display | `src/components/shared/AttachmentList.jsx` |
| File validation | `src/utils/fileUpload.js` (sanitizeFilename, isValidFileType) |

## PDF Export

| Feature | File(s) |
|---------|---------|
| Task export | `src/utils/pdfExport.js` (exportTasksToPDF) |
| Student progress export | `src/utils/pdfExport.js` (exportStudentProgressToPDF) |
| Announcements export | `src/utils/pdfExport.js` (exportAnnouncementsToPDF) |

## Special Effects (specialEffects: true users only)

| Feature | File(s) |
|---------|---------|
| Heart confetti | `src/utils/specialEffects.js` (triggerHeartConfetti) |
| Pink fireworks | `src/utils/specialEffects.js` (triggerPinkFireworks) |
| hasSpecialEffects check | `src/utils/specialEffects.js` (hasSpecialEffects) |
| Mouse trail | `src/components/shared/HeartTrail.jsx` |
| Bear mascot | `src/components/shared/BearMascot.jsx` |
| F1 car (3D) | `src/components/shared/F1Car.jsx` |
| Pink theme | `src/components/shared/PinkThemeManager.jsx` |

## Analytics & Progress

| Feature | File(s) |
|---------|---------|
| Student analytics | `src/components/student/StudentAnalytics.jsx` |
| Progress tracker (admin) | `src/components/student/StudentProgressTracker.jsx` |
| Student dashboard (admin) | `src/components/admin/StudentDashboard.jsx` |

## Productivity Tools

| Feature | File(s) |
|---------|---------|
| Pomodoro timer | `src/components/student/PomodoroTimer.jsx` |
| Class schedule | `src/components/student/ScheduleTable.jsx` |
| Daily quotes | `src/components/shared/DailyQuote.jsx`, `src/data/quotes.json` |
| Resource links | `src/components/student/ResourceLinks.jsx` |

## UI/UX Features

| Feature | File(s) |
|---------|---------|
| Global search (Ctrl+K) | `src/components/shared/GlobalSearch.jsx` |
| Multi-step loader | `src/components/ui/multi-step-loader.jsx` |
| Network status | `src/components/NetworkStatus.jsx` |
| Weather/time bar | `src/components/shared/InfoBar.jsx` |
| PWA install prompt | `src/components/shared/InstallPrompt.jsx` |
| Markdown editor | `src/components/shared/MarkdownEditor.jsx` |
| Markdown display | `src/components/shared/MarkdownDisplay.jsx` |
| Semester progress | `src/components/shared/SemesterProgress.jsx` |
| Linkified text | `src/components/shared/LinkifiedText.jsx` |

## Theme & Styling

| Feature | File(s) |
|---------|---------|
| Theme context | `src/context/ThemeContext.jsx` |
| MUI theme | `src/theme/muiTheme.js` |
| Global styles | `src/index.css` |
| Tailwind config | `tailwind.config.js` |
| Class name utility | `src/lib/utils.js` |

## External APIs

| API | Purpose | File(s) |
|-----|---------|---------|
| Open-Meteo | Weather data for SJDM, PH | `src/components/shared/InfoBar.jsx` |
| Firebase Auth | User authentication | `src/config/firebase.js`, `src/context/AuthContext.jsx` |
| Firebase Firestore | Database | `src/utils/firestore.js` |
