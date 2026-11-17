import { inject } from '@angular/core';
import { SqlService } from '../services/sql.service';

// CRUD base shared by every repository. Each repository declares only its schema:
// table, defaultOrder, idColumn, toRow() and fromRow(); the SQL generation, the
// bulk transaction and the persistence live here. The inject() call below is
// resolved by Angular for the decorated repository that extends this base.
export abstract class RepositoryBase<T> {
  protected readonly sqlite = inject(SqlService);
  protected abstract toRow(entity: T): Record<string, unknown>;
  protected abstract fromRow(row: Record<string, any>): T;

  protected table: string = '';
  protected defaultOrder: string = '';
  protected idColumn: string = 'id';

  findAll(order: string = this.defaultOrder): T[] {
    return this.selectEntities(`SELECT * FROM ${this.table}${this.orderBy(order)}`);
  }

  find(criteria: Partial<T> = {}, order: string = this.defaultOrder): T[] {
    const { clause, params } = this.where(criteria);

    return this.selectEntities(
      `SELECT * FROM ${this.table}${this.filter(clause)}${this.orderBy(order)}`,
      params,
    );
  }

  findById(id: string): T | null {
    const sql = `SELECT * FROM ${this.table} WHERE ${this.column(this.idColumn)} = ? LIMIT 1`;

    return this.selectEntities(sql, [id])[0] ?? null;
  }

  findOne(criteria: Partial<T> = {}): T | null {
    const { clause, params } = this.where(criteria);

    return (
      this.selectEntities(`SELECT * FROM ${this.table}${this.filter(clause)} LIMIT 1`, params)[0] ??
      null
    );
  }

  exists(id: string): boolean {
    return this.findById(id) !== null;
  }

  count(criteria: Partial<T> = {}): number {
    const { clause, params } = this.where(criteria);
    const [row] = this.sqlite.select(
      `SELECT COUNT(*) AS total FROM ${this.table}${this.filter(clause)}`,
      params,
    );

    return Number(row?.total ?? 0);
  }

  create(entity: T): T {
    const { sql, params } = this.insertStatement(this.toRow(entity));

    this.sqlite.run(sql, params);

    return entity;
  }

  update(entity: T): T {
    const row = this.toRow(entity);
    const keys = Object.keys(row).filter((key) => key !== this.idColumn);
    const sql = `UPDATE ${this.table} SET ${keys.map((key) => `${this.column(key)} = ?`).join(', ')} WHERE ${this.column(this.idColumn)} = ?;`;
    const params = [...keys.map((key) => this.param(row[key])), this.param(row[this.idColumn])];

    this.sqlite.run(sql, params);

    return entity;
  }

  updateFields(ids: string[], patch: Partial<T>): T[] {
    const keys = Object.keys(patch).filter((key) => key !== this.idColumn);

    if (ids.length === 0 || keys.length === 0) {
      return [];
    }

    const sql = `UPDATE ${this.table} SET ${keys.map((key) => `${this.column(key)} = ?`).join(', ')}
      WHERE ${this.column(this.idColumn)} IN (${ids.map(() => '?').join(', ')});`;
    const params = [
      ...keys.map((key) => this.param(patch[key as keyof T])),
      ...ids.map((id) => this.param(id)),
    ];

    this.sqlite.run(sql, params);

    return this.findAll();
  }

  remove(id: string): T | null {
    const entity = this.findById(id);

    this.sqlite.run(`DELETE FROM ${this.table} WHERE ${this.column(this.idColumn)} = ?;`, [id]);

    return entity;
  }

  removeAll(ids: string[]): number {
    if (ids.length === 0) {
      return 0;
    }

    const existing = ids.filter((id) => this.exists(id));
    const placeholders = ids.map(() => '?').join(', ');

    this.sqlite.run(
      `DELETE FROM ${this.table} WHERE ${this.column(this.idColumn)} IN (${placeholders});`,
      ids,
    );

    return existing.length;
  }

  clear(): void {
    this.sqlite.run(`DELETE FROM ${this.table};`);
  }

  async save(entities: T[]): Promise<T[]> {
    if (entities.length === 0) {
      return this.findAll();
    }

    const db = this.sqlite.database;

    if (!db) {
      throw new Error('Base de datos no inicializada');
    }

    const rows = entities.map((entity) => this.toRow(entity));
    const keys = Object.keys(rows[0]);
    const sql = `INSERT OR REPLACE INTO ${this.table} (${keys.map((key) => this.column(key)).join(', ')}) VALUES (${keys.map(() => '?').join(', ')});`;

    db.run('BEGIN TRANSACTION;');

    const stmt = db.prepare(sql);

    try {
      for (const row of rows) {
        stmt.run(keys.map((key) => this.param(row[key])));
      }

      stmt.free();
      db.run('COMMIT;');
      await this.sqlite.persist();

      return this.findAll();
    } catch (error) {
      db.run('ROLLBACK;');
      await this.sqlite.persist();
      console.error(`Error saving ${this.table} repository:`, error);

      throw error;
    }
  }

  queryRaw(sql: string, params: any[] = []): T[] {
    return this.selectEntities(sql, params);
  }

  private column(name: string) {
    return `\`${name}\``;
  }

  // Scalar used as SQL parameter. Dates travel as epoch milliseconds, the
  // representation repositories store; a repository using another one overrides
  // this hook so WHERE values keep matching the stored rows.
  protected param(value: unknown): any {
    return value instanceof Date ? value.getTime() : value;
  }

  private where(criteria: Partial<T>) {
    const entries = Object.entries(criteria).filter(
      ([, value]) => value !== undefined && value !== null,
    );

    if (entries.length === 0) {
      return { clause: '', params: [] as any[] };
    }

    return {
      clause: entries.map(([key]) => `${this.column(key)} = ?`).join(' AND '),
      params: entries.map(([, value]) => this.param(value)),
    };
  }

  private filter(clause: string) {
    return clause ? ` WHERE ${clause}` : '';
  }

  private orderBy(order: string) {
    return order ? ` ORDER BY ${order}` : '';
  }

  private selectEntities(sql: string, params: any[] = []) {
    return this.sqlite.select(sql, params).map((row) => this.fromRow(row));
  }

  private insertStatement(row: Record<string, unknown>) {
    const keys = Object.keys(row);

    return {
      sql: `INSERT OR REPLACE INTO ${this.table} (${keys.map((key) => this.column(key)).join(', ')}) VALUES (${keys.map(() => '?').join(', ')});`,
      params: keys.map((key) => this.param(row[key])),
    };
  }
}
