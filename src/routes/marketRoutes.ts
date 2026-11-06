import { Router, Request, Response } from 'express';
import TAEngine from '../services/taEngine';
import MarketDataService from '../services/marketDataService';

const router = Router();

/**
 * GET /api/market/analysis
 * GET /api/market/analysis/:ticker
 * Retrieves full quantitative technical analysis report for an asset
 */
const handleAnalysis = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawParam = req.params.ticker || req.query.ticker;
    const rawTicker = Array.isArray(rawParam) ? rawParam[0] : (rawParam || '^NSEI');
    const ticker = String(rawTicker).toUpperCase();
    const report = await TAEngine.analyze(ticker);

    res.status(200).json({
      success: true,
      report,
      ...report,
    });
  } catch (error: any) {
    console.error('[MarketRoutes] Error analyzing ticker:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze market data.',
      details: error.message,
    });
  }
};

router.get('/analysis', handleAnalysis);
router.get('/analysis/:ticker', handleAnalysis);

/**
 * GET /api/market/candles/:ticker
 * Retrieves historical decoded candlestick data for charting
 */
router.get('/candles/:ticker', async (req: Request, res: Response): Promise<void> => {
  try {
    const rawParam = req.params.ticker;
    const rawTicker = Array.isArray(rawParam) ? rawParam[0] : (rawParam || '^NSEI');
    const ticker = rawTicker.toUpperCase();
    const candles = await TAEngine.fetchDecodedCandles(ticker);

    res.status(200).json({
      success: true,
      ticker,
      total: candles.length,
      candles,
    });
  } catch (error: any) {
    console.error('[MarketRoutes] Error fetching candles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch candlestick data.',
      details: error.message,
    });
  }
});

/**
 * POST /api/market/sync
 * Manually synchronizes market data from Yahoo Finance
 */
router.post('/sync', async (req: Request, res: Response): Promise<void> => {
  try {
    const days = parseInt(String(req.body.days || 60), 10);
    const syncResults = await MarketDataService.syncMarketData(days);

    res.status(200).json({
      success: true,
      message: 'Market data synchronized successfully.',
      syncResults,
    });
  } catch (error: any) {
    console.error('[MarketRoutes] Error syncing market data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync market data.',
      details: error.message,
    });
  }
});

export default router;
