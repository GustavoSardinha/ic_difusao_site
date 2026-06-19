import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeWrapperProps from '../../Interfaces/HomeWrapperProps';
import ResultState from '../../Interfaces/ResultState';

function DrivenPowerComponent({ initialState }: HomeWrapperProps) {
  const [result, setResult] = useState<ResultState | null>(initialState?.result || null);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const [boundaries, setBoundaries] = useState<number[]>([]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  // 1. Inicializa as linhas divisórias APENAS NA MONTAGEM (se houver regiões)
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

  // 2. Lida com o arraste do mouse
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingIndex === null || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      let newBoundaryPct = ((e.clientX - rect.left) / rect.width) * 100;

      const newBoundaries = [...boundaries];
      const minRegionSize = 0; 

      // Torna a lógica dinâmica para suportar N barras
      // O limite esquerdo é a barra anterior (ou 0%)
      const prevBoundary = draggingIndex === 0 ? 0 : boundaries[draggingIndex - 1];
      // O limite direito é a próxima barra (ou 100%)
      const nextBoundary = draggingIndex === boundaries.length - 1 ? 100 : boundaries[draggingIndex + 1];

      // Trava a barra para não ultrapassar os vizinhos
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

  // 3. Calcula as regiões dinamicamente com base nas boundaries ATUAIS
  const regions = [];
  if (result?.numRegioes) {
    for (let i = 0; i < result.numRegioes; i++) {
      const start = i === 0 ? 0 : boundaries[i - 1];
      const end = i === result.numRegioes - 1 ? 100 : boundaries[i];
      
      // Fallback seguro caso as boundaries ainda não estejam montadas
      const percentual = (end !== undefined && start !== undefined) 
        ? (end - start) 
        : (100 / result.numRegioes);
      
      regions.push({ percentual });
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div 
        ref={containerRef}
        style={{ 
          position: 'relative', 
          display: 'flex', 
          height: '30px', 
          width: '100%', 
          border: '1px solid #ccc',
          userSelect: 'none',
          overflow: 'hidden' // Evita que arredondamentos quebrem o layout
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
              marginLeft: '-2.5px', // Centraliza a barra (metade de 5px)
              backgroundColor: draggingIndex === index ? '#019722' : '#d1cece',
              border: '1px solid #333',
              cursor: 'col-resize',
              zIndex: 10,
              borderRadius: '2px',
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default DrivenPowerComponent;