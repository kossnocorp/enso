#!/usr/bin/env bash

set -e

eval "$(mise activate bash --shims)"

# Stack

mise install

# Dependencies

# Node.js
corepack install
pnpm install

# Playwright
pnpm exec playwright install --with-deps