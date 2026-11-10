#!/bin/sh
cd "$(dirname "$0")/../.." || exit 1
exec node src/cli.mjs --run --limit=5 "$@"
