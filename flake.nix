{
  description = "Enso dev environment";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      nixpkgs,
      flake-utils,
      ...
    }:

    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
      in
      {
        devShells.default =
          with pkgs;
          mkShell {
            buildInputs = [
              # Tools
              direnv
              # just
              # Node.js
              nodejs
              corepack
              # Playwright
              # [TODO] Move into a shared flake
              # libgobject-2.0.so.0
              # libglib-2.0.so.0
              # libgio-2.0.so.0
              glib
              # libnss3.so
              # libnssutil3.so
              # libsmime3.so
              nss
              # libnspr4.so
              nspr
              # libatk-1.0.so.0
              # libatk-bridge-2.0.so.0
              # libatspi.so.0
              at-spi2-core
              # libcups.so.2
              cups
              # libdrm.so.2
              libdrm
              # libdbus-1.so.3
              dbus
              # libX11.so.6
              xorg.libX11
              # libXcomposite.so.1
              xorg.libXcomposite
              # libXdamage.so.1
              xorg.libXdamage
              # libXext.so.6
              xorg.libXext
              # libXfixes.so.3
              xorg.libXfixes
              # libXrandr.so.2
              xorg.libXrandr
              # libgbm.so.1
              mesa
              # libexpat.so.1
              expat
              # libxcb.so.1
              xorg.libxcb
              # libxkbcommon.so.0
              libxkbcommon
              # libpango-1.0.so.0
              pango
              # libcairo.so.2
              cairo
              # libasound.so.2
              alsa-lib
            ];
          };
      }
    );
}
