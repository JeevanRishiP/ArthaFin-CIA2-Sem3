import YahooFinance from 'yahoo-finance2';
import pool from '../db/pool';

export interface RawMarketCandle {
  date: Date | string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export class MarketDataService {
  private static yfInstance: any = null;

  /**
   * Lazily initializes and caches the yahoo-finance2 client instance
   */
  private static getClient(): any {
    if (!this.yfInstance) {
      if (typeof YahooFinance === 'function') {
        this.yfInstance = new (YahooFinance as any)({ suppressNotices: ['ripHistorical'] });
      } else {
        this.yfInstance = YahooFinance;
      }
    }
    return this.yfInstance;
  }

  /**
   * Ensures the asset exists in the assets table, returning its UUID
   */
  public static async getOrCreateAsset(
    ticker: string,
    name: string,
    assetType: string = 'INDEX'
  ): Promise<string> {
    const query = `
      INSERT INTO assets (ticker, name, asset_type)
      VALUES ($1, $2, $3)
      ON CONFLICT (ticker) 
      DO UPDATE SET 
        name = EXCLUDED.name,
        asset_type = EXCLUDED.asset_type
      RETURNING id;
    `;
    const result = await pool.query(query, [ticker, name, assetType]);
    return result.rows[0].id;
  }

  /**
   * Fetches historical daily OHLCV candlestick data for a ticker using yahoo-finance2.
   * Looks back enough calendar days to guarantee sufficient trading sessions (e.g. 50+ sessions for 50 SMA).
   */
  public static async fetchHistoricalData(
    ticker: string,
    tradingDaysTarget: number = 60
  ): Promise<RawMarketCandle[]> {
    try {
      const client = this.getClient();
      // Multiply by 1.6 to bridge trading days across weekends and market holidays
      const calendarDays = Math.ceil(tradingDaysTarget * 1.6);
      const period1 = new Date(Date.now() - calendarDays * 24 * 60 * 60 * 1000);
      const period2 = new Date();

      const rawResults = await client.historical(ticker, {
        period1,
        period2,
        interval: '1d',
      });

      if (!Array.isArray(rawResults) || rawResults.length === 0) {
        throw new Error(`No historical data returned for ticker ${ticker}`);
      }

      // Filter out any incomplete candles or records with missing price points
      const validCandles: RawMarketCandle[] = rawResults
        .filter(
          (c: any) =>
            c &&
            c.date &&
            c.open != null &&
            c.high != null &&
            c.low != null &&
            c.close != null
        )
        .map((c: any) => ({
          date: c.date,
          open: Number(c.open),
          high: Number(c.high),
          low: Number(c.low),
          close: Number(c.close),
          volume: Number(c.volume || 0),
        }));

      return validCandles;
    } catch (error: any) {
      console.error(`[MarketDataService] Error fetching historical data for ${ticker}:`, error.message);
      throw error;
    }
  }

  /**
   * Converts fetched float prices into integer paise (Math.round(price * 100))
   * and upserts them into the PostgreSQL ohlcv_data table.
   */
  public static async upsertOHLCV(
    assetId: string,
    data: RawMarketCandle[]
  ): Promise<number> {
    if (!data || data.length === 0) return 0;

    let upsertedCount = 0;

    for (const item of data) {
      // CRITICAL CONSTRAINT: All prices stored in integer paise (Currency * 100)
      const openPaise = Math.round(item.open * 100);
      const highPaise = Math.round(item.high * 100);
      const lowPaise = Math.round(item.low * 100);
      const closePaise = Math.round(item.close * 100);
      const volumeUnits = Math.round(item.volume || 0);

      const dateStr = item.date instanceof Date
        ? item.date.toISOString().split('T')[0]
        : new Date(item.date).toISOString().split('T')[0];

      const upsertQuery = `
        INSERT INTO ohlcv_data (asset_id, date, open, high, low, close, volume)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (asset_id, date)
        DO UPDATE SET
          open = EXCLUDED.open,
          high = EXCLUDED.high,
          low = EXCLUDED.low,
          close = EXCLUDED.close,
          volume = EXCLUDED.volume;
      `;

      await pool.query(upsertQuery, [
        assetId,
        dateStr,
        openPaise,
        highPaise,
        lowPaise,
        closePaise,
        volumeUnits,
      ]);

      upsertedCount++;
    }

    return upsertedCount;
  }

  /**
   * Synchronizes historical data for a single asset
   */
  public static async syncAsset(
    ticker: string,
    name: string,
    assetType: string = 'INDEX',
    tradingDaysTarget: number = 60
  ): Promise<{ assetId: string; ticker: string; totalSynced: number }> {
    const assetId = await this.getOrCreateAsset(ticker, name, assetType);
    const candles = await this.fetchHistoricalData(ticker, tradingDaysTarget);
    const totalSynced = await this.upsertOHLCV(assetId, candles);

    console.log(`[MarketDataService] Synced ${totalSynced} OHLCV candles for ${name} (${ticker}).`);
    return { assetId, ticker, totalSynced };
  }

  /**
   * Generates realistic synthetic candlestick data when both DB and external feeds are offline
   */
  public static generateSyntheticData(
    ticker: string = '^NSEI',
    count: number = 60
  ): RawMarketCandle[] {
    const isNifty = ticker === '^NSEI';
    let basePrice = isNifty ? 24500 : 5800;
    const candles: RawMarketCandle[] = [];
    const now = new Date();

    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const changePercent = (Math.sin(i * 0.4) * 0.008) + ((Math.random() - 0.48) * 0.012);
      const close = Number((basePrice * (1 + changePercent)).toFixed(2));
      const spread = close * 0.009;
      const high = Number((Math.max(basePrice, close) + spread * 0.6).toFixed(2));
      const low = Number((Math.min(basePrice, close) - spread * 0.6).toFixed(2));
      const open = basePrice;
      const volume = Math.round(250000000 + Math.random() * 80000000);

      candles.push({
        date: d.toISOString().split('T')[0],
        open,
        high,
        low,
        close,
        volume,
      });

      basePrice = close;
    }

    return candles;
  }

  /**
   * Fetches and synchronizes daily OHLCV data for both Nifty 50 (^NSEI) and S&P 500 (^GSPC)
   */
  public static async syncMarketData(tradingDaysTarget: number = 60): Promise<{
    nifty: { assetId: string; ticker: string; totalSynced: number };
    sp500: { assetId: string; ticker: string; totalSynced: number };
  }> {
    console.log(`[MarketDataService] Syncing market data for Nifty 50 and S&P 500 (${tradingDaysTarget} trading days)...`);
    const nifty = await this.syncAsset('^NSEI', 'Nifty 50', 'INDEX', tradingDaysTarget);
    const sp500 = await this.syncAsset('^GSPC', 'S&P 500', 'INDEX', tradingDaysTarget);
    return { nifty, sp500 };
  }
}

export default MarketDataService;
