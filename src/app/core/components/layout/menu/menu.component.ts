import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-menu',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav>
      <a [routerLink]="'/plans'" [routerLinkActive]="'text-blue-500'">Planes</a>
      <a [routerLink]="'/exercises'" [routerLinkActive]="'text-blue-500'">Ejercicios</a>
      <a [routerLink]="'/config'" [routerLinkActive]="'text-blue-500'">Configuración</a>
    </nav>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Menu {}
