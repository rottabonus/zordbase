# ZordBase

**The software is under construction!**

This is a [WordBase](https://apkpure.com/wordbase-%E2%80%93-fun-word-search-battles-with-friends/com.wordbaseapp)-like game, called ZordBase.

WordBase was a fun android-game, which I played a lot myself.<br>
Sadly, it was closed for unprofitability.<br>
I have developed the project to amuse myself.

## Tech Stack

### Frontend
- React 19 + React Router 7
- Redux 5 + React Redux 9
- Vite 8 + TypeScript 7
- Socket.io-client for real-time communication
- Biome for linting/formatting
- Vitest + React Testing Library for unit tests

### Backend
- Node.js 24 + Express 5 + Socket.io 4
- PostgreSQL 18 + Drizzle ORM
- TypeScript 7
- Biome for linting/formatting
- Vitest for unit tests

---

## Running the Application

### Prerequisites
- Node.js 24.x (for local development)
- Docker & Docker Compose (for containerized development)
- PostgreSQL 18+ (if running locally without Docker)

### Development with Docker Compose (Recommended)

Run database, migrations, backend, and frontend with a single command:

```bash
# Clone repo
git clone https://github.com/rottabonus/zordbase
cd zordbase

# Start all services (database → migrator → backend → frontend)
docker compose up
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:6540 |
| Backend API | http://localhost:3000 |
| Health Check | http://localhost:3000/health |
| PostgreSQL | localhost:5432 |

The docker-compose setup mounts source directories for hot-reloading:
- `./back/src` → backend container
- `./front/src` → frontend container  
- `./words` → backend container (for word list data)

To run in background:
```bash
docker compose up -d
```

To stop:
```bash
docker compose down
```

### Development (Frontend + Backend separately - without Docker)

**Terminal 1 - Database & Backend:**
```bash
cd zordbase/back
npm install
# Set DATABASE_URL or use default: postgres://postgres:secret@localhost:5432/zordbase
npm run db:migrate  # Run Drizzle migrations
npm run dev         # Start backend (port 3000)
```

**Terminal 2 - Frontend:**
```bash
cd zordbase/front
npm install
npm run dev         # Start Vite dev server (port 6540)
```

The frontend proxies API requests to the backend.

---

## Development Commands

### Frontend (`zordbase/front/`)
```bash
npm run dev      # Start Vite dev server (port 6540)
npm run build    # Type-check (tsc) and build for production
npm run preview  # Preview production build
npm run lint     # Lint with Biome
npm run format   # Format with Biome
npm run check    # Lint and auto-fix with Biome
npm run test     # Run unit tests (Vitest)
npm run test:watch # Watch mode for tests
npm run test:coverage # Run tests with coverage report
```

### Backend (`zordbase/back/`)
```bash
npm run dev       # Start backend with TypeScript (port 3000)
npm run build     # Type-check and compile TypeScript
npm run lint      # Lint with Biome
npm run format    # Format with Biome
npm run check     # Lint and auto-fix with Biome
npm run test      # Run unit tests (Vitest)
npm run test:watch # Watch mode for tests
npm run test:coverage # Run tests with coverage report
npm run db:generate # Generate Drizzle migration
npm run db:migrate  # Run Drizzle migrations
npm run db:studio   # Open Drizzle Studio (GUI)
```

---

## Architecture

### Socket.io Connection Management
- **Single shared socket** via React Context (`SocketContext`)
- Two specialized hooks: `useMultiplayerLobby` and `useMultiplayerGame`
- Auto-reconnection and session persistence via `sessionStorage`

### Database (PostgreSQL + Drizzle ORM)
| Table | Purpose |
|-------|---------|
| `sessions` | User sessions (replaces InMemorySessionStore) |
| `game_rooms` | Active game state (replaces in-memory Map) |
| `game_moves` | Move history for replay/analytics |

### Game Logic (Shared)
- Pure functions for: path validation, ownership, win conditions, neighbor generation
- Unit tested with Vitest (31 backend tests, 3 frontend tests)

---

## Testing

```bash
# Backend
cd back && npm run test           # 31 game logic tests
cd back && npm run test:watch     # Watch mode

# Frontend
cd front && npm run test          # 3 Board component tests
cd front && npm run test:watch    # Watch mode
```

**Backend tests cover:** board creation, initial base, path validation, ownership validation, win detection, movement generation  
**Frontend tests cover:** Board rendering, click handling, ownership styling

---

## Docker Production Build

```bash
# Build production image
docker build . -t zordbase

# Run with environment variables
docker run --rm -p 3000:3000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  --name zordbase zordbase
```

---

## Deployment

Deploy using the Kubernetes templates in the `kube/` folder (if available).

---

## Word List

The [Finnish wordlist](http://kaino.kotus.fi/sanat/nykysuomi/) is from the [Institute for the Languages of Finland](https://www.kotus.fi/en).
