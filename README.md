# Mongo Viewer (Electron)

Desktop MongoDB browser built with Electron, React, TypeScript, and shadcn UI.

## Overview

This app lets you save MongoDB connections locally, browse databases and collections, and inspect records in table or JSON mode. It uses Electron IPC between renderer and main process, and stores saved connections in a local JSON file under the app user data directory.

## Features

- Saved MongoDB connections (name + URI)
- Optional TLS certificate picker
- Active connection switching
- Database/collection tree browsing
- Collection records viewer with pagination
- Table and JSON view modes
- Custom draggable title bar with native window controls overlay
- Local-first storage (no cloud backend)

## Tech Stack

- Electron 41
- Electron Forge + Vite
- React 19 + TypeScript
- Tailwind CSS v4 + shadcn styles/components
- MongoDB Node driver + BSON EJSON

## Prerequisites

- Node.js 20+
- pnpm 9+
- Access to a MongoDB instance

## Getting Started

1. Install dependencies:

```bash
pnpm install
```

2. Start the app in development:

```bash
pnpm start
```

## Scripts

- `pnpm start` - Run Electron in development mode
- `pnpm lint` - Run ESLint on TypeScript/TSX files
- `pnpm package` - Package the app
- `pnpm make` - Generate distributables using Electron Forge makers
- `pnpm publish` - Publish via Electron Forge

## Build and Packaging

Packaging is configured with Electron Forge in `forge.config.ts`.

Configured makers:
- Squirrel (Windows)
- ZIP (macOS)
- DEB (Linux)
- RPM (Linux)

## Project Structure

```text
src/
  main.ts                         # Electron main process + IPC handlers + BrowserWindow
  preload.ts                      # Context bridge API exposed to renderer
  renderer.tsx                    # React entry point
  App.tsx                         # App shell and view switching
  components/
    connection-home.tsx           # Connection management screen
    mongo-viewer.tsx              # Data browser screen
    title-bar.tsx                 # Custom title bar (drag region)
    ui/                           # shadcn-style UI components
  hooks/
    use-connections.ts            # Renderer state for saved/active connections
  lib/
    mongo-types.ts                # Shared types
    mongo-connection.ts           # URI + TLS helpers
    document-format.ts            # Record formatting helpers
    renderer-api.ts               # Typed bridge access wrapper
    main/
      connection-store.ts         # Local JSON persistence for connections
      mongo-service.ts            # Mongo client + list/query operations
```

## Data Storage

Saved connections are stored in:

- `app.getPath('userData')/storage/connections.json`

Notes:
- This file is created automatically on first save.
- Connection names must be unique.
- The active connection ID is persisted.

## Security Model

- Renderer uses `contextBridge` + `ipcRenderer.invoke` via preload API.
- Main process validates IPC inputs before DB operations.
- No direct Node.js access is exposed to UI components.

## Custom Title Bar

The app uses a custom title bar setup:

- `titleBarStyle: 'hidden'` to remove default OS chrome
- macOS traffic lights are repositioned with `trafficLightPosition`
- Windows/Linux native controls are shown via `titleBarOverlay`
- The renderer title bar uses a draggable region (`-webkit-app-region: drag`)

## Troubleshooting

### App starts but cannot load records

- Verify a saved connection is active.
- Confirm MongoDB URI and network access.
- Check TLS certificate path if using TLS.

### TLS certificate selection

- Use the picker in the connection form.
- Supported extensions: `pem`, `crt`, `cer`, `ca`, `txt`.

### Type-check locally

```bash
pnpm exec tsc --noEmit
```

## Roadmap Ideas

- Edit existing saved connections
- Collection filtering and query controls
- Index viewer and schema summary
- Export records to JSON/CSV

## License

MIT
