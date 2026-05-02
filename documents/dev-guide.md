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
  ```
- Backend will serve the built frontend at http://localhost:3000/


If you see errors about MongoDB, make sure MongoDB is running locally
## Quick Start (minimal)
1. Ensure Node.js and npm are installed and `npm` is available in your PATH. If not, install Node.js and follow a short YouTube tutorial to add npm to your PATH : https://www.youtube.com/watch?v=YfC8tEfjKCM&t=51s
2. Open a terminal in the project root and install the MongoDB driver:
```bash
cd "c:\Users(Add your local directory)\project"
npm install mongodb
```

1. Start the development environment ( for frontend and backend):
```bash
npm run dev:full
```
1. For production-style serving (backend serves built frontend):
```bash
npm run build
npm run server
```
Then open these 3 and check if it shows success in setup
1. frontend dev: http://localhost:5173/
2.  backend/prod: http://localhost:3000/
3.  Mongo test: http://localhost:3000/api/test-mongo

