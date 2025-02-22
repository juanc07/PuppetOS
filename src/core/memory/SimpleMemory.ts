import sqlite3 from "sqlite3";
import { IMemory } from "src/interfaces/IMemory";

export class SimpleMemory implements IMemory {
  private db: sqlite3.Database;
  private shortTerm: Map<string, any> = new Map();

  constructor(dbPath: string = "./data/simple_memory.db") {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) console.error("DB Error:", err);
      else this.initialize();
    });
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.exec(
        `CREATE TABLE IF NOT EXISTS long_term (key TEXT PRIMARY KEY, value TEXT)`,
        (err) => (err ? reject(err) : resolve())
      );
    });
  }

  setShortTerm(key: string, value: any) {
    this.shortTerm.set(key, value);
  }

  getShortTerm(key: string) {
    return this.shortTerm.get(key);
  }

  clearShortTerm() {
    this.shortTerm.clear();
  }

  async setLongTerm(key: string, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT OR REPLACE INTO long_term (key, value) VALUES (?, ?)`,
        [key, JSON.stringify(value)],
        (err) => (err ? reject(err) : resolve())
      );
    });
  }

  async getLongTerm(key: string) {
    return new Promise((resolve) => {
      this.db.get(
        `SELECT value FROM long_term WHERE key = ?`,
        [key],
        (err, row: any) => resolve(row ? JSON.parse(row.value) : undefined)
      );
    });
  }

  async deleteLongTerm(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `DELETE FROM long_term WHERE key = ?`,
        [key],
        (err) => (err ? reject(err) : resolve())
      );
    });
  }
}