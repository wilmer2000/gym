import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { ModalService } from '../../../../modal/services/modal.service';
import { ConfigService } from '../../../services/config.service';
import { Section } from '../../../../../../shared/components/section/section.component';

@Component({
  selector: 'app-delete-account-section',
  templateUrl: './delete-account-section.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Section],
})
export class DeleteAccountSection {
  private readonly config = inject(ConfigService);
  private readonly modal = inject(ModalService);
  private readonly destroyRef = inject(DestroyRef);

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
        this.config.reset().then(
          // The databases are only read at startup, so reload to drop stale data.
          () => location.reload(),
          (error: unknown) => {
            console.error(`Eliminar cuenta failed: ${String(error)}`);
          },
        );
      });
  }
}
