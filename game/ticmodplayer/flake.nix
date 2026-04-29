{
  description = "Run build.py with mixed nix + pip deps";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };

        python = pkgs.python3.withPackages (ps: [
          ps.numpy
          ps.scipy
          ps.pip
          ps.setuptools
          ps.wheel
        ]);

        app = pkgs.writeShellApplication {
          name = "run-build";
          runtimeInputs = [ python ];
          text = ''
            if [ ! -d .venv ]; then
              echo "Creating venv for ticfile..."
              ${python}/bin/python -m venv .venv
              .venv/bin/pip install --upgrade pip
              .venv/bin/pip install ticfile
            fi

            # merge nix python + venv site-packages
            export PYTHONPATH="${python}/${python.sitePackages}:$PWD/.venv/lib/python*/site-packages"

            exec ${python}/bin/python build.py
          '';
        };

      in {
        apps.default = {
          type = "app";
          program = "${app}/bin/run-build";
        };
      }
    );
}
