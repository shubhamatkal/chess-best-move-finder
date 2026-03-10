# Chess Next Move Finder

A browser-based tool to analyze any chess position using the Stockfish engine. Set up a position, pick which side is to move, and get ranked best moves with evaluation scores — all running locally in your browser, no server required.

## Features

- **Board editor** — drag spare pieces onto the board to place them; drag pieces off to remove them
- **Engine analysis** — Stockfish 18 (WASM, lite single-threaded) analyzes the position at configurable depth and returns ranked best moves with centipawn / mate scores
- **Click to play** — click any suggested move to play it on the board
- **Undo / Redo** — step back and forward through played moves with the arrow buttons
- **FEN support** — live FEN display updates on every board change; paste or type a FEN and press Enter to load a position; one-click copy to clipboard
- **Controls** — flip board, reset to starting position, clear all pieces
- **Active color & castling** — set who is to move and which castling rights are available before analyzing

## Tech Stack

| Dependency | Purpose |
|---|---|
| [Stockfish 18 (lite-single)](https://github.com/nmrugg/stockfish.js) | Chess engine, WASM |
| [chessboard.js 1.0.0](https://unpkg.com/@chrisoakman/chessboardjs@1.0.0) | Board UI, drag-and-drop |
| [jQuery 3.7.1](https://code.jquery.com) | Required by chessboard.js |

No build step. The entire app is a single `index.html` file.

## Running Locally

A local HTTP server is required (WASM cannot be loaded over `file://`).

```bash
npm install
npm start          # serves on http://localhost:8080
```

Or with any other static server:

```bash
npx serve . --listen 8080
python3 -m http.server 8080
```

## FEN Format

The app generates FENs in the form:

```
<board> <active-color> <castling> - 0 1
```

- **active-color** — controlled by the "White / Black to move" radio buttons
- **castling** — any combination of `KQkq`, or `-` if none are checked
- En passant, halfmove clock, and fullmove number are fixed at `- 0 1`
