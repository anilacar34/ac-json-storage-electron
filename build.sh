#!/usr/bin/env bash
# Build AC JSON Storage inside Docker — no Node toolchain needed on the host.
#
#   ./build.sh           AppImage           -> dist/ac-json-storage-<version>.AppImage
#   ./build.sh pack      unpacked app tree  -> dist/linux-unpacked/ (fast feedback)
#   ./build.sh install   force a clean `npm ci` and stop
set -euo pipefail

cd "$(dirname "$0")"

IMAGE=ac-json-storage-builder
CACHE_VOLUME=ac-json-storage-cache
MODE="${1:-appimage}"

docker build -f Dockerfile.build -t "$IMAGE" .

run_in_container() {
  docker run --rm \
    -u "$(id -u):$(id -g)" \
    -v "$PWD:/app" \
    -v "$CACHE_VOLUME:/cache" \
    -w /app \
    "$IMAGE" \
    bash -c "$1"
}

# The source tree is mounted, so node_modules survives between runs and this
# only pays off on the first build. `./build.sh install` forces it.
INSTALL='[ -d node_modules ] || npm ci --no-audit --no-fund'

case "$MODE" in
  install)
    run_in_container 'npm ci --no-audit --no-fund'
    ;;
  pack)
    run_in_container "$INSTALL && npx --no-install electron-builder --linux dir"
    echo "-> dist/linux-unpacked/"
    ;;
  appimage)
    run_in_container "$INSTALL && npx --no-install electron-builder --linux AppImage"
    ls -1 dist/*.AppImage
    ;;
  *)
    echo "usage: $0 [appimage|pack|install]" >&2
    exit 1
    ;;
esac
