import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  output,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { ModalAction, ModalEvent, ModalService, ModalType } from '../../services/modal.service';

const TONES: Record<ModalType, { icon: string; title: string; iconClass: string }> = {
  error: { icon: '✕', title: 'text-red-600', iconClass: 'bg-red-100 text-red-600' },
  warning: { icon: '!', title: 'text-amber-600', iconClass: 'bg-amber-100 text-amber-600' },
  success: { icon: '✓', title: 'text-green-600', iconClass: 'bg-green-100 text-green-600' },
  info: { icon: 'i', title: 'text-primary-600', iconClass: 'bg-primary-100 text-primary-600' },
};

@Component({
  selector: 'app-modal',
  imports: [],
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
  templateUrl: './modal.component.html',
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Modal {
  readonly service = inject(ModalService);
  readonly modal = this.service.modal;

  readonly closed = output<number>();
  readonly action = output<ModalEvent>();

  private readonly host = viewChild('host', { read: ViewContainerRef });

  tone = computed(() => TONES[this.modal()?.type ?? 'info']);

  constructor() {
    effect(() => {
      const state = this.modal();
      const host = this.host();

      if (!host) {
        return;
      }

      host.clear();

      if (state?.component) {
        const ref = host.createComponent(state.component);

        if (state.data !== undefined) {
          ref.setInput('data', state.data);
        }
      }
    });
  }

  trigger(action: ModalAction): void {
    const state = this.modal();

    if (!state) {
      return;
    }

    this.action.emit({ id: state.id, action });
    this.service.trigger(action, state.id);
    this.closed.emit(state.id);
  }

  onEscape(): void {
    if (this.modal()) {
      this.trigger('close');
    }
  }
}
