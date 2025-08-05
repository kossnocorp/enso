FROM kossnocorp/dev-node:latest

# Install mise
COPY mise.toml /wrkspc/enso/mise.toml
RUN eval "$(mise activate bash --shims)" \
  && cd /wrkspc/enso \
  && mise install
