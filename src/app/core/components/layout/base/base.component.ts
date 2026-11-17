import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ModalService } from '../../../modules/modal/services/modal.service';
import { Header } from '../header/header.component';
import { Menu } from '../menu/menu.component';

@Component({
  selector: 'app-base',
  imports: [RouterOutlet, Header, Menu],
  templateUrl: './base.component.html',
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Base {
  private readonly modal = inject(ModalService);

  sidebarOpen = signal(false);
  sidebarCollapsed = signal(false);

  toggleMenu(): void {
    this.sidebarOpen.update((open) => !open);
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update((collapsed) => !collapsed);
  }

  closeMenu(): void {
    this.sidebarOpen.set(false);
  }
}
