import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { SwUpdate } from '@angular/service-worker';
import { ModalService } from '../../modules/modal/services/modal.service';
import { StorageService } from '../../services/storage.service';
import { formatUpdate } from '../../utils/date.util';

const LAST_UPDATE_KEY = 'app-last-update';
const UPDATE_READY = 'VERSION_READY';

@Component({
  selector: 'app-pwa-update',
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PwaUpdate {
  private readonly swUpdate = inject(SwUpdate);
  private readonly modalService = inject(ModalService);
  private readonly storage = inject(StorageService);
  private readonly destroyRef = inject(DestroyRef);

  private modalId = 0;
  private awaitingAction = false;

  constructor() {
    effect(() => {
      if (!this.swUpdate.isEnabled) {
        return;
      }

      this.swUpdate.versionUpdates
        .pipe(
          filter((update) => update.type === UPDATE_READY),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe(() => this.notify());

      void this.swUpdate.checkForUpdate();
    });

    this.modalService.action$
      .pipe(
        filter((event) => event.id === this.modalId),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        if (event.action === 'ok') {
          this.reload();
          return;
        }

        this.awaitingAction = false;
      });
  }

  private lastUpdate(): number | null {
    return this.storage.getItem<number>(LAST_UPDATE_KEY);
  }

  private notify(): void {
    if (this.awaitingAction) {
      return;
    }

    this.awaitingAction = true;

    const updated = this.lastUpdate() ?? Date.now();
    this.storage.setItem(LAST_UPDATE_KEY, updated);

    this.modalId = this.modalService.open({
      title: 'Nueva actualización disponible',
      subtitle: `Ultima actualización: ${formatUpdate(new Date(updated))}. Presiona ACEPTAR para recargar.`,
      type: 'info',
      buttons: { okButton: true, closeButton: true },
    });
  }

  private reload(): void {
    this.awaitingAction = false;
    window.location.reload();
  }
}
