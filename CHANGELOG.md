# Changelog

## Unreleased

Complete rework of the original frontend-only prototype. Everything below was done in one change set; nothing has been released or deployed.

### Added
- Express + SQLite backend: accounts (register/login/logout, change password, delete account), session cookies, saved resumes CRUD with per-user isolation, migrations.
- Server-side PDF export (headless Chrome via `puppeteer-core`) producing exactly one A4 page from the same components as the preview; print fallback when Chrome is unavailable.
- Shared domain layer (`shared/`): section registry, profile presets (8 career stages × 7 fields), zod schema, immutable edit operations, fit model, fictional demo data.
- Guided builder: Profile → Details → Sections → Template → Download, with add/hide/rename/delete/reorder for sections and entries, and custom sections.
- Live A4 preview, page-fit meter, density compaction (9pt floor), overflow warnings with hide/shorten suggestions.
- Six single-column ATS-friendly templates.
- Demo mode with five fictional profiles, clearly marked DEMO, no login.
- Pages: landing, demo picker, login, register, dashboard, settings, about, contact, privacy, terms.
- Tests (Vitest unit, Supertest API, Puppeteer E2E), ESLint config, `.env.example`, README, this changelog.

### Changed
- Resume data moved from per-type flat strings to structured, ordered sections.
- Phone field accepts international numbers (was a hard-coded 10 digits).
- Profile switching no longer reloads the page; it adds sections without removing content.
- Autosave replaced the `setInterval` inside `useMemo` with debounced, mode-specific persistence (demo → sessionStorage, draft → localStorage, account → API).
- Input sanitisation: removed the blacklist that deleted the words "script"/"onload" from user text; output is now escaped by React and links are restricted to http(s).

### Removed
- `html2pdf.js` (raster screenshot PDFs), `docx` + `file-saver` (window-event-driven Word export), `framer-motion`, `react-hook-form` and the old per-type renderers/templates.

### Fixed
- Skill groups containing only a label no longer render an empty section.
- Reloading `/builder/new?fresh=1` no longer discards the draft; reopening a draft lands on Details.
