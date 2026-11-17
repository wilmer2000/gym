import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Modal } from './core/modules/modal/components/modal/modal.component';
import { PwaUpdate } from './core/components/pwa-update/pwa-update.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Modal, PwaUpdate],
  template: `
    <app-pwa-update />
    <router-outlet />
    <app-modal />
  `,
  styles: [':host { display: block; width: 100%; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
