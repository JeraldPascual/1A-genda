# Copilot Instructions for 1A-genda

## Project Architecture & Patterns
- **Monorepo structure:** All source code is under `src/`, organized by feature (admin, student, shared, ui, config, context, utils, data, theme).
- **Component conventions:**
  - Avoid mutating props or state directly; always use provided callbacks and context.
  - Use context providers (`AuthContext`, `ThemeContext`, `NotificationContext`) for global state.
  - Shared UI and logic live in `src/components/shared/` and `src/components/ui/`.
- **Data flow:**
  - Firebase (Firestore/Auth) is the backend; see `src/config/firebase.js` and `firestore.rules`.
  - All file uploads and downloads use `src/utils/fileUpload.js`.
  - Task/announcement CRUD and progress tracking use Firestore via `src/utils/firestore.js`.
- **Styling:**
  - Tailwind CSS (see `tailwind.config.js`) and Material-UI (`theme/muiTheme.js`) are used together.
  - Dark/light mode is managed via `ThemeContext` and Tailwind's `darkMode: 'class'`.
- **Animation:**
  - GSAP is used for announcement tickers and card entry animations.
  - Confetti animation on task completion (see `KanbanBoard.jsx`).

## Developer Workflows
- **Install:** `npm install` (see README for full stack)
- **Dev server:** `npx vite --port=4000` (default port is 4000)
- **Lint:** `npx eslint .` (config in `eslint.config.js`)
- **Test:** `npm run test` (setup with Vitest, see tasks.json or package.json)
- **Build:** `npm run build`
- **Firebase emulation:** Not configured by default; see README for manual setup.

## Project-Specific Conventions
- **Task/Request objects:** Never mutate objects directly; always use provided update functions.
- **File attachments:** Support images, PDFs, Office docs, text, ZIP. Max 2MB per file (see AdminPanel.jsx).
- **Markdown:** Use `MarkdownEditor` for input and `MarkdownDisplay` for rendering. Never inject raw HTML.
- **Global search/navigation:** Use `GlobalSearch` and navigation callbacks; avoid direct DOM manipulation.
- **Accessibility:** Use semantic HTML and ARIA labels in all new components.
- **Internationalization:** Not implemented; all text is currently English.

## Integration Points
- **Firebase:** All authentication and data storage.
- **Open-Meteo API:** For weather in `InfoBar.jsx`.
- **GSAP:** For animation in `AnnouncementTicker.jsx` and others.
- **lucide-react:** For icons throughout the UI.

## Examples
- See `src/components/student/KanbanBoard.jsx` for state management and animation patterns.
- See `src/components/admin/AdminPanel.jsx` for tabbed admin workflows and file upload logic.
- See `src/components/shared/AttachmentList.jsx` for file handling and download logic.

---

**For more details, see the README and comments in each component.**
