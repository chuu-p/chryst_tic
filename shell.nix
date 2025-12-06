{pkgs ? import <nixpkgs> {}}:
pkgs.mkShell {
  buildInputs = [
    # frontend
    pkgs.nodejs
    pkgs.protobuf

    # shell
    pkgs.fish
    pkgs.pkg-config

    # backend
    pkgs.rustc
    pkgs.cargo
    pkgs.sqlite
    pkgs.llvmPackages.clang
    pkgs.llvmPackages.lld
  ];

  nativeBuildInputs = [
    (pkgs.buildNpmPackage {
      name = "protoc-gen-ts-deps";
      packageJSON = ./example/package.json;
      lockFile = ./example/package-lock.json;
      src = ./example;
      npmDepsHash = "sha256-8XA5valnl19UGeRL+ikVwuCFFAi6fSozVFeWoZzAzrQ=";
    })
  ];

  shellHook = ''
    export PKG_CONFIG_PATH="${pkgs.sqlite.dev}/lib/pkgconfig"
    export LD_LIBRARY_PATH=${pkgs.sqlite.out}/lib:$LD_LIBRARY_PATH
    export PATH="$PWD/node_modules/.bin:$PATH"
    echo ENTER DEV
    fish -C "set --universal hydro_symbol_prompt 'DEV❱'"
    echo EXIT DEV
    fish -c "set --universal hydro_symbol_prompt '❱'"
    exit
  '';
}
