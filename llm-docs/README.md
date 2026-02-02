# 1A-genda LLM Documentation

This directory contains guidance, architecture documentation, and reusable prompt templates for LLMs working on the 1A-genda project.

## Directory Structure

- `README.md` - This file
- `ARCHITECTURE.md` - System architecture and design patterns
- `FEATURE_MAP.md` - Feature-to-file mapping
- `COMPONENT_CONNECTIONS.md` - Component relationships and data flow
- `PROMPTS.md` - Reusable prompt templates for common tasks
- `NATIVE_APP_ROADMAP.md` - PWA/Native app migration plan
- `CONTEXT_SNIPPETS.md` - Quick context snippets for LLM sessions

## Quick Start for LLMs

1. **New to the project?** Start with `ARCHITECTURE.md`
2. **Working on a feature?** Check `FEATURE_MAP.md`
3. **Need to understand data flow?** See `COMPONENT_CONNECTIONS.md`
4. **Need a prompt template?** Check `PROMPTS.md`
5. **Working on native/offline?** See `NATIVE_APP_ROADMAP.md`

## Key Project Facts

- **Stack:** React 19 + Vite 7 + Firebase 12 + Tailwind CSS 4 + MUI 7
- **Database:** Firestore (users, globalTasks, studentProgress, announcements, etc.)
- **Auth:** Firebase Authentication
- **Special Effects:** User-targeted via `specialEffects: true` in Firestore
- **PWA:** Service worker + manifest already in place
- **Styling:** Dual system (Tailwind + MUI), dark/light mode via CSS variables

## Critical Conventions

1. Never mutate props or state directly—use context and callbacks
2. All file uploads use base64 (max 2MB) via `utils/fileUpload.js`
3. All Firestore operations go through `utils/firestore.js`
4. Special effects are only for users with `specialEffects: true`
5. Use `MarkdownEditor` for input and `MarkdownDisplay` for output
