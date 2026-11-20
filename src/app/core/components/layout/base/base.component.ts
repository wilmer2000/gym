import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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
export class Base {}
