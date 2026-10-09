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
1. Project Overview
2. Software Requirements  
2.1 Development Environment  
2.2 Frontend Stack  
2.3 Backend Stack  
2.4 Database  
3. Environment Variables   
4. Hardware Requirements
5. Project Setup & Execution  
5.1 Initial Setup  
5.2 Running Development Servers  
5.3 Admin & User Account Setup  
6. Deployment  

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