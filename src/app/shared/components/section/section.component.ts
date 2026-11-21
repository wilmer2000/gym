import { Component, input } from '@angular/core';

@Component({
  selector: 'app-section',
  imports: [],
  template: `
    <div class="flex flex-col gap-2">
      <h3 class="ml-4">{{ title() }}</h3>
      <div class="card">
        <div class="card-body flex flex-col gap-4">
          <ng-content />
        </div>
      </div>
    </div>
  `,
  styles: ``,
})
export class Section {
  title = input.required<string>();
}
