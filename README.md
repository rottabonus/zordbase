# zordbase

**The software is under construction!**

This is a [WordBase](https://apkpure.com/wordbase-%E2%80%93-fun-word-search-battles-with-friends/com.wordbaseapp)-like game, called ZordBase.

WordBase was a fun android-game, which I played a lot myself.<br>
Sadly, it was closed for unprofitability.<br>
I have developed the project to amuse myself.

For now, you can play against a computer in Finnish.

The [Finnish wordlist](http://kaino.kotus.fi/sanat/nykysuomi/) is from the [Institute for the languages of Finland](https://www.kotus.fi/en)

First demo-version hosted in [Heroku](http://ancient-sierra-67919.herokuapp.com/)

## Running the Application

### Prerequisites
- Node.js 24.x (for local development)
- Docker & Docker Compose (for containerized development)

### Development with Docker Compose (Recommended)

Run both frontend and backend with a single command:

```bash
# Clone repo
git clone https://github.com/rottabonus/zordbase
cd zordbase

# Start both services
docker-compose up --build
```

- Frontend: http://localhost:6540
- Backend API: http://localhost:3000

The docker-compose setup mounts source directories for hot-reloading:
- `./back/src` → backend container
- `./front/src` → frontend container  
- `./words` → backend container (for word list data)

To run in background:
```bash
docker-compose up -d --build
```

To stop:
```bash
docker-compose down
```

### Production (Backend serves Frontend)
```bash
# Clone repo
git clone https://github.com/rottabonus/zordbase
cd zordbase

# Install and build frontend
cd front
npm install
npm run build

# Install and run backend (serves frontend from dist/)
cd ../back
npm install
npm run dev
```
Then access the game at http://localhost:3000

### Development (Frontend + Backend separately - without Docker)

**Terminal 1 - Backend:**
```bash
cd zordbase/back
npm install
npm run dev
```
Backend runs on http://localhost:3000

**Terminal 2 - Frontend:**
```bash
cd zordbase/front
npm install
npm run dev
```
Frontend runs on http://localhost:6540 (proxies API to backend)

## Development Commands

### Frontend (`zordbase/front/`)
```bash
npm run dev      # Start Vite dev server (port 6540)
npm run build    # Type-check (tsc) and build for production
npm run preview  # Preview production build
npm run lint     # Lint with Biome
npm run format   # Format with Biome
npm run check    # Lint and auto-fix with Biome
```

### Backend (`zordbase/back/`)
```bash
npm run dev      # Start backend with TypeScript (port 3000)
npm run build    # Type-check and compile TypeScript
npm run lint     # Lint with Biome
npm run format   # Format with Biome
npm run check    # Lint and auto-fix with Biome
```

## Technology Stack

### Frontend
- React 19
- React Router 7
- Redux 5 / React Redux 9
- Vite 8
- TypeScript 7
- Biome 2 (linting/formatting)

### Backend
- Express 5
- TypeScript 7
- Biome 2 (linting/formatting)
- Node.js 24 with `--experimental-strip-types`

