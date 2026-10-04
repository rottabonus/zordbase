# Zordbase Frontend

## Development

### Prerequisites
- Node.js 24.x

### Install dependencies
```bash
npm install
```

### Run development server
```bash
npm run dev
```
This starts the Vite dev server on port 6540. It proxies API requests to the backend (default: http://localhost:3000).

You need to run the backend separately for the frontend to work fully. See the main project README or the backend README for instructions.

### Build for production
```bash
npm run build
```
This runs TypeScript type checking (`tsc`) and then builds with Vite. Output goes to `dist/`.

### Preview production build
```bash
npm run preview
```

### Linting and formatting
```bash
# Lint code
npm run lint

# Format code
npm run format

# Check and auto-fix
npm run check
```

### Testing
```bash
# Run unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## Project Structure
- `src/` - React source code
  - `components/` - React components (Board, Board.tsx, etc.)
  - `pages/` - Page components (MultiplayerLobby, MultiplayerGameBoardPage)
  - `hooks/` - Custom React hooks (useMultiplayerLobby, useMultiplayerGame, useSocket)
  - `reducers/` - Redux reducers (board, base, message, multiplayer)
  - `actions/` - Redux actions
  - `services/` - API services (words, game, storage)
  - `types/` - TypeScript types
  - `worker/` - Web Worker for game logic
- `public/` - Static assets
- `index.html` - Entry HTML
- `vite.config.ts` - Vite configuration
- `tsconfig.json` - TypeScript configuration
- `biome.json` - Biome (linting/formatting) configuration
- `vitest.config.ts` - Vitest configuration

## Key Features

### Multiplayer Architecture
- **Single shared Socket.io connection** via `SocketContext` (React Context)
- **Two specialized hooks:**
  - `useMultiplayerLobby` - Handles lobby events (users list, challenges, game:start)
  - `useMultiplayerGame` - Handles game events (game:state, game:move, game:end)
- **Session persistence** via `sessionStorage` - survives page reloads
- **Auto-reconnection** on connection loss

### Game Visualization
- Opponent moves animate letter-by-letter before game state updates
- `timeTravel` feature to replay previous moves
- Real-time turn indicators

### State Management
- Redux for global state (board, base, message, multiplayer)
- Local state for UI interactions

## Dependencies
- React 19
- React Router 7
- Redux 5
- React Redux 9
- Socket.io-client 4
- Vite 8
- TypeScript 7
- Biome 2
- Vitest 5 + React Testing Library

## Backend
The backend serves the frontend as static files in production and provides the Socket.io/WebSocket API. See the main project README or the backend README for more details.