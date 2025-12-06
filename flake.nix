{
  description = "Rust devShell with oxalica rust-overlay";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

    rust-overlay = {
      url = "github:oxalica/rust-overlay";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = {
    self,
    nixpkgs,
    rust-overlay,
    ...
  }: let
    tic80 = pkgs.callPackage ./tic80.nix {
      withPro = true;
    };
    rustVersion = "latest"; # or "1.62.0"
    pkgs = import nixpkgs {
      system = "x86_64-linux";
      overlays = [
        rust-overlay.overlays.default
        (final: prev: {
          my-rust = prev.rust-bin.stable.${rustVersion}.default.override {
            extensions = [
              "rust-src"
              "rust-analyzer"
            ];
            targets = ["wasm32-unknown-unknown"];
          };
        })
      ];
    };
  in {
    devShells.x86_64-linux.default = pkgs.mkShell {
      strictDeps = true;

      nativeBuildInputs = with pkgs; [
        my-rust
        pkg-config
        binaryen
        tic80
      ];

      RUST_BACKTRACE = "1";
    };
  };
}
