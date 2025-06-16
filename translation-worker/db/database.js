import Database from 'better-sqlite3';

const db = new Database('translations.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS translations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    requestId TEXT UNIQUE NOT NULL,
    text TEXT NOT NULL,
    targetLanguage TEXT NOT NULL,
    translatedText TEXT,
    status TEXT NOT NULL CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export default db;
