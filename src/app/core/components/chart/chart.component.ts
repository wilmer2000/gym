import { Chart as ChartJs, ChartConfiguration, ChartDataset, TooltipItem } from 'chart.js';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  input,
  OnDestroy,
  viewChild,
} from '@angular/core';
import { ChartData } from './chart-data';

type ChartType = 'bar' | 'line' | 'pie' | 'doughnut';
type ValueFormat = 'currency' | 'percent' | 'number';

const CURRENCY = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const COMPACT_CURRENCY = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
});

const NUMBER = new Intl.NumberFormat('en-US');

@Component({
  selector: 'app-chart',
  template: ` <canvas #canvas aria-label="{{ title() }}" class="w-full h-64 sm:h-72"></canvas> `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Chart implements OnDestroy {
  type = input.required<ChartType>();
  data = input.required<ChartData[]>();
  stacked = input<false | true | 'grouped'>(false);
  title = input<string>();
  colors = input<{
    palette: 'auto' | 'default';
  }>();
  legend = input<'show' | 'hide'>();
  average = input<number>();
  axis = input<{
    title: string;
    format?: ValueFormat;
  }>();
  responsive = input<'responsive' | 'fixed'>();
  maintainAspectRatio = input<'keep' | 'stretch'>('stretch');

  private readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private instance: ChartJs | null = null;

  constructor() {
    effect(() => {
      const canvas = this.canvas()?.nativeElement;

      if (!canvas) {
        return;
      }

      this.render(canvas);
    });
  }

  ngOnDestroy(): void {
    this.instance?.destroy();
    this.instance = null;
  }

  private render(canvas: HTMLCanvasElement): void {
    const type = this.type();
    const data = this.data();
    const isStacked = this.stacked() === true;
    const isGrouped = this.stacked() === 'grouped';
    const isMultiSeries = isStacked || isGrouped;
    const format = this.axis()?.format ?? 'currency';

    const labels: string[] = [];
    const seenLabels = new Set<string>();
    const seriesValues = new Map<string, Map<string, number>>();
    const seriesTooltips = new Map<string, Map<string, number>>();
    const seriesStyles = new Map<string, { color: string; dashed: boolean }>();
    const datasets: ChartDataset[] = [];

    if (isMultiSeries) {
      for (const item of data) {
        if (!seenLabels.has(item.label)) {
          seenLabels.add(item.label);
          labels.push(item.label);
        }

        const series = item.series ?? item.label;

        if (!seriesValues.has(series)) {
          seriesValues.set(series, new Map());
          seriesTooltips.set(series, new Map());
          seriesStyles.set(series, {
            color: item.color,
            dashed: item.dashed === true,
          });
        }

        if (item.value !== null) {
          const values = seriesValues.get(series)!;
          values.set(item.label, (values.get(item.label) ?? 0) + item.value);

          const tooltips = seriesTooltips.get(series)!;
          tooltips.set(
            item.label,
            (tooltips.get(item.label) ?? 0) + (item.tooltipValue ?? item.value),
          );
        }
      }

      for (const [series, values] of seriesValues) {
        const style = seriesStyles.get(series)!;

        datasets.push({
          label: series,
          data: labels.map((label) => values.get(label) ?? null),
          borderColor: style.color,
          backgroundColor: style.color,
          borderWidth: 2,
          borderDash: style.dashed ? [6, 4] : [],
          fill: false,
          pointRadius: type === 'line' ? 2 : 0,
          pointHoverRadius: 5,
          tension: 0.25,
          spanGaps: false,
        } as ChartDataset);
      }
    } else {
      const values: (number | null)[] = [];
      const colors: string[] = [];

      for (const item of data) {
        labels.push(item.label);
        values.push(item.value);
        colors.push(item.color);
      }

      datasets.push({
        data: values,
        backgroundColor: type === 'line' ? colors[0] : colors,
        borderColor: type === 'line' ? colors[0] : undefined,
        fill: false,
        pointRadius: type === 'line' ? 3 : 0,
        pointHoverRadius: 5,
        borderWidth: 2,
        borderRadius: 4,
        maxBarThickness: type === 'bar' ? 10 : undefined,
        tension: 0.25,
        spanGaps: false,
      } as ChartDataset);
    }

    const average = this.average();

    if (average !== undefined) {
      datasets.push({
        type: 'line',
        label: 'Promedio',
        data: labels.map(() => average),
        borderColor: '#6b7280',
        backgroundColor: '#6b7280',
        borderDash: [6, 4],
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 0,
        fill: false,
      } as ChartDataset);
    }

    // Stacked charts show every visible series in the tooltip but also the
    // full month total, including series hidden through the legend.
    const totalsByLabel = new Map<string, number>();
    if (isStacked) {
      for (const item of data) {
        totalsByLabel.set(item.label, (totalsByLabel.get(item.label) ?? 0) + (item.value ?? 0));
      }
    }

    const formatTooltip = (value: number): string => {
      if (format === 'percent') {
        return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
      }

      return format === 'currency' ? CURRENCY.format(value) : NUMBER.format(value);
    };

    const formatTick = (value: number): string => {
      if (format === 'percent') {
        return `${Math.round(value)}%`;
      }

      return format === 'currency' ? COMPACT_CURRENCY.format(value) : NUMBER.format(value);
    };

    if (this.instance) {
      this.instance.destroy();
    }

    const config: ChartConfiguration = {
      type,
      data: {
        labels,
        datasets,
      },
      options: {
        responsive: this.responsive() !== 'fixed',
        maintainAspectRatio: this.maintainAspectRatio() !== 'stretch',
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            display: this.legend() !== 'hide',
          },
          tooltip: {
            callbacks: {
              label: (context: TooltipItem<'bar' | 'line'>) => {
                const parsed = context.parsed;
                const plotted = (typeof parsed === 'number' ? parsed : parsed.y) ?? 0;
                const series = context.dataset.label;
                const raw =
                  isMultiSeries && series
                    ? seriesTooltips.get(series)?.get(context.label ?? '')
                    : undefined;
                const text = formatTooltip(raw ?? plotted);

                return datasets.length > 1 && series ? `${series}: ${text}` : text;
              },
              ...(isStacked
                ? {
                    footer: (items: TooltipItem<'bar' | 'line'>[]) => {
                      const label = items[0]?.label ?? '';

                      return `Total: ${formatTooltip(totalsByLabel.get(label) ?? 0)}`;
                    },
                  }
                : {}),
            },
          },
        },
        scales: {
          x: {
            stacked: isStacked,
          },
          y: {
            stacked: isStacked,
            title: {
              text: this.axis()?.title ?? '',
            },
            ticks: {
              callback: (value) => formatTick(Number(value)),
            },
          },
        },
      },
    };

    this.instance = new ChartJs(canvas, config);
  }
}
