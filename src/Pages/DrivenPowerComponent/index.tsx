import React, { useState, useRef } from 'react';
import HomeWrapperProps from '../../Interfaces/HomeWrapperProps';
import ResultState from '../../Interfaces/ResultState';
import PlotComponent from '../../Components/AnaliticalGraphics/PlotComponent';
import PlotHistogramComponent from '../../Components/AnaliticalGraphics/PlotHistogramComponent';
import ContinueButton from '../../Components/ContinueButton';
import { getNonMultiplicativeFluxProfile } from '../../Services/nonMultiplicativeSolver';
import { ResultStateNonMultiplicative } from '../../Interfaces/ResultStateNonMultiplicative';
import { m } from 'framer-motion';
import { ResultStateMultiplicative } from '../../Interfaces/ResultStateMultiplicative';
import { numericalIntegral } from '../../Services/numericalMath';

function DrivenPowerComponent({ initialState }: HomeWrapperProps) {
  const [result] = useState<ResultState | null>(initialState?.result || null);
  const [solutions] = useState<number[]>(
    initialState?.solutions || []
  );
  const [powers, setVectorPot] = useState<number[]>(initialState?.powers || []);
  const [sources, setSources] = useState<number[]>([]);
  const isMultiplicative = powers.map((value) => value !== 0);

  const containerRef = useRef<HTMLDivElement>(null);

  const [targetPower, setTargetPower] = useState<string[]>(() => {
    const total = powers.reduce((acc, value) => acc + value, 0);

    if (total <= 0) {
      return powers.map(() => '0.0000');
    }

    const percentages = powers.map(
      (value) => Number(((value / total) * 100).toFixed(4))
    );

    const largestIndex = powers.reduce(
      (largest, value, index, values) =>
        value > values[largest] ? index : largest,
      0
    );

    const roundedTotal = percentages.reduce(
      (acc, value) => acc + value,
      0
    );

    percentages[largestIndex] += 100 - roundedTotal;

    return percentages.map((value) => value.toFixed(4));
  });

  const [source, setSource] = useState(false);
  const [draggingIndex] = useState<number | null>(null);
  const [err, setErr] = useState<Error | null>(null);

  const totalPower = powers.reduce((acc, value) => acc + value, 0);

  const regions = powers.map((power) => ({
    power,
    percentual: totalPower > 0 ? (power / totalPower) * 100 : 0,
  }));

  function getDX(): number[] {
    const dx: number[] = [];
    let x = 0;

    for (let i = 0; i < (result?.regionCount ?? 0); i++) {
      const thickness = result?.thickness[i] ?? 0;
      const numCells = result?.cellsPerRegion[i] ?? 0;

      if (numCells <= 0) {
        continue;
      }

      const cellSize = thickness / numCells;

      for (let j = 0; j < numCells; j++) {
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

    return i >= 0 ? solutions[i] : NaN;
  }

  function getRegions(): number[] {
    const regions: number[] = [];
    let x = 0;

    for (let i = 0; i < (result?.regionCount ?? 0); i++) {
      const cellSize = result?.thickness[i] || 2;

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
      setVectorPot(validatedValues.map((value) => (totalPower * value) / 100));
    } catch (error) {
      const currentError = error as Error;

      setErr(currentError);
      onError(currentError);
    }
    solveProblem();
  }
  function solveProblem() {
    let regionCount = result?.regionCount ?? 0;
    for(let i = 0; i < regionCount; i++){
      let sourceNeutrons = [];
      let regionIndex = result?.mapping[i] ?? 1;
      regionIndex--;
      console.log(`Região ${i + 1} mapeada para índice ${regionIndex}`);
      const E_fission_J = Number((result as ResultStateMultiplicative)?.energy) * 1.602176634e-13;
      let Q = (result as ResultStateMultiplicative)?.crossSectionsMacroscopicFis[regionIndex]*E_fission_J / 1000000;
      console.log(Q);
      let crossSectionsCapture = [];
      for(let j = 0; j < regionCount; j++){
        let regionIndexCap = result?.mapping[j] ?? 1;
        regionIndexCap--;
        let crossCaptureSection = 0;
        if(result && (result as ResultStateMultiplicative)?.noNi){
          crossCaptureSection = (result as ResultStateMultiplicative)?.crossSectionsMacroscopicAbs[regionIndexCap] - (result as ResultStateMultiplicative)?.crossSectionsMacroscopicFis[regionIndexCap];
        } else {
          crossCaptureSection = (result as ResultStateMultiplicative)?.crossSectionsMacroscopicAbs[regionIndexCap] - (result as ResultStateMultiplicative)?.crossSectionsMacroscopicFis[regionIndexCap];
        }
        console.log(`Seção de captura para a Região ${j + 1}:`, crossCaptureSection);
        console.log(`Seção de fissão para a Região ${j + 1}:`, (result as ResultStateMultiplicative)?.crossSectionsMacroscopicFis[regionIndexCap]);
        console.log(`Seção de absorção para a Região ${j + 1}:`, (result as ResultStateMultiplicative)?.crossSectionsMacroscopicAbs[regionIndexCap]);
        console.log(regionIndexCap);
        crossSectionsCapture.push(crossCaptureSection);
        if(i != j)
          sourceNeutrons.push(0);
        else
          sourceNeutrons.push(Q);
      }
      console.log((result as ResultStateMultiplicative));
      console.log(`Fonte de nêutrons para a Região ${i + 1}:`, sourceNeutrons);
      console.log(`Seção de captura para a Região ${i + 1}:`, crossSectionsCapture);
      let calculationResult: ResultStateNonMultiplicative = {
        regionCount: regionCount,
        materialZoneCount: result?.materialZoneCount ?? 0,
        mapping: result?.mapping ?? [],
        cellsPerRegion: result?.cellsPerRegion ?? [],
        diffusionCoefficients: result?.diffusionCoefficients ?? [],
        thickness: result?.thickness ?? [],
        length: result?.length ?? 0,
        stepGraphic: 0,
        stepTable: 0,
        hasGraphic: false,
        advancedOptions: false,
        noGamma: false,
        filterPoint: 0,
        boundaryRight: result?.boundaryRight ?? '',
        boundaryLeft: result?.boundaryLeft ?? '',
        sourceNeutrons: sourceNeutrons,
        crossSectionsMacroscopic: crossSectionsCapture,
        incidenceRight: 0,
        incidenceLeft: 0
      };
      const { solutions, positions } = getNonMultiplicativeFluxProfile(calculationResult); 
      console.log(`Soluções para a Região ${i + 1}:`, solutions);
      let start = 0;
      let end = 0;
      let index = 1;
      let estimatedPower = 0;
      for (let regions = 0; regions < regionCount; regions++) {
        let regionIndex = result?.mapping[regions] ?? 1;      
        const idx = regionIndex - 1;
        const h = (result?.thickness[regions] ?? 0) / (result?.cellsPerRegion[regions] ?? 1);
        end = index + (result?.cellsPerRegion[regions] ?? 1);
        let p = numericalIntegral(solutions, h, start, end - 1);
        estimatedPower += p;
        index += result?.cellsPerRegion[regions] ?? 1;
        start = end - 1;
      }
      console.log(`Potência estimada para a Região ${i + 1}:`, estimatedPower);
      sources.push(powers[i] / estimatedPower);
      setSources([...sources]);
    }
    console.log('Fatores de ajuste das fontes de nêutrons:', sources);
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
                  {powers[index].toFixed(4)}
                </td>

                <td
                  style={{
                    textAlign: 'center',
                  }}
                >
                <input
                  type="text"
                  value={value}
                  onChange={(e) => {
                    const newValue = e.target.value;

                    if (/^\d*([.,]\d{0,4})?$/.test(newValue)) {
                      updateTargetPower(index, newValue);
                    }
                  }}
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
            Percentual Total: {totalTargetPower.toFixed(2)} %
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
      {sources.length > 0 && (
        <div className="sources-container">

          <div className="sources-list">
            {sources.map((value, index) => (
              <div key={index} className="source-item">
                <span>Q{index + 1} =  </span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </div>
      )}
      <PlotComponent
        f={getSolutions}
        L={1000}
        range={[0, result?.length ?? 0]}
        x_data={getDX()}
        markers={true}
      />

      <PlotHistogramComponent
        x_data={getRegions()}
        y_data={powers}
        width={result?.thickness ?? []}
      />
    </div>
  );
}

export default DrivenPowerComponent;