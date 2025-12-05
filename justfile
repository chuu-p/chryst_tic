n:
    nix develop --command fish -C "set hydro_symbol_start DEV "

dev:
    nix develop --command watchexec --exts moon --restart -- moon blue.moon
