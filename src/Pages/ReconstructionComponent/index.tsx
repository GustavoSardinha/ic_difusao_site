import { useState, useEffect } from 'react';
import '../../Styles/App.css';
import HomeWrapperProps from '../../Interfaces/HomeWrapperProps';
import ResultState from '../../Interfaces/ResultState';
import ArrayFormInput from '../../Components/ArrayFormInput';
import PlotComponent from '../../Components/AnaliticalGraphics/PlotComponent';
import { isResultStateNonMultiplicative } from '../../Interfaces/ResultStateNonMultiplicative';
import { isResultStateMultiplicative } from '../../Interfaces/ResultStateMultiplicative';

function ReconstructionComponent({ initialState }: HomeWrapperProps) {
  const [result] = useState<ResultState | null>(initialState?.result || null);
  const [vector_solutions] = useState<number[]>(
    initialState?.vector_solutions || []
  );
  const [solution_consts, setSolutionConsts] = useState<number[]>([]);
  const [filterPoint, setFilterPoint] = useState<string>('');
  const [filterInterval, setFilterInterval] = useState<string>('');

  useEffect(() => {
    if (result && solution_consts.length === 0) generateConstants();
  }, [result]);

  function getComprimento(): number {
    return Number(result?.comprimento || 0);
  }

  function generateConstants(): void {
    if (!result) return;
    const sol_const: number[] = [];

    if (isResultStateNonMultiplicative(result)) {
      const {
        numRegioes,
        mapeamento,
        numCelulasPorRegiao,
        fonteNeutrons,
        coeficientesDifusao,
        choquesMacroscopicos,
        espessura,
      } = result;

      let cells = 0;
      for (let i = 0; i < numRegioes; i++) {
        const h = espessura[i];
        const zona = mapeamento[i];
        const L = Math.sqrt(coeficientesDifusao[zona - 1] / choquesMacroscopicos[zona - 1]);

        const phi0 = vector_solutions[cells] - fonteNeutrons[i] / choquesMacroscopicos[zona - 1];
        const phiH = vector_solutions[cells + numCelulasPorRegiao[i]] - fonteNeutrons[i] / choquesMacroscopicos[zona - 1];

        const A =
          (phiH - phi0 * Math.exp(-h / L)) /
          (Math.exp(h / L) - Math.exp(-h / L));
        const B =
          (-phiH + phi0 * Math.exp(h / L)) /
          (Math.exp(h / L) - Math.exp(-h / L));

        sol_const.push(A, B);
        cells += numCelulasPorRegiao[i];
      }
    }

    else if (isResultStateMultiplicative(result)) {
      const {
        numRegioes,
        mapeamento,
        numCelulasPorRegiao,
        coeficientesDifusao,
        choquesMacroscopicosAbs,
        choquesMacroscopicosFis,
        Ni,
        keff,
        espessura,
        noNi,
      } = result;

      const niValor = noNi ? Number(Ni) : 1;
      const eps = 1e-12;

      let nodeIndex = 0;

      for (let i = 0; i < numRegioes; i++) {
        const zona = mapeamento[i];
        const D = coeficientesDifusao[zona - 1];
        const Sa = choquesMacroscopicosAbs[zona - 1];
        const Sf = choquesMacroscopicosFis[zona - 1];

        const nCells = numCelulasPorRegiao[i];
        const regionThickness = espessura[i];
        const hCell = regionThickness / nCells;

        const B2raw = (niValor * Sf) / keff - Sa;
        const B2 = B2raw / D;

        for (let k = 0; k < nCells; k++) {
          const leftIdx = nodeIndex + k;
          const rightIdx = leftIdx + 1;

          const phiL = vector_solutions[leftIdx];
          const phiR = vector_solutions[rightIdx];

          if (B2 > 0) {
            const beta = Math.sqrt(B2);
            const A = phiL;
            const denom = Math.sin(beta * hCell);
            const C =
              Math.abs(denom) > eps
                ? (phiR - A * Math.cos(beta * hCell)) / denom
                : (phiR - A * Math.cos(beta * hCell)) / (denom + eps);
            sol_const.push(A, C);
          } 
          else if (B2 < 0) {
            const alpha = Math.sqrt(-B2);
            const A = phiL;
            const denom = Math.sinh(alpha * hCell);
            const C =
              Math.abs(denom) > eps
                ? (phiR - A * Math.cosh(alpha * hCell)) / denom
                : (phiR - A * Math.cosh(alpha * hCell)) / (denom + eps);
            sol_const.push(A, C);
          } 
          else {
            const A = phiL;
            const C = (phiR - phiL) / (Math.abs(hCell) > eps ? hCell : eps);
            sol_const.push(A, C);
          }
        }

        nodeIndex += nCells;
      }

    setSolutionConsts(sol_const);
    console.log("Solution constants:", sol_const);
    
    }
  }

  function findAPoint(x: number): number[] {
    if (!result) return [];
    const { numRegioes, espessura, comprimento } = result;
    if (x < 0 || x > comprimento) return [];

    let acc = 0;
    for (let i = 0; i < numRegioes; i++) {
      acc += espessura[i];
      if (x <= acc) return [i, acc];
    }
    return [];
  }

  function fluxFunction(x: number): number {
    if (!result) return NaN;
    const regInfos = findAPoint(x);
    if (regInfos.length === 0) return NaN;

    const regionIdx = regInfos[0];
    const regionEnd = regInfos[1];
    const regionStart = regionEnd - result.espessura[regionIdx];
    const localXInRegion = x - regionStart;


    if (isResultStateNonMultiplicative(result)) {
      const {
        mapeamento,
        fonteNeutrons,
        coeficientesDifusao,
        choquesMacroscopicos,
      } = result;

      const zona = mapeamento[regionIdx];
      const L = Math.sqrt(
        coeficientesDifusao[zona - 1] /
        choquesMacroscopicos[zona - 1]
      );

      const dx = localXInRegion;

      return (
        solution_consts[2 * regionIdx] * Math.exp(dx / L) +
        solution_consts[2 * regionIdx + 1] * Math.exp(-dx / L) +
        fonteNeutrons[regionIdx] /
          choquesMacroscopicos[zona - 1]
      );
    }

    if (isResultStateMultiplicative(result)) {
      const {
        mapeamento,
        coeficientesDifusao,
        choquesMacroscopicosAbs,
        choquesMacroscopicosFis,
        espessura,
        numCelulasPorRegiao,
        Ni,
        keff,
        noNi,
      } = result;

      const niValor = noNi ? Number(Ni) : 1;

      const zona = mapeamento[regionIdx];
      const D = coeficientesDifusao[zona - 1];
      const Sa = choquesMacroscopicosAbs[zona - 1];
      const Sf = choquesMacroscopicosFis[zona - 1];

      const nCells = numCelulasPorRegiao[regionIdx];
      const hCell = espessura[regionIdx] / nCells;

      const cellLocalIndex = Math.min(
        Math.floor(localXInRegion / hCell),
        nCells - 1
      );

      let globalCellIndex = 0;
      for (let i = 0; i < regionIdx; i++) {
        globalCellIndex += numCelulasPorRegiao[i];
      }
      globalCellIndex += cellLocalIndex;

      const A = solution_consts[2 * globalCellIndex];
      const C = solution_consts[2 * globalCellIndex + 1];

      const dx = localXInRegion - cellLocalIndex * hCell;

      const B2 = ((niValor * Sf) / keff - Sa) / D;
      const eps = 1e-12;

      if (B2 > 0) {
        const beta = Math.sqrt(B2);
        return A * Math.cos(beta * dx) + C * Math.sin(beta * dx);
      } 
      else if (B2 < 0) {
        const alpha = Math.sqrt(-B2);
        return A * Math.cosh(alpha * dx) + C * Math.sinh(alpha * dx);
      } 
      else {
        return A + C * dx;
      }
    }

    return NaN;
  }
  function absorptionRate(a: number, b:number) : number {
    if (!result) 
      return -1; 
    let absRate = 0; 
    if(isResultStateNonMultiplicative(result)){ 
      const { 
        mapeamento,
        fonteNeutrons, 
        coeficientesDifusao, 
        choquesMacroscopicos, 
        espessura, 
      } = result; 
      const regInfosA = findAPoint(a); 
      const regInfosB = findAPoint(b); 
      for(let i = regInfosA[0]; i <= regInfosB[0]; i++){
        const zona = mapeamento[i]; 
        const L = Math.sqrt(coeficientesDifusao[zona - 1]/choquesMacroscopicos[zona - 1]); 
        let dxa = 0; 
        let dxb = espessura[i]; 
        if(i == regInfosA[0]) 
          dxa = a - (regInfosA[1] - espessura[i]); 
        if(i == regInfosB[0]) 
          dxb = b - (regInfosB[1] - espessura[i]); 
        absRate += L*choquesMacroscopicos[zona - 1]*(solution_consts[2*i]*(Math.pow(Math.E, dxb/L) - Math.pow(Math.E, dxa/L)) - solution_consts[2*i + 1]*(Math.pow(Math.E, - dxb/L) - Math.pow(Math.E, - dxa/L))) + fonteNeutrons[i]*(dxb - dxa) 
      } 
    } 
    return absRate; 
  }
  function powerRate(a: number, b: number): number {
    if (!result) return -1;
    if (!isResultStateMultiplicative(result)) return -1;

    const {
      mapeamento,
      coeficientesDifusao,
      choquesMacroscopicosAbs,
      choquesMacroscopicosFis,
      numCelulasPorRegiao,
      espessura,
      keff,
      energia,
      noNi,
      Ni,
    } = result;

    if (b <= a) return -1;

    const E = 1.602176634e-13 * Number(energia);
    const niValor = noNi ? Number(Ni) : 1;
    const eps = 1e-12;

    let power = 0;
    let globalCellIndex = 0;
    let xAccRegionStart = 0;

    for (let r = 0; r < numCelulasPorRegiao.length; r++) {
      const zona = mapeamento[r];
      const D = coeficientesDifusao[zona - 1];
      const Sa = choquesMacroscopicosAbs[zona - 1];
      const Sf = choquesMacroscopicosFis[zona - 1];

      const nCells = numCelulasPorRegiao[r];
      const regionLength = espessura[r];
      const hCell = regionLength / nCells;

      const B2 = ((niValor * Sf) / keff - Sa) / D;

      for (let k = 0; k < nCells; k++) {
        const cellStart = xAccRegionStart + k * hCell;
        const cellEnd = cellStart + hCell;

        const localA = Math.max(a, cellStart);
        const localB = Math.min(b, cellEnd);

        if (localB <= localA) {
          globalCellIndex++;
          continue;
        }

        const dxA = localA - cellStart;
        const dxB = localB - cellStart;

        const A = solution_consts[2 * globalCellIndex];
        const C = solution_consts[2 * globalCellIndex + 1];

        if (B2 > 0) {
          const beta = Math.sqrt(B2);
          const denom = Math.abs(beta) > eps ? beta : eps;
          power +=
            E *
            Sf *
            ((A / denom) * (Math.sin(beta * dxB) - Math.sin(beta * dxA)) -
              (C / denom) * (Math.cos(beta * dxB) - Math.cos(beta * dxA)));
        } else if (B2 < 0) {
          const alpha = Math.sqrt(-B2);
          const denom = Math.abs(alpha) > eps ? alpha : eps;
          power +=
            E *
            Sf *
            ((A / denom) * (Math.sinh(alpha * dxB) - Math.sinh(alpha * dxA)) +
              (C / denom) * (Math.cosh(alpha * dxB) - Math.cosh(alpha * dxA)));
        } else {
          power +=
            E *
            Sf *
            (A * (dxB - dxA) + (C / 2) * (dxB * dxB - dxA * dxA));
        }

        globalCellIndex++;
      }

      xAccRegionStart += regionLength;
    }

    return power/1e+6;
  }


  return (
    <div>
      <PlotComponent f={(x) => fluxFunction(x)} L={1000} range={[0, getComprimento()]} />

      <ArrayFormInput
        label="Digite um ponto para ser filtrado"
        placeholder="Informe a posição em cm"
        value={filterPoint}
        msgAlert="Informe um ponto do domínio para calcular o fluxo"
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setFilterPoint(event.target.value)}
      />

      <div style={{ justifyContent: 'center', alignItems: 'center' }}>
        {(() => {
          const x = Number(filterPoint);
          
          if(filterPoint === '')
            return;
          
          if (Number.isNaN(x)) {
            return (
              <p style={{ textAlign: 'center' }}>
                O ponto filtrado está fora do domínio.
              </p>
            );
          }

          const value = fluxFunction(x);

          if (value === -1 || Number.isNaN(value)) {
            return (
              <p style={{ textAlign: 'center' }}>
                O ponto filtrado está fora do domínio.
              </p>
            );
          }

          return (
            <p style={{ textAlign: 'center' }}>
              O valor em {filterPoint} é {value.toExponential(5)}.
            </p>
          );
        })()}
      </div>

      {isResultStateNonMultiplicative(result) && (
        <div>
          <ArrayFormInput
            label="Digite um intervalo"
            placeholder="Informe o intervalo para calcular a taxa de absorção a;b"
            value={filterInterval}
            msgAlert="Informe um intervalo do domínio para calcular a taxa de absorção"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setFilterInterval(event.target.value)}
          />
          <div style={{ justifyContent: 'center', alignItems: 'center' }}>
            {(() => {
              if (filterInterval === '') return null;

              const parts = filterInterval.split(';');
              if (parts.length !== 2) return null;

              const a = Number(parts[0]);
              const b = Number(parts[1]);
              const length = getComprimento();

              // Validação do Domínio
              if (Number.isNaN(a) || Number.isNaN(b) || a < 0 || b > length || b <= a) {
                return (
                  <p style={{ textAlign: 'center' }}>
                    Intervalo inválido ou fora do domínio (0 a {length}).
                  </p>
                );
              }

              const value = absorptionRate(a, b);
              
              if (Number.isNaN(value) || value === -1) {
                return (
                  <p style={{ textAlign: 'center' }}>
                    Erro ao calcular o intervalo.
                  </p>
                );
              }

              return (
                <p style={{ textAlign: 'center' }}>
                  O valor em {filterInterval} é {value.toExponential(5)}
                </p>
              );
            })()}
          </div>
        </div>
      )}

      {isResultStateMultiplicative(result) && (
        <div>
          <ArrayFormInput
            label="Digite um intervalo para determinar a potência local"
            placeholder="Informe o intervalo para calcular a potência local a;b"
            value={filterInterval}
            msgAlert="Informe um intervalo do domínio para calcular a potência local."
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setFilterInterval(event.target.value)}
          />
          <div style={{ justifyContent: 'center', alignItems: 'center' }}>
            {(() => {
              if (filterInterval === '') return null;

              const parts = filterInterval.split(';');
              if (parts.length !== 2) return null;

              const x = Number(parts[0]);
              const y = Number(parts[1]);
              const length = getComprimento();

              // Validação do Domínio adicionando a checagem com 'length'
              if (Number.isNaN(x) || Number.isNaN(y) || x < 0 || y > length || y <= x) {
                return (
                  <p style={{ textAlign: 'center' }}>
                    Intervalo inválido ou fora do domínio (0 a {length}).
                  </p>
                );
              }

              const value = powerRate(x, y);

              if (Number.isNaN(value) || value === -1) {
                return (
                  <p style={{ textAlign: 'center' }}>
                    Erro ao calcular o intervalo.
                  </p>
                );
              }

              return (
                <p style={{ textAlign: 'center' }}>
                  O valor em {filterInterval} é {value.toExponential(5)} MW.
                </p>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

export default ReconstructionComponent;
