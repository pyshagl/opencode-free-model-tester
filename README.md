# OpenCode Free Model Tester

[English](README.md) | [Русский](README.ru.md)

**A cross-platform command-line smoke tester for free-named AI models exposed through OpenCode.** One codebase, launchers for Windows, macOS, and Linux, and CSV/JSON reports. It uses your existing OpenCode provider connections, without asking for or storing API keys.

> **Safety first:** The default command **only lists candidates**. Actual API requests require `--run` plus a `YES` confirmation. Free-looking names **do not guarantee** zero charges or remaining quota. Check your provider's prices, billing settings, and terms before testing.

## Features

- Discovers candidate models from `opencode models` (not by scraping web pages).
- Selects `opencode/*-free`, OpenRouter `*:free`, and `openrouter/openrouter/free` by name; others require explicit manual approval.
- Runs a small single-response check per model, sequentially, with a timeout and no intended tool calls.
- Classifies `OK`, `REPLY_UNVERIFIED`, `QUOTA`, `AUTH`, `BILLING`, `REGION`, `MODEL_UNAVAILABLE`, `TIMEOUT`, `MODEL_MISMATCH`, and other responses.
- Saves timestamped CSV and JSON results into `reports/` (ignored by Git).
- Uses an isolated temporary working directory, best-effort plugin disabling, and explicit denial of tools in the test process. The global OpenCode configuration is never edited.

## Quick start

**Requirements:** Windows 10/11, macOS, or Linux; Node.js **20+**; **OpenCode CLI** installed and authenticated with your own providers. Having only the Desktop app does not necessarily put `opencode` on your terminal PATH.

1. Get [Node.js](https://nodejs.org/) and the [official OpenCode CLI](https://opencode.ai/docs/cli/commands). Check `node --version` and `opencode models`.
2. Download and extract this repository (GitHub **Code → Download ZIP**), or clone it.
3. Preview without contacting model APIs:

   ```sh
   node src/cli.mjs
   ```

4. Run a short test on up to five candidates, confirm with `YES`:

   ```sh
   node src/cli.mjs --run --limit=5
   ```

5. Find the results in `reports/`.

**Click-to-start launchers** (after dependencies are installed): Windows: `launchers/windows/*.cmd`; macOS: `launchers/macos/*.command`; Linux: `launchers/linux/*.sh`. macOS/Linux may require `chmod +x` on downloaded launchers.

## Examples

```sh
node src/cli.mjs --help
node src/cli.mjs --run --only=openrouter/openrouter/free
node src/cli.mjs --run --exclude=opencode,teamorouter,orcarouter --limit=10
node src/cli.mjs --run --timeout=120 --output=./my-reports
```

For a provider that has a legitimate free tier but no free suffix (e.g. a Gemini Flash-Lite model), put its **exact** ID in [`config/approved-models.json`](config/approved-models.json) after verifying your own billing tier. This is an opt-in, not a price verification.

## What results mean

| Status | Meaning |
| --- | --- |
| `OK` | The expected reply was received **and** stream metadata identified the exact requested model. |
| `REPLY_UNVERIFIED` | Reply received, but OpenCode did not expose enough model identity metadata to rule out fallback. |
| `QUOTA` | Request hit a quota or rate limit. |
| `REGION`, `AUTH`, `BILLING` | Region restriction, invalid credentials, or billing/balance problem. |
| `MODEL_UNAVAILABLE`, `TIMEOUT` | Model unavailable or no response within configured time. |
| `MODEL_MISMATCH` | Reported answering model differs from the requested one. |
| `REPLIED_OTHER`, `ERROR`, `NO_REPLY` | Other non-verifying outcomes; inspect sanitized details. |

One successful short reply does **not** establish coding quality, tool-use support, future availability, or ongoing free pricing. Several OpenRouter models may share one account-wide free quota.

## Documentation

- Installation: [English](docs/INSTALL.en.md) | [Русский](docs/INSTALL.ru.md)
- Technical specification: [English](docs/SPEC.en.md) | [Русский](docs/SPEC.ru.md)
- Security, privacy and costs: [English](docs/SECURITY.en.md) | [Русский](docs/SECURITY.ru.md)
- Contribution guide: [English](docs/CONTRIBUTING.en.md) | [Русский](docs/CONTRIBUTING.ru.md)
- Changelog: [English](CHANGELOG.md) | [Русский](CHANGELOG.ru.md)

## Development

```sh
npm test
```

All tests are offline and use a mock OpenCode CLI; no API keys are required. CI runs the suite on Windows, macOS, and Linux. Real provider tests remain opt-in and are **not** part of CI.

## Scope and independence

This is an **independent community utility**, not an official OpenCode project or an API router/fallback plugin. It does **not** merge token balances, configure models automatically, create provider accounts, or override billing. OpenCode's catalog can contain models hidden in Desktop.

Licensed under [MIT](LICENSE). See the [privacy and risk notice](docs/SECURITY.en.md) before sharing reports.
