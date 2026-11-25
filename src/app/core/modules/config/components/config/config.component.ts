import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Container } from '../../../../components/container/container.component';
import { DatabaseSection } from '../sections/database-section/database-section.component';
import { DeleteAccountSection } from '../sections/delete-account-section/delete-account-section.component';

@Component({
  selector: 'app-config',
  imports: [Container, DatabaseSection, DeleteAccountSection],
  templateUrl: './config.component.html',
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Config {}
