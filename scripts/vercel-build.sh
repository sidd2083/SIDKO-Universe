#!/usr/bin/env bash
# Vercel build entrypoint. Runs with `set -ex` so the log shows exactly
# which step fails and why, instead of a bare "exited with 1".
set -ex

pnpm install

pnpm --filter @workspace/api-server run build

pnpm --filter @workspace/sidkouniverse run build:vercel

rm -rf public
cp -r artifacts/sidkouniverse/dist/public public

echo "vercel-build.sh: done"
