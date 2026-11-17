import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pager',
  imports: [],
  templateUrl: './pager.component.html',
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pager {
  page = input(0);
  total = input.required<number>();
  size = input(10);
  sizes = input<number[]>([5, 10, 25, 50, 100]);

  pageChange = output<number>();
  sizeChange = output<number>();

  pages = computed(() => Math.max(1, Math.ceil(this.total() / Math.max(1, this.size()))));
  current = computed(() => Math.min(Math.max(0, this.page()), this.pages() - 1));
  visiblePages = computed(() => {
    const windowSize = 5;
    const pages = this.pages();
    const end = Math.min(pages, Math.max(windowSize, this.current() + 3));
    const start = Math.max(0, end - windowSize);

    return Array.from({ length: end - start }, (_, index) => start + index);
  });

  go(page: number): void {
    const target = Math.min(Math.max(0, page), this.pages() - 1);

    if (target !== this.current()) {
      this.pageChange.emit(target);
    }
  }

  changeSize(event: Event): void {
    const size = Number((event.target as HTMLSelectElement).value);

    if (size > 0 && size !== this.size()) {
      this.sizeChange.emit(size);
    }
  }
}
