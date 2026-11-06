# CIA 2 Project Report: AI-Powered Financial Chatbot (ArthaAI)

---

## Project Title
**AI-Powered Financial Chatbot (ArthaAI)**

---

## 1. Introduction
In today's fast-paced economic landscape, personal financial literacy and wealth planning remain significant hurdles for millions of households. Many individuals struggle with fundamental financial decisions, such as budgeting monthly earnings, calculating debt obligations, understanding loan eligibility rules, choosing between diverse investment vehicles, analyzing market trends, or auditing their monthly personal expenditures. Traditional financial consultancy is frequently expensive, fragmented, or inaccessible to young professionals, students, and everyday retail earners.

Conversational Artificial Intelligence combined with quantitative financial engineering provides a transformative mechanism to bridge this divide. By deploying an intelligent, cloud-native conversational agent powered by Google's state-of-the-art **Gemini API** (`gemini-3.5-flash-lite`), the **AI-Powered Financial Chatbot (ArthaAI)** addresses real-world personal finance challenges. The system translates complex financial terminology into straightforward, actionable insights. By incorporating domain-specific safeguards—such as integer-paise arithmetic to eliminate IEEE-754 floating-point inaccuracies in Indian Rupee transactions—the application guarantees reliable, deterministic, and educational financial advice around the clock.

---

## 2. How AI is Used
The application architecture integrates cloud-native Generative AI and Natural Language Processing (NLP) powered by the official **Google Gemini API** (`@google/genai` SDK and Gemini REST API v1beta with the high-performance `gemini-3.5-flash-lite` model).

```
+-----------------------------------------------------------------------------------------+
|                                ARTHA-AI ARCHITECTURE FLOW                               |
|                                                                                         |
|  [ Apple VisionOS Glass UI ] <===== JSON / REST =====> [ Node.js Express (TypeScript) ] |
|            |                                                   |                        |
|            | User Query & Session ID                           | Relational Persistence |
|            v                                                   v                        |
|  [ Multi-Session View ]                                  [ PostgreSQL DB ]              |
|  - 1. AI Chatbot View                                    - users table                  |
|  - 2. Stock Market View                                  - chat_history table           |
|  - 3. Personal Finance View                              - finance_transactions table   |
|            ^                                                   |                        |
|            |                                                   |                        |
|            +================ Assistant Response ===============+                        |
|                                     ^                                                   |
|                                     | @google/genai & fetch()                           |
|                                     v                                                   |
|                         [ Google Gemini 3.5 Flash ]                                     |
|                         (Paise Guardrails + Multi-Turn Context)                         |
+-----------------------------------------------------------------------------------------+
```

### Key AI Integration Aspects:
1. **Natural Language Understanding (NLU) & Intent Classification:**
   - The user inputs arbitrary conversational text (e.g., *"How much should I set aside from my salary for an emergency fund?"* or *"Analyze my monthly spending leaks"*).
   - Gemini models parse user intent, extract quantitative parameters (salary figures, debt ratios, loan horizons, tickers), and classify the request into core domains: budgeting, debt management, equity investments, risk hedging, or retirement planning.

2. **System Prompt Conditioning & Domain Framing:**
   - Every inference request incorporates a strict financial persona and boundary constraint:
     > *"You are an intelligent financial chatbot. Answer questions about budgeting, savings, loans, investments, and financial planning clearly and concisely. When representing Indian currency internally or in examples, calculate values in integer paise to avoid floating-point errors, but display the final output in standard Rupee format to the user."*
   - This ensures the model delivers culturally contextualized guidance (incorporating Indian financial instruments such as SIPs, Nifty 50, CIBIL, FOIR, FD, and PPF) while calculating in integer paise.

3. **Multi-Turn Contextual Awareness & Session Threading:**
   - The backend controller queries previous dialogue turns from PostgreSQL and prepends recent context to the Gemini payload. This maintains conversational coherence across multi-turn interactions and separate consultation threads.

4. **Paise Precision Guardrails:**
   - All internal arithmetic is governed by integer paise calculations ($1\text{ Rupee} = 100\text{ paise}$) to completely prevent IEEE-754 floating-point rounding errors (such as `0.1 + 0.2 = 0.30000000000000004`), displaying the final result in clean standard Indian Rupee format (`₹`).

---

## 3. The Three Flagship Features of ArthaAI

The application is architected around **totally three core features**, providing an end-to-end financial intelligence ecosystem:

```
+----------------------------------------------------------------------------------------------------+
|                                    TOTALLY THREE CORE FEATURES                                     |
+----------------------------------------------------------------------------------------------------+
| Feature 1: AI Financial Chatbot                                                                    |
| • Google Gemini 3.5 Flash LLM Integration with integer-paise precision arithmetic                  |
| • Multi-turn session isolation, persistent PostgreSQL history, and quick-prompt chips              |
+----------------------------------------------------------------------------------------------------+
| Feature 2: Stock Market Quantitative Engine (TAEngine)                                             |
| • Real-time quantitative technical analysis on Indian market indices (Nifty 50 ^NSEI)               |
| • 20 vs 50 SMA crossover trend detection, Break of Structure (BoS), Fair Value Gaps (FVGs), & PoC |
+----------------------------------------------------------------------------------------------------+
| Feature 3: Personal Finance Ledger & Pinterest-Style Dual Authentication                           |
| • Expense ledger, monthly income tracking, discretionary leak detection, interactive donut chart   |
| • Real Google OAuth 2.0 (accounts.google.com) + Dynamic email check with 12-round bcrypt & JWT     |
+----------------------------------------------------------------------------------------------------+
```

### Feature 1: Conversational AI Financial Advisory with Integer-Paise Precision
- **LLM Backbone**: Direct cloud-native integration with Google Gemini (`gemini-3.5-flash-lite`) via the official `@google/genai` SDK.
- **Paise Computational Integrity**: Solves IEEE-754 floating-point errors by enforcing all calculations in integer paise before formatting into Indian Rupees (`₹`).
- **Comprehensive Financial Coverage**: Specializes in 50/30/20 budget allocations, loan eligibility thresholds (FOIR, EMI formulas), CIBIL score optimization, and compounding wealth creation via SIPs.
- **Relational Chat Persistence**: Multi-session conversation management stored in PostgreSQL (`users` and `chat_history` tables), supporting full history reloading, session deletion, and cross-thread isolation.

### Feature 2: Real-Time Quantitative Stock Market Analysis & Prediction Engine (`TAEngine`)
- **Institutional Technical Analysis**: Algorithmic technical analysis engine (`src/services/taEngine.ts`) tracking Indian indices (Nifty 50 `^NSEI`).
- **Trend & Crossover Detection**: Computes 20-period and 50-period Simple Moving Averages (SMA) to identify Golden Crosses (Bullish) and Death Crosses (Bearish).
- **Smart Money Concepts (SMC)**:
  - **Break of Structure (BoS)**: Tracks recent swing highs and swing lows to detect institutional trend continuation or reversal breaks.
  - **Fair Value Gaps (FVGs)**: Algorithmic 3-candle imbalance scanning identifying unfilled liquidity voids.
  - **Point of Control (PoC)**: Volume profiling calculating price levels with highest trading concentration.
- **AI-Powered Synthesis**: Injects quantitative indicators into Google Gemini to generate forward-looking market sentiment and key support/resistance zones.

### Feature 3: Personal Finance & Wealth Ledger + Pinterest-Style Dual Security Authentication
- **Personal Financial Ledger**:
  - Complete income and expense transaction manager with category classification (Housing, Investments, Groceries, Discretionary, etc.).
  - Automated discretionary spending leak detection highlighting high-leak categories (e.g., Food delivery, Entertainment).
  - Interactive SVG Donut / Pie Chart visualizing category expense distributions with percentage breakdowns.
- **Pinterest-Style Intelligent Authentication**:
  - **Real Google OAuth 2.0 Authorization**: Direct authorization against the official Google Accounts service (`https://accounts.google.com/o/oauth2/v2/auth`), completely eliminating any mock or sandbox screens. Exchanges authorization codes via `oauth2.googleapis.com` for verified profile tokens.
  - **Dynamic Email Check Flow**: The user enters their email address; the backend checks account existence via `/api/auth/check-email`:
    - *Existing Account*: Reveals password entry for immediate authentication.
    - *New Account*: Automatically guides the user to account registration with Full Name, password strength meter, and Confirm Password validation.
  - **Production-Grade Security**: Passwords hashed with 12 salt rounds of `bcryptjs`, tamper-proof signed HMAC SHA-256 JWT sessions (7-day validity), parameter-sanitized SQL preventing injection vulnerabilities, and RFC 5322 email validation.

---

## 4. User Interface: Apple VisionOS Glass Design
- **Obsidian Dark Canvas**: Deep dark theme (`#07090e`) with multi-layered atmospheric ambient light meshes (cyan, violet, emerald).
- **Specular Glassmorphism**: Translucent frosted panels with 28px backdrop blur (`backdrop-filter: blur(28px) saturate(190%)`) and polished border highlights.
- **Unified 3-System Navigation**: Dedicated top and sidebar navigation tabs seamlessly switching between the three core features without full page reloads.
- **Floating Apple Glass Prompt Island**: Ergonomic prompt input bar with auto-growing textarea and keyboard dispatch (`Enter` to submit, `Shift+Enter` for multiline).

---

## 5. Machine Port Allocation (Zero-Conflict Design)
The project is configured with dedicated ports, Docker containers, volumes, and networks to run simultaneously alongside existing local projects without conflicts:

| Resource | Value in ArthaAI | Avoided Conflicting Local Projects |
| :--- | :--- | :--- |
| **Web Server / REST API** | **`3020`** | `3000` (DineFlow), `3001`–`3002` (AI WhatsApp), `3003`–`3004` (DineFlow), `3010`–`3011` (StuNet) |
| **PostgreSQL Host Port** | **`5435:5432`** | `5432` (AI WhatsApp), `5433` (DineFlow), `5434` (StuNet) |
| **PostgreSQL Database** | **`arthafin_db`** | `evolution`, `dineflow_dev`, `stunet` |
| **Docker Container** | **`arthafin_postgres`** | `wcos-*`, `dineflow_*`, `stunet_*` |
| **Docker Volume** | **`arthafin_postgres_data`** | `postgres_data`, `stunet_postgres_data`, etc. |
| **Docker Network** | **`arthafin_network`** | `wcos-network`, `stunet_network` |

---

## 6. Technical Specifications & Architecture Summary

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Language** | TypeScript 5.x | End-to-end static type safety and compilation |
| **Runtime** | Node.js (v20+ ESNext) | High-performance asynchronous event-driven I/O |
| **Server Framework** | Express.js 5.x | REST API routing, CORS handling, static asset serving |
| **Database** | PostgreSQL 16+ | Relational data persistence, indexed chat history (Port 5435, Container: `arthafin_postgres`) |
| **DB Client** | `pg` (node-postgres) | Connection pooling and parameterized query execution (`arthafin_db`) |
| **LLM Inference** | Google Gemini API | Cloud-native natural language processing via `@google/genai` & REST API (`gemini-3.5-flash-lite`) |
| **Authentication** | Google OAuth 2.0 + JWT + Bcrypt | Official Google authorization (`accounts.google.com`) + 12-round bcrypt hashing |
| **Frontend** | HTML5 / CSS3 / Vanilla JS | Apple VisionOS glassmorphism responsive dark UI (Port 3020) |

---

## 7. Conclusion
The **AI-Powered Financial Chatbot (ArthaAI)** demonstrates the convergence of modern web technologies, relational persistence, quantitative market intelligence, and state-of-the-art Generative AI. By organizing the system into **totally three core features**—Conversational AI Financial Advisory, Stock Market Quantitative Engine, and Personal Finance Ledger with Pinterest-Style Security—the platform provides an accessible, robust, and highly secure personal wealth copilot.
