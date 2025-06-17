import { ChartType } from "chart.js";

declare module 'chartjs-plugin-crosshair';
declare module "chart.js" {
  interface PluginOptionsByType<TType extends ChartType> {
    crosshair?: any;
  }
}