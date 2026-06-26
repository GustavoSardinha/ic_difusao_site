import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeWrapperProps from '../../Interfaces/HomeWrapperProps';
import ResultState from '../../Interfaces/ResultState';
import PlotComponent from '../../Components/AnaliticalGraphics/PlotComponent';
import CheckBoxInput from '../../Components/CheckBoxInput';

function DrivenPowerComponent({ initialState }: HomeWrapperProps) {
  const [result, setResult] = useState<ResultState | null>(initialState?.result || null);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Estado que controlará o nosso interruptor
  const [source, setSource] = useState<boolean>(false);

  const [boundaries, setBoundaries] = useState<number[]>([]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (result?.numRegioes) {
      const initialBoundaries: number[] = [];
      const regionSize = 100 / result.numRegioes;
      
      for (let i = 0; i < result.numRegioes - 1; i++) {
        initialBoundaries.push(regionSize * (i + 1));
      }
      setBoundaries(initialBoundaries);
    }
  }, [result?.numRegioes]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingIndex === null || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      let newBoundaryPct = ((e.clientX - rect.left) / rect.width) * 100;

      const newBoundaries = [...boundaries];
      const minRegionSize = 0; 

      const prevBoundary = draggingIndex === 0 ? 0 : boundaries[draggingIndex - 1];
      const nextBoundary = draggingIndex === boundaries.length - 1 ? 100 : boundaries[draggingIndex + 1];

      newBoundaryPct = Math.max(
        prevBoundary + minRegionSize, 
        Math.min(newBoundaryPct, nextBoundary - minRegionSize)
      );

      newBoundaries[draggingIndex] = newBoundaryPct;
      setBoundaries(newBoundaries);
    };

    const handleMouseUp = () => {
      setDraggingIndex(null); 
    };

    if (draggingIndex !== null) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingIndex, boundaries]);

  const regions = [];
  if (result?.numRegioes) {
    for (let i = 0; i < result.numRegioes; i++) {
      const start = i === 0 ? 0 : boundaries[i - 1];
      const end = i === result.numRegioes - 1 ? 100 : boundaries[i];
      
      const percentual = (end !== undefined && start !== undefined) 
        ? (end - start) 
        : (100 / result.numRegioes);
      
      regions.push({ percentual });
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      
      {/* Design do Interruptor da Fonte de Nêutrons */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <span style={{ marginRight: '15px', fontWeight: 'bold', color: '#333', fontSize: '14px' }}>
          Fonte Externa de Nêutrons
        </span>
        
        <div
          onClick={() => setSource(!source)}
          style={{
            width: '46px',
            height: '24px',
            backgroundColor: source ? '#019722' : '#ccc',
            borderRadius: '12px',
            position: 'relative',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)'
          }}
        >
          <div
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: 'white',
              borderRadius: '50%',
              position: 'absolute',
              top: '2px',
              left: source ? '24px' : '2px',
              transition: 'left 0.3s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
          />
        </div>

        <span style={{ 
          marginLeft: '15px', 
          color: source ? '#019722' : '#777', 
          fontWeight: 'bold',
          fontSize: '13px'
        }}>
          {source ? 'LIGADA' : 'DESLIGADA'}
        </span>
      </div>
      <span style={{ marginRight: '15px', fontWeight: 'bold', color: '#333', fontSize: '14px', marginBottom: '10px', display: 'block' }}>
        Distribuição de Potência:
      </span>
      <div 
        ref={containerRef}
        style={{ 
          position: 'relative', 
          display: 'flex', 
          height: '30px', 
          width: '100%', 
          border: '1px solid #ccc',
          userSelect: 'none',
          overflow: 'hidden',
          marginBottom: '20px'
        }}
      >

        {regions.map((region, index) => (
          <div 
            key={`region-${index}`}
            style={{ 
              width: `${region.percentual}%`, 
              backgroundColor:'#6c757d', 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
              transition: draggingIndex === null ? 'width 0.1s ease-out' : 'none', 
            }}
          >
            {Math.round(region.percentual)}%
          </div>
        ))}

        {boundaries.map((boundary, index) => (
          <div
            key={`handle-${index}`}
            onMouseDown={() => setDraggingIndex(index)}
            style={{
              position: 'absolute',
              left: `${boundary}%`,
              top: 0,
              bottom: 0,
              width: '5px',
              marginLeft: '-2.5px', 
              backgroundColor: draggingIndex === index ? '#019722' : '#d1cece',
              border: '1px solid #333',
              cursor: 'col-resize',
              zIndex: 10,
              borderRadius: '2px',
            }}
          />
        ))}
      </div>
      <PlotComponent f={(x) => {return x + 1}} L={1000} range={[0, 100]} />
    </div>
  );
}

export default DrivenPowerComponent;