import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Section } from '../../../../../shared/components/section/section.component';
import { Button } from '../../../../../core/modules/form/components/button/button.component';

@Component({
  selector: 'app-actions-widget',
  imports: [Section, RouterLink, Button],
  template: `
    <app-section [title]="'Acciones rapidas'">
      <div class="grid grid-cols-2 gap-2">
        <app-button [label]="'Nuevo plan'" routerLink="/plans/new" />
      </div>
    </app-section>
  `,
})
export class ActionsWidget {}
