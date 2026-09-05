#!/bin/sh
# Local dev server. The app fetches ./data.json, so it must be served over
# HTTP — opening index.html via file:// fails the fetch and shows the
# "data didn't load" state.
set -eu
cd "$(dirname "$0")"
PORT="${1:-8137}"
echo "HUB on http://localhost:$PORT/  (append ?demo for data-demo.json)"
exec python3 -m http.server "$PORT" --bind 127.0.0.1
