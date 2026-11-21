import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  contentChild,
  model,
} from '@angular/core';

@Component({
  selector: 'app-drag-list',
  imports: [CdkDrag, CdkDropList, NgTemplateOutlet],
  template: `
    <div
      class="max-h-80 overflow-y-auto flex flex-col gap-2"
      cdkDropList
      (cdkDropListDropped)="drop($event)"
    >
      @for (item of items(); track $index) {
        <div cdkDrag>
          <ng-container
            [ngTemplateOutlet]="row()"
            [ngTemplateOutletContext]="{ $implicit: item, index: $index }"
          />
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DragList<T> {
  readonly items = model.required<T[]>();
  readonly row = contentChild.required(TemplateRef);

  drop(event: CdkDragDrop<T[]>): void {
    this.items.update((items) => {
      const next = [...items];

      moveItemInArray(next, event.previousIndex, event.currentIndex);

      return next;
    });
  }
}
