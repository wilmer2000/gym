export interface ChartData {
  label: string;
  color: string;
  value: number | null;
  // Plotted as value but shown by the tooltip when the two differ.
  tooltipValue?: number;
  series?: string;
  dashed?: boolean;
}
