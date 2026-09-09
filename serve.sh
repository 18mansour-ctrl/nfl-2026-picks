#!/bin/sh
# Local dev server. The app fetches ./data.json, so it must be served over
# HTTP — opening index.html via file:// fails the fetch and shows the
# "data didn't load" state.
set -eu
cd "$(dirname "$0")"
# An argument wins, then whatever the harness assigned, then the default — so
# `./serve.sh 8145` still means 8145 and a tool that hands us a free port in
# $PORT is not ignored into a collision with the one already running.
PORT="${1:-${PORT:-8137}}"
echo "2026 NFL Predictions on http://localhost:$PORT/"
exec python3 -m http.server "$PORT" --bind 127.0.0.1
