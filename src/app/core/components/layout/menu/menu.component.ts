import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { MENU_ITEMS } from '../../../constants/menu.constant';

export interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-menu',
  imports: [RouterLink, RouterLinkActive, NgIcon],
  templateUrl: './menu.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Menu {
  navItems = signal<NavItem[]>(MENU_ITEMS);
}
