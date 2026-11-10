#!/bin/sh
cd "$(dirname "$0")/../.." || exit 1
node src/cli.mjs --run --limit=5
printf '\nPress Enter to close / Нажмите Enter...'; read answer
