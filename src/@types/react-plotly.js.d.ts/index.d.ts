
declare module 'react-plotly.js' {
  import * as React from 'react';
  import { PlotlyHTMLElement } from 'plotly.js';

  export interface PlotlyData { [key: string]: any }
  export interface Layout { [key: string]: any }
  export interface Config { [key: string]: any }

  export interface PlotlyProps {
    data: PlotlyData[];
    layout?: Partial<Layout>;
    config?: Partial<Config>;
    style?: React.CSSProperties;
    className?: string;
    divId?: string;
    useResizeHandler?: boolean;
    onInitialized?: (figure: any, graphDiv: PlotlyHTMLElement) => void;
    onUpdate?: (figure: any, graphDiv: PlotlyHTMLElement) => void;
    revision?: any;
  }

  const Plot: React.ComponentType<PlotlyProps>;
  export default Plot;
}

declare module 'react-plotly.js/factory' {
  import { ComponentType } from 'react';
  import { PlotlyStatic } from 'plotly.js';
  const createPlotComponent: (plotly: PlotlyStatic) => ComponentType<any>;
  export default createPlotComponent;
}
declare module 'plotly.js-basic-dist' {
  import * as Plotly from 'plotly.js';
  export default Plotly;
}

