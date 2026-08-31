# Project Setup and Execution Guide

## 4.2 Initial Project Setup

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd fit3170_project1
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the project root:
```bash
# Database
MONGO_URI=mongodb://localhost:27017/fit3170

# Server
PORT=3000
NODE_ENV=development

# Email (optional, for verification)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# JWT (generate random strings)
JWT_SECRET=your-random-secret-key-here
JWT_REFRESH_SECRET=your-random-refresh-secret-here
```

### Step 4: Verify MongoDB Connection
```bash
npm run server
# Visit: http://localhost:3000/api/test-mongo
# Should return JSON with test user data
```

---

## 4.3 Development Environment Setup

### Option A: Full Stack Development (Recommended)
Run both frontend and backend with hot reload:
```bash
npm run dev:full
```

This starts:
- **Frontend (Vite)**: http://localhost:5173/
- **Backend (Express)**: http://localhost:3000/
- **Hot reload**: Changes auto-update without restarting

### Option B: Frontend Only
```bash
npm run dev
```
Access at http://localhost:5173/

### Option C: Backend Only
```bash
npm run server
```
Access at http://localhost:3000/

---

## 4.4 User Setup

### Create an Admin Account

**Important**: Only administrators can access the analytics dashboard.

In PowerShell (Windows):
```powershell
$env:ADMIN_FULL_NAME="Platform Administrator"
$env:ADMIN_EMAIL="admin@example.com"
$env:ADMIN_PASSWORD="ReplaceWithAStrongPassword!1"
npm run create-admin
Remove-Item Env:ADMIN_FULL_NAME, Env:ADMIN_EMAIL, Env:ADMIN_PASSWORD
```

In Bash (Linux/Mac):
```bash
export ADMIN_FULL_NAME="Platform Administrator"
export ADMIN_EMAIL="admin@example.com"
export ADMIN_PASSWORD="ReplaceWithAStrongPassword!1"
npm run create-admin
unset ADMIN_FULL_NAME ADMIN_EMAIL ADMIN_PASSWORD
```

### Create Test Users (Via UI)

1. Start the app: `npm run dev:full`
2. Navigate to http://localhost:5173/signup
3. Sign up with different roles (Student, Staff, etc.)

---

## 4.5 Testing

Your project uses **two testing frameworks**:

### 4.5.1 Unit & Integration Testing (Vitest)

**Run all tests (once):**
```bash
npm run test:unit
```

**Run tests in watch mode (recommended for development):**
```bash
npm run test
```

**Run specific test file:**
```bash
npx vitest run tests/unit/controllers/analyticsController.test.js
```

**Generate coverage report:**
```bash
npm run test:coverage
```

**Test Structure:**
```
tests/
├── unit/              # Component, hook, controller, model, utility tests
│   ├── components/
│   ├── controllers/
│   ├── hooks/
│   ├── models/
│   └── utils/
├── integration/       # API route tests
│   └── routes/
└── setup/            # Test configuration
```

**Important**: Test files must be named with `.test.js` or `.spec.js` extension to be recognized.

Example test file location:
- Unit test: `tests/unit/controllers/analyticsController.test.js`
- Integration test: `tests/integration/routes/analyticsRoutes.test.js`

---

### 4.5.2 End-to-End Testing (Playwright)

**Run E2E tests (headless):**
```bash
npm run test:e2e
```

**Run E2E tests with interactive UI (recommended):**
```bash
npm run test:e2e:ui
```
This opens an interactive browser where you can:
- See all tests in the left panel
- Click on any test to run it
- Watch the browser perform actions in real-time
- Debug failures with screenshots

**View E2E test report:**
```bash
npm run test:e2e:report
```

**Test Structure:**
```
tests/
└── e2e/
    ├── analytics.spec.js      # Analytics dashboard tests
    ├── auth.spec.js           # Authentication flow tests
    └── items.spec.js          # Item listing/creation tests
```

---

### 4.5.3 Test Commands Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run test` | Run unit/integration tests in watch mode |
| `npm run test:unit` | Run unit/integration tests once (CI/CD) |
| `npm run test:coverage` | Generate code coverage report |
| `npm run test:e2e` | Run E2E tests headless |
| `npm run test:e2e:ui` | Run E2E tests with interactive UI |
| `npm run test:e2e:report` | View last E2E test report |

---

## 4.6 Building for Production

### Build Frontend
```bash
npm run build
```
Output: `dist/` folder with optimized static files

### Serve Frontend from Backend
```bash
npm run server
```
Backend serves the built frontend at http://localhost:3000/

**Full production build process:**
```bash
npm run build          # Build frontend
npm run server         # Start backend (serves built frontend)
```

---

## 4.7 Deployment

### Using Docker (Optional)

**Build Docker image:**
```bash
docker build -t fit3170-app .
```

**Run Docker container:**
```bash
docker run -p 3000:3000 --env-file .env fit3170-app
```

**Using Docker Compose:**
```bash
docker-compose up
```

### Using Render.yaml (Configured in Project)

The project includes `render.yaml` for deployment to Render.com:
1. Push code to GitHub
2. Connect repository to Render.com
3. Render auto-deploys on every push to `main`

---

## 4.8 Troubleshooting

### MongoDB Connection Issues

**Error**: `MongooseError: Cannot connect to MongoDB`

**Solution**:
```bash
# Verify MongoDB is running
mongod --version

# Start MongoDB
# Windows: mongod
# Mac: brew services start mongodb-community
# Linux: sudo service mongod start

# Check .env MONGO_URI
cat .env | grep MONGO_URI
```

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (Windows)
taskkill /PID <PID> /F

# Or change port in .env
PORT=3001
```

### Dependencies Not Installed

**Error**: `Module not found`

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Vitest Not Finding Tests

**Error**: `No test files found`

**Solution**:
- Ensure test files end in `.test.js` or `.spec.js`
- Check file location: `tests/unit/**` or `tests/integration/**`
- Example: `analyticsController.js` → `analyticsController.test.js`

### Playwright Tests Timing Out

**Error**: `Timeout 30000ms exceeded`

**Solution**:
- Ensure server is running: `npm run dev:full`
- Increase timeout in `playwright.config.js`
- Check if API endpoints are working

---

## 4.9 Development Workflow

**Typical Development Cycle:**

1. **Start dev environment**:
   ```bash
   npm run dev:full
   ```

2. **Write code** in `src/` folder

3. **Run tests** in watch mode (separate terminal):
   ```bash
   npm run test
   ```

4. **Test E2E features** (when server ready, separate terminal):
   ```bash
   npm run test:e2e:ui
   ```

5. **Before commit**:
   ```bash
   npm run test:unit      # Run all unit tests
   npm run test:e2e       # Run all E2E tests
   npm run build          # Verify build works
   ```

6. **Commit and push**:
   ```bash
   git add .
   git commit -m "Add feature X"
   git push origin main
   ```

---

## 4.10 Project Structure Reference

```
fit3170_project1/
├── src/
│   ├── pages/              # React page components
│   ├── components/         # Reusable React components
│   ├── controllers/        # Backend business logic
│   ├── routes/            # Express API routes
│   ├── models/            # Mongoose schemas
│   ├── services/          # API & auth services
│   ├── middleware/        # Express middleware
│   ├── config/            # Configuration files
│   ├── context/           # React context
│   ├── hooks/             # Custom React hooks
│   ├── styles/            # CSS files
│   ├── utils/             # Utility functions
│   ├── data/              # Static data
│   └── server.js          # Express server entry
├── tests/
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   ├── e2e/              # E2E tests
│   ├── mocks/            # Mock data
│   ├── setup/            # Test configuration
│   └── utils/            # Test helpers
├── documents/            # Documentation
├── public/               # Static assets
├── .env                  # Environment variables
├── package.json          # Dependencies & scripts
├── vite.config.js        # Vite configuration
├── vitest.config.js      # Vitest configuration
└── playwright.config.js  # Playwright configuration
```

---

## Quick Reference: All npm Scripts

```bash
# Development
npm run dev                # Frontend only
npm run server            # Backend only
npm run dev:full          # Frontend + Backend (recommended)

# Testing
npm run test              # Watch mode unit tests
npm run test:unit         # Run unit tests once
npm run test:coverage     # Coverage report
npm run test:e2e          # Headless E2E tests
npm run test:e2e:ui       # Interactive E2E tests
npm run test:e2e:report   # View E2E report

# Production
npm run build             # Build frontend
npm start                 # Start backend (production)

# Admin
npm run create-admin      # Create administrator account
```
