import { Injectable, signal } from '@angular/core';
import initSqlJs, { Database, SqlJsStatic } from 'sql.js';

const DB_NAME = 'GymAppDB';
const STORE_NAME = 'sqlite_store';
const FILE_KEY = 'sqlite_binary';

@Injectable({ providedIn: 'root' })
export class SqlService {
  private db: Database | null = null;

  isReady = signal<boolean>(false);

  get database(): Database | null {
    return this.db;
  }

  async initDatabase(): Promise<void> {
    if (this.isReady()) return;

    try {
      const SQL: SqlJsStatic = await initSqlJs({
        locateFile: (file: string) => `db/${file}`,
      });

      const savedBuffer = await this.getBufferFromIndexedDB();

      if (savedBuffer) {
        try {
          this.db = new SQL.Database(savedBuffer);
        } catch (dbError) {
          this.db = new SQL.Database();
        }
      } else {
        this.db = new SQL.Database();
      }

      this.createTables();

      await this.saveToDisk();

      this.isReady.set(true);
    } catch (error) {
      console.error('Error al inicializar SQLite:', error);
      throw error;
    }
  }

  private saveQueue: Promise<void> = Promise.resolve();

  async saveToDisk(): Promise<void> {
    if (!this.db) return;

    try {
      await this.setBufferInIndexedDB(this.db.export());
    } catch (error) {
      console.error('Error persistendo el binario en IndexedDB:', error);
    }
  }

  persist(): Promise<void> {
    this.saveQueue = this.saveQueue.then(() => this.saveToDisk());
    return this.saveQueue;
  }

  run(sql: string, params: any[] = []): void {
    if (!this.db) throw new Error('Base de datos no inicializada');

    this.db.run(sql, params);

    void this.persist();
  }

  query<T = any>(sql: string, params: any[] = []): T[] {
    if (!this.db) {
      throw new Error('Base de datos no inicializada');
    }

    const cleanSql = sql.trim().toUpperCase();
    const isSelect =
      cleanSql.startsWith('SELECT') ||
      cleanSql.startsWith('PRAGMA') ||
      cleanSql.startsWith('EXPLAIN') ||
      cleanSql.startsWith('WITH');

    if (isSelect) {
      const stmt = this.db.prepare(sql);
      stmt.bind(params);

      const results: T[] = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject() as T);
      }
      stmt.free();
      return results;
    } else {
      // Para escrituras (INSERT, UPDATE, DELETE, ALTER, etc.)
      this.db.run(sql, params);

      // Persistir el cambio binario en IndexedDB de inmediato
      void this.persist();

      return [];
    }
  }

  // Raw binary of the DB in memory, for the backup download in the config UI.
  getBinary(): Uint8Array {
    if (!this.db) throw new Error('Base de datos no inicializada');
    return this.db.export();
  }

  // Raw binary persisted in IndexedDB, without going through the in-memory DB:
  // it is the exact size the database occupies in the storage.
  async getStoredBinary(): Promise<Uint8Array | null> {
    return await this.getBufferFromIndexedDB();
  }

  // Rebuilds the in-memory DB from a backup binary (database recovery).
  async load(buffer: Uint8Array): Promise<void> {
    const SQL: SqlJsStatic = await initSqlJs({
      locateFile: (file: string) => `db/${file}`,
    });

    this.db = new SQL.Database(buffer);
    this.createTables();
    await this.saveToDisk();
    this.isReady.set(true);
  }

  // Drops every table and recreates them empty. Used by "Eliminar cuenta".
  async resetDatabase(): Promise<void> {
    if (!this.db) throw new Error('Base de datos no inicializada');

    this.createTables();

    // Goes through the queue so a pending persist() does not overwrite the reset.
    await this.persist();
  }

  select<T = any>(sql: string, params: any[] = []): T[] {
    if (!this.db) throw new Error('Base de datos no inicializada');

    const stmt = this.db.prepare(sql);
    stmt.bind(params);

    const results: T[] = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as T);
    }
    stmt.free();
    return results;
  }

  private createTables(): void {
    if (!this.db) return;
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

  private async getBufferFromIndexedDB(): Promise<Uint8Array | null> {
    try {
      const idb = await this.openIDB();
      return new Promise((resolve, reject) => {
        const tx = idb.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(FILE_KEY);

        request.onsuccess = () => {
          const result = request.result;
          if (!result) {
            resolve(null);
            return;
          }
          // Asegurar que cualquier formato de binario se convierta en Uint8Array
          if (result instanceof Uint8Array) {
            resolve(result);
          } else if (result instanceof ArrayBuffer) {
            resolve(new Uint8Array(result));
          } else {
            // Por si se guardó como un objeto plano con índices numéricos
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

  private async setBufferInIndexedDB(buffer: Uint8Array): Promise<void> {
    const idb = await this.openIDB();
    return new Promise((resolve, reject) => {
      const tx = idb.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(buffer, FILE_KEY);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}
