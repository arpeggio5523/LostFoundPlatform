# FIT3170 Software Engineering Practice – FY 2026

# 🔍 LostFound MY
> **A Centralized Web-Based Platform for Community Lost & Found Management.**

---

## 👥 Team Members

---
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

## Table of Contents
[1. Project Overview](#1-project-overview)  
[2. Software Requirements](#2-software-requirements)  
&emsp;[2.1 Development Environment](#21-development-environment)  
&emsp;[2.2 Frontend Stack](#22-frontend-stack)  
&emsp;[2.3 Backend Stack](#23-backend-stack)  
&emsp;[2.4 Database](#24-database)  
[3. Environment Variables](#3-environment-variables)   
[4. Hardware Requirements](#4-hardware-requirements)  
5. Project Setup & Execution  
5.1 Initial Setup  
5.2 Running Development Servers  
5.3 Admin & User Account Setup  
6. Deployment  
[7. Versioning Strategy](#7-versioning-strategy)
[8. Pull Request Strategy](#8-pull-request-strategy)

## 1. Project Overview
**LostFound MY** is a centralized platform designed to streamline the reporting and recovery of lost items within specific communities such as universities, shopping malls, and residential areas. 

## 2. Software Requirements
### 2.1 Development Environment
| Software | Purpose | Version |  
| :--- | :--- | :--- |  
| VS Code | Code editor used for development and debugging | `1.133.0` |  
| Vite | Frontend build tool and local development server | `5.4.21` |  
| Git | Version control system | `2.50.1` |

### 2.2 Frontend Stack
| Software | Purpose | Version |  
| :--- | :--- | :--- |  
| React | Component-based UI library | `18.3.1` |  
| Tailwind CSS | Utility-first CSS framework | `3.4.19` |  

### 2.3 Backend Stack
| Software | Purpose | Version |  
| :--- | :--- | :--- | 
| Node.js | JavaScript runtime environment | `26.0.0` |  
| Express.js | Backend web framework for REST APIs | `4.22.2` |

### 2.4 Database
| Software | Purpose | Version |  
| :--- | :--- | :--- | 
| MongoDB Atlas | Cloud NoSQL database | Compatibility: `mongodb 7.5.0` / `mongoose 9.9.1` |

## 3. Environment Variables 
| Variable | Description | 
| :--- | :--- | 
| `MONGO_URI` | MongoDB Atlas connection string | 
| `PORT` | Backend port (default: `3000`) | 
| `FRONTEND_URL` | Frontend application URL used by backend services (default: `http://localhost:5173`) |  
| `VITE_API_BASE_URL` | API base URL used by the React frontend | 
| `VITE_PUBLIC_APP_URL` | Public frontend URL used for QR code links |  
| `JWT_SECRET` | General JWT secret key |  
| `JWT_ACCESS_SECRET` | Secret key for access tokens | 
| `JWT_REFRESH_SECRET` | Secret key for refresh tokens | 
| `JWT_EXPIRES_IN` | JWT expiry duration | 
| `JWT_ACCESS_EXPIRES_IN` | Access token expiry duration |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry duration in days |  
| `REFRESH_TOKEN_COOKIE_NAME` | Name of the refresh token cookie | 
|`REFRESH_TOKEN_COOKIE_SECURE` | Controls whether refresh cookie is HTTPS-only |
| `REFRESH_TOKEN_SAME_SITE` | SameSite policy for refresh cookie |
| `REFRESH_TOKEN_PATH` | Cookie path for refresh token |  
| `REFRESH_TOKEN_DOMAIN` | Cookie domain for refresh token |  
| `SMTP_HOST` | SMTP email server host |  
| `SMTP_PORT` | SMTP email server port |  
| `SMTP_USER` | SMTP account username |  
| `SMTP_PASS` | SMTP account password |  
| `SMTP_FROM` | Sender email address |  
| `API_BASE_URL` | Backend API base URL used in email links |  
| `RENDER_EXTERNAL_URL` | Render deployment URL |  
| `EMAIL_VERIFY_TOKEN_EXPIRES_MINUTES` | Email verification token expiry duration |
| `ADMIN_EMAIL` | Admin account email |  
| `ADMIN_FULL_NAME` | Admin account full name | 
| `ADMIN_PASSWORD` | Admin account password |  
| `VITE_MAPBOX_TOKEN` | Mapbox API token |

## 4. Hardware Requirements
The hardware requirements provide sufficient processing power and resources to develop, run, and test the LostFound MY platform efficiently. They support the simultaneous operation of the web application, backend server, database, browser, and development tools while maintaining stable performance. Additional devices may also improve access to features such as photo uploads, QR-code scanning, and label printing.
| Resource | Minimum Requirement | Recommended Requirement | Operational Purpose |
| :--- | :--- | :--- | :---|
| **Proccesor** | 64-bit Dual-Core 2.0GHz | Quad-Core 3.0GHz | Runs compilers, API servers, and test suits |  
| **RAM** | 4GB RAM | 8GB - 16GB RAM | Supports Node runtime, browser dev tools, and Docker |  
| **Storage** | 2GB available space | 5GB+ available space | Stores `node_modules`, test assets and log buffers |  
| **Peripherals** | 1280 x 720 resolution | 1920 x 1080 resolution or higher | Supports application development, debugging, and UI testing

### 7. Versioning Strategy
LostFoundMY will follow Semantic Versioning (SemVer) for future stable releases, using the format `MAJOR.MINOR.PATCH` (e.g., `1.2.3`)
- **MAJOR:** Incremented when a release introduces incompatible changes that may affect existing functionality or integrations.
- **MINOR:** Incremented when new features are introduced in a backward-compatible manner.
- **PATCH:** Incremented when backward-compatible bug fixes or minor improvements are released.

### 8. Pull Request Strategy  
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