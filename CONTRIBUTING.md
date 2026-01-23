# Contributing & Technical Improvements

## Potential Improvements (Non-breaking)
- **Code Quality:**
  - Refactor repeated logic in components (e.g., file upload, error handling) into shared hooks or utilities.
  - Add more JSDoc/type annotations for better editor support and maintainability.
  - Increase test coverage, especially for utils and context providers.
  - Use ESLint/Prettier auto-fix on save (see `eslint.config.js`).
- **Performance:**
  - Optimize large list rendering (e.g., virtualize task/announcement lists for large classes).
  - Debounce or throttle expensive operations (e.g., search, file uploads).
- **Accessibility:**
  - Audit and improve ARIA labels and keyboard navigation in all interactive components.
  - Ensure color contrast meets WCAG standards (especially in dark mode).
- **Dev Experience:**
  - Add Husky pre-commit hooks for linting and formatting.
  - Add Storybook for component development and documentation.
  - Add Vitest coverage reporting and CI integration.
- **Documentation:**
  - Expand README with more usage examples and troubleshooting.
- **PWA Enhancements:**
  - Add more robust offline support and background sync for submissions.
- **Error Handling:**
  - Centralize error boundaries and user-friendly error messages.
- **Security:**
  - Review and harden Firestore security rules.
  - Sanitize all user-generated content (markdown, file uploads).

## Possible Features (Future Roadmap)
- **Calendar View:** Visualize tasks and deadlines in a calendar format.
- **Push Notifications:** Real-time notifications for new tasks, announcements, and feedback.
- **Batch Messaging:** Allow admins to send messages to specific batches or all students.
- **Analytics Dashboard:** More detailed analytics for admins (engagement, completion rates, etc.).
- **Role Management:** Support for multiple admin roles (e.g., co-admin, teacher).
- **Mobile App:** React Native or PWA enhancements for better mobile UX.
- **Custom Themes:** User-selectable color themes beyond dark/light.
- **Integration:** Google Classroom, Notion, or other LMS integrations.

---

**See `.github/copilot-instructions.md` for AI agent guidelines.**
