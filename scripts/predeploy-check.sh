#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> Predeploy gate: lint"
npm run lint

echo "==> Predeploy gate: typecheck"
npm run typecheck

echo "==> Predeploy gate: unit tests"
npm run test

echo "==> Predeploy gate: production build"
npm run build

if command -v python3 >/dev/null 2>&1; then
  echo "==> Predeploy gate: Python engine tests (optional)"
  if python3 -m pytest --version >/dev/null 2>&1; then
    (cd engine && python3 -m pytest tests/ -q)
    (cd engine && python3 tests.py)
  else
    echo "    Skipped: pytest not installed locally (pip install pytest)"
  fi
else
  echo "==> Predeploy gate: Python engine tests skipped (python3 not found)"
fi

echo ""
echo "Predeploy checks passed."
