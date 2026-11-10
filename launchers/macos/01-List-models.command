#!/bin/sh
cd "$(dirname "$0")/../.." || exit 1
node src/cli.mjs
printf '\nPress Enter to close / Нажмите Enter...'; read answer
