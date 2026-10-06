# Developer Guide: Running & Building the App

## In-app notifications

Open **Notifications** in the sidebar or use the header bell. New messages and
admin edits, deletions, and approval/rejection/match/return decisions are stored in MongoDB and delivered through
Socket.IO while connected. Offline users see their stored notifications when
they return. Click an entry to mark it read and open the conversation or report,
or use **Mark all as read**. No additional environment variables are required.

Authenticated API endpoints:

- `GET /api/notifications?page=1&limit=25&filter=all`: newest notifications, total and unread count (maximum limit: 100). Filters: `all`, `unread`, `messages`, `moderation`. The unread count always covers all notifications.
- `PATCH /api/notifications/:id/read`: mark one of the current user's notifications read.
- `PATCH /api/notifications/read-all`: mark the current user's notifications read.

Socket events `notification_received` and `notifications_updated` are sent only
to the recipient's authenticated user room. Message notifications omit message
contents and respect anonymous sender names. Moderation notifications are created
when an administrator edits or deletes a report, or changes its status to Approved,
Rejected, Matched, or Returned. An edit that changes status sends one specific
status notification. Deleted-report notifications keep the report title but do
not link to the removed report. Owner actions do not create admin notifications.


## Quick Start (minimal)
1. Ensure Node.js and npm are installed and `npm` is available in your PATH. If not, install Node.js and follow a short YouTube tutorial to add npm to your PATH : https://www.youtube.com/watch?v=YfC8tEfjKCM&t=51s
2. Open a terminal in the project root and install the MongoDB driver:
```bash
cd "c:\Users(Add your local directory)\project"
npm install mongodb
```

3. Start the development environment ( for frontend and backend):
```bash
npm run dev:full
```
4. For production-style serving (backend serves built frontend):
```bash
npm run build
npm run server
```
Then open these 3 and check if it shows success in setup
1. frontend dev: http://localhost:5173/
2.  backend/prod: http://localhost:3000/http://localhost:3000/
3.  Mongo test: http://localhost:3000/api/test-mongo

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

## Create an administrator account

Public signup always creates a `Student`. Create an administrator from a trusted
terminal on the server instead. In PowerShell, run:

```powershell
$env:ADMIN_FULL_NAME="Platform Administrator"
$env:ADMIN_EMAIL="admin@example.com"
$env:ADMIN_PASSWORD="ReplaceWithAStrongPassword!1"
npm run create-admin
Remove-Item Env:ADMIN_FULL_NAME, Env:ADMIN_EMAIL, Env:ADMIN_PASSWORD
```

The command uses `MONGO_URI` from `.env`, validates the account through the normal
user model, hashes the password, and marks the admin email as verified. It refuses
to modify an existing account automatically.

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
