# CIA 2 Project Report: AI-Powered Financial Chatbot

---

## Project Title
**AI-Powered Financial Chatbot (ArthaAI)**

---

## 1. Introduction
In today's fast-paced economic landscape, personal financial literacy and wealth planning remain significant hurdles for millions of households. Many individuals struggle with fundamental financial decisions, such as budgeting monthly earnings, calculating debt obligations, understanding loan eligibility rules, choosing between diverse investment vehicles, or building emergency safety nets. Traditional financial consultancy is frequently expensive, fragmented, or inaccessible to young professionals, students, and everyday retail earners.

Conversational Artificial Intelligence provides a transformative mechanism to bridge this divide. By deploying an intelligent, zero-cost, locally hosted conversational agent, the **AI-Powered Financial Chatbot** addresses real-world personal finance challenges. The system translates complex financial terminology into straightforward, actionable insights. By incorporating domain-specific safeguards—such as integer-paise arithmetic to eliminate IEEE-754 floating-point inaccuracies in Indian Rupee transactions—the application guarantees reliable, deterministic, and educational financial advice around the clock.

---

## 2. How AI is Used
The chatbot architecture integrates Natural Language Processing (NLP) powered by **Google Gemini API** (`@google/genai` SDK and Gemini REST API v1beta with models like `gemini-2.5-flash`).

```
+-----------------------------------------------------------------------------------+
|                                 APPLICATION FLOW                                  |
|                                                                                   |
|  [ Modern Web UI ] <==== JSON / REST ====> [ Node.js + Express (TypeScript) ]     |
|         |                                                   |                     |
|         | User Prompt & ID                                  | Database Storage    |
|         v                                                   v                     |
|  [ Chat Messages ]                                   [ PostgreSQL DB ]            |
|         ^                                           (users & chat_history)        |
|         |                                                   |                     |
|         +================ Assistant Response ===============+                     |
|                                     ^                                             |
|                                     | @google/genai & fetch()                     |
|                                     v                                             |
|                     [ Google Gemini API Engine ]                                  |
|                     (System Prompt + Conversational Context)                      |
+-----------------------------------------------------------------------------------+
```

### Key AI Integration Aspects:
1. **Natural Language Understanding (NLU) & Intent Recognition:**
   - The user inputs arbitrary conversational text (e.g., *"How much should I set aside from my salary for an emergency fund?"*).
   - Gemini models parse user intent, extract quantitative parameters (salary figures, debt ratios, loan horizons), and classify the request into core domains: budgeting, debt management, equity investments, risk hedging, or retirement planning.

2. **System Prompt Conditioning & Domain Framing:**
   - Every inference request incorporates a strict financial persona and boundary constraint:
     > *"You are an intelligent financial chatbot. Answer questions about budgeting, savings, loans, investments, and financial planning clearly and concisely. When representing Indian currency internally or in examples, calculate values in integer paise to avoid floating-point errors, but display the final output in standard Rupee format to the user."*
   - This ensures the model delivers culturally contextualized guidance (incorporating Indian financial instruments such as SIPs, Nifty 50, CIBIL, FOIR, FD, and PPF) while calculating in integer paise.

3. **Multi-Turn Contextual Awareness:**
   - The backend controller queries previous dialogue turns from PostgreSQL and prepends recent context to the Gemini payload. This maintains conversational coherence across multi-turn interactions.

4. **Zero-Cloud Data Privacy (Local Execution):**
   - By running on a local Ollama instance rather than proprietary cloud APIs, sensitive financial data (income figures, net worth queries, loan details) never leaves the host machine, guaranteeing privacy and regulatory compliance.

---

## 3. Features & Functionality

### 3.1 Intuitive & Responsive User Interface
- **Apple VisionOS / Gemini / Claude Dark Glass Design:** Deep obsidian canvas (`#07090e`) with multi-layered atmospheric ambient lights (cyan, violet, emerald), frosted glass panels with 28px blur and specular reflections (`backdrop-filter: blur(28px) saturate(190%)`), and centered conversation flows modeled after Gemini and Claude.
- **Floating Apple Glass Prompt Island:** Ergonomic pill-shaped island floating above the bottom viewport with seamless auto-growing textarea, instant keyboard dispatch (`Enter` to submit, `Shift+Enter` for multiline), and live token state indicators.
- **Pinterest-Style Intelligent Authentication Modal:**
  - **Continue with Google:** One-click OAuth popup that launches the official Google Accounts authentication page (`accounts.google.com`) or account selector, exchanging secure tokens and auto-syncing profiles.
  - **Pinterest-Style Email Flow:** Enter email first. The system instantly verifies if the account exists via `/api/auth/check-email`.
    - If registered: Smoothly reveals password input for immediate login.
    - If unregistered: Transitions to an account creation screen with Full Name, Password Strength meter, and Confirm Password verification.
  - **Production Security Standard:** 12-round `bcryptjs` password hashing, signed HMAC SHA-256 JWT sessions, parameterized queries protecting against SQL injection, and RFC-compliant email normalization.

### 3.2 Relational Chat Persistence (PostgreSQL)
- **Strict Normalized Schema:**
  - `users`: Stores user identity, display names, and creation timestamps.
  - `chat_history`: Stores foreign-key mapped interactions with distinct roles (`user` or `assistant`), text payloads, and precise timestamps.
- **Connection Pooling (`pg`):**
  - Utilizes a robust PostgreSQL connection pool (`src/db/pool.ts`) with configurable idle timeouts and environment variable configuration (`.env`).
- **History Reloading & User Switching:**
  - Allows seamless switching between mock user profiles or loading historical conversation logs directly from PostgreSQL.

### 3.3 Contextual & Accurate Financial Answers
- **Integer Paise Computational Integrity:**
  - Solves the classic floating-point rounding issue in monetary calculations (e.g., `0.1 + 0.2 !== 0.3`) by directing the AI to compute all intermediate financial values in integer paise ($1\text{ Rupee} = 100\text{ paise}$) before displaying formatted Rupee representations.
- **Graceful Offline Fallback:**
  - If the Ollama daemon is offline or warming up, the controller catches connection faults and returns actionable guidance rather than crashing the HTTP pipeline.

---

## 4. Benefits & Practical Applications

1. **Democratizing Financial Literacy:**
   - Provides on-demand, free, and unbiased financial education to demographics who cannot afford professional fee-only SEBI-registered financial planners.
2. **Actionable Budget Discipline:**
   - Translates raw income figures into clear allocations (such as the 50/30/20 rule), helping young professionals curtail lifestyle inflation and cultivate consistent savings habits.
3. **Debt Risk Mitigation & Loan Readiness:**
   - Educates borrowers on critical debt thresholds, such as Fixed Obligation to Income Ratio (FOIR) and credit score thresholds, before they commit to major liabilities like home loans.
4. **Demystifying Long-Term Equity Wealth:**
   - Clarifies the mathematical advantages of disciplined compounding and rupee-cost averaging via Index SIPs over high-risk day trading or speculative instruments.
5. **Privacy-Preserving Corporate / Institutional Use:**
   - Because the system utilizes an open-source local LLM and PostgreSQL, banks, credit unions, and universities can deploy this platform on private internal networks without risking consumer data leaks.

---

## 5. Technical Specifications & Architecture Summary

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Language** | TypeScript 5.x | End-to-end static type safety and compilation |
| **Runtime** | Node.js (v20+ ESNext) | High-performance asynchronous event-driven I/O |
| **Server Framework** | Express.js 4.x | REST API routing, CORS handling, static asset serving |
| **Database** | PostgreSQL 16+ | Relational data persistence, indexed chat history (Port 5435, Container: `arthafin_postgres`) |
| **DB Client** | `pg` (node-postgres) | Connection pooling and parameterized query execution (`arthafin_db`) |
| **LLM Inference** | Google Gemini API | Cloud-native natural language processing via `@google/genai` & REST API (`gemini-2.5-flash`) |
| **Frontend** | HTML5 / CSS3 / Vanilla JS | Zero-dependency responsive messaging UI (Port 3020) |

---

## 6. Conclusion
The **AI-Powered Financial Chatbot (ArthaAI)** demonstrates the convergence of modern web technologies, relational persistence, and localized Large Language Models. By combining TypeScript's compile-time safety, Express.js's routing simplicity, PostgreSQL's relational consistency, and Ollama's local reasoning capabilities, the system delivers an accessible, privacy-centric financial copilot for everyday users.

