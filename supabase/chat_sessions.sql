-- Run this in the Supabase SQL Editor to enable chat history persistence

CREATE TABLE IF NOT EXISTS chat_sessions (
  id          UUID        PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL DEFAULT 'แชทใหม่',
  messages    JSONB       NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own sessions
CREATE POLICY "Users manage own sessions"
  ON chat_sessions
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for fast per-user queries sorted by last update
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_updated
  ON chat_sessions (user_id, updated_at DESC);
