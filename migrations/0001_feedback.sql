CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'feedback',
  status TEXT NOT NULL DEFAULT 'new',
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'General',
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'web',
  meta_json TEXT NOT NULL DEFAULT '{}',
  email_status TEXT NOT NULL DEFAULT 'not_configured'
);

CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback(type);
