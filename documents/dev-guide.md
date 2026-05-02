# Developer Guide: Running & Building the App

## Development
- Run both frontend (Vite) and backend (Express) with hot reload:
  ```bash
  npm run dev:full
  ```
- This starts:
  - Frontend: http://localhost:5173/  → Shows "Set up done"
  - Backend:  http://localhost:3000/  → Shows "Set up done" (if built) or a backend message
  - MongoDB test: http://localhost:3000/api/test-mongo → Shows JSON with test user if MongoDB is running
- You do **not** need to run `npm run build` every time for development.

## Production / Serve Frontend from Backend
- Build the frontend (only after code changes):
  ```bash
  npm run build
  ```
- Start only the backend server:
  ```bash
  npm run server
  # or
  node server.js
  ```
- Backend will serve the built frontend at http://localhost:3000/

## Quick Reference
- **Frontend (dev):** http://localhost:5173/
- **Backend (dev/prod):** http://localhost:3000/
- **MongoDB check:** http://localhost:3000/api/test-mongo

If you see errors about MongoDB, make sure MongoDB is running locally or set the `MONGO_URI` environment variable.

