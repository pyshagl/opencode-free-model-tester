# Installation and usage — English

[Русский](INSTALL.ru.md) · [README](../README.md)

## Requirements

- Windows 10/11 (x64 or ARM64 with compatible Node/OpenCode), macOS, or Linux.
- Node.js 20 or newer: [nodejs.org](https://nodejs.org/).
- An installed, working OpenCode CLI: [official CLI documentation](https://opencode.ai/docs/cli/commands). The Desktop app alone does not necessarily install the `opencode` terminal command.
- At least one provider connected to OpenCode. Use OpenCode's own provider settings or auth flow; never paste API keys into this tester.

Check commands in your shell/terminal:

```sh
node --version
opencode --version
opencode models
```

If `opencode` is missing, install the **official OpenCode CLI** following the current official instructions. A supported npm installer is `npm install -g @opencode/cli`; some npm versions may warn that the package's postinstall script was blocked. Confirm the CLI works with `opencode models` before continuing.

## Windows

1. Download **Code → Download ZIP** from GitHub, extract the archive (do not run files inside ZIP).
2. Install Node.js and OpenCode CLI. Open PowerShell and verify the commands above.
3. Double-click `launchers\windows\01-List-models.cmd` to list candidates without API calls.
4. Double-click `launchers\windows\02-Test-first-5.cmd` and type `YES` to test five candidates.
5. Results are in `reports\` at the repository root. For all candidates, use `03-Test-all.cmd`, taking account of provider quotas.

On Windows, Node invokes OpenCode through its executable or npm `.cmd` shim. If the command is not found, add OpenCode CLI to PATH, or set `OPENCODE_BIN` to the full path to `opencode.exe` / the npm command shim.

## macOS

1. Extract the GitHub archive, install Node.js and OpenCode CLI, and verify `opencode models`.
2. Open Terminal in the repository directory, run `node src/cli.mjs` to preview, then `node src/cli.mjs --run --limit=5` to test.
3. Alternative: `chmod +x launchers/macos/*.command`, then open the `.command` files via Terminal/Finder. macOS may show a safety prompt for downloaded shell scripts; inspect them before allowing execution.

## Linux

1. Install Node.js 20+ and OpenCode CLI with a supported method for your distribution.
2. From the extracted directory run `node src/cli.mjs` or `node src/cli.mjs --run --limit=5`.
3. Optional launcher: `chmod +x launchers/linux/*.sh` and execute the desired script.

## Options

```text
--run               Actually send requests (interactive YES confirmation)
--yes               Explicitly bypass confirmation for scripted runs
--only=id1,id2      Restrict to exact model IDs (they must be eligible)
--exclude=p1,p2     Exclude provider IDs
--limit=N           Cap at N candidates (1..200; default 20)
--timeout=N         Per-model timeout in seconds (10..300; default 90)
--output=DIR        Custom result folder
--help              Help
```

## Manual allowlist

By default, the tester only selects explicit `opencode/*-free` and OpenRouter `*:free` identifiers, plus `openrouter/openrouter/free`. These patterns are labels, **not verified prices**. Other models need opt-in:

Edit `config/approved-models.json`:

```json
{ "models": ["google/gemini-3.5-flash-lite"] }
```

This is only an example. Before enabling an ID, verify that your account/tier offers free API use. The tester will never change this file on its own. Some free models share a provider-wide daily limit.

## Troubleshooting

- **`node: command not found` / not recognized:** install Node.js 20+ and reopen the terminal.
- **`opencode` missing:** install the official CLI, not only the Desktop UI.
- **No candidates:** ensure `opencode models` returns IDs, and review provider connections/allowlist. The CLI catalog may differ from the enabled Desktop model list.
- **`QUOTA` or `BILLING`:** provider-side limits or account billing, not a script malfunction.
- **`REPLY_UNVERIFIED`:** OpenCode did not supply model identity metadata. Do not treat this result as a verified pass; a fallback plugin could have intervened.
- **`ERROR` from tool calls:** tool permissions should be denied in the child process. Custom plugins may not honor configuration overrides; do not use the tester on sensitive repositories.
- **Windows blocks script:** check downloaded contents; `.cmd` files are plain text. Do not disable system protections globally.

The tester does not automatically install dependencies, update OpenCode, collect API keys, or verify billed prices.
