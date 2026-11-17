import { computed, Injectable, signal, Type } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export type ModalType = 'error' | 'warning' | 'success' | 'info';

export type ModalAction = 'ok' | 'close' | 'back';

export interface ModalButtons {
  okButton?: boolean;
  closeButton?: boolean;
  backButton?: boolean;
}

export interface ModalConfig {
  title?: string;
  subtitle?: string;
  type?: ModalType;
  buttons?: ModalButtons;
  /** Footer labels, so the same modal can say "Crear" or "Guardar". */
  okLabel?: string;
  closeLabel?: string;
  /** Data passed as the `data` input of the dynamic component. */
  data?: unknown;
  /** Component rendered inside the modal body. */
  component?: Type<unknown>;
}

export interface ModalState extends ModalConfig {
  id: number;
  title: string;
  subtitle: string;
  type: ModalType;
  buttons: Required<ModalButtons>;
  okLabel: string;
  closeLabel: string;
}

export interface ModalEvent {
  id: number;
  action: ModalAction;
}

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
