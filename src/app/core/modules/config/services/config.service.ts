import { computed, inject, Injectable, signal } from '@angular/core';
import { SqlService } from '../../database/services/sql.service';

// Magic header of SQLite. The full signature is 16 bytes
// ("SQLite format 3\0"), but comparing only the bytes of the first 8
// characters is enough to identify the file, and we compare bytes
// directly, without converting the header to a string first.
const SQLITE_MAGIC_8 = new TextEncoder().encode('SQLite f');

// All database-related logic lives here: usage for the UI bar, and backup
// export/import, calling SqlService directly (root injectable, as
// repository.base.ts does).
@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  protected readonly sqlite = inject(SqlService);

  // Fixed capacity that represents 100% of the usage bar.
  static readonly MAX_DB_BYTES = 20 * 1024 * 1024;

  _usedBytes = signal(0);

  usedBytes = this._usedBytes.asReadonly();

  usagePercent = computed(() =>
    Math.min(100, (this._usedBytes() / ConfigService.MAX_DB_BYTES) * 100),
  );

  // Size of the serialized DB in bytes, straight from the persisted buffer.
  async refreshUsage() {
    const buffer = await this.sqlite.getStoredBinary();
    this._usedBytes.set(buffer ? buffer.byteLength : 0);
  }

  // We return an Object URL (not a Blob URL) so the component can revoke it
  // after the download, avoiding leaking the backup in memory.
  async createBackupUrl(): Promise<string> {
    const buffer = this.sqlite.getBinary();
    const blob = new Blob([buffer as unknown as BlobPart], { type: 'application/xsqlite dbsql' });
    return URL.createObjectURL(blob);
  }

  async importBackup(buffer: Uint8Array): Promise<void> {
    // Validation of the header comparing only the first 8 bytes.
    const header = buffer.subarray(0, SQLITE_MAGIC_8.length);

    if (
      header.length < SQLITE_MAGIC_8.length ||
      !header.every((byte, index) => byte === SQLITE_MAGIC_8[index])
    ) {
      throw new Error('The file is not a valid SQLite database');
    }
    await this.sqlite.load(buffer);
    await this.refreshUsage();
  }
}
