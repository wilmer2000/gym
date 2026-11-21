import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DATABASE_FILENAME } from '../../../../database/constants/database.constant';
import { Disc } from '../../../../../../shared/components/disc/disc.component';
import { ConfigService } from '../../../services/config.service';
import { Section } from '../../../../../../shared/components/section/section.component';

@Component({
  selector: 'app-database-section',
  templateUrl: './database-section.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Disc, Section],
})
export class DatabaseSection {
  private readonly config = inject(ConfigService);
  readonly filename = DATABASE_FILENAME;

  dbUsage = computed(() => {
    const total = ConfigService.MAX_DB_BYTES;
    const used = this.config.usedBytes();

    return {
      percent: Math.min(100, Math.round((used / total) * 100)),
      used: used,
      total: total,
    };
  });
  usedBytesMessage = computed(() => {
    const usage = this.dbUsage();
    const toMb = (bytes: number) => this.megabytes.format(bytes / 1024 / 1024);

    return `${toMb(usage.used)} de ${toMb(usage.total)}`;
  });

  constructor() {
    void this.config.refreshUsage();
  }

  downloadBackup(): void {
    const url = this.config.createBackupUrl();
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = DATABASE_FILENAME;

    anchor.click();

    URL.revokeObjectURL(url);
  }

  async importBackup(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const buffer = await file.arrayBuffer();

    try {
      await this.config.importBackup(new Uint8Array(buffer));
      location.reload();
    } catch (error) {
      console.error(`Importar backup failed: ${String(error)}`);
    } finally {
      input.value = '';
    }
  }

  private readonly megabytes = new Intl.NumberFormat('es', {
    maximumFractionDigits: 1,
    style: 'unit',
    unit: 'megabyte',
  });
}
