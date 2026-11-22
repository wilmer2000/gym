import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { Section } from '../../../../../shared/components/section/section.component';

@Component({
  selector: 'app-actions-widget',
  imports: [Section, RouterLink, NgIcon],
  template: `
    <app-section [title]="'Acciones rapidas'">
      <button class="btn-icon" routerLink="/plans/new">
        <span class="text-sm flex py-2">Crear nuevo plan</span>
        <ng-icon name="hugeArrowRight01" />
      </button>
    </app-section>
  `,
})
export class ActionsWidget {}
