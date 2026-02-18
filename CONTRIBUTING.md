# Contributing to 1A-genda

Thank you for your interest in contributing! This guide will help you get started, follow best practices, and make your contributions smooth and effective.

---

##  Quick Start

1. **Clone the repo:**
   ```bash
   git clone https://github.com/JeraldPascual/1A-genda.git
   cd 1A-genda
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Run the dev server:**
   ```bash
   npx vite --port=4000
   ```
   **IMPORTANT:** To test offline/PWA features, use production build:
   ```bash
   npm run build && npm run preview
   ```
4. **Lint & format:**
   ```bash
   npx eslint .
   ```
5. **Run tests:**
   ```bash
   npm run test
   ```

---

##  Project Structure & Key Files

- All source code is under `src/`, organized by feature (admin, student, shared, ui, config, context, utils, data, theme).
- Shared UI and logic: `src/components/shared/`, `src/components/ui/`
- Firebase config: `src/config/firebase.js`
- File upload/download: `src/utils/fileUpload.js`
- Firestore logic: `src/utils/firestore.js`
- Styling: Tailwind CSS (`tailwind.config.js`), Material-UI (`theme/muiTheme.js`)
- Animations: GSAP (see `AnnouncementTicker.jsx`, `KanbanBoard.jsx`)

---

##  Workflow & Conventions

- **Branching:**
  - Use feature branches: `feat/feature-name`, `fix/bug-description`, etc.
- **Commits:**
  - Use [Conventional Commits](https://www.conventionalcommits.org/):
    - `feat(student): add drag-and-drop to Kanban`
    - `fix(admin): correct file upload bug`
- **Pull Requests:**
  - Target `main` branch via PR (required, protected branch)
  - Reference related issues in PR description
  - Use clear, descriptive titles
- **Code Style:**
  - Run `npx eslint .` and fix all errors before pushing
  - Use Prettier formatting (auto-fix on save recommended)
- **Testing:**
  - Add/maintain tests for new features and bugfixes
  - Use Vitest for unit/component tests
- **Accessibility:**
  - Use semantic HTML, ARIA labels, and keyboard navigation in all interactive components
- **Docs:**
  - Update README or relevant docs for new features or changes

---

##  Pull Request Checklist

- [ ] Code builds and runs locally
- [ ] Linting passes (`npx eslint .`)
- [ ] All tests pass (`npm run test`)
- [ ] No direct mutations of props/state/objects
- [ ] Accessibility (ARIA/keyboard) checked for new UI
- [ ] Docs updated if needed
- [ ] No changes to `package.json`/`package-lock.json` unless required
- [ ] No secrets or credentials committed

---

##  Support & Questions

- For questions, open a [GitHub Discussion](https://github.com/JeraldPascual/1A-genda/discussions) or create an issue.
- See `.github/copilot-instructions.md` for AI agent guidelines.
- See `llm-docs/` for detailed architecture, feature map, and component connections.

---

##  Recent Improvements (v2.1.0)

- **Offline-First Architecture:** Full IndexedDB caching + background sync via `offlineDataService.js` and `operationQueue.js`
- **Bundle Optimization:** Main bundle reduced from 1,364kB → 257kB (-81%) with code splitting and lazy loading
- **Vercel Analytics:** Web analytics + speed insights integration
- **Service Worker:** Auto-update without user intervention (`skipWaiting: true` + `clientsClaim: true`)
- **Sync Status UI:** Auto-dismissing toast for offline/syncing states via `SyncStatusBadge`
- **PWA Enhancements:** Install prompt, manifest, runtime caching for fonts/APIs

---

**Thank you for contributing to 1A-genda!**
