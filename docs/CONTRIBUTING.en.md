# Contributing

[Русский](CONTRIBUTING.ru.md)

Contributions are welcome: bug fixes, CLI compatibility improvements, documentation, and test cases. This is an independent community project and is not endorsed by OpenCode.

## Before opening a pull request

1. Create a feature branch and describe the user-facing change.
2. Run `npm test` (Node.js 20+). Tests must **never** contact paid/free external model APIs or require secrets.
3. Add offline fixtures for new output or error cases. Do not add real account logs without scrubbing them.
4. Keep feature flags, model names, and billing claims conservative. Avoid automatic paid-model inclusion.
5. Update both English and Russian documentation when behavior changes.

## Coding principles

Use Node.js standard library when possible. Keep `src/core.mjs` pure and testable; place OpenCode process handling in `src/cli.mjs`. Retain preview-only defaults and explicit confirmation for network tests. Never log full environment variables or credentials. Do not add background monitoring or writes to users' project directories.

## Reporting problems

Please include OS, Node.js/OpenCode CLI versions, reproduction steps, and **redacted** output. Never post API keys. Prefer a small reproducible example using the fake CLI fixture.
