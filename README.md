# Yokanri

A local-first desktop application for managing your personal manga, manhwa, and manhua library.

Built with **Tauri 2** + **React** + **Vite**.

## Features

- Organize your reading library with detailed tracking (status, chapters, ratings, notes)
- Multi-workspace system for separate collections
- Search and import metadata from AniList and MangaDex
- Release schedule with daily highlights
- Cover image management with local storage
- Detailed statistics and profile dashboard
- Multiple view modes (grid, compact, row)
- Advanced filtering by status, genre, type, rating, and more
- 100% offline, no account required, all data stays on your machine

## Tech Stack

- **Desktop**: [Tauri 2](https://v2.tauri.app/) (Rust + WebView2)
- **Frontend**: React 18 + Vite 5
- **Storage**: Native filesystem via `@tauri-apps/plugin-fs` (JSON-based, SQLite-ready)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data location**: `AppData/Roaming/Yokanri/`

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://www.rust-lang.org/tools/install)
- [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with C++ workload (Windows)

### Development

```bash
# Install dependencies
npm install

# Run in development mode (opens desktop window with hot reload)
npm run tauri:dev
```

### Build

```bash
# Build the desktop application
npm run tauri:build
```

The installer will be generated at `src-tauri/target/release/bundle/nsis/`.

## Project Structure

```
yokanri/
├── src/                      # React frontend
│   ├── components/           # UI components
│   │   ├── Configuracoes/    # Settings panel
│   │   ├── CustomSelect/     # Custom select input
│   │   ├── Header/           # App header with workspace menu
│   │   ├── ObraCard/         # Card views (grid, compact, row)
│   │   ├── ObraDetail/       # Detailed view of a single work
│   │   ├── ObraForm/         # Add/edit form with API search
│   │   ├── ObraList/         # Main list with filters and pagination
│   │   ├── ReleasesToday/    # Daily release schedule
│   │   ├── Statistics/       # Library statistics
│   │   ├── WorkspaceMenu/    # Workspace dropdown menu
│   │   └── WorkspaceProfile/ # Profile/dashboard page
│   ├── context/              # React context (config)
│   ├── hooks/                # Shared hooks
│   ├── services/             # Data and API services
│   │   ├── storage/          # Storage abstraction layer
│   │   └── workspace/        # Workspace management
│   ├── styles/               # Global CSS variables and utilities
│   ├── types/                # Data type definitions
│   └── utils/                # Helper functions
├── src-tauri/                # Tauri backend (Rust)
│   ├── capabilities/         # Permission scopes
│   ├── icons/                # App icons
│   └── src/                  # Rust source
└── index.html                # Entry point
```

## License

[MIT](LICENSE)
