-- ==============================================================================
-- Migration: 01_market_data.sql
-- Description: Creates assets and ohlcv_data tables for market analysis.
-- ==============================================================================

-- Enable pgcrypto for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Assets Table
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticker VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. OHLCV Data Table
-- CRITICAL CONSTRAINT: All price columns (open, high, low, close) MUST be BIGINT.
-- All prices are stored in integer paise (INR * 100) to prevent floating-point precision loss.
CREATE TABLE IF NOT EXISTS ohlcv_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    open BIGINT NOT NULL,
    high BIGINT NOT NULL,
    low BIGINT NOT NULL,
    close BIGINT NOT NULL,
    volume BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_asset_ohlcv_date UNIQUE (asset_id, date)
);

-- Explicit PostgreSQL comments for schema documentation
COMMENT ON TABLE ohlcv_data IS 'Daily OHLCV candlestick data for financial assets';
COMMENT ON COLUMN ohlcv_data.open IS 'Open price stored in integer paise (INR * 100) to prevent floating-point precision loss';
COMMENT ON COLUMN ohlcv_data.high IS 'High price stored in integer paise (INR * 100) to prevent floating-point precision loss';
COMMENT ON COLUMN ohlcv_data.low IS 'Low price stored in integer paise (INR * 100) to prevent floating-point precision loss';
COMMENT ON COLUMN ohlcv_data.close IS 'Close price stored in integer paise (INR * 100) to prevent floating-point precision loss';
COMMENT ON COLUMN ohlcv_data.volume IS 'Trading volume in units';

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ohlcv_data_asset_id_date ON ohlcv_data(asset_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_assets_ticker ON assets(ticker);
