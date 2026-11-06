-- =============================================================================
-- Seed Script for AI-Powered Financial Chatbot (ArthaAI)
-- =============================================================================

-- 1. Insert Mock User
INSERT INTO users (id, name, created_at)
VALUES (1, 'Aarav Sharma', CURRENT_TIMESTAMP - INTERVAL '7 days')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Reset serial sequence for users table
SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE(MAX(id), 1)) FROM users;

-- Clean existing mock chat history for user 1 to avoid duplicates on re-runs
DELETE FROM chat_history WHERE user_id = 1;

-- =============================================================================
-- 2. Insert 5 Realistic Mock Financial Conversations
-- =============================================================================

-- Conversation 1: Budgeting (50-30-20 Rule with integer paise precision)
INSERT INTO chat_history (user_id, role, message_content, timestamp) VALUES
(
  1,
  'user',
  'I earn a monthly take-home salary of ₹75,000. How should I allocate my income using the 50-30-20 budgeting method?',
  CURRENT_TIMESTAMP - INTERVAL '5 days 2 hours'
),
(
  1,
  'assistant',
  'Under the 50-30-20 budgeting principle, your total monthly inflow of **₹75,000** (calculated with exact precision as 7,500,000 paise) is distributed into three distinct financial buckets:

1. **Needs (50% = ₹37,500 | 3,750,000 paise):**
   - Covers essential living expenses: rent/home EMI, groceries, utilities, basic transportation, and insurance premiums.

2. **Wants (30% = ₹22,500 | 2,250,000 paise):**
   - Allocated for lifestyle and discretionary expenditures: dining out, streaming subscriptions, leisure travel, and hobbies.

3. **Savings & Debt Repayment (20% = ₹15,000 | 1,500,000 paise):**
   - Channeled directly toward long-term wealth building: automated Equity SIPs, emergency fund contributions, and prepaying any high-interest debt.

*Tip: Automate the ₹15,000 transfer on your salary credit date to avoid impulsive discretionary spending.*',
  CURRENT_TIMESTAMP - INTERVAL '5 days 2 hours' + INTERVAL '3 seconds'
);

-- Conversation 2: Loan Eligibility
INSERT INTO chat_history (user_id, role, message_content, timestamp) VALUES
(
  1,
  'user',
  'What are the key eligibility criteria and financial metrics banks evaluate for a home loan of ₹50,00,000 in India?',
  CURRENT_TIMESTAMP - INTERVAL '4 days 1 hour'
),
(
  1,
  'assistant',
  'When applying for a **₹50,00,000** (5,000,000,000 paise) home loan, Indian financial institutions evaluate eligibility based on the following key benchmarks:

1. **FOIR (Fixed Obligation to Income Ratio):**
   - Banks mandate that total ongoing EMIs plus the prospective home loan EMI must not exceed **45% to 50%** of your net monthly income.
   - For a ₹50,00,000 loan at an indicative 8.50% interest rate over a 20-year tenure, the monthly EMI is approximately **₹43,391**. Hence, a net monthly income of at least **₹88,000 - ₹95,000** is typically required.

2. **CIBIL / Credit Score:**
   - A score of **750 or above** ensures swift approval and qualifies you for competitive interest rate concessions.

3. **LTV (Loan-to-Value) & Down Payment:**
   - RBI regulations permit up to 80% financing for loans between ₹30 Lakhs and ₹75 Lakhs. You will need an upfront down payment of 20%, which equates to **₹10,00,000 to ₹12,50,000** including stamp duty and registration fees.

4. **Employment Stability:**
   - Minimum 2 years of continuous work experience with at least 6 months at your current employer or 3 years of audited ITRs for self-employed professionals.',
  CURRENT_TIMESTAMP - INTERVAL '4 days 1 hour' + INTERVAL '4 seconds'
);

-- Conversation 3: Stock Market Investments (SIP vs Direct Equity)
INSERT INTO chat_history (user_id, role, message_content, timestamp) VALUES
(
  1,
  'user',
  'As a beginner investor, should I pick individual stocks directly or invest via SIP in Nifty 50 Index Mutual Funds?',
  CURRENT_TIMESTAMP - INTERVAL '3 days 4 hours'
),
(
  1,
  'assistant',
  'For beginner wealth accumulators, starting with a **Systematic Investment Plan (SIP)** in broad market Index Funds (such as Nifty 50 or Nifty LargeMidcap 250) is strongly recommended over direct stock picking:

- **Rupee-Cost Averaging:** A recurring monthly SIP (e.g., ₹5,000 / 500,000 paise per month) automatically purchases more units when markets drop and fewer when markets peak, neutralizing emotional volatility.
- **Power of Compounding:** Investing **₹10,000 per month** at an annualized estimated return of 12% yields approximately **₹23,23,391** in 10 years, of which ₹12,00,000 is principal and ₹11,23,391 is accumulated wealth.
- **Diversification & Low Expense Ratio:** A Nifty 50 index fund gives you instant exposure to India’s top 50 blue-chip companies with an expense ratio as low as 0.10% to 0.20%, eliminating single-stock bankruptcy risks.

*Recommendation:* Dedicate 80% of your equity allocation to low-cost index/flexi-cap mutual funds, reserving only 10-20% for direct stocks after you develop fundamental balance sheet analysis skills.',
  CURRENT_TIMESTAMP - INTERVAL '3 days 4 hours' + INTERVAL '5 seconds'
);

-- Conversation 4: Saving Patterns & Emergency Fund
INSERT INTO chat_history (user_id, role, message_content, timestamp) VALUES
(
  1,
  'user',
  'My mandatory monthly living expenses are ₹35,000. How much emergency fund should I accumulate and where should I store it?',
  CURRENT_TIMESTAMP - INTERVAL '2 days 6 hours'
),
(
  1,
  'assistant',
  'For a baseline monthly expenditure of **₹35,000** (3,500,000 paise), your emergency fund strategy should be structured as follows:

1. **Target Fund Size:**
   - **Salaried with stable employment:** 6 months of expenses = **₹2,10,000** (21,000,000 paise).
   - **Single-income households or freelancers:** 9 to 12 months = **₹3,15,000 to ₹4,20,000**.

2. **Optimal Tiered Allocation Strategy:**
   - **Tier 1 (Instant Liquidity - ₹70,000):** Maintain in a separate high-yield savings bank account linked with an ATM card for immediate medical or household emergencies.
   - **Tier 2 (High Safety & Overnight Liquidity - ₹1,40,000):** Allocate into Auto-Sweep Fixed Deposits or Overnight/Liquid Mutual Funds (T+1 instant redemption).

*Golden Rule:* Never park emergency savings in volatile instruments like equity mutual funds, crypto, or locked tax-saving schemes (ELSS/PPF).',
  CURRENT_TIMESTAMP - INTERVAL '2 days 6 hours' + INTERVAL '3 seconds'
);

-- Conversation 5: Explanation of Financial Planning
INSERT INTO chat_history (user_id, role, message_content, timestamp) VALUES
(
  1,
  'user',
  'Can you explain what comprehensive financial planning actually involves and what sequence of priorities I should follow?',
  CURRENT_TIMESTAMP - INTERVAL '1 day 3 hours'
),
(
  1,
  'assistant',
  'Comprehensive financial planning is a structured roadmap designed to align your current financial resources with your future life milestones. Think of it as a resilient 5-tier financial pyramid:

1. **Foundation: Risk Protection (Non-Negotiable)**
   - Pure Term Life Insurance covering 10x-15x your annual income.
   - Comprehensive Health Insurance (Base cover of ₹5 Lakhs + Super Top-up of ₹20-50 Lakhs) independent of corporate cover.

2. **Pillar 2: Emergency Resilience**
   - 6 months of mandatory living costs preserved in high-liquidity, capital-guaranteed accounts.

3. **Pillar 3: High-Cost Debt Elimination**
   - Aggressively pay down credit cards (36-42% APR) and personal loans (12-18% APR) before initiating speculative investments.

4. **Pillar 4: Goal-Based Wealth Accumulation**
   - Short-term goals (<3 years): Arbitrage / Short-duration debt funds.
   - Medium-term goals (3-7 years): Balanced Advantage / Hybrid funds.
   - Long-term goals (>7 years - Retirement, Children’s Higher Education): Broad equity SIPs, EPF/PPF, and National Pension System (NPS).

5. **Pillar 5: Tax Optimization & Estate Planning**
   - Utilize standard deductions, Section 80C, 80D, and NPS 80CCD(1B), and create clear wills or registered nominations across all bank and depository accounts.',
  CURRENT_TIMESTAMP - INTERVAL '1 day 3 hours' + INTERVAL '4 seconds'
);

-- Reset serial sequence for chat_history table
SELECT setval(pg_get_serial_sequence('chat_history', 'id'), COALESCE(MAX(id), 1)) FROM chat_history;

