import pool from '../pool';
import MarketDataService from '../../services/marketDataService';

async function runUnifiedSeed() {
  console.log('🌱 Starting Unified Financial & Market Database Seeding...');

  try {
    // 1. Ensure primary user exists
    const userRes = await pool.query(
      `INSERT INTO users (id, name, email) 
       VALUES (1, 'Rohan Sharma', 'rohan.sharma@arthafin.ai')
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email
       RETURNING id, name;`
    );
    const userId = userRes.rows[0].id;
    console.log(`👤 Verified Test User: ID ${userId} (${userRes.rows[0].name})`);

    // 2. Insert Standard Categories
    const categories = [
      { name: 'Salary', type: 'income' },
      { name: 'Freelance Consulting', type: 'income' },
      { name: 'Investment Dividends', type: 'income' },
      { name: 'Housing & Rent', type: 'expense' },
      { name: 'Utilities & Groceries', type: 'expense' },
      { name: 'Food & Fine Dining', type: 'expense' },
      { name: 'SaaS & Cloud Subscriptions', type: 'expense' },
      { name: 'Transport & Uber Premier', type: 'expense' },
      { name: 'Entertainment & Nightlife', type: 'expense' },
      { name: 'Impulse Shopping & Tech', type: 'expense' },
    ];

    const categoryMap = new Map<string, string>();

    for (const cat of categories) {
      const res = await pool.query(
        `INSERT INTO categories (name, type)
         VALUES ($1, $2)
         ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type
         RETURNING id, name;`,
        [cat.name, cat.type]
      );
      categoryMap.set(res.rows[0].name, res.rows[0].id);
    }
    console.log(`📂 Seeded ${categoryMap.size} Income and Expense Categories.`);

    // 3. Clear existing transactions for fresh test run
    await pool.query(`DELETE FROM transactions WHERE user_id = $1;`, [userId]);

    // 4. Seed 15 Mock Transactions with High Discretionary Spending
    // All amounts in integer paise (INR * 100)
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = String(today.getMonth() + 1).padStart(2, '0');

    const mockTransactions = [
      // Income
      {
        cat: 'Salary',
        desc: 'Monthly Corporate Tech Salary',
        amount: 16000000, // ₹1,60,000.00
        date: `${currentYear}-${currentMonth}-01`,
      },
      {
        cat: 'Freelance Consulting',
        desc: 'Advisory Retainer Payout',
        amount: 3500000, // ₹35,000.00
        date: `${currentYear}-${currentMonth}-05`,
      },
      // Fixed Essentials
      {
        cat: 'Housing & Rent',
        desc: '2BHK Apartment Rent & Society Maintenance',
        amount: 4200000, // ₹42,000.00
        date: `${currentYear}-${currentMonth}-02`,
      },
      {
        cat: 'Utilities & Groceries',
        desc: 'High-end Supermarket & Electricity Bill',
        amount: 1250000, // ₹12,500.00
        date: `${currentYear}-${currentMonth}-04`,
      },
      // Heavy Discretionary Outflows (Triggers strict AI personal wealth optimization)
      {
        cat: 'Food & Fine Dining',
        desc: 'Weekend Chef Tasting Menu & Wine Bar',
        amount: 1480000, // ₹14,800.00
        date: `${currentYear}-${currentMonth}-06`,
      },
      {
        cat: 'Food & Fine Dining',
        desc: 'Frequent Swiggy/Zomato Gourmet Deliveries',
        amount: 980000, // ₹9,800.00
        date: `${currentYear}-${currentMonth}-09`,
      },
      {
        cat: 'Food & Fine Dining',
        desc: 'Late Night Rooftop Lounge Bill',
        amount: 1120000, // ₹11,200.00
        date: `${currentYear}-${currentMonth}-13`,
      },
      {
        cat: 'SaaS & Cloud Subscriptions',
        desc: 'ChatGPT Plus, Midjourney, Claude Pro Bundle',
        amount: 680000, // ₹6,800.00
        date: `${currentYear}-${currentMonth}-07`,
      },
      {
        cat: 'SaaS & Cloud Subscriptions',
        desc: 'Unused Cloud Sandbox GPU Servers & Premium Tools',
        amount: 750000, // ₹7,500.00
        date: `${currentYear}-${currentMonth}-11`,
      },
      {
        cat: 'Impulse Shopping & Tech',
        desc: 'Custom Mechanical Keyboard & Noise-Cancelling Headphones',
        amount: 2200000, // ₹22,000.00
        date: `${currentYear}-${currentMonth}-08`,
      },
      {
        cat: 'Impulse Shopping & Tech',
        desc: 'Luxury Designer Casual Wear',
        amount: 1650000, // ₹16,500.00
        date: `${currentYear}-${currentMonth}-14`,
      },
      {
        cat: 'Entertainment & Nightlife',
        desc: 'VIP Concert Passes & Cocktails',
        amount: 1350000, // ₹13,500.00
        date: `${currentYear}-${currentMonth}-10`,
      },
      {
        cat: 'Entertainment & Nightlife',
        desc: 'Weekend Clubbing & Table Reservation',
        amount: 850000, // ₹8,500.00
        date: `${currentYear}-${currentMonth}-15`,
      },
      {
        cat: 'Transport & Uber Premier',
        desc: 'Daily Uber Premier Rides to Airport & City',
        amount: 920000, // ₹9,200.00
        date: `${currentYear}-${currentMonth}-12`,
      },
      {
        cat: 'Transport & Uber Premier',
        desc: 'Inter-City Executive Chauffeur Cab',
        amount: 550000, // ₹5,500.00
        date: `${currentYear}-${currentMonth}-16`,
      },
    ];

    for (const tx of mockTransactions) {
      const categoryId = categoryMap.get(tx.cat);
      if (!categoryId) continue;

      await pool.query(
        `INSERT INTO transactions (user_id, category_id, amount, description, date)
         VALUES ($1, $2, $3, $4, $5);`,
        [userId, categoryId, tx.amount, tx.desc, tx.date]
      );
    }

    console.log(`💳 Successfully inserted ${mockTransactions.length} mock transactions with high discretionary spend.`);

    // 5. Trigger Market Data Ingestion for last 60 days of Nifty 50 (^NSEI)
    console.log(`📈 Synchronizing historical market data for Nifty 50 (^NSEI)...`);
    const marketResult = await MarketDataService.syncAsset('^NSEI', 'Nifty 50', 'INDEX', 60);
    console.log(`✅ Synced ${marketResult.totalSynced} trading days of Nifty 50 data.`);

    console.log('🎉 Unified database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during unified database seeding:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runUnifiedSeed();

