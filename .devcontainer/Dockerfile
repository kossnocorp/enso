FROM kossnocorp/dev-node:latest

# Install mise
COPY mise.toml /wrkspc/enso/mise.toml
RUN eval "$(mise activate bash --shims)" \
  && cd /wrkspc/enso \
  && mise install

# Install Playwright
RUN eval "$(mise activate bash --shims)" \
  && sudo apt-get update \
  && npx playwright install --with-deps