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

---

##  Potential Improvements & Roadmap

See below for ideas and future features. PRs welcome!

### Potential Improvements (Non-breaking)
- **Code Quality:** Refactor repeated logic, add JSDoc/types, increase test coverage, use ESLint/Prettier.
- **Performance:** Virtualize large lists, debounce expensive ops.
- **Accessibility:** Audit ARIA/keyboard, ensure color contrast.
- **Dev Experience:** Add Husky, Storybook, CI, coverage.
- **Docs:** Expand README, troubleshooting.
- **PWA:** Improve offline/background sync.
- **Error Handling:** Centralize error boundaries/messages.
- **Security:** Harden Firestore rules, sanitize user content.

### Possible Features (Future Roadmap)
- Calendar view, push notifications, batch messaging, analytics dashboard, role management, mobile app, custom themes, integrations (Google Classroom, Notion, etc.)
