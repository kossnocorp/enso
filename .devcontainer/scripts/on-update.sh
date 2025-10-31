#!/usr/bin/env bash

# This script is when the container is updated.

set -e

source ~/.config/mothership/.env || true

# Make sure mise is activated
if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
  export PATH="$HOME/.local/bin:$PATH"
fi
# Update it
mise self-update -y
# Activate it
eval "$(mise activate bash --shims)"
eval "$(mise env -s bash)"

# Pull git submodules
if [ -e .git ]; then
  git submodule update --recursive --init --remote
fi

# Trust all mise configs
mise trust --yes --all
if [ -d .git ]; then
  git submodule foreach --recursive "mise trust"
fi

# Install stack
mise install
mise reshim

# Install dependencies
corepack enable || true # Try enabling corepack
if [ -f ./pnpm-lock.yaml ]; then
  yes | pnpm install
elif [ -f ./yarn.lock ]; then
  yes | yarn install
elif [ -f ./package-lock.json ]; then
  yes | npm install
fi

# Install dependencies
if [ -f ./Cargo.lock ]; then
  cargo build || echo "🟡 Cargo build failed, but that's ok"
fi

# NOTE: When needed, run setup scripts here.