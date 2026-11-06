-- ==============================================================================
-- Migration: 02_unified_finance_market.sql
-- Description: Unified schema for Stock Market Analysis & Personal Finance Management
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Assets Table
-- Supports indices, equities, ETFs across Indian & Global markets
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticker VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    asset_type VARCHAR(50) NOT NULL DEFAULT 'INDEX',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure asset_type column exists if table was previously created
ALTER TABLE assets ADD COLUMN IF NOT EXISTS asset_type VARCHAR(50) NOT NULL DEFAULT 'INDEX';

-- 2. OHLCV Market Data Table
-- CRITICAL CONSTRAINT: All price columns (open, high, low, close) MUST be BIGINT.
-- Stored in integer paise (INR * 100 for Nifty, USD * 100 for S&P 500) to eliminate floating-point precision loss.
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

-- Explicit Column Documentation for integer paise
COMMENT ON TABLE ohlcv_data IS 'Daily OHLCV candlestick records with prices in integer paise';
COMMENT ON COLUMN ohlcv_data.open IS 'Open price stored in integer paise (Currency * 100) to prevent precision loss';
COMMENT ON COLUMN ohlcv_data.high IS 'High price stored in integer paise (Currency * 100) to prevent precision loss';
COMMENT ON COLUMN ohlcv_data.low IS 'Low price stored in integer paise (Currency * 100) to prevent precision loss';
COMMENT ON COLUMN ohlcv_data.close IS 'Close price stored in integer paise (Currency * 100) to prevent precision loss';
COMMENT ON COLUMN ohlcv_data.volume IS 'Trading volume in units';

-- 3. Categories Table for Personal Finance
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Transactions Table
-- CRITICAL CONSTRAINT: amount MUST be BIGINT stored in integer paise (INR * 100).
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    amount BIGINT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE transactions IS 'Personal finance income and expense ledger entries';
COMMENT ON COLUMN transactions.amount IS 'Transaction amount stored in integer paise (INR * 100) to prevent floating-point precision loss';

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ohlcv_data_asset_id_date ON ohlcv_data(asset_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_assets_ticker ON assets(ticker);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id_date ON transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);

