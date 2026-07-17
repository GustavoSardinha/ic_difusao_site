import React from 'react';
import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js-basic-dist';

const Plot = createPlotlyComponent(Plotly);

interface PlotCompProps {
  x_data: number[];
  y_data: number[];
  width: number[];
}

const PlotHistogramComponent: React.FC<PlotCompProps> = ({
  x_data,
  y_data,
  width,
}) => {
  return (
    <Plot
      useResizeHandler
      style={{ width: '100%', height: '100%' }}
      data={[
        {
          x: x_data,
          y: y_data,
          type: 'bar',
          name: 'Potência em MW',
          width: width,
        },
      ]}
      layout={{
        autosize: true,
        showlegend: true,
        title: 'Potência em MW X Posição',
        xaxis: {
          title: 'Posição',
        },
        yaxis: {
          title: 'Potência (MW)',
        },
        bargap: 0,
        dragmode: 'zoom',
      }}
      config={{
        scrollZoom: true,
        displaylogo: false,
        doubleClick: 'reset+autosize',
      }}
    />
  );
};

export default PlotHistogramComponent;