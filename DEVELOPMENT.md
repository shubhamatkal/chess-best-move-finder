# Development Notes

## Project Structure

```
chess-next-move-finder/
├── index.html          # Entire app — board, UI, all JS in one file
├── stockfish.js        # Stockfish 18 lite-single JS (copied from node_modules)
├── stockfish.wasm      # Stockfish 18 lite-single WASM binary (~7 MB)
├── img/
│   └── chesspieces/wikipedia/   # Chess piece PNGs (wK, bQ, etc.)
├── package.json
└── node_modules/stockfish/      # Source of stockfish.js / stockfish.wasm
```

## Setup from Scratch

```bash
npm install
cp node_modules/stockfish/bin/stockfish-18-lite-single.js stockfish.js
cp node_modules/stockfish/bin/stockfish-18-lite-single.wasm stockfish.wasm
npm start
```

Open http://localhost:8080.

> The WASM file must be served over HTTP — it cannot be loaded via `file://`.

## Engine Architecture

`stockfish.js` is loaded directly as a Web Worker:

```js
new Worker('/stockfish.js')
```

The file auto-detects it is running inside a Web Worker (via `typeof onmessage !== 'undefined' && typeof window === 'undefined'`) and bootstraps itself — loading the WASM binary from `/stockfish.wasm` (derived from the worker script URL) and setting up its own `onmessage` / `postMessage` bridge.

UCI flow:
```
main → worker:  uci
main → worker:  isready
worker → main:  ... option lines ...
worker → main:  uciok
worker → main:  readyok          ← engine marked ready, Analyze button enabled

main → worker:  setoption name MultiPV value <n>
main → worker:  position fen <fen>
main → worker:  go depth <d>
worker → main:  info depth N multipv M score cp X pv <moves>  (repeated)
worker → main:  bestmove <move> ponder <move>                  ← analysis done
```

Parsed fields per `info` line: `depth`, `multipv` (rank), `score cp`/`score mate`, `pv` (move list).

## Key Design Decisions

- **No build step** — everything is vanilla HTML/CSS/JS in `index.html`
- **Lite single-threaded engine** — chosen because it works without `Cross-Origin-Isolation` headers (which the multi-threaded version requires for `SharedArrayBuffer`)
- **`ignoreNextUpdate` flag** — `board.position()` fires the `onChange` callback even on programmatic updates; this flag suppresses the FEN re-render for those cases
- **Move history** — each played move saves full board state (position object + active color + castling flags) so undo restores everything exactly
- **Active color is manual** — the engine always analyzes for whatever side the radio button says; clicking a suggested move does NOT auto-toggle the color

## Stockfish Engine Variants (node_modules/stockfish/bin/)

| File | Threads | Size | Notes |
|---|---|---|---|
| `stockfish-18.js` + `.wasm` | Multi | ~108 MB | Requires CORS isolation headers |
| `stockfish-18-single.js` + `.wasm` | Single | ~108 MB | No CORS needed, large |
| `stockfish-18-lite.js` + `.wasm` | Multi | ~7 MB | Requires CORS isolation headers |
| `stockfish-18-lite-single.js` + `.wasm` | Single | ~7 MB | **Used here** — no CORS, small |
| `stockfish-18-asm.js` | Single | ~11 MB | Pure JS, no WASM, slowest |

## Updating the Engine

To switch to a different variant, copy the matching `.js` and `.wasm` pair to the project root as `stockfish.js` / `stockfish.wasm`.

```bash
# Example: switch to full single-threaded
cp node_modules/stockfish/bin/stockfish-18-single.js stockfish.js
cp node_modules/stockfish/bin/stockfish-18-single.wasm stockfish.wasm
```
