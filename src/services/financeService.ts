import pool from '../db/pool';

export interface CategorySummary {
  categoryName: string;
  categoryType: 'income' | 'expense';
  totalPaise: number;
  totalAmount: number; // in standard currency (INR)
  percentageOfTotal: number; // percentage of income or expense
  transactionCount: number;
}

export interface TransactionDetail {
  id: string;
  categoryId: string;
  date: string;
  description: string;
  categoryName: string;
  categoryType: 'income' | 'expense';
  amountPaise: number;
  amount: number; // in standard currency (INR)
}

export interface MonthlyLedgerReport {
  userId: number;
  period: {
    month: number;
    year: number;
    label: string;
  };
  metrics: {
    totalIncome: number;
    totalExpenses: number;
    netSavings: number;
    savingsRatePercent: number;
    totalIncomePaise: number;
    totalExpensesPaise: number;
    netSavingsPaise: number;
  };
  categoryBreakdown: {
    expenses: CategorySummary[];
    income: CategorySummary[];
  };
  discretionarySpendingAlerts: {
    categoryName: string;
    amount: number;
    percentageOfExpenses: number;
    note: string;
  }[];
  recentTransactions: TransactionDetail[];
}

export class FinanceService {
  /**
   * Generates a monthly financial ledger for a user by querying the PostgreSQL transactions table.
   * Aggregates total income, total expenses, category breakdowns, and converts all integer paise
   * back to standard float decimals for AI context injection.
   */
  public static async getMonthlyLedger(
    userId: number,
    month?: number,
    year?: number
  ): Promise<MonthlyLedgerReport> {
    // 1. If month and year are not specified, discover the latest active month with transactions
    let targetMonth = month;
    let targetYear = year;

    if (!targetMonth || !targetYear) {
      const latestTxQuery = `
        SELECT EXTRACT(MONTH FROM date) as m, EXTRACT(YEAR FROM date) as y
        FROM transactions
        WHERE user_id = $1
        ORDER BY date DESC
        LIMIT 1;
      `;
      const latestRes = await pool.query(latestTxQuery, [userId]);
      if (latestRes.rows.length > 0) {
        targetMonth = parseInt(latestRes.rows[0].m, 10);
        targetYear = parseInt(latestRes.rows[0].y, 10);
      } else {
        const now = new Date();
        targetMonth = now.getMonth() + 1;
        targetYear = now.getFullYear();
      }
    }

    // 2. Fetch all transactions for the specified month and year
    const query = `
      SELECT 
        t.id,
        t.category_id,
        t.amount,
        t.description,
        t.date,
        c.name as category_name,
        c.type as category_type
      FROM transactions t
      JOIN categories c ON c.id = t.category_id
      WHERE t.user_id = $1
        AND EXTRACT(MONTH FROM t.date) = $2
        AND EXTRACT(YEAR FROM t.date) = $3
      ORDER BY t.date DESC;
    `;

    const result = await pool.query(query, [userId, targetMonth, targetYear]);

    let totalIncomePaise = 0;
    let totalExpensesPaise = 0;

    const expenseCategoryMap = new Map<string, { paise: number; count: number }>();
    const incomeCategoryMap = new Map<string, { paise: number; count: number }>();

    const transactionsList: TransactionDetail[] = result.rows.map((r: any) => {
      const amountPaise = Number(r.amount);
      const isExpense = r.category_type === 'expense';

      if (isExpense) {
        totalExpensesPaise += amountPaise;
        const current = expenseCategoryMap.get(r.category_name) || { paise: 0, count: 0 };
        current.paise += amountPaise;
        current.count += 1;
        expenseCategoryMap.set(r.category_name, current);
      } else {
        totalIncomePaise += amountPaise;
        const current = incomeCategoryMap.get(r.category_name) || { paise: 0, count: 0 };
        current.paise += amountPaise;
        current.count += 1;
        incomeCategoryMap.set(r.category_name, current);
      }

      return {
        id: r.id,
        categoryId: r.category_id,
        date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : String(r.date).split('T')[0],
        description: r.description || '',
        categoryName: r.category_name,
        categoryType: r.category_type,
        amountPaise,
        amount: Number((amountPaise / 100).toFixed(2)),
      };
    });

    const netSavingsPaise = totalIncomePaise - totalExpensesPaise;
    const savingsRatePercent = totalIncomePaise > 0
      ? Number(((netSavingsPaise / totalIncomePaise) * 100).toFixed(2))
      : 0;

    // Convert integer paise to standard decimal units
    const totalIncome = Number((totalIncomePaise / 100).toFixed(2));
    const totalExpenses = Number((totalExpensesPaise / 100).toFixed(2));
    const netSavings = Number((netSavingsPaise / 100).toFixed(2));

    // Build expense breakdowns
    const expenseBreakdown: CategorySummary[] = Array.from(expenseCategoryMap.entries()).map(
      ([catName, stats]) => ({
        categoryName: catName,
        categoryType: 'expense' as const,
        totalPaise: stats.paise,
        totalAmount: Number((stats.paise / 100).toFixed(2)),
        percentageOfTotal: totalExpensesPaise > 0
          ? Number(((stats.paise / totalExpensesPaise) * 100).toFixed(1))
          : 0,
        transactionCount: stats.count,
      })
    ).sort((a, b) => b.totalAmount - a.totalAmount);

    // Build income breakdowns
    const incomeBreakdown: CategorySummary[] = Array.from(incomeCategoryMap.entries()).map(
      ([catName, stats]) => ({
        categoryName: catName,
        categoryType: 'income' as const,
        totalPaise: stats.paise,
        totalAmount: Number((stats.paise / 100).toFixed(2)),
        percentageOfTotal: totalIncomePaise > 0
          ? Number(((stats.paise / totalIncomePaise) * 100).toFixed(1))
          : 0,
        transactionCount: stats.count,
      })
    ).sort((a, b) => b.totalAmount - a.totalAmount);

    // Highlight discretionary spending areas (Dining, Subscriptions, Entertainment, Luxury Shopping)
    const discretionaryKeywords = ['food', 'dining', 'saas', 'subscription', 'entertainment', 'shopping'];
    const discretionarySpendingAlerts = expenseBreakdown
      .filter((cat) =>
        discretionaryKeywords.some((kw) => cat.categoryName.toLowerCase().includes(kw))
      )
      .map((cat) => ({
        categoryName: cat.categoryName,
        amount: cat.totalAmount,
        percentageOfExpenses: cat.percentageOfTotal,
        note: `Discretionary category accounting for ${cat.percentageOfTotal}% of total monthly outflows.`,
      }));

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return {
      userId,
      period: {
        month: targetMonth,
        year: targetYear,
        label: `${monthNames[targetMonth - 1]} ${targetYear}`,
      },
      metrics: {
        totalIncome,
        totalExpenses,
        netSavings,
        savingsRatePercent,
        totalIncomePaise,
        totalExpensesPaise,
        netSavingsPaise,
      },
      categoryBreakdown: {
        expenses: expenseBreakdown,
        income: incomeBreakdown,
      },
      discretionarySpendingAlerts,
      recentTransactions: transactionsList.slice(0, 15),
    };
  }
}

export default FinanceService;
