import { computed, inject, Injectable, signal } from '@angular/core';
import { ExerciseSqlService } from '../../database/services/exercise-sql.service';
import { MainSqlService } from '../../database/services/main-sql.service';

// Magic header of SQLite. The full signature is 16 bytes
// ("SQLite format 3\0"), but comparing only the bytes of the first 8
// characters is enough to identify the file, and we compare bytes
// directly, without converting the header to a string first.
const SQLITE_MAGIC_8 = new TextEncoder().encode('SQLite f');

// All database-related logic lives here: usage for the UI bar, and backup
// export/import, calling the two SqlDatabase instances directly (root
// injectables, as repository.base.ts does).
@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private readonly main = inject(MainSqlService);
  private readonly exerciseDb = inject(ExerciseSqlService);

  // Fixed capacity that represents 100% of the usage bar.
  static readonly MAX_DB_BYTES = 20 * 1024 * 1024;

  _usedBytes = signal(0);

  usedBytes = this._usedBytes.asReadonly();

  usagePercent = computed(() =>
    Math.min(100, (this._usedBytes() / ConfigService.MAX_DB_BYTES) * 100),
  );

  // Size of both serialized DBs in bytes, straight from the persisted buffers.
  async refreshUsage() {
    const buffers = await Promise.all([
      this.main.getStoredBinary(),
      this.exerciseDb.getStoredBinary(),
    ]);

    this._usedBytes.set(buffers.reduce((total, buffer) => total + (buffer?.byteLength ?? 0), 0));
  }

  // We return an Object URL (not a Blob URL) so the component can revoke it
  // after the download, avoiding leaking the backup in memory.
  createBackupUrl(): string {
    const buffer = this.main.getBinary();
    const blob = new Blob([buffer as unknown as BlobPart], { type: 'application/xsqlite dbsql' });

    return URL.createObjectURL(blob);
  }

  // Only the user's DB is backed up: the exercise list is fixed and reseeds itself.
  async importBackup(buffer: Uint8Array): Promise<void> {
    // Validation of the header comparing only the first 8 bytes.
    const header = buffer.subarray(0, SQLITE_MAGIC_8.length);

    if (
      header.length < SQLITE_MAGIC_8.length ||
      !header.every((byte, index) => byte === SQLITE_MAGIC_8[index])
    ) {
      throw new Error('The file is not a valid SQLite database');
    }
    await this.main.load(buffer);
    await this.refreshUsage();
  }

  async reset(): Promise<void> {
    await Promise.all([this.main.resetDatabase(), this.exerciseDb.resetDatabase()]);
  }
}
