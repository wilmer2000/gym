import { computed, Injectable, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import {
  ModalAction,
  ModalButtons,
  ModalConfig,
  ModalEvent,
  ModalState,
} from '../interfaces/modal.interface';

const DEFAULT_BUTTONS: Required<ModalButtons> = {
  okButton: true,
  closeButton: true,
  backButton: false,
};

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private stack = signal<ModalState[]>([]);
  private readonly actionSubject = new Subject<ModalEvent>();
  private readonly closedSubject = new Subject<number>();
  private readonly guards = new Map<number, () => boolean>();
  private sequence = 0;

  modal = computed<ModalState | null>(() => this.stack().at(-1) ?? null);
  action$: Observable<ModalEvent> = this.actionSubject.asObservable();
  closed$: Observable<number> = this.closedSubject.asObservable();

  open(config: ModalConfig = {}): number {
    const id = ++this.sequence;

    this.stack.update((current) => [
      ...current,
      {
        id,
        title: config.title ?? 'Aviso',
        subtitle: config.subtitle ?? '',
        type: config.type ?? 'info',
        buttons: { ...DEFAULT_BUTTONS, ...config.buttons },
        okLabel: config.okLabel ?? 'Aceptar',
        closeLabel: config.closeLabel ?? 'Cerrar',
        data: config.data,
        component: config.component,
      },
    ]);

    return id;
  }

  /** Blocks the ok action while the hosted component reports invalid data. */
  guard(id: number, canClose: () => boolean): void {
    this.guards.set(id, canClose);
  }

  trigger(action: ModalAction, id: number = this.modal()?.id ?? 0): void {
    if (!this.stack().some((modal) => modal.id === id)) {
      return;
    }

    if (action === 'ok' && this.guards.get(id)?.() === false) {
      return;
    }

    this.actionSubject.next({ id, action });
    this.close(id);
  }

  close(id: number = this.modal()?.id ?? 0): void {
    if (!this.stack().some((modal) => modal.id === id)) {
      return;
    }

    this.guards.delete(id);
    this.stack.update((current) => current.filter((modal) => modal.id !== id));
    this.closedSubject.next(id);
  }

  closeAll(): void {
    for (const modal of [...this.stack()].reverse()) {
      this.close(modal.id);
    }
  }
}
