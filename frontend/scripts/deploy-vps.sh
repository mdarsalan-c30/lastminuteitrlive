#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/NikhilAdmin/frontend"
PM2_APP="frontend"

if [[ "$(pwd)" != "$APP_DIR" || ! -f package.json ]]; then
  echo "Run this script from $APP_DIR" >&2
  exit 1
fi

stamp="$(date +%Y%m%d%H%M%S)"
build_dir=".next-build"
previous_dir=".next-previous-${stamp}"

cleanup_failed_build() {
  if [[ -d "$build_dir" ]]; then
    rm -rf -- "$APP_DIR/$build_dir"
  fi
}
trap cleanup_failed_build ERR

echo "Building release in $build_dir while the current site stays online..."
NEXT_DIST_DIR="$build_dir" npm run build

# Keep the preceding release's hashed assets so already-open browser tabs do not
# lose their CSS/JS immediately after a deployment.
if [[ -d .next/static ]]; then
  cp -a --update=none .next/static/. "$build_dir/static/"
fi

mv -- .next "$previous_dir"
mv -- "$build_dir" .next
pm2 restart "$PM2_APP" --update-env

trap - ERR
echo "Deployment complete. Previous release retained at $previous_dir"
