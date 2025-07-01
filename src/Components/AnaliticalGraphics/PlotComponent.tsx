
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
  const y = x.map(f);

  return (
    <Plot
      data={[
        {
          x,
          y,
          type: 'scatter',
          mode: 'lines',
        },
      ]}
      layout={{
        width: 700,
        height: 400,
        title: 'Zoom e Pan com Plotly',
        xaxis: { title: 'x' },
        yaxis: { title: 'f(x)' },
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
