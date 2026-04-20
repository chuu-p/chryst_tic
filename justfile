n:
    nix develop --command fish -C "set hydro_symbol_start DEV:"

ide:
    nix develop --command antigravity . 

dev:
    nix develop --command bacon

run:
    nix develop --command bacon run

run-raw:
    nix develop --command cargo build --release --target=wasm32-unknown-unknown
    # nix develop --command wasm-opt -Os --enable-bulk-memory target/wasm32-unknown-unknown/release/chryst.wasm -o chryst.wasm
    cp target/wasm32-unknown-unknown/release/chryst.wasm chryst.wasm
    nix develop --command tic80 --skip --fs . --cmd 'new wasm & import binary chryst.wasm & import tiles res/tilesheet.png & import sprites res/spritesheet.png & run'

