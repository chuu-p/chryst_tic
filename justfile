n:
    nix develop --command fish -C "set hydro_symbol_start DEV:"

ide:
    nix develop --command codium . 

dev:
    nix develop --command bacon

run:
    nix develop --command bacon run

run-raw:
    cargo build --release --target=wasm32-unknown-unknown
    wasm-opt --enable-bulk-memory-opt -Os target/wasm32-unknown-unknown/release/chryst.wasm -o chryst.wasm
    tic80 --skip --fs . --cmd 'new wasm & import binary chryst.wasm & import tiles res/tilesheet.png & import sprites res/spritesheet.png & run'

