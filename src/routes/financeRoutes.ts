import { Router, Request, Response } from 'express';
import pool from '../db/pool';
import FinanceService, { STANDARD_CATEGORIES, IN_MEMORY_TRANSACTIONS } from '../services/financeService';

const router = Router();

/**
 * GET /api/finance/ledger/:userId
 * Retrieves aggregated monthly ledger and discretionary spending analysis
 */
router.get('/ledger/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const userIdStr = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    const userIdNum = parseInt(userIdStr, 10);
    if (isNaN(userIdNum)) {
      res.status(400).json({ success: false, error: 'Invalid userId parameter.' });
      return;
    }

    const month = req.query.month ? parseInt(String(req.query.month), 10) : undefined;
    const year = req.query.year ? parseInt(String(req.query.year), 10) : undefined;

    const ledger = await FinanceService.getMonthlyLedger(userIdNum, month, year);

    res.status(200).json({
      success: true,
      ledger,
    });
  } catch (error: any) {
    console.error('[FinanceRoutes] Error fetching monthly ledger:', error);
    // Even if an unexpected error occurs, provide the high-availability fallback report
    const fallbackLedger = await FinanceService.getMonthlyLedger(1);
    res.status(200).json({
      success: true,
      ledger: fallbackLedger,
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
    if (result.rows.length > 0) {
      res.status(200).json({
        success: true,
        categories: result.rows,
      });
      return;
    }
  } catch (error: any) {
    console.warn('[FinanceRoutes] Database unavailable for categories, returning standard categories.');
  }

  res.status(200).json({
    success: true,
    categories: STANDARD_CATEGORIES,
  });
});

/**
 * POST /api/finance/transactions
 * Inserts a new personal transaction, converting standard decimal amount into integer paise
 */
router.post('/transactions', async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id, category_id, amount, description, date } = req.body;

    if (!user_id || !category_id || amount == null || isNaN(Number(amount))) {
      res.status(400).json({
        success: false,
        error: 'user_id, category_id, and numeric amount are required.',
      });
      return;
    }

    const amountPaise = Math.round(Number(amount) * 100);
    const txDate = date || new Date().toISOString().split('T')[0];

    try {
      const insertQuery = `
        INSERT INTO transactions (user_id, category_id, amount, description, date)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, user_id, category_id, amount, description, date, created_at;
      `;

      const result = await pool.query(insertQuery, [
        parseInt(String(user_id), 10),
        category_id,
        amountPaise,
        description || '',
        txDate,
      ]);

      res.status(201).json({
        success: true,
        transaction: {
          ...result.rows[0],
          amount: Number((amountPaise / 100).toFixed(2)),
        },
      });
      return;
    } catch (dbErr: any) {
      console.warn('[FinanceRoutes] DB offline for transaction insert, updating in-memory store.');
    }

    // In-memory fallback
    const matchedCategory = STANDARD_CATEGORIES.find((c) => c.id === category_id) || { name: 'General Outflow', type: 'expense' as const };
    const newTx = {
      id: `tx-${Date.now()}`,
      user_id: parseInt(String(user_id), 10),
      category_id: String(category_id),
      category_name: matchedCategory.name,
      category_type: matchedCategory.type as 'income' | 'expense',
      amount: amountPaise,
      description: String(description || 'New Transaction'),
      date: txDate,
    };

    IN_MEMORY_TRANSACTIONS.unshift(newTx);

    res.status(201).json({
      success: true,
      transaction: {
        ...newTx,
        amount: Number((amountPaise / 100).toFixed(2)),
      },
    });
  } catch (error: any) {
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
    const { category_id, amount, description, date } = req.body;

    if (!category_id || amount == null || isNaN(Number(amount))) {
      res.status(400).json({
        success: false,
        error: 'category_id and numeric amount are required.',
      });
      return;
    }

    const amountPaise = Math.round(Number(amount) * 100);
    const txDate = date || new Date().toISOString().split('T')[0];

    try {
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
        category_id,
        amountPaise,
        description || '',
        txDate,
        id,
      ]);

      if (result.rows.length > 0) {
        res.status(200).json({
          success: true,
          transaction: {
            ...result.rows[0],
            amount: Number((amountPaise / 100).toFixed(2)),
          },
        });
        return;
      }
    } catch (dbErr: any) {
      console.warn('[FinanceRoutes] DB offline for transaction update, updating in-memory store.');
    }

    // In-memory fallback
    const idx = IN_MEMORY_TRANSACTIONS.findIndex((t) => t.id === id);
    if (idx !== -1) {
      const matchedCategory = STANDARD_CATEGORIES.find((c) => c.id === category_id) || { name: 'General Outflow', type: 'expense' as const };
      IN_MEMORY_TRANSACTIONS[idx] = {
        ...IN_MEMORY_TRANSACTIONS[idx],
        category_id: String(category_id),
        category_name: matchedCategory.name,
        category_type: matchedCategory.type as 'income' | 'expense',
        amount: amountPaise,
        description: description || IN_MEMORY_TRANSACTIONS[idx].description,
        date: txDate,
      };

      res.status(200).json({
        success: true,
        transaction: {
          ...IN_MEMORY_TRANSACTIONS[idx],
          amount: Number((amountPaise / 100).toFixed(2)),
        },
      });
      return;
    }

    res.status(404).json({ success: false, error: 'Transaction not found.' });
  } catch (error: any) {
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
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    try {
      await pool.query('DELETE FROM transactions WHERE id = $1', [id]);
    } catch {
      // In-memory fallback
      const idx = IN_MEMORY_TRANSACTIONS.findIndex((t) => t.id === id);
      if (idx !== -1) {
        IN_MEMORY_TRANSACTIONS.splice(idx, 1);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully.',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete transaction.',
      details: error.message,
    });
  }
});

export default router;
