import { signal } from '@angular/core';
import initSqlJs, { Database, SqlJsStatic } from 'sql.js';

const DB_NAME = 'GymAppDB';
const STORE_NAME = 'sqlite_store';

// The wasm module is loaded once and shared by both connections.
let sqljs: Promise<SqlJsStatic> | null = null;

function loadSqlJs(): Promise<SqlJsStatic> {
  sqljs ??= initSqlJs({ locateFile: (file: string) => `db/${file}` });

  return sqljs;
}

// One SQLite database persisted in IndexedDB under `dbKey`. The schema stays
// with its feature; this class only opens, migrates and saves the binary.
export abstract class SqlDatabase {
  protected abstract readonly dbKey: string;
  protected abstract readonly schema: string;
  protected abstract readonly seed: string | null;

  private db: Database | null = null;
  private depth = 0;
  private saveQueue: Promise<void> = Promise.resolve();

  readonly isReady = signal(false);

  get database(): Database | null {
    return this.db;
  }

  async init(): Promise<void> {
    if (this.isReady()) {
      return;
    }

    const SQL = await loadSqlJs();
    const saved = await this.getStoredBinary();

    if (saved) {
      try {
        this.db = new SQL.Database(saved);
      } catch {
        this.db = new SQL.Database();
      }
    } else {
      this.db = new SQL.Database();
    }

    const db = this.db;

    // sql.js does not persist pragmas, so foreign keys are enabled on every open.
    db.run('PRAGMA foreign_keys = ON;');
    // run() without params goes through sqlite3_exec, which runs every statement
    // in the script; passing [] would prepare only the first one.
    db.run(this.schema);

    if (this.seed) {
      db.run(this.seed);
    }

    this.migrate(db);

    await this.writeBinary(db.export());
    this.isReady.set(true);
  }

  // Features patch columns that already-persisted DBs are missing.
  protected migrate(_db: Database): void {}

  persist(): Promise<void> {
    this.saveQueue = this.saveQueue.then(() => this.flush());

    return this.saveQueue;
  }

  run(sql: string, params: any[] = []): void {
    this.requireDatabase().run(sql, params);

    if (this.depth === 0) {
      void this.persist();
    }
  }

  query<T = any>(sql: string, params: any[] = []): T[] {
    const stmt = this.requireDatabase().prepare(sql);

    stmt.bind(params);

    const results: T[] = [];

    while (stmt.step()) {
      results.push(stmt.getAsObject() as T);
    }

    stmt.free();

    return results;
  }

  // Runs `fn` between BEGIN and COMMIT. Nested calls join the open transaction,
  // so repositories can expose their own transactional helpers.
  transaction<R>(fn: () => R): R {
    const db = this.requireDatabase();

    if (this.depth > 0) {
      return fn();
    }

    db.run('BEGIN TRANSACTION;');
    this.depth++;

    try {
      const result = fn();

      this.depth--;
      db.run('COMMIT;');
      void this.persist();

      return result;
    } catch (error) {
      this.depth--;
      db.run('ROLLBACK;');

      throw error;
    }
  }

  // Raw binary of the DB in memory, for the backup download in the config UI.
  getBinary(): Uint8Array {
    return this.requireDatabase().export();
  }

  // Raw binary persisted in IndexedDB, without going through the in-memory DB.
  getStoredBinary(): Promise<Uint8Array | null> {
    return this.readBinary(this.dbKey);
  }

  // Rebuilds the in-memory DB from a backup binary (database recovery).
  async load(buffer: Uint8Array): Promise<void> {
    const SQL = await loadSqlJs();

    this.db?.close();
    this.db = new SQL.Database(buffer);

    const db = this.db;

    db.run('PRAGMA foreign_keys = ON;');
    db.run(this.schema);

    if (this.seed) {
      db.run(this.seed);
    }

    this.migrate(db);

    await this.writeBinary(db.export());
    this.isReady.set(true);
  }

  // Wipes the stored binary and starts again from the schema + seed.
  async resetDatabase(): Promise<void> {
    await this.destroy();
    await this.init();
  }

  async destroy(): Promise<void> {
    this.db?.close();
    this.db = null;
    this.isReady.set(false);
    await this.deleteBinary(this.dbKey);
  }

  private async flush(): Promise<void> {
    if (!this.db) {
      return;
    }

    await this.writeBinary(this.db.export());
  }

  private requireDatabase(): Database {
    if (!this.db) {
      throw new Error(`Base de datos no inicializada: ${this.dbKey}`);
    }

    return this.db;
  }

  private openIDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);

      request.onupgradeneeded = () => {
        request.result.createObjectStore(STORE_NAME);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async readBinary(key: string): Promise<Uint8Array | null> {
    try {
      const idb = await this.openIDB();

      return await new Promise((resolve, reject) => {
        const request = idb.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(key);

        request.onsuccess = () => {
          const result = request.result;

          if (!result) {
            resolve(null);
          } else if (result instanceof Uint8Array) {
            resolve(result);
          } else if (result instanceof ArrayBuffer) {
            resolve(new Uint8Array(result));
          } else {
            resolve(new Uint8Array(Object.values(result)));
          }
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error leyendo IndexedDB:', error);

      return null;
    }
  }

  private async writeBinary(buffer: Uint8Array): Promise<void> {
    const idb = await this.openIDB();

    return new Promise((resolve, reject) => {
      const request = idb
        .transaction(STORE_NAME, 'readwrite')
        .objectStore(STORE_NAME)
        .put(buffer, this.dbKey);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async deleteBinary(key: string): Promise<void> {
    const idb = await this.openIDB();

    return new Promise((resolve, reject) => {
      const request = idb.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}
