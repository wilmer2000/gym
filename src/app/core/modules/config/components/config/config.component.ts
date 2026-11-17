import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { ConfigService } from '../../services/config.service';

import { ChangePin } from '../../../login/components/change-pin/change-pin.component';
import { Container } from '../../../../components/container/container.component';
import { ModalService } from '../../../modal/services/modal.service';
import { SqlService } from '../../../database/services/sql.service';
import { DATABASE_FILENAME } from '../../../database/constants/database.constant';

@Component({
  selector: 'app-config',
  imports: [Container, Container],
  templateUrl: './config.component.html',
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Config {
  private readonly config = inject(ConfigService);
  private readonly modal = inject(ModalService);
  private readonly sqlite = inject(SqlService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    void this.config.refreshUsage();
  }

  readonly dbUsage = computed(() => {
    const total = ConfigService.MAX_DB_BYTES;
    const used = this.config.usedBytes();

    return {
      percent: Math.min(100, Math.round((used / total) * 100)),
      used: used,
      total: total,
    };
  });

  usageBar = computed(() => `${this.dbUsage().percent}%`);

  usedBytesMessage = computed(() => {
    const usage = this.dbUsage();
    const toMb = (bytes: number) => this.megabytes.format(bytes / 1024 / 1024);

    return `${toMb(usage.used)} de ${toMb(usage.total)}`;
  });

  openChangePin(): void {
    this.modal.open({
      title: 'Cambiar PIN',
      subtitle: 'Primero validamos el PIN actual y después pedimos el nuevo.',
      type: 'info',
      buttons: { okButton: true, closeButton: true },
      component: ChangePin,
    });
  }

  confirmDelete(): void {
    const modalId = this.modal.open({
      title: 'Eliminar cuenta',
      subtitle: 'Se eliminará toda la información de forma permanente y no se podrá recuperar.',
      type: 'error',
      buttons: { okButton: true, closeButton: true },
    });

    this.modal.action$
      .pipe(
        filter((event) => event.id === modalId && event.action === 'ok'),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.sqlite.resetDatabase().then(
          // initLoadData() only runs at startup, so reload to drop stale signals.
          () => location.reload(),
          (error: unknown) => {
            console.error(`Eliminar cuenta failed: ${String(error)}`);
          },
        );
      });
  }

  downloadBackup(): void {
    this.config.createBackupUrl().then(
      (url) => {
        const anchor = document.createElement('a');

        anchor.href = url;
        anchor.download = DATABASE_FILENAME;

        anchor.click();

        URL.revokeObjectURL(url);
      },
      (error: unknown) => {
        console.error(`Descargar copia failed: ${String(error)}`);
      },
    );
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
