# Technical specification — v0.1.0

[Русский](SPEC.ru.md)

## Goal and scope

Determine which **candidate free-named** OpenCode models can return a tiny response under the current user's provider credentials, without editing their OpenCode configuration. This is a smoke test, **not** a free-tier billing audit, a coding benchmark, an automated quota aggregator, or a fallback plugin.

## Architecture

- `src/core.mjs`: pure model-selection, event parsing, status classification, report serialization.
- `src/cli.mjs`: command-line interface and OS-independent process orchestrator.
- `config/approved-models.json`: optional user-maintained explicit allowlist.
- `launchers/`: OS-specific wrappers; they call the same Node.js core.
- `tests/`: offline fixtures and integration/unit tests; CI covers 3 OS environments.

## Functional requirements

1. Discover model IDs through `opencode models`, one model per line. Drop malformed IDs and duplicates.
2. By default match only `opencode/*-free`, `openrouter/*:free`, and `openrouter/openrouter/free`. Other providers and models require an explicit allowlist entry, not price inference.
3. Allow only/exclude selectors, a request cap, timeout, and configurable report directory.
4. Default to preview; `--run` requires case-sensitive `YES` unless `--yes` explicitly supplied.
5. Use `opencode run --standalone --archived --model <id> --format json` in a new temporary working directory. Send the constant short prompt with a unique marker. Execute sequentially.
6. Apply process-local `OPENCODE_PURE=1` and `OPENCODE_CONFIG_CONTENT` disabling plugins and all tool permissions as **best effort**, without modifying any user settings. A misbehaving plugin can still interfere.
7. Parse JSON Lines into text, error, and actual model identity. Count an answer as `OK` only when marker is present **and** actual model metadata matches the requested ID exactly. When metadata is absent, return `REPLY_UNVERIFIED` instead.
8. Classify errors into `REGION`, `AUTH`, `BILLING`, `QUOTA`, `MODEL_UNAVAILABLE`, `TIMEOUT`, `ERROR`, with `MODEL_MISMATCH`, `NO_REPLY`, `REPLIED_OTHER` and `REPLY_UNVERIFIED` for other cases.
9. Save timestamped, UTF-8 CSV and JSON reports under an ignored local output directory. Apply basic error-message redaction and CSV spreadsheet formula neutralization.
10. Clean the temporary directory after running. Archived OpenCode sessions may remain.

## Non-functional requirements

- Node.js >=20; no npm production dependencies or API secrets in the repository.
- macOS, Linux and Windows launchers; automated offline tests on all three.
- Network calls only during explicit `--run` (except `opencode models` may itself refresh the model catalog).
- No promises of zero cost: free labels can be misleading, provider billing is external, provider-wide rate limits apply.
- No claims of human-level coding quality, tool-use capabilities, ongoing availability, or permanent price from a single short response.

## Known limitations / roadmap

- Windows launchers require installed Node.js and OpenCode CLI; standalone binaries are not shipped.
- Free labels are only heuristics, not provider price API verification.
- Some OpenCode versions omit model attribution in JSON output. Those replies cannot receive `OK`.
- OpenCode CLI may list models hidden in Desktop.
- Tool/plugin isolation depends on the OpenCode version and plugin behavior; sandboxing is not a security boundary.
- A future opt-in extension could query official price metadata and add request-budget controls, but this is **not implemented**.

## Acceptance checks

- Preview prints candidates and never runs `opencode run`.
- Explicit run displays per-model statuses and writes both report formats.
- A successful answer with matching metadata returns `OK`.
- A success without identity returns `REPLY_UNVERIFIED`, and a different identity returns `MODEL_MISMATCH`.
- Simulated quota, bad key, region restriction, billing error and timeouts map correctly.
- Automated tests use mocked CLI only, no paid API requests.
