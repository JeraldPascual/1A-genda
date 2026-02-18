# 1A-genda - Class Management System

A modern, offline-first task management PWA for class administrators (P.I.O.) and students. Built with React, Firebase, Material-UI, GSAP, and Tailwind CSS.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.2.0-61dafb.svg)
![Firebase](https://img.shields.io/badge/Firebase-12.6.0-orange.svg)

## Overview

1A-genda is an offline-first class task management system with an intuitive Kanban board. P.I.O. administrators create and manage tasks and announcements for batches 1A1 and 1A2, while students track their individual progress with full offline support.

**Live Demo:** [https://www.1agenda.tech](https://www.1agenda.tech)

**Key Highlights:**
- Progressive Web App (PWA) with full offline support
- Auto-sync when online with background queue
- Optimized bundle size (257kB main, -81% from initial)
- Real-time analytics and progress tracking

## Key Features

### For Students
- **Simple Task Board**: Two columns (To Do → Completed) with forward/backward navigation
- **Personal Progress Tracking**: Mark tasks complete without affecting other students
- **Task Revision Requests**: Request changes to existing tasks (edit details, deadlines, priorities)
- **Content Submissions**: Submit new task or announcement proposals with file attachments
- **File Upload Support**: Attach images, PDFs, and documents to submissions (up to 5MB)
- **Announcement Feed**: View important class announcements with file attachments and fullscreen image viewer
- **Notion Integration**: Quick links to external deadlines tracker and resources
- **Semester Progress**: Visual indicator of class progress
- **File Downloads**: Download attachments from announcements and view images in fullscreen

### For P.I.O. (Class Admin)
- **Global Task Management**: Create tasks for specific batches (1A1, 1A2) or all students
- **Batch-Based Assignment**: Assign tasks to specific batches or make them available to everyone
- **Request Management**: Approve/reject task revision and content submission requests (auto-cleanup on reject/approve)
- **Announcement System**: Post urgent alerts, info, or celebrations with file attachments
- **File Upload Support**: Attach images, PDFs, Office docs (up to 5MB per file, base64 storage)
- **Student Dashboard**: View demographics, completion statistics, and request activity
- **Progress Tracker**: Monitor individual student task completion and request counts
- **Batch Filtering**: View and manage tasks by batch or all together
- **Auto Firestore Cleanup**: Deleted/approved/rejected records removed automatically

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19.2.0 | Frontend framework |
| Vite 7.2.4 | Build tool and dev server |
| Material-UI 7.3.5 | Component library |
| Tailwind CSS v4 | Styling framework |
| Firebase 12.6.0 | Backend (Firestore + Auth) |
| GSAP 3.13.0 | Animations |
| lucide-react | Icon system |
| idb 7.1.1 | IndexedDB wrapper for offline |
| vite-plugin-pwa 1.2.0 | Service worker & offline support |
| @vercel/analytics 1.6.1 | Web analytics |
| @vercel/speed-insights 1.3.1 | Performance monitoring |

---

## Installation & Quick Start

### Prerequisites
- Node.js 16+ and npm
- Firebase account (free tier)
- Git

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/JeraldPascual/1A-genda.git
   cd 1A-genda
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your Firebase credentials (see `.env.example` for reference):
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   VITE_ADMIN_EMAIL=admin@example.com
   ```

4. **Set up Firebase** (See Firebase Setup section below)
   - Create project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Email/Password Authentication
   - Create Firestore Database
   - Apply security rules from `firestore.rules`
   - Create required indexes from `firestore.indexes.json`

5. **Run development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173)

6. **Test offline/PWA features** (production build required)
   ```bash
   npm run build && npm run preview
   ```


---

## Usage

### First Time Setup
1. P.I.O. registers with the admin email (must match `VITE_ADMIN_EMAIL`)
2. Students register and select their batch (1A1 or 1A2)
3. P.I.O. creates initial tasks and announcements

### Admin Workflow
1. Access admin panel from header navigation
2. **Create Tasks**
   - Title, description, subject
   - Priority: High, Medium, Low
   - Due date
   - Batch assignment: 1A1, 1A2, or All
3. **Post Announcements**
   - Info (🔵) - General updates
   - Urgent (🔴) - Important deadlines
   - Celebration (🟢) - Achievements
   - Attach files: Images, PDFs, Word, Excel, PowerPoint, ZIP (max 5MB)
4. **Review Requests**
   - Task Revision Requests - Proposed changes to existing tasks
   - Content Submissions - Suggested new tasks/announcements
5. **Manage Requests**
   - Approve requests to apply changes (auto-deletes request after processing)
   - Reject with deletion (cleans up Firestore immediately)
6. **Monitor Activity**
   - Student progress dashboard
   - Completion statistics
   - Request activity tracking

### Student Workflow
1. **View Tasks** - Tasks appear in To Do column
2. **Complete Tasks** - Click "Mark Complete" to move to Completed
3. **Undo Completion** - Use "Back to To Do" to revert
4. **Request Revisions** - Propose changes to existing tasks
5. **Submit Content** - Suggest new tasks or announcements with optional file attachments
6. **Track Submissions** - Check request status and admin feedback
7. **Stay Updated** - View announcements with attachments
8. **Download Files** - Click images for fullscreen view, download any attachment type

---

## Advanced Features

- **Offline-First PWA**: Full offline support with IndexedDB caching, background sync, and service worker. Works completely offline after first load.
- **SyncStatusBadge**: Fixed bottom-center toast showing offline/sync status with color-coded states.
- **Bundle Optimization**: Code splitting with dynamic imports, lazy loading, and vendor chunks (-81% bundle size reduction).
- **InfoBar**: Real-time weather, date, and time for SJDM, PH, using Open-Meteo API.
- **GlobalSearch**: Search across tasks, announcements, and submissions with instant navigation (Ctrl+K).
- **PomodoroTimer**: Built-in Pomodoro timer for productivity with notifications.
- **InstallPrompt**: Smart PWA install prompt for iOS/Android with localStorage-based dismissal.
- **MarkdownDisplay**: Secure, styled markdown rendering with XSS protection and GitHub Flavored Markdown support.
- **AttachmentList**: Fullscreen image viewer, download menu, support for images, PDFs, Office docs, text, and ZIP files.
- **AnnouncementTicker**: GSAP-powered infinite scroll for announcements, color-coded by type.
- **Custom Theming**: Tailwind and Material-UI integration, dark/light mode, persistent user preference.
- **Special Effects**: User-targeted animations (confetti, mascots, heart trails) for enhanced engagement.

**For detailed component architecture and data flow, see [`llm-docs/ARCHITECTURE.md`](./llm-docs/ARCHITECTURE.md).**


---

## Key Technologies Explained

### Frontend Stack
- **React 19.2.0** - Latest React with improved performance and hooks
- **Vite 7.2.4** - Lightning-fast dev server and build tool
- **Material-UI v7** - Pre-built components for professional UI
- **Tailwind CSS v4** - Utility-first CSS for rapid styling
- **GSAP 3.13.0** - Professional-grade animation library

### Backend Stack
- **Firebase Authentication** - Secure email/password authentication
- **Cloud Firestore** - NoSQL database with real-time sync and base64 file storage
- **Firebase Security Rules** - Server-side data access control
- **Auto-Cleanup System** - Automatic deletion of processed/rejected records

### Animation Features
- **Confetti Celebration** - Task completion rewards with canvas-confetti
- **GSAP Scrolling** - Smooth infinite announcement ticker
- **Card Animations** - Staggered entry animations for task cards
- **Portal Modals** - Fullscreen image viewer with smooth transitions

### File Management
- **Base64 Storage** - Files stored directly in Firestore (no Firebase Storage billing)
- **5MB File Limit** - Optimized for announcements and documents
- **Instant Uploads** - Local file conversion with immediate preview
- **Supported Formats** - Images (jpg, png, gif), PDF, Office docs, text, ZIP

---

## Cost Estimate

**For 50 users over 5 months:**
- **Vercel Hosting**: $0 (Free tier: 100GB bandwidth/month)
- **Firebase Firestore**: $0 (Free tier: 50K reads/day, 20K writes/day)
- **Firebase Auth**: $0 (Unlimited users on free tier)

**Total: $0** ✓

---

## Contributing

We welcome contributions! Please see [`CONTRIBUTING.md`](./CONTRIBUTING.md) for:
- Quick start guide for contributors
- Project structure and key files
- Workflow and conventions (branching, commits, PRs)
- Pull request checklist
- Recent improvements and future roadmap

**For AI coding agents:** See [`.github/copilot-instructions.md`](.github/copilot-instructions.md) for project-specific guidelines.

---

## License

MIT License - Free to use and modify.

---

## Acknowledgments

Built with modern web technologies:
- [React](https://react.dev/) - UI Framework
- [Firebase](https://firebase.google.com/) - Backend Platform
- [Vite](https://vitejs.dev/) - Build Tool
- [Material-UI](https://mui.com/) - Component Library
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework
- [GSAP](https://greensock.com/gsap/) - Animation Library

---


## Potential Improvements & Roadmap

See [CONTRIBUTING.md](./CONTRIBUTING.md) for a list of non-breaking technical improvements and possible future features (calendar view, push notifications, analytics, i18n, etc.).

For AI coding agents, see [`.github/copilot-instructions.md`](.github/copilot-instructions.md) for project-specific automation guidelines.


---

**1A-genda** - Streamlining class management, one task at a time.
