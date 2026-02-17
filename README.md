# 1A-genda - Class Management System

A modern task management application for class administrators (P.I.O.) and students. Built with React, Firebase, Material-UI, GSAP, and Tailwind CSS.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.2.0-61dafb.svg)
![Firebase](https://img.shields.io/badge/Firebase-12.6.0-orange.svg)

## Overview

1A-genda is a class task management system with an intuitive Kanban-style board. P.I.O. administrators create and manage tasks and announcements for batches 1A1 and 1A2, while students track their individual progress without affecting the global board state.

**Live Demo:** [https://www.1agenda.tech](https://www.1agenda.tech)

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

## Installation

### Prerequisites
- Node.js 16+ and npm
- Firebase account (free tier)
- Git

### Step 1: Clone the Repository
```bash
git clone https://github.com/JeraldPascual/1A-genda.git
cd 1A-genda
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install all required packages including:
- React 19.2.0
- Firebase 12.6.0
- Material-UI v7
- Tailwind CSS v4
- GSAP 3.13.0
- Vite 7.2.4
- And all other dependencies

### Step 3: Environment Configuration
Copy the example environment file:
```bash
cp .env.example .env
```

Open `.env` and add your Firebase credentials:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_ADMIN_EMAIL=your-admin@email.com
```

### Step 4: Firebase Setup
Follow the detailed Firebase setup section below to:
- Create your Firebase project
- Enable authentication
- Set up Firestore database
- Apply security rules
- Create required indexes

### Step 5: Run Development Server
```bash
npm run dev
```

The application will be available at [http://localhost:5173](http://localhost:5173)

---

## Quick Start

### Local Development

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

   Edit `.env` with Firebase credentials and admin email:
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

4. **Set up Firebase** (Detailed steps below)
   - Create project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Email/Password Authentication
   - Create Firestore Database
   - Apply security rules
   - Create required indexes

5. **Run development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173)


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
- **InfoBar**: Real-time weather, date, and time for SJDM, PH, using Open-Meteo API.
- **GlobalSearch**: Search across tasks, announcements, and submissions with instant navigation.
- **PomodoroTimer**: Built-in Pomodoro timer for productivity, with notifications.
- **InstallPrompt**: Smart install prompt for PWA on iOS/Android, with localStorage-based dismissal.
- **StudentModularDashboard**: Tabbed dashboard for students, with dynamic content (announcements, schedule, resources, analytics, Pomodoro, etc.).
- **MarkdownDisplay**: Secure, styled markdown rendering with XSS protection and GitHub Flavored Markdown support.
- **LinkifiedText**: Auto-linking of URLs in text, with safe external link handling.
- **AttachmentList**: Fullscreen image viewer, download menu, and support for images, PDFs, Office docs, text, and ZIP files.
- **AnnouncementTicker**: GSAP-powered infinite scroll for announcements, color-coded by type.
- **Custom Theming**: Tailwind and Material-UI integration, dark/light mode, persistent user preference.
- **BearMascot**: Interactive 3D/2D animated mascot (We Bare Bears style) that encourages students and reacts to task completion.
- **F1Car**: Interactive F1 racing car element with GSAP-powered drive-off animations.
- **PinkThemeManager**: Specialized theme manager for the custom pink aesthetic mode.
- **Bundle Optimization**: Code splitting with dynamic imports, lazy loading, and vendor chunks for optimal performance.

---

## Component Architecture

### Main Components

**AdminPanel.jsx** - Admin control center with tabs:
- Student Progress Tracker
- Student Dashboard
- Create Tasks
- View/Edit/Delete Tasks
- Create Announcements
- View/Delete Announcements
- Task Revision Requests (Approve/Reject)
- Content Submissions (Approve/Reject)
- Utilities (Clean orphaned data)

**KanbanBoard.jsx** - Main task board:
- Two-column layout (To Do → Completed)
- Personal progress tracking for students
- Task completion with confetti animation
- Content submission panel for 1A2 batch

**AnnouncementTicker.jsx** - Scrolling announcements:
- GSAP infinite scroll animation
- Color-coded by type (Info/Urgent/Celebration)
- Auto-refreshes on new announcements
- Attachment indicators with file count badges

**AnnouncementPanel.jsx** - Announcement display:
- Full announcement cards with attachment preview
- Fullscreen image viewer with portal rendering
- Download functionality for all file types
- Three-dot menu for download options

**AttachmentList.jsx** - File attachment display:
- Full-size image display with aspect ratio preservation
- Clickable images for fullscreen popup view
- Download menu for images and documents
- Support for images, PDFs, Office docs, text, ZIP files

**StudentProgressTracker.jsx** - Admin view of all students:
- Task completion counts
- Request submission counts
- Batch filtering
- Individual student details

**StudentDashboard.jsx** - Demographics overview:
- Total students by batch
- Completion statistics
- Request activity metrics

**ContentSubmissionPanel.jsx** - Student submission interface:
- Create task proposals with file attachments
- Create announcement suggestions with media uploads
- View submission history with attachment indicators
- See admin feedback and approval status
- Upload progress tracking for file submissions

**TaskCard.jsx** / **RequestableTaskCard.jsx**:
- Task details display
- Priority indicators
- Due date formatting
- Action buttons (Complete, Revise, etc.)

**BearMascot.jsx** - Interactive mascot:
- Animated stack of three bears
- Responds to "allTasksCompleted" events with celebration
- Interactive hover and click states with speech bubbles

**F1Car.jsx** - Decorative element:
- SVG-based F1 car visualization
- Interactive GSAP animations on click

**PinkThemeManager.jsx** - Theme Logic:
- Dedicated manager for Pink theme specific styles
- Handles theme persistence and application

### Context Providers

**AuthContext** - Authentication state:
- User login/logout
- Role detection (admin/student)
- User data management
- Firebase auth integration

**ThemeContext** - Theme management:
- Dark/Light mode toggle
- Persistent theme preference
- Dynamic theme switching


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

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and formatting
- Test all changes thoroughly before submitting
- Update README if adding new features
- Include comments for complex logic

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


