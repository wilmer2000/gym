import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  template: `
    <div class="flex w-full items-center justify-between gap-4">
      <p class="text-lg font-semibold text-primary">Gym</p>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="cursor-pointer rounded-md p-2 text-text-secondary hover:bg-surface-muted md:hidden"
          aria-label="Abrir menú"
          aria-controls="app-sidebar"
          [attr.aria-expanded]="menuOpen()"
          (click)="menuToggle.emit()"
        >
          <svg
            class="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
            />
          </svg>
        </button>

        <button
          type="button"
          class="hidden cursor-pointer rounded-md p-2 text-text-secondary hover:bg-surface-muted md:inline-flex"
          [attr.aria-label]="collapsed() ? 'Mostrar menú' : 'Ocultar menú'"
          aria-controls="app-sidebar"
          [attr.aria-expanded]="!collapsed()"
          (click)="sidebarToggle.emit()"
        >
          <svg
            class="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
            />
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  readonly menuOpen = input(false);
  readonly collapsed = input(false);
  readonly menuToggle = output<void>();
  readonly sidebarToggle = output<void>();
}
