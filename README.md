# ArthaAI — AI-Powered Financial Chatbot

A production-grade, full-stack AI financial advisory platform built with **TypeScript**, **Node.js**, **Express.js**, **PostgreSQL**, and the **Google Gemini API** (`@google/genai`).

Designed specifically to provide contextual, deterministic guidance on personal budgeting, loan eligibility (FOIR / CIBIL), equity compounding (SIP vs. stocks), emergency funds, and comprehensive financial roadmaps. Intermediate monetary calculations strictly use integer-paise precision to eliminate floating-point rounding errors in Indian Rupee (`₹`) transactions.

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

## Features

- **Apple VisionOS / Gemini / Claude Dark Glass UI**: Deep obsidian `#07090e` canvas with multi-layered atmospheric ambient glow, 28px blur glassmorphism, and a centered conversation stream inspired by Claude and Gemini.
- **Pinterest-Style Intelligent Authentication**:
  - **Continue with Google**: Triggers official Google Accounts OAuth popup (`accounts.google.com`) or account chooser.
  - **Dynamic Email Check**: Input email -> checks database via `/api/auth/check-email`. If account exists, prompts for password to log in; if account does not exist, transitions directly to account creation with password confirmation and strength indicator.
- **Production-Grade Security**: Passwords hashed with `bcryptjs` (12 salt rounds), signed HMAC SHA-256 JWT sessions (7-day validity), parameter-sanitized SQL queries preventing injection attacks, and strict email RFC validation.
- **Google Gemini AI Engine**: Pure Google Gemini API (`gemini-3.5-flash-lite` via `@google/genai`) with zero Ollama dependencies.
- **Relational Chat History**: Multi-turn conversation persistence in PostgreSQL with cascade constraints and query indexes.
- **Context-Aware Responses**: Automatically appends the user's recent dialogue history to prompt payloads for seamless conversational continuity.
- **Paise Precision Guardrails**: Intermediate calculations executed in integer paise ($1\text{ Rupee} = 100\text{ paise}$) before displaying formatted Rupee representations.

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

