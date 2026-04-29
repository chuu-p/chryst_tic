{
  description = "Run build.py (fully nix, no pip)";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };

        python = pkgs.python3;

        ticfile = python.pkgs.buildPythonPackage rec {
          pname = "ticfile";
          version = "0.1";

          src = pkgs.fetchFromGitHub {
            owner = "gasman";
            repo = "ticfile";
            rev = "master";
            sha256 = "sha256-GnvIOgg0Lud2cpdIPKqmcd+wPRrkYi528uhS8ml68xI=";
          };

          format = "setuptools";
          doCheck = false;
        };

        pythonEnv = python.withPackages (ps: [
          ps.numpy
          ps.scipy
          ticfile
        ]);

      in {
        apps.default = {
          type = "app";
          program = "${pkgs.writeShellScript "run-build" ''
            exec ${pythonEnv}/bin/python build.py "$@"
          ''}";
        };
      }
    );
}
