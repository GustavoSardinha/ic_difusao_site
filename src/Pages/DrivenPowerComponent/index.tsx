import React, { useState, useRef } from 'react';
import HomeWrapperProps from '../../Interfaces/HomeWrapperProps';
import ResultState from '../../Interfaces/ResultState';
import PlotComponent from '../../Components/AnaliticalGraphics/PlotComponent';
import PlotHistogramComponent from '../../Components/AnaliticalGraphics/PlotHistogramComponent';
import ContinueButton from '../../Components/ContinueButton';

function DrivenPowerComponent({ initialState }: HomeWrapperProps) {
  const [result] = useState<ResultState | null>(initialState?.result || null);
  const [vector_solutions] = useState<number[]>(
    initialState?.vector_solutions || []
  );
  const [vector_pot] = useState<number[]>(initialState?.vector_pot || []);
  const isMultiplicative = vector_pot.map((value) => value !== 0);

  const containerRef = useRef<HTMLDivElement>(null);

  const [targetPower, setTargetPower] = useState<string[]>(
    vector_pot.map((value) => value.toString())
  );

  const [source, setSource] = useState(false);
  const [draggingIndex] = useState<number | null>(null);
  const [err, setErr] = useState<Error | null>(null);

  const totalPower = vector_pot.reduce((acc, value) => acc + value, 0);

  const regions = vector_pot.map((power) => ({
    power,
    percentual: totalPower > 0 ? (power / totalPower) * 100 : 0,
  }));

  function getDX(): number[] {
    const dx: number[] = [];
    let x = 0;

    for (let i = 0; i < (result?.numRegioes ?? 0); i++) {
      const espessura = result?.espessura[i] ?? 0;
      const numCelulas = result?.numCelulasPorRegiao[i] ?? 0;

      if (numCelulas <= 0) {
        continue;
      }

      const cellSize = espessura / numCelulas;

      for (let j = 0; j < numCelulas; j++) {
        dx.push(x);
        x += cellSize;
      }
    }

    dx.push(x);

    return dx;
  }

  function getSolutions(x: number): number {
    const dx = getDX();
    const i = dx.findIndex((value) => value === x);

    return i >= 0 ? vector_solutions[i] : NaN;
  }

  function getRegions(): number[] {
    const regions: number[] = [];
    let x = 0;

    for (let i = 0; i < (result?.numRegioes ?? 0); i++) {
      const cellSize = result?.espessura[i] || 2;

      regions.push((2 * x + cellSize) / 2);
      x += cellSize;
    }

    return regions;
  }

  function updateTargetPower(index: number, value: string) {
    const newValues = [...targetPower];
    newValues[index] = value;
    setTargetPower(newValues);

    setErr(null);
  }

  function onSubmit(onError: (err: Error) => void) {
    try {
      let sum = 0;
      const validatedValues = targetPower.map((value, index) => {
        const numberValue = Number(value);

        if (
          value.trim() === '' ||
          !Number.isFinite(numberValue) ||
          numberValue < 0
        ) {
          throw new Error(
            `O valor da Região ${index + 1} deve ser um número não negativo.`
          );
        }
        if (isMultiplicative[index] && numberValue === 0) {
          throw new Error(
            `A Região ${index + 1} não pode ter potência zero, pois é multiplicativa.`
          );
        }
        if( !isMultiplicative[index] && numberValue > 0) {
          throw new Error(
            `A Região ${index + 1} não pode ter potência maior que zero, pois é não multiplicativa.`
          );
        }

        sum += numberValue;

        return numberValue;
      });
      if(sum != 100){
        throw new Error(
          `A soma dos percentuais deve ser igual a 100.`
        );
      }

      setErr(null);
      onError(null as unknown as Error);

      console.log('Valores validados:', validatedValues);
    } catch (error) {
      const currentError = error as Error;

      setErr(currentError);
      onError(currentError);
    }
  }

  const totalTargetPower = targetPower.reduce(
    (acc, value) => acc + (Number(value) || 0),
    0
  );

  return (
    <div
      style={{
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <span
          style={{
            marginRight: '15px',
            fontWeight: 'bold',
            color: '#333',
            fontSize: '14px',
          }}
        >
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
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)',
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
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}
          />
        </div>

        <span
          style={{
            marginLeft: '15px',
            color: source ? '#019722' : '#777',
            fontWeight: 'bold',
            fontSize: '13px',
          }}
        >
          {source ? 'LIGADA' : 'DESLIGADA'}
        </span>
      </div>

      <span
        style={{
          marginRight: '15px',
          fontWeight: 'bold',
          color: '#333',
          fontSize: '14px',
          marginBottom: '10px',
          display: 'block',
        }}
      >
        Distribuição de Potência:
      </span>

      <div
        ref={containerRef}
        style={{
          display: 'flex',
          height: '30px',
          width: '100%',
          border: '1px solid #ccc',
          overflow: 'hidden',
          marginBottom: '20px',
        }}
      >
        {regions.map((region, index) => (
          <div
            key={index}
            style={{
              width: `${region.percentual}%`,
              minWidth: '20px',
              backgroundColor:
                region.power === 0 ? '#dc3545' : '#6c757d',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              boxSizing: 'border-box',
              borderRight:
                index < regions.length - 1
                  ? '1px solid #fff'
                  : 'none',
              transition:
                draggingIndex === null
                  ? 'width 0.1s ease-out'
                  : 'none',
            }}
          >
            {region.percentual.toFixed(1)}%
          </div>
        ))}
      </div>

      <div
        style={{
          marginBottom: '25px',
          padding: '15px',
          border: '1px solid #dcdcdc',
          borderRadius: '8px',
          background: '#fafafa',
        }}
      >
        <h3
          style={{
            marginTop: 0,
            marginBottom: '15px',
            fontSize: '16px',
            color: '#333',
          }}
        >
          Distribuição de Potência Desejada
        </h3>

        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  textAlign: 'left',
                  paddingBottom: '8px',
                }}
              >
                Região
              </th>

              <th
                style={{
                  textAlign: 'center',
                  paddingBottom: '8px',
                }}
              >
                Atual
              </th>

              <th
                style={{
                  textAlign: 'center',
                  paddingBottom: '8px',
                }}
              >
                Desejada
              </th>
            </tr>
          </thead>

          <tbody>
            {targetPower.map((value, index) => (
              <tr key={index}>
                <td
                  style={{
                    padding: '8px 0',
                    fontWeight: 'bold',
                  }}
                >
                  Região {index + 1}
                </td>

                <td
                  style={{
                    textAlign: 'center',
                  }}
                >
                  {vector_pot[index].toFixed(4)}
                </td>

                <td
                  style={{
                    textAlign: 'center',
                  }}
                >
                  <input
                    type="text"
                    value={value}
                    onChange={(e) =>
                      updateTargetPower(index, e.target.value)
                    }
                    style={{
                      width: '100px',
                      padding: '6px',
                      textAlign: 'center',
                      border:
                        err && value.trim() === ''
                          ? '1px solid #dc3545'
                          : '1px solid #ccc',
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div
          style={{
            marginTop: '15px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <strong>
            Percentual Total: {totalTargetPower.toFixed(4)} MW
          </strong>

          <div
            style={{
              display: 'flex',
              gap: '10px',
            }}
          >
            <ContinueButton
              onClick={onSubmit}
              err={err}
            />
          </div>
        </div>
      </div>

      <PlotComponent
        f={getSolutions}
        L={1000}
        range={[0, result?.comprimento ?? 0]}
        x_data={getDX()}
        markers={true}
      />

      <PlotHistogramComponent
        x_data={getRegions()}
        y_data={vector_pot}
        width={result?.espessura ?? []}
      />
    </div>
  );
}

export default DrivenPowerComponent;