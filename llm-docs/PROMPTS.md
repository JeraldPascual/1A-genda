# Reusable Prompt Templates for LLMs

## Quick Context Prompt

```
I'm working on 1A-genda, a React + Firebase task management app for students.
- React 19.2, Vite, Tailwind CSS 4.1, MUI 7.3
- Firebase Firestore + Auth (no Firebase Storage - uses base64)
- Context providers: AuthContext, ThemeContext, NotificationContext
- Special effects (heart confetti, pink theme) for users with `specialEffects: true`

[Insert your specific request here]
```

---

## Feature Implementation Template

```
I need to implement [FEATURE] in 1A-genda.

Context:
- 1A-genda is a React 19 + Firebase Firestore task management app
- Uses Tailwind CSS + MUI for styling, GSAP for animations
- Files stored as base64 in Firestore (no Firebase Storage)
- Context providers: AuthContext (auth/user data), ThemeContext (dark/light), NotificationContext (toasts)

Relevant files:
- [List files if known, e.g., src/components/student/KanbanBoard.jsx]

Requirements:
1. [Requirement 1]
2. [Requirement 2]
3. [Requirement 3]

Please:
1. Show which files need changes
2. Explain the implementation approach
3. Provide the code changes
```

---

## Bug Fix Template

```
I'm encountering [ERROR/BUG] in 1A-genda.

Environment:
- React 19.2, Vite 7.2, Firebase 12.6
- [Browser/OS if relevant]

Steps to reproduce:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Expected: [What should happen]
Actual: [What actually happens]

Relevant file(s): [e.g., src/components/student/KanbanBoard.jsx]

Error message (if any):
```
[Paste error here]
```

Please diagnose and provide a fix.
```

---

## Special Effects Implementation Template

```
I want to add a special visual effect for users with `specialEffects: true` in 1A-genda.

Context:
- Special effects are for specific users (checked via userData.specialEffects in AuthContext)
- Existing effects: HeartTrail.jsx, BearMascot.jsx, PinkThemeManager.jsx, triggerHeartConfetti()
- Effect utilities are in src/utils/specialEffects.js

New effect requirements:
- [Describe the effect]
- [When it triggers]
- [Target colors/theme if any]

Please:
1. Create or modify the necessary component(s)
2. Integrate into App.jsx or the relevant component
3. Use hasSpecialEffects(userData) for user targeting
4. Follow existing patterns (lazy loading, cleanup)
```

---

## Firestore Operation Template

```
I need to [CREATE/READ/UPDATE/DELETE] [DATA TYPE] in 1A-genda.

Firestore collection: [collection name]
Document structure:
```json
{
  "field1": "value",
  "field2": "value"
}
```

Requirements:
- [Real-time listener / one-time fetch]
- [User permission checks if needed]
- [Error handling approach]

Relevant files:
- src/utils/firestore.js (existing CRUD functions)
- [Component that will use this]

Please add the function to firestore.js and integrate with the component.
```

---

## Component Creation Template

```
I need to create a new component [COMPONENT_NAME] in 1A-genda.

Location: src/components/[student|admin|shared]/

Purpose: [What the component does]

Props:
- propName: type - description
- propName: type - description

Features:
- [Feature 1]
- [Feature 2]
- [Feature 3]

Styling:
- Use Tailwind CSS (dark mode compatible: dark:class-name)
- [Any specific colors/theme requirements]

Connections:
- Uses AuthContext for [user data / current user]
- Uses ThemeContext for [theme detection]
- Uses data from [Firestore collection]

Please create the component following project conventions.
```

---

## PWA / Offline Enhancement Template

```
I want to improve offline capabilities for 1A-genda.

Current PWA setup:
- service-worker.js in public/
- manifest.json with app metadata
- InstallPrompt.jsx for install flow
- No offline data persistence yet

Enhancement goal: [Describe offline feature]

Options to consider:
1. Service worker cache strategies
2. IndexedDB for local data
3. Background sync for pending changes

Please provide implementation approach and code.
```

---

## Styling / Theme Template

```
I need to update styling for [COMPONENT/FEATURE] in 1A-genda.

Current setup:
- Tailwind CSS 4.1 with dark mode (class-based)
- MUI 7.3 with custom theme in src/theme/muiTheme.js
- CSS variables for dark/light in src/index.css
- Special pink theme for specialEffects users via PinkThemeManager.jsx

Changes needed:
- [Describe styling changes]
- [Dark mode considerations]
- [Mobile responsiveness if needed]

Please provide the Tailwind classes or CSS changes.
```

---

## Animation Template

```
I want to add [ANIMATION] to 1A-genda.

Animation library options in use:
- GSAP 3.13 (preferred for complex animations)
- CSS animations/transitions (for simple effects)
- canvas-confetti (for particle effects)

Trigger: [When the animation plays]
Target: [What element(s) animate]
Effect: [Describe the animation]

Considerations:
- Cleanup on unmount (useEffect return)
- Performance (reduce repaints)
- User preference (reduce motion)

Please provide the animation implementation.
```

---

## Code Review Prompt

```
Please review this code from 1A-genda:

File: [filename]
```
[Paste code here]
```

Review for:
- [ ] React best practices
- [ ] Performance issues
- [ ] Security concerns
- [ ] Accessibility
- [ ] Error handling
- [ ] Code organization

Project context:
- React 19 with functional components and hooks
- Firebase Firestore for data
- Tailwind + MUI for styling
- Files stored as base64 (max 2MB per file)
```

---

## Codebase Navigation Prompt

```
I'm exploring the 1A-genda codebase. Help me understand:

Question: [Your question about the codebase]

Key directories:
- src/components/admin/ - Admin-only features
- src/components/student/ - Student-facing features
- src/components/shared/ - Reusable components
- src/context/ - React context providers
- src/utils/ - Utility functions (firestore, fileUpload, etc.)
- src/config/ - Firebase configuration

Entry points:
- src/App.jsx - Root component, routing, providers
- src/main.jsx - React DOM render
```
