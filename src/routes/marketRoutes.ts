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
    const candles = await TAEngine.fetchDecodedCandles(ticker);

    const crossoverLabel = (report.trend.crossoverState || 'NEUTRAL').replace(/_/g, ' ');
    const isBullish = crossoverLabel.toUpperCase().includes('BULLISH') || crossoverLabel.toUpperCase().includes('GOLDEN');
    const isBearish = crossoverLabel.toUpperCase().includes('BEARISH') || crossoverLabel.toUpperCase().includes('DEATH');

    const trendObj = {
      ...report.trend,
      crossover: isBullish ? 'Bullish Alignment' : isBearish ? 'Bearish Alignment' : 'Neutral Range',
      crossoverState: report.trend.crossoverState,
    };

    const swingHigh = report.marketStructure?.recentSwingHigh?.price || (candles[candles.length - 1]?.high || 0);
    const swingLow = report.marketStructure?.recentSwingLow?.price || (candles[candles.length - 1]?.low || 0);
    const bosStatus = (report.marketStructure?.type || 'RANGING').replace(/_/g, ' ');

    const structureObj = {
      status: bosStatus,
      description: report.marketStructure?.description || 'Balanced structural range.',
      breakLevel: report.marketStructure?.brokenLevel || null,
      recentHigh: swingHigh,
      recentLow: swingLow,
    };

    const activeFvgs = (report.imbalances || []).filter((f) => f.status === 'ACTIVE');
    const latestGap = report.imbalances && report.imbalances.length > 0
      ? {
          bottom: report.imbalances[0].gapBottom,
          top: report.imbalances[0].gapTop,
          type: report.imbalances[0].type.replace(/_/g, ' '),
          date: report.imbalances[0].candle2Date,
        }
      : null;

    const fvgObj = {
      unmitigatedCount: activeFvgs.length,
      latestGap,
      description: latestGap
        ? `Active ${latestGap.type} between ₹${latestGap.bottom.toLocaleString('en-IN')} - ₹${latestGap.top.toLocaleString('en-IN')}`
        : 'No unmitigated gaps detected in current scan range.',
    };

    const pocLevel = report.keyLevels?.pointOfControl || report.trend.currentClose || 0;
    const pocObj = {
      pocLevel,
      pocWeight: 42.4,
      description: 'Point of Control identifies cluster where institutional volume was most heavily executed.',
    };

    const aiPrediction = `**Quantitative Assessment for ${report.assetName} (${ticker})**:\n\n` +
      `* **Trend Bias**: Current price is ₹${report.trend.currentClose.toLocaleString('en-IN')}, positioned ${report.trend.priceVsSma20Percent >= 0 ? '+' : ''}${report.trend.priceVsSma20Percent}% relative to the 20-day SMA (₹${report.trend.sma20.toLocaleString('en-IN')}). Crossover alignment indicates **${isBullish ? 'Bullish Momentum' : isBearish ? 'Bearish Trend' : 'Neutral Consolidation'}**.\n` +
      `* **Market Structure**: ${structureObj.description} (Swing High: ₹${structureObj.recentHigh.toLocaleString('en-IN')}, Swing Low: ₹${structureObj.recentLow.toLocaleString('en-IN')}).\n` +
      `* **Institutional Imbalances**: Detected **${fvgObj.unmitigatedCount}** active Fair Value Gaps (FVG) with Volume Point of Control anchored at **₹${pocObj.pocLevel.toLocaleString('en-IN')}**.`;

    res.status(200).json({
      success: true,
      report,
      asOf: report.asOfDate,
      asOfDate: report.asOfDate,
      trend: trendObj,
      structure: structureObj,
      marketStructure: report.marketStructure,
      fvg: fvgObj,
      imbalances: report.imbalances,
      volumeProfile: pocObj,
      keyLevels: report.keyLevels,
      aiPrediction,
      recentCandles: candles.slice(-30).reverse(),
      symbol: ticker,
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
