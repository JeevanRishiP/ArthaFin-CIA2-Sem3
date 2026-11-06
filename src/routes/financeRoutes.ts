import { Router, Request, Response } from 'express';
import pool from '../db/pool';
import FinanceService from '../services/financeService';

const router = Router();

/**
 * GET /api/finance/overview
 * GET /api/finance/ledger/:userId
 * Retrieves aggregated monthly ledger and discretionary spending analysis
 */
const handleLedgerOverview = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawUserId = req.params.userId || req.query.userId || '1';
    const userIdStr = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;
    const userIdNum = parseInt(String(userIdStr), 10) || 1;

    const month = req.query.month ? parseInt(String(req.query.month), 10) : undefined;
    const year = req.query.year ? parseInt(String(req.query.year), 10) : undefined;

    const ledger = await FinanceService.getMonthlyLedger(userIdNum, month, year);

    res.status(200).json({
      success: true,
      period: ledger.period.label,
      totalIncomePaise: ledger.metrics.totalIncomePaise,
      totalExpensePaise: ledger.metrics.totalExpensesPaise,
      netSavingsPaise: ledger.metrics.netSavingsPaise,
      savingsRatePercent: ledger.metrics.savingsRatePercent,
      expensesByCategory: ledger.categoryBreakdown.expenses.map((e) => ({
        category: e.categoryName,
        amountPaise: e.totalPaise,
        percentOfTotal: e.percentageOfTotal,
      })),
      discretionaryOutflows: ledger.discretionarySpendingAlerts.map((d) => ({
        category: d.categoryName,
        amountPaise: Math.round(d.amount * 100),
        percentOfTotalExpenses: d.percentageOfExpenses,
      })),
      ledger,
    });
  } catch (error: any) {
    console.error('[FinanceRoutes] Error fetching monthly ledger:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch financial ledger.',
      details: error.message,
    });
  }
};

router.get('/overview', handleLedgerOverview);
router.get('/ledger/:userId', handleLedgerOverview);

/**
 * GET /api/finance/transactions
 * Retrieves transactions list for a user
 */
router.get('/transactions', async (req: Request, res: Response): Promise<void> => {
  try {
    const rawUserId = req.query.userId || req.query.user_id || '1';
    const userIdNum = parseInt(String(Array.isArray(rawUserId) ? rawUserId[0] : rawUserId), 10) || 1;

    const result = await pool.query(
      `SELECT t.id, t.user_id, t.category_id, t.amount, t.description, t.date, t.created_at,
              c.name AS category_name, c.type AS category_type
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = $1
       ORDER BY t.date DESC, t.id DESC;`,
      [userIdNum]
    );

    res.status(200).json({
      success: true,
      transactions: result.rows.map((r) => ({
        id: r.id,
        amount_paise: r.amount,
        amount: Number((r.amount / 100).toFixed(2)),
        category: r.category_name,
        category_id: r.category_id,
        type: r.category_type,
        description: r.description,
        date: r.date,
        created_at: r.created_at,
      })),
    });
  } catch (error: any) {
    console.error('[FinanceRoutes] Error fetching transactions list:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions.',
      details: error.message,
    });
  }
});

/**
 * GET /api/finance/categories
 * Retrieves all income and expense categories
 */
router.get('/categories', async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT id, name, type FROM categories ORDER BY type DESC, name ASC;`
    );
    res.status(200).json({
      success: true,
      categories: result.rows,
    });
  } catch (error: any) {
    console.error('[FinanceRoutes] Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories.',
      details: error.message,
    });
  }
});

/**
 * POST /api/finance/transactions
 * Inserts a new personal transaction, converting standard decimal amount into integer paise
 */
router.post('/transactions', async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id, userId, category_id, category, amount, amountPaise, description, date } = req.body;
    const uid = parseInt(String(user_id || userId || 1), 10);

    let catId = category_id;
    if (!catId && category) {
      const catRes = await pool.query('SELECT id FROM categories WHERE LOWER(name) = $1 LIMIT 1', [String(category).toLowerCase()]);
      if (catRes.rows.length > 0) {
        catId = catRes.rows[0].id;
      }
    }
    if (!catId) catId = 1; // Fallback to first category

    let finalPaise = amountPaise != null ? Math.round(Number(amountPaise)) : Math.round(Number(amount || 0) * 100);
    if (!finalPaise || isNaN(finalPaise)) {
      res.status(400).json({ success: false, error: 'A valid transaction amount is required.' });
      return;
    }

    const txDate = date || new Date().toISOString().split('T')[0];

    const insertQuery = `
      INSERT INTO transactions (user_id, category_id, amount, description, date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, user_id, category_id, amount, description, date, created_at;
    `;

    const result = await pool.query(insertQuery, [
      uid,
      catId,
      finalPaise,
      description || '',
      txDate,
    ]);

    res.status(201).json({
      success: true,
      transaction: {
        ...result.rows[0],
        amount_paise: finalPaise,
        amount: Number((finalPaise / 100).toFixed(2)),
      },
    });
  } catch (error: any) {
    console.error('[FinanceRoutes] Error creating transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create transaction.',
      details: error.message,
    });
  }
});

/**
 * PUT /api/finance/transactions/:id
 * Updates an existing transaction, converting decimal amount to integer paise
 */
router.put('/transactions/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const { category_id, category, amount, amountPaise, description, date } = req.body;

    let catId = category_id;
    if (!catId && category) {
      const catRes = await pool.query('SELECT id FROM categories WHERE LOWER(name) = $1 LIMIT 1', [String(category).toLowerCase()]);
      if (catRes.rows.length > 0) catId = catRes.rows[0].id;
    }
    if (!catId) catId = 1;

    let finalPaise = amountPaise != null ? Math.round(Number(amountPaise)) : Math.round(Number(amount || 0) * 100);
    if (!finalPaise || isNaN(finalPaise)) {
      res.status(400).json({ success: false, error: 'A valid numeric amount is required.' });
      return;
    }

    const txDate = date || new Date().toISOString().split('T')[0];

    const updateQuery = `
      UPDATE transactions
      SET 
        category_id = $1,
        amount = $2,
        description = $3,
        date = $4
      WHERE id = $5
      RETURNING id, user_id, category_id, amount, description, date, created_at;
    `;

    const result = await pool.query(updateQuery, [
      catId,
      finalPaise,
      description || '',
      txDate,
      id,
    ]);

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Transaction not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      transaction: {
        ...result.rows[0],
        amount_paise: finalPaise,
        amount: Number((finalPaise / 100).toFixed(2)),
      },
    });
  } catch (error: any) {
    console.error('[FinanceRoutes] Error updating transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update transaction.',
      details: error.message,
    });
  }
});

/**
 * DELETE /api/finance/transactions/:id
 * Deletes a personal transaction
 */
router.delete('/transactions/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM transactions WHERE id = $1', [id]);
    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully.',
    });
  } catch (error: any) {
    console.error('[FinanceRoutes] Error deleting transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete transaction.',
      details: error.message,
    });
  }
});

export default router;
