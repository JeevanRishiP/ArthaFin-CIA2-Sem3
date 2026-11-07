# ArthaAI — AI-Powered Financial Chatbot

[![Live Deployment](https://img.shields.io/badge/Live%20Demo-arthafin.vercel.app-00dfa2?style=for-the-badge&logo=vercel)](https://arthafin.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-ArthaFin--CIA2--Sem3-blue?style=for-the-badge&logo=github)](https://github.com/JeevanRishiP/ArthaFin-CIA2-Sem3)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

> 🌐 **Live Web Application**: [https://arthafin.vercel.app](https://arthafin.vercel.app)  
> 📦 **GitHub Repository**: [https://github.com/JeevanRishiP/ArthaFin-CIA2-Sem3.git](https://github.com/JeevanRishiP/ArthaFin-CIA2-Sem3.git)  
> 🎓 **Academic Evaluation**: CIA-2 (Semester 3) • Full-Stack AI Engineering Deliverable

---

A production-grade, full-stack AI financial advisory platform built with **TypeScript**, **Node.js**, **Express.js**, **PostgreSQL**, and the **Google Gemini API** (`@google/genai`).

Designed specifically to provide contextual, deterministic guidance on personal budgeting, loan eligibility (FOIR / CIBIL), equity compounding (SIP vs. stocks), emergency funds, and comprehensive financial roadmaps. Intermediate monetary calculations strictly use integer-paise precision to eliminate floating-point rounding errors in Indian Rupee (`₹`) transactions. Fully deployable on both local Dockerized stacks and serverless cloud architectures (Vercel).

---

## Architecture Overview

```
+-----------------------------------------------------------------------------------------+
|                                      ARCHITECTURE                                       |
|                                                                                         |
|   [ Modern Web Interface ] <====== JSON / REST ======> [ Express API (TypeScript) ]     |
|   - Vanilla JS / CSS3 (Port 3020)                      - Controller & History Context   |
|   - Real-time typing animation                         - Static Asset Serving           |
|   - Markdown rendering (₹ format)                               |                       |
|   - Quick action prompt chips                                   |                       |
|                                         +-----------------------+-----------------------+
|                                         |                                               |
|                                         v                                               v
|                        [ PostgreSQL 16 (Port 5435) ]                     [ Google Gemini API ]
|                        - Container: arthafin_postgres                    - SDK: @google/genai
|                        - Database: arthafin_db                           - Model: gemini-3.5-flash-lite
|                        - Tables: users, chat_history                     - System instructions + context
+-----------------------------------------------------------------------------------------+
```

---

## Machine Port Allocation (Zero-Conflict Design)

This project is configured with dedicated ports, containers, volumes, and networks so that it can run simultaneously alongside existing local projects (**DineFlow**, **StuNet**, and **AI WhatsApp Sales Agent**) without conflicts:

| Resource | Value in this Project | Avoided Conflicting Projects |
| :--- | :--- | :--- |
| **Web Server / REST API** | **`3020`** | `3000` (DineFlow), `3001`–`3002` (WhatsApp), `3003`–`3004` (DineFlow), `3010`–`3011` (StuNet) |
| **PostgreSQL Host Port** | **`5435:5432`** | `5432` (WhatsApp), `5433` (DineFlow), `5434` (StuNet) |
| **PostgreSQL Database** | **`arthafin_db`** | `evolution`, `dineflow_dev`, `stunet` |
| **Docker Container** | **`arthafin_postgres`** | `wcos-*`, `dineflow_*`, `stunet_*` |
| **Docker Volume** | **`arthafin_postgres_data`** | `postgres_data`, `stunet_postgres_data`, etc. |
| **Docker Network** | **`arthafin_network`** | `wcos-network`, `stunet_network` |

---

## The Three Core Features

ArthaAI is organized into **totally three core features**:

### 1. Feature 1: Conversational AI Financial Advisory with Integer-Paise Precision
- **Google Gemini 3.5 Flash Engine**: Direct cloud-native integration with Google Gemini (`gemini-3.5-flash-lite`) via the official `@google/genai` SDK.
- **Integer Paise Precision**: Eliminates IEEE-754 floating-point errors by enforcing all calculations in integer paise ($1\text{ Rupee} = 100\text{ paise}$) before rendering formatted Indian Rupees (`₹`).
- **Comprehensive Financial Advisory**: Budgeting (50/30/20 rule), loan eligibility (FOIR / CIBIL / EMI), equity compounding (SIP vs. direct stocks), and emergency fund strategies.
- **Persistent Relational Memory**: Multi-turn conversation sessions saved to PostgreSQL with session switching, conversation reloading, and deletion.

### 2. Feature 2: Real-Time Quantitative Stock Market Analysis & Prediction Engine (`TAEngine`)
- **Algorithmic Technical Analysis**: Institutional indicators computed on Indian indices (Nifty 50 `^NSEI`).
- **Trend & Crossover Detection**: 20 vs 50 SMA crossover identifying Golden Crosses and Death Crosses.
- **Smart Money Concepts (SMC)**:
  - **Break of Structure (BoS)**: Swing high/low breakthrough detection.
  - **Fair Value Gaps (FVG)**: 3-candle imbalance scanning identifying unfilled institutional liquidity voids.
  - **Point of Control (PoC)**: Volume profiling calculating high-liquidity price levels.
- **AI-Powered Synthesis**: Injects quantitative indicators into Google Gemini for forward-looking market sentiment and key level analysis.

### 3. Feature 3: Personal Finance Ledger & Pinterest-Style Dual Authentication
- **Personal Finance Ledger**:
  - Full income and expense tracking with category classification (Investments, Groceries, Housing, Discretionary, etc.).
  - Automated discretionary spending leak detection highlighting high-leak categories (e.g., Food delivery, Entertainment).
  - Interactive SVG Donut / Pie Chart visualizing category expense distributions with percentage breakdowns.
- **Pinterest-Style Intelligent Dual Authentication**:
  - **Real Google OAuth 2.0 Authorization**: Direct authorization against the official Google Accounts service (`https://accounts.google.com/o/oauth2/v2/auth`), completely eliminating any mock or sandbox screens.
  - **Dynamic Email Check Flow**: Checks account existence via `/api/auth/check-email`:
    - *Existing Account*: Reveals password entry for immediate authentication.
    - *New Account*: Automatically guides user to registration with Full Name, password strength meter, and Confirm Password verification.
  - **Production-Grade Security**: Passwords hashed with 12 salt rounds of `bcryptjs`, tamper-proof signed HMAC SHA-256 JWT sessions (7-day validity), and parameterized SQL preventing injection vulnerabilities.

---

## Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v20+)
- [Docker](https://www.docker.com/) & Docker Compose
- Google Gemini API Key

### 2. Environment Configuration
The `.env` file contains project credentials:

```ini
PORT=3020
DB_HOST=localhost
DB_PORT=5435
DB_NAME=arthafin_db
DB_USER=postgres
DB_PASSWORD=postgres
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.5-flash-lite
```

### 3. Spin up PostgreSQL
```bash
docker compose up -d
```

### 4. Initialize & Seed Database
```bash
npm run db:init
npm run db:seed
```

### 5. Build & Start the Application
```bash
# Compile TypeScript
npm run build

# Start production server
npm start

# Or start development server with live reload
npm run dev
```

Visit **http://localhost:3020** in your web browser.

---

## Cloud Deployment (Vercel)

The project is pre-configured for automated serverless deployment on [Vercel](https://vercel.com):

* **Live URL**: [https://arthafin.vercel.app](https://arthafin.vercel.app)
* **Configuration**: `vercel.json` and `api/index.js` automatically bridge the Express app into AWS Lambda / Vercel Serverless Functions.
* **Cloud Resilience**: Even when a persistent PostgreSQL database instance is not connected in the cloud, ArthaAI features built-in in-memory fallback stores and deterministic reasoning engines across all three core modules, guaranteeing zero downtime.
* **Environment Variables in Vercel Dashboard**:
  * `GEMINI_API_KEY`: Your Google Gemini API key from [Google AI Studio](https://aistudio.google.com).
  * `GEMINI_MODEL`: `gemini-3.5-flash-lite`
  * `JWT_SECRET`: A secure random string for signing JWT tokens.
  * `GOOGLE_CLIENT_ID`: (Optional) Your Google Cloud Console Client ID.
  * `GOOGLE_CLIENT_SECRET`: (Optional) Your Google Cloud Console Client Secret.
  * `APP_URL`: `https://arthafin.vercel.app`

### Setting up Real Google OAuth 2.0 (Optional)
To enable one-click Google Sign-in on either localhost or production:
1. Open the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Create an **OAuth 2.0 Client ID** (Web Application).
3. Add Authorized Redirect URIs:
   * Local: `http://localhost:3020/api/auth/google/callback`
   * Production: `https://arthafin.vercel.app/api/auth/google/callback`
4. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in your `.env` (or Vercel Environment Variables).
5. *Note*: Even without Google Cloud Console credentials configured, users can instantly authenticate using the Pinterest-style email + password workflow, secured with 12-round bcrypt hashing and JWT tokens!

---

## API Reference

### 1. Send Message
- **Endpoint**: `POST /api/chat`
- **Request Body**:
  ```json
  {
    "user_id": 1,
    "message": "How should I allocate my ₹60,000 monthly salary using the 50-30-20 rule?"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "user_id": 1,
    "message": "Under the 50-30-20 rule...",
    "user_record": { "id": 1, "role": "user", "message_content": "...", "timestamp": "..." },
    "assistant_record": { "id": 2, "role": "assistant", "message_content": "...", "timestamp": "..." }
  }
  ```

### 2. Fetch Chat History
- **Endpoint**: `GET /api/chat/history/:userId`
- **Response**:
  ```json
  {
    "success": true,
    "history": [ ... ]
  }
  ```

### 3. Health Check
- **Endpoint**: `GET /api/health`
- **Response**:
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-11-06T16:21:56.899Z",
    "service": "AI-Powered Financial Chatbot API"
  }
  ```

---

## Project Deliverable

Detailed academic report structured according to the CIA-2 evaluation guidelines:
- [CIA_2_Project_Report.md](CIA_2_Project_Report.md)

