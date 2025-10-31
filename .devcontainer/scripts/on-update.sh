#!/usr/bin/env bash

# This script is when the container is updated.

set -e

source ~/.config/mothership/.env || true

# Make sure mise is activated

if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
  export PATH="$HOME/.local/bin:$PATH"
fi
# Trust it
mise trust --yes --all
# Update it
mise self-update -y
# Activate it
eval "$(mise activate bash --shims)"
eval "$(mise env -s bash)"

# Pull git submodules

if [ -e .git ]; then
  git submodule update --recursive --init --remote
fi
# Trust all submodule mise configs
if [ -d .git ]; then
  git submodule foreach --recursive "mise trust"
fi

# Install stack

mise install

# Install dependencies

# Node.js
if [ -f ./pnpm-lock.yaml ]; then
  yes | mise x pnpm -- pnpm install || echo -e "🟡 pnpm install failed, make sure to run:\n\n    pnpm install\n"
elif [ -f ./yarn.lock ]; then
  yes | mise x yarn -- yarn install || echo -e "🟡 yarn install failed, make sure to run:\n\n    yarn install\n"
elif [ -f ./package-lock.json ]; then
  yes | mise x node -- npm install || echo -e "🟡 npm install failed, make sure to run:\n\n    npm install\n"
fi

# Install dependencies
if [ -f ./Cargo.lock ]; then
  mise x rust -- cargo build || echo -e "🟡 Cargo build failed, make sure to run:\n\n    cargo build\n"
fi

# NOTE: When needed, run setup scripts here.