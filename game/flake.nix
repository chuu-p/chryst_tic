{
  description = "Dev shell for chryst_tic";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = {
    self,
    nixpkgs,
    ...
  }: let
    tic80 = pkgs.callPackage ./tic80.nix {
      withPro = true;
    };
    pkgs = import nixpkgs {
      system = "x86_64-linux";
    };
  in {
    devShells.x86_64-linux.default = pkgs.mkShell {
      strictDeps = true;

      nativeBuildInputs = with pkgs; [
        pkg-config
        tic80
        nixfmt
        typescript
        nodejs
      ];
    };
  };
}
