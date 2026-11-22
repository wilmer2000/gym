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
    .dot {
      position: absolute;
      top: 0.25rem;
      left: 0.25rem;
      transition: transform 400ms cubic-bezier(0.22, 1, 0.36, 1);
    }
    nav:has(> a:nth-child(3)[aria-current='location']) .dot {
      transform: translateX(4rem);
    }
    nav:has(> a:nth-child(4)[aria-current='location']) .dot {
      transform: translateX(8rem);
    }
    nav:has(> a:nth-child(5)[aria-current='location']) .dot {
      transform: translateX(12rem);
    }
    nav:has(> a:nth-child(6)[aria-current='location']) .dot {
      transform: translateX(16rem);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Menu {
  navItems = signal<NavItem[]>(MENU_ITEMS);
}
