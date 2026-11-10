# Changelog

[Русский](CHANGELOG.ru.md)

## 0.1.0 — 2026-11-10

Initial cross-platform release.

- One Node.js test engine for Windows, macOS, and Linux.
- Default dry-run listing with opt-in sequential API probes.
- Free-name heuristics and a user-maintained allowlist.
- Per-model outcome classification and cautious model-attribution checks.
- UTF-8 CSV/JSON reports, basic secret redaction, and formula-safe CSV cells.
- Launchers and installation guides for three platforms.
- Offline unit/integration tests and GitHub Actions checks.

### Known limitations

- Free labels do not prove that a model is free for every account.
- JSON event formats and plugin behavior can vary across OpenCode releases.
- A single successful response is not a tool-use/coding benchmark.
