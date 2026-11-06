-- ==============================================================================
-- Migration: 03_chat_sessions.sql
-- Description: Multi-session chat conversations (threads / locks) like ChatGPT & Claude
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Chat Sessions Table
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL DEFAULT 'New Consultation',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Add session_id to chat_history
ALTER TABLE chat_history ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_history_session_id ON chat_history(session_id);

-- 3. Backfill existing orphaned messages into historical sessions
DO $$
DECLARE
    default_session_id UUID;
    u_id INTEGER;
BEGIN
    FOR u_id IN SELECT DISTINCT user_id FROM chat_history WHERE session_id IS NULL LOOP
        INSERT INTO chat_sessions (user_id, title)
        VALUES (u_id, 'Previous Consultation History')
        RETURNING id INTO default_session_id;

        UPDATE chat_history
        SET session_id = default_session_id
        WHERE user_id = u_id AND session_id IS NULL;
    END LOOP;
END $$;

