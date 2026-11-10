# Security, privacy, and costs

[Русский](SECURITY.ru.md)

## Credentials

The tester does **not** request API keys. It invokes your locally installed OpenCode CLI, which uses your existing provider credentials. Never add API keys, `.env` files, credentials, or personal logs to a public repository. The repository's `.gitignore` excludes typical local secrets and reports.

## Costs and quota

A name containing `free` is **not proof** of a free request for your account. Providers can change plans, regional availability, usage limits, or billing rules without notice. The tester does not query a pricing service or check billing status. Verify your account's plan and ensure you have not enabled paid billing before running tests. `--run` sends real API calls and requires an explicit `YES`; automated `--yes` skips this protection. Several free models at a single gateway may share a common request limit. Errors can also consume quota.

## Isolation and limitations

Each probe is run from a newly created temporary directory with `opencode run --standalone --archived`. The tool asks for no file operations and sets process-local OpenCode config overrides intended to disable plugins and deny tools. **This is best effort, not a security sandbox**: OpenCode versions and external plugins can behave differently. The user's global OpenCode configuration and working projects are not intentionally modified; OpenCode may still create archived sessions and update its own caches.

Successful response attribution depends on OpenCode's emitted JSON metadata. If the requested model is not verifiably the answering model, the test reports `REPLY_UNVERIFIED` or `MODEL_MISMATCH`, not a verified `OK`.

## Report privacy

Reports contain requested model IDs, status, timing, exposed model identity, and short sanitized errors. Error redaction covers common token formats but is not a complete secret scanner. **Inspect reports before sharing**. CSV values are escaped to reduce spreadsheet formula execution risks. Reports are stored under `reports/` by default and ignored by Git.

## Reporting a vulnerability

Do not publish credentials, tokens, or exploit details in an issue. Use a private GitHub security advisory on the repository if available, or contact the repository maintainers privately. Do not include real API keys in reports.
