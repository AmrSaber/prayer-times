import { Database } from 'bun:sqlite';
import { CACHE_PATH } from './constants';

type Record = {
  key: string;
  value: string;
  expires_at: number | null;
};

export class SqliteCache {
  private db: Database;

  constructor(path: string = CACHE_PATH) {
    this.db = new Database(path, { strict: true });

    // Enable WAL mode
    this.db.exec('PRAGMA journal_mode = WAL;');

    // Initialize the database in a transaction
    this.db
      .transaction(() => {
        // Initialize the table
        this.db.exec(`CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT, expires_at INTEGER)`);
        this.db.exec(`CREATE INDEX IF NOT EXISTS kv__expires_at ON kv (expires_at)`);
      })
      .exclusive();
  }

  private cleanExpired() {
    this.db.exec(`DELETE FROM kv WHERE expires_at IS NOT NULL AND expires_at < ?`, [Date.now()]);
  }

  set<T>(key: string, value: T, { expiresAt = null }: { expiresAt?: number | null } = {}) {
    this.db.exec(
      `INSERT INTO kv (key, value, expires_at)
       VALUES(?, ?, ?) 
       ON CONFLICT(key) 
       DO UPDATE SET value = excluded.value, expires_at = excluded.expires_at
      `,
      [key, JSON.stringify(value), expiresAt],
    );
  }

  get<T = string>(key: string): T | undefined {
    this.cleanExpired();
    const record = this.db.query<Record, string>(`SELECT * FROM kv WHERE key = ?`).get(key);

    const value = record?.value;
    if (value == null) return value;
    return JSON.parse(value) as T;
  }

  delete(key: string) {
    this.db.exec('DELETE FROM kv WHERE kv.key = ?', [key]);
  }
}