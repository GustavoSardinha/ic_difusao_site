import React from 'react';
import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js-basic-dist';

const Plot = createPlotlyComponent(Plotly);

interface PlotCompProps {
  f: (x: number) => number;
  L: number;
  range: [number, number];
}

const PlotComponent: React.FC<PlotCompProps> = ({
  f,
  L,
  range,
}) => {
  const [a, b] = range;

  const x = Array.from({ length: L }, (_, i) =>
    a + ((b - a) * i) / (L - 1)
  );

  const y = x.map((v) => {
    if (f(v) > 1e18) {
      return 1e18 * Number((f(v) / 1e18).toFixed(5));
    }
    return Number(f(v).toFixed(5));
  });

  const minY = Math.min(...y);
  const maxY = Math.max(...y);
  const isConstant = minY === maxY;

  const yPadding = isConstant
    ? Math.abs(minY) * 0.1 || 1
    : 0;

  return (
    <Plot
      useResizeHandler
      style={{ width: '100%', height: '100%' }}
      data={[
        {
          x,
          y,
          type: 'scatter',
          mode: 'lines',
          name: 'Fluxo escalar de nêutrons X Posição', 
        },
      ]}
      layout={{
        autosize: true,
        title: 'Zoom e Pan com Plotly',
        showlegend: true,
        legend: {
          x: 0.05,
          y: 1,
          bgcolor: 'rgba(255,255,255,0.7)',
          bordercolor: 'black',
          borderwidth: 1,
        },
        xaxis: { title: 'x' },
        yaxis: {
          title: 'f(x)',
          range: isConstant
            ? [minY - yPadding, maxY + yPadding]
            : undefined,
        },
        dragmode: 'zoom',
      }}
      config={{
        scrollZoom: true,
        displaylogo: false,
        modeBarButtonsToAdd: ['zoom2d', 'pan2d', 'autoScale2d'],
        modeBarButtonsToRemove: ['select2d', 'lasso2d'],
        doubleClick: 'reset+autosize',
      }}
    />
  );
};

export default PlotComponent;
