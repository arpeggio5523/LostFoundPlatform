# FIT3170 Software Engineering Practice – FY 2026
# 🔍 LostFound MY
## 👥 Team Members

### ⚙️ System Architecture Team

| No. | Name | Email |
| :-- | :--- | :---- |
| 01 | **Ram Kamalesh Borkar** | rbor0012@student.monash.edu |
| 02 | **Joshua Ling Xian Le** | jlin0168@student.monash.edu |
| 03 | **Sham Ganesh Thamarai Kannan** | stha0083@student.monash.edu |
| 04 | **Jaslyn Chan Mun Kuan** | jcha0270@student.monash.edu |

---

### 📋 Product Management Team

| No. | Name | Email |
| :-- | :--- | :---- |
| 01 | **Jeffrey Zhi Qiang Lam Po Yuen** | jlam0070@student.monash.edu |
| 02 | **Chan Tze Ern** | tcha0152@student.monash.edu |
| 03 | **Daphne Chu Yoong Kei** | dchu0036@student.monash.edu|

---

### 🚂 Release Train Engineering (RTE) Team

| No. | Name | Email |
| :-- | :--- | :---- |
| 01 | **Lee Jia Wey** | jlee0482@student.monash.edu |
| 02 | **Chew Min Xuan** | mche0225@student.monash.edu |
| 03 | **Ruchith Kumal Sathkorala** | rsat0014@student.monash.edu |
| 04 | **Melanie Lok Huey Xin** | mlok0007@student.monash.edu |

## 👥 Agile Team Composition

### 1️⃣ Team 1

| No. | Name |
| :-- | :--- |
| 01 | **Daphne Chu Yoong Kei (Product Manager)** |
| 02 | **Joshua Ling Xian Le (System Architect)** |
| 03 | **Sham Ganesh Thamarai Kannan (System Architect)** |
| 04 | **Ruchith Kumal Sathkorala (Release Train Engineering)** |

---

### 2️⃣ Team 2

| No. | Name |
| :-- | :--- |
| 01 | **Chan Tze Ern (Product Manager)** |
| 02 | **Jaslyn Chan Mun Kuan (System Architect)** |
| 03 | **Chew Min Xuan (Release Train Engineering)** |
| 04 | **Melanie Lok Huey Xin (Release Train Engineering)** |

---

### 3️⃣ Team 3

| No. | Name |
| :-- | :--- |
| 01 | **Ram Kamalesh Borkar (System Architect)** |
| 02 | **Jeffrey Zhi Qiang Lam Po Yuen (Product Manager)** |
| 03 |  *Open* |
| 04 | **Lee Jia Wey (Release Train Engineering)**|

## 🏛️ Stakeholders

* **Mentor / Client:** Ms. Shamala Maniam
* **Email:** [shamala.maniam@monash.edu](mailto:shamala.maniam@monash.edu)
* **Organization:** Monash University Malaysia

---

## Table of Contents
**1.0 Introduction**  
**2.0 Software Requirements**  
2.1 Development environment  
2.2 Frontend requirements  
2.3 Backend requirements  
2.4 Database requirements  
2.5 Supporting tools  
2.6 Environment configuration  
**3.0 Hardware Requirements**  
**4.0 Instructions on Project Setup and Execution**  
4.1 Initial Project Setup  
4.2 Development Environment Setup  
4.3 User Setup  
4.4 Testing  
4.4.1 Unit & Integration Testing (Vitest)  
4.4.2 End-to-End Testing (Playwright)  
4.5 Deployment  
**5.0 Versioning Strategy**  
**6.0 Pull Request Strategy**  
**7.0 Additional Notes & Common Issues**  
7.1 Common Setup Issues  
7.2 Recommendations for future developers 

---

## 1.0 Introduction

This document serves as a handover guide for LostFound MY, a centralized web-based platform developed by Blue Peak Solutions. LostFound MY is designed to allow the user to report lost and found items within a specific community such as universities, shopping malls, offices, or residential areas. This platform aims to improve the efficiency of item recovery by enabling users to post detailed listings for lost and found items, search existing reports, and communicate securely with other users. Blue Peak Solutions believe that this platform will benefit individuals and organizations by reducing manual lost-and-found processes, improving transparency and traceability of reported items.

This document provides the essential information required for future developers to understand, set up and maintain the LostFound MY platform. It outlines the requirements of software and hardware that is necessary to run the platform. Besides that, the instructions for setting up the platform and running the platform will be listed. This document also includes additional information and common issues that might be needed to support future developers in maintaining and further developing the system.

---

## 2.0 Software Requirements

### 2.1 Development environment

| Software | Purpose | Version |
| :--- | :--- | :--- |
| VS Code | Code editor used for developing, debugging, and managing the project files | `1.133.0` |`
| Vite | Frontend build tool and local development server | `5.4.21` |

### 2.2 Frontend requirements

| Software | Purpose | Version |
| :--- | :--- | :--- |
| React | JavaScript library used to build the user interface and reusable frontend components | `18.3.1` |
| Tailwind CSS | Utility-first CSS framework used for styling the frontend | `3.4.19` |

### 2.3 Backend requirements

| Software | Purpose | Version |
| :--- | :--- | :--- |
| Node.js | JavaScript runtime used to run the backend server and development tools | `26.0.0` |
| Express.js | Backend web framework used to create API routes and handle HTTP requests | `4.22.2` |

### 2.4 Database requirements

| Software | Purpose | Version |
| :--- | :--- | :--- |
| MongoDB (Atlas) | Cloud-hosted NoSQL database used to store application data such as users, sessions, and lost/found items | Cloud service; project uses mongodb `7.5.0` and mongoose `9.9.1` |

### 2.5 Supporting tools

| Software | Purpose | Version |
| :--- | :--- | :--- |
| GitHub | Version control hosting platform used for source code collaboration and repository management | Web-based platform; local Git version `2.50.1` |

### 2.6 Environment configuration

| Variable | Purpose | Notes |
| :--- | :--- | :--- |
| `MONGO_URI` | MongoDB Atlas connection string | Required for database connection |
| `PORT` | Backend server port | Defaults to 3000 |
| `FRONTEND_URL` | Frontend application URL used by backend services | Defaults to http://localhost:5173 |
| `VITE_API_BASE_URL` | API base URL used by the React frontend | Used to connect frontend to backend |
| `VITE_PUBLIC_APP_URL` | Public frontend URL used for QR code links | Falls back to browser origin |
| `JWT_SECRET` | General JWT secret key | Used as fallback auth secret |
| `JWT_ACCESS_SECRET` | Secret key for access tokens | Optional if JWT_SECRET is used |
| `JWT_REFRESH_SECRET` | Secret key for refresh tokens | Optional if JWT_SECRET is used |
| `JWT_EXPIRES_IN` | JWT expiry duration | Defaults to 7d |
| `JWT_ACCESS_EXPIRES_IN` | Access token expiry duration | Defaults to project setting |
| `JWT_REFRESH_EXPIRES_DAYS` | Refresh token expiry duration in days | Used for refresh session lifetime |
| `REFRESH_TOKEN_COOKIE_NAME` | Name of the refresh token cookie | Defaults to project setting |
| `REFRESH_TOKEN_COOKIE_SECURE` | Controls whether refresh cookie is HTTPS-only | Usually true in production |
| `REFRESH_TOKEN_COOKIE_SAME_SITE` | SameSite policy for refresh cookie | Defaults to lax |
| `REFRESH_TOKEN_COOKIE_PATH` | Cookie path for refresh token | Defaults to /api/auth |
| `REFRESH_TOKEN_COOKIE_DOMAIN` | Cookie domain for refresh token | Optional |
| `SMTP_HOST` | SMTP email server host | Required for production email |
| `SMTP_PORT` | SMTP email server port | Required for production email |
| `SMTP_USER` | SMTP account username | Required for production email |
| `SMTP_PASS` | SMTP account password | Required for production email |
| `SMTP_FROM` | Sender email address | Required for verification emails |
| `API_BASE_URL` | Backend API base URL used in email links | Falls back to deployed/render URL or localhost |
| `RENDER_EXTERNAL_URL` | Render deployment URL | Used as fallback in deployment |
| `EMAIL_VERIFY_TOKEN_EXPIRES_MINUTES` | Email verification token expiry duration | Optional; project has default behavior |
| `ADMIN_EMAIL` | Admin account email | Used by admin creation script |
| `ADMIN_FULL_NAME` | Admin account full name | Used by admin creation script |
| `ADMIN_PASSWORD` | Admin account password | Used by admin creation script |
| `VITE_MAPBOX_TOKEN` | Mapbox API Token | Used to access location information and map |  
|`LARA_ACCESS_KEY_ID` |  LARA service authentication access key ID | Required for authenticating requests to LARA API services |  
|`LARA_ACCESS_KEY_SECRET` | LARA service authentication access key secret | Required for signing and verifying authorisation requests to LARA API services |

---

## 3.0 Hardware Requirements

The hardware requirements provide sufficient processing power and resources to develop, run, and test the LostFound MY platform efficiently. They support the simultaneous operation of the web application, backend server, database, browser, and development tools while maintaining stable performance. Additional devices may also improve access to features such as photo uploads, QR-code scanning, and label printing.

| Category | Hardware | Minimum Requirement | Recommended Requirement | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Required** | Processor | 64-bit dual-core processor | Quad-core processor or better | Runs the frontend, backend, database, and development tools |
| | RAM | 4 GB | 8 GB or more | Supports Node.js, MongoDB, the browser, and Docker |
| | Storage | At least 2 GB of free storage | 5 GB or more free space | Stores source code, dependencies, Docker images, and database data |
| | Internet Connection | Stable internet connection | Broadband connection | Downloads packages and accesses MongoDB Atlas, external images, and email services |
| | Display | $1280 \times 720$ resolution | $1920 \times 1080$ resolution or higher | Displays and tests the web interface |
| | Keyboard | Standard keyboard | Any comfortable keyboard | Enters commands, form data and source code |
| **Optional** | Mouse/Trackpad | Standard mouse or trackpad | Any comfortable pointing device | Navigates the application and development tools |
| | Smartphone with camera | Any device capable of taking photos and scanning QR codes | Modern Android or iOS smartphone | Captures item photos, tests the mobile interface and scan QR codes |
| | Printer | Any compatible printer | Colour printer | Prints QR-code labels if physical labels are needed |

---

## 4.0 Instructions on project setup and execution

### 4.1 Initial Project Setup

This section is for new developers to set up the project, configure environment variables and install necessary dependencies before any extension or updates made to the current project.

#### Step 1: Clone the Repository
The repository can be found on gitlab with the given http.
Developers can paste the exact command on the terminal in an IDE.

```bash
git clone https://git.infotech.monash.edu/fit3170_project1_2026/fit3170_project1.git
cd fit3170_project1
```

#### Step 2: Install Dependencies
The required dependencies will be installed after running the below command.

```bash
npm install
```

#### Step 3: Configure Environment Variables
The environment variables for database and server are fixed. But for email, developers can fill in with their own email and password. JWT variables will only require a random string currently.

Create a `.env` file in the project root:

```env
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

#### Step 4: Verify MongoDB Connection

```bash
npm run server
```
Visit: `http://localhost:3000/api/test-mongo`  
Should return JSON with test user data.

---

### 4.2 Development Environment Setup

To actually run and see the actual website, developers can either choose option A to run the whole program at one go, or run option B and option C separately on two terminals.

#### Option A: Full Stack Development (Recommended)
Run both frontend and backend with hot reload:

```bash
npm run dev:full
```

This starts:
- **Frontend (Vite)**: http://localhost:5173/
- **Backend (Express)**: http://localhost:3000/
- **Hot reload**: Changes auto-update without restarting

#### Option B: Frontend Only

```bash
npm run dev
```
Access at http://localhost:5173/

#### Option C: Backend Only

```bash
npm run server
```
Access at http://localhost:3000/

---

### 4.3 User Setup

The project has role user and role admin. To allow someone to be an admin, we need to create an admin account by setting the name, email and password. As to test if actual users can run everything perfectly, developers can create test users via UI.

#### Create an Admin Account
> **Important:** Only administrators can access the analytics dashboard.

**In PowerShell (Windows):**

```powershell
$env:ADMIN_FULL_NAME="Platform Administrator"
$env:ADMIN_EMAIL="admin@example.com"
$env:ADMIN_PASSWORD="ReplaceWithAStrongPassword!1"
npm run create-admin
Remove-Item Env:ADMIN_FULL_NAME, Env:ADMIN_EMAIL, Env:ADMIN_PASSWORD
```

**In Bash (Linux/Mac):**

```bash
export ADMIN_FULL_NAME="Platform Administrator"
export ADMIN_EMAIL="admin@example.com"
export ADMIN_PASSWORD="ReplaceWithAStrongPassword!1"
npm run create-admin
unset ADMIN_FULL_NAME ADMIN_EMAIL ADMIN_PASSWORD
```

#### Create Test Users (Via UI)
1. Start the app: `npm run dev:full`
2. Navigate to http://localhost:5173/signup
3. Sign up with different roles (Student, Staff, etc.)

---

### 4.4 Testing

The project uses two testing frameworks, developers can refer to the structures below to extend extra testing scripts. The testing is splitted to unit and integration testing, where it is more on feature testing and integration testing where frontend works with backend. For end-to-end testing, developers are able to test the run of a website, mimicking an actual user accessing it.

#### 4.4.1 Unit & Integration Testing (Vitest)

Run all tests (once):
```bash
npm run test:unit
```

Run specific test file (for example for analyticsController test script):
```bash
npx vitest run tests/unit/controllers/analyticsController.test.js
```

Generate coverage report:
```bash
npm run test:coverage
```

**Test Structure:**
```text
tests/
├── unit/                   # Component, hook, controller, model, utility tests
│   ├── components/
│   ├── controllers/
│   ├── hooks/
│   ├── models/
│   └── utils/
├── integration/            # API route tests
│   └── routes/
└── setup/                  # Test configuration
```

> **Important:** Test files must be named with `.test.js` or `.spec.js` extension to be recognized.

**Example test file location:**
- Unit test: `tests/unit/controllers/analyticsController.test.js`
- Integration test: `tests/integration/routes/analyticsRoutes.test.js`

#### 4.4.2 End-to-End Testing (Playwright)

Run E2E tests (headless):
```bash
npm run test:e2e
```

Run E2E tests with interactive UI (recommended):
```bash
npm run test:e2e:ui
```
This opens an interactive browser where you can:
- See all tests in the left panel
- Click on any test to run it
- Watch the browser perform actions in real-time
- Debug failures with screenshots

View E2E test report:
```bash
npm run test:e2e:report
```

**Test Structure:**
```text
tests/
└── e2e/
    ├── analytics.spec.js   # Analytics dashboard tests
    ├── auth.spec.js        # Authentication flow tests
    └── items.spec.js       # Item listing/creation tests
```

---

### 4.6 Deployment

The current project uses Render as deployment. Developers can choose to deploy it on Docker using the below command to build docker image and container.

#### Using Docker (Optional)

Build Docker image:
```bash
docker build -t fit3170-app .
```

Run Docker container:
```bash
docker run -p 3000:3000 --env-file .env fit3170-app
```

Using Docker Compose:
```bash
docker-compose up
```

#### Using Render.yaml (Configured in Project)

The project includes `render.yaml` for deployment to Render.com:
1. Push code to GitHub
2. Connect repository to Render.com
3. Render auto-deploys on every push to `main`

---

## 5. Versioning Strategy
LostFoundMY will follow Semantic Versioning (SemVer) for future stable releases, using the format `MAJOR.MINOR.PATCH` (e.g., `1.2.3`)
- **MAJOR:** Incremented when a release introduces incompatible changes that may affect existing functionality or integrations.
- **MINOR:** Incremented when new features are introduced in a backward-compatible manner.
- **PATCH:** Incremented when backward-compatible bug fixes or minor improvements are released.

---

## 6. Pull Request Strategy  
Merge Requests (MRs) are used to review, test, and approve code changes before they are merged into the protected `main` branch. This process helps maintain code quality, prevent conflicts, and ensure that changes meet the project's requirements.

Contributors must follow these steps when submitting changes:  

**1. Create a Branch**  
Create a separate branch from the appropriate base branch for each new feature or bug fix. Follow the project's branch naming conventions, such as `main/Subteam1/Subteam1Member1`.  

**2. Implement and Test Changes**  
Make the neccessary changes and run relevant unit, integration or end-to-end tests to verify that the implementation works as expected.  

**3. Commit and Push Changes**  
Commit changes using clear and descriptive commit messages, following the project's commit conventions (e.g., `feat:`, `fix:`, `docs:`, and `test:`). Push the branch to GitLab.  

**4. Create a Merge Request**  
Open a merge request in GitLab targeting the appropriate subteam branch or the protected `main` branch. The MR should contain a clear title and a description of the changes.

**5. Provide Required Information**  
Each merge request must include:
- An implementation summary explaining what changed and why
- The related user story, issue or development task
- Relevant engineering decisions and trade-offs, where applicable
- Test performed and their results
- Known limitations or outstanding issues, where applicable
- Updated documentation, if necessary

**6. Code Review**
At least 1 team member must review and approve the merge request before changes are merged into `main`. Contributors must address reviewer comments and resolve any merge conflicts before merging. 

**7. Verify CI/CD Checks**  
All applicable automated checks in the GitLab CI/CD pipeline must pass before merging. Any failed checks must be investigated and resolved. 

**8. Merge and Clean Up**  
Once the merge request has been approved and all requirements are satisfied, merge the changes into the target branch. Delete the merged feature branch unless it is intentionally retained for an agreed reason.  

Each merge request should represent 1 coherent feature, bug fix, or development task. Unrelated changes should be submitted through separate merge requests to make code review and maintenance easier. 

---

## 7.0 Additional Notes & Common Issues

### 7.1 Common Setup Issues

While setting up and running LostFound MY, several recurring issues came up that are worth flagging for future developers. Most of these are environment or configuration-related rather than bugs in the application logic itself, and knowing about them in advance should save significant debugging time.

| Common issues | Description |
| :--- | :--- |
| **MongoDB Atlas cluster pausing** | The project uses MongoDB Atlas's free tier, which automatically pauses the cluster after a period of inactivity. This causes both local development and the live deployed site to lose database connectivity. Check the Atlas dashboard and manually resume the cluster before assuming it's a code issue. |
| **Stale or incorrect MONGO_URI** | Connection failures can also result from an outdated connection string, an unescaped special character in the database password, or the developer's current IP address not being whitelisted under Atlas's Network Access settings. |
| **Port conflicts** | `npm run dev:full` will fail to start if port 3000 (backend) or port 5173 (frontend) is already in use, often due to a process left running from a previous session. Close the conflicting process before troubleshooting further. |
| **Missing .env file** | Since `.env` is excluded from version control, new developers must create it manually using the variable reference in Section 2.6. Without it, the app will fail to start or behave unpredictably. |
| **Missing VITE_MAPBOX_TOKEN** | The map feature fails silently (no error is thrown, the map simply doesn't render) if this token isn't set. |
| **Admin account environment variables not cleared** | Forgetting to unset `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_FULL_NAME` after running `npm run create-admin` can cause confusion or duplicate admin creation attempts later. |
| **Render environment variables** | Environment variables must be set separately in the Render dashboard, since deployment does not read from the local `.env` file. |
| **Cold starts on Render's free tier** | The live backend spins down after inactivity, causing a slower response on the first request afterward; expected behavior on the free tier, not a fault. |

---

### 7.2 Recommendations for future developers

1. Keep a shared, sanitised `.env.example` file in the repository (with placeholder values only) so new developers can see every required variable without hunting through section 2.6.
2. When debugging authentication issues, check both the JWT secrets and the refresh token cookie settings together since most login/session bugs trace back to one of these 2 areas.
3. Consider adding a `.env.test` or separate test MongoDB URI to isolate automated test runs from development data.
4. Before assuming a bug is in application logic, rule out the Atlas cluster pause and Render cold start behaviors first, since both present as generic "request failed" or timeout errors.
5. Render has a free tier deployment which has an inactivity limit of 15 minutes, hence after 15 minutes of inactivity, the instance of the app will be shut down and later restarted for use which causes unwanted delays. Hence to overcome this a developer can set up a CRON job using [https://cron-job.org/en/](https://cron-job.org/en/) to poll the backend API every 10 minutes as a health check and keep it alive, preventing cold-restarts.