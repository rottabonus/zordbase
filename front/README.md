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

You need to run the backend separately for the frontend to work fully. See the backend README for instructions.

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

## Project Structure
- `src/` - React source code
  - `components/` - React components
  - `pages/` - Page components
  - `hooks/` - Custom React hooks
  - `reducers/` - Redux reducers
  - `actions/` - Redux actions
  - `services/` - API services
  - `types/` - TypeScript types
  - `worker/` - Web Worker for game logic
- `public/` - Static assets
- `index.html` - Entry HTML
- `vite.config.ts` - Vite configuration
- `tsconfig.json` - TypeScript configuration
- `biome.json` - Biome (linting/formatting) configuration

## Dependencies
- React 19
- React Router 7
- Redux 5
- React Redux 9
- Vite 8
- TypeScript 7
- Biome 2

## Backend
The backend serves the frontend as static files in production and provides the API. See the main project README or the backend README for more details.