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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  function getComprimento(): number {
    return Number(result?.comprimento || 0);
  }

  /* ===========================================================
     GENERATE CONSTANTS
     - Mantém o bloco NÃO-MULTIPLICATIVO inalterado (já funcional)
     - MULTIPLICATIVO: reconstrução por CÉLULA (corrige escadinha)
     ============================================================*/
  function generateConstants(): void {
    if (!result) return;
    const sol_const: number[] = [];

    // ---------------------------
    // NÃO-MULTIPLICATIVO (INALTERADO)
    // ---------------------------
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

    // ---------------------------
    // MULTIPLICATIVO (CORRIGIDO: por CÉLULA)
    // ---------------------------
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

      let cellGlobalIndex = 0; // contará célula a célula para todo domínio

      for (let i = 0; i < numRegioes; i++) {
        const zona = mapeamento[i];
        const D = coeficientesDifusao[zona - 1];
        const Sa = choquesMacroscopicosAbs[zona - 1];
        const Sf = choquesMacroscopicosFis[zona - 1];

        const nCells = numCelulasPorRegiao[i];
        const regionThickness = espessura[i];
        const hCell = regionThickness / nCells;

        // B2 por região (mesmo para todas células da região)
        const B2 = (niValor * Sf) / keff - Sa;

        // Para cada célula na região
        // pressupõe vector_solutions indexado por Ncells_total + 1 (valores em interfaces)
        // left index: sum(prev numCelulasPorRegiao) + localIndex
        // right index: left index + 1
        // vamos computar a soma cumulativa de células para localizar índices nas soluções
        // (usamos cellGlobalIndex como contador cumulativo)
        for (let local = 0; local < nCells; local++) {
          // índices de solução: esquerdo e direito
          const idxLeft = cellGlobalIndex + local; // i.e., global left node index
          const idxRight = idxLeft + 1;

          const phiL = vector_solutions[idxLeft];
          const phiR = vector_solutions[idxRight];

          // Tratar regimes:
          if (B2 > 0) {
            // supercrítico: cos / sin
            const B = Math.sqrt(B2 / D);
            const A = phiL;
            // proteger divisão por sin(B*hCell) muito pequeno
            const denom = Math.sin(B * hCell);
            const C = Math.abs(denom) > 1e-12 ? (phiR - A * Math.cos(B * hCell)) / denom : (phiR - A * Math.cos(B * hCell)) / (denom + Math.sign(denom) * 1e-12);
            sol_const.push(A, C);
          } else if (B2 < 0) {
            // subcrítico: cosh / sinh
            const alpha = Math.sqrt(-B2 / D);
            const A = phiL;
            const denom = Math.sinh(alpha * hCell);
            const C = Math.abs(denom) > 1e-12 ? (phiR - A * Math.cosh(alpha * hCell)) / denom : (phiR - A * Math.cosh(alpha * hCell)) / (denom + Math.sign(denom) * 1e-12);
            sol_const.push(A, C);
          } else {
            // crítico exato: linear
            const A = phiL;
            const C = (phiR - phiL) / hCell;
            sol_const.push(A, C);
          }
        }

        // avançar o índice global de células
        cellGlobalIndex += nCells;
      }
    }

    setSolutionConsts(sol_const);
  }

  /* ===========================================================
     findAPoint: retorna [regionIndex, regionEndCoordinate]
     ===========================================================*/
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

  /* ===========================================================
     fluxFunction: agora localiza CÉLULA dentro da região e usa A/C da célula
     ===========================================================*/
  function fluxFunction(x: number): number {
    if (!result) return NaN;
    const regInfos = findAPoint(x);
    if (regInfos.length === 0) return NaN;

    const regionIdx = regInfos[0];
    const regionEnd = regInfos[1];
    const regionStart = regionEnd - result.espessura[regionIdx];
    const localXInRegion = x - regionStart;

    // parâmetros da região
    if (isResultStateNonMultiplicative(result)) {
      // mantém comportamento original (inalterado)
      const {
        mapeamento,
        fonteNeutrons,
        coeficientesDifusao,
        choquesMacroscopicos,
      } = result;
      const zona = mapeamento[regionIdx];
      const L = Math.sqrt(coeficientesDifusao[zona - 1] / choquesMacroscopicos[zona - 1]);

      // dx dentro da região
      const dx = localXInRegion;
      return (
        solution_consts[2 * regionIdx] * Math.exp(dx / L) +
        solution_consts[2 * regionIdx + 1] * Math.exp(-dx / L) +
        fonteNeutrons[regionIdx] / choquesMacroscopicos[zona - 1]
      );
    }

    // MULTIPLICATIVO: localizar a célula dentro da região
    if (isResultStateMultiplicative(result)) {
      const {
        mapeamento,
        coeficientesDifusao,
        choquesMacroscopicosAbs,
        choquesMacroscopicosFis,
        numCelulasPorRegiao,
        espessura,
        Ni,
        keff,
        noNi,
      } = result;

      const niValor = noNi ? Number(Ni) : 1;
      const nCells = numCelulasPorRegiao[regionIdx];
      const hCell = espessura[regionIdx] / nCells;

      // índice da célula dentro da região
      let cellInRegion = Math.floor(localXInRegion / hCell);
      if (cellInRegion >= nCells) cellInRegion = nCells - 1;
      if (cellInRegion < 0) cellInRegion = 0;

      // global cell index (somar células das regiões anteriores)
      let cellGlobalIndex = 0;
      for (let r = 0; r < regionIdx; r++) cellGlobalIndex += numCelulasPorRegiao[r];
      const thisCellGlobal = cellGlobalIndex + cellInRegion;

      // dx dentro da célula (0..hCell)
      const dxInCell = localXInRegion - cellInRegion * hCell;

      const zona = mapeamento[regionIdx];
      const D = coeficientesDifusao[zona - 1];
      const Sa = choquesMacroscopicosAbs[zona - 1];
      const Sf = choquesMacroscopicosFis[zona - 1];

      const B2 = (niValor * Sf) / keff - Sa;
      const A = solution_consts[2 * thisCellGlobal];
      const C = solution_consts[2 * thisCellGlobal + 1];

      if (B2 > 0) {
        const B = Math.sqrt(B2 / D);
        return A * Math.cos(B * dxInCell) + C * Math.sin(B * dxInCell);
      } else if (B2 < 0) {
        const alpha = Math.sqrt(-B2 / D);
        return A * Math.cosh(alpha * dxInCell) + C * Math.sinh(alpha * dxInCell);
      } else {
        return A + C * dxInCell;
      }
    }

    return NaN;
  }

  /* ===========================================================
     absorptionRate: integra célula a célula usando A/C por célula
     ===========================================================*/
  function absorptionRate(a: number, b: number): number {
    if (!result) return NaN;
    if (a < 0 || b < a || b > result.comprimento) return NaN;

    const ra = findAPoint(a);
    const rb = findAPoint(b);
    if (ra.length === 0 || rb.length === 0) return NaN;

    let total = 0;

    const { numCelulasPorRegiao, espessura } = result;

    // helper para obter global cell index given regionIdx and local cell idx
    function getCellGlobalIndex(regionIdx: number, localCellIdx: number) {
      let idx = 0;
      for (let r = 0; r < regionIdx; r++) idx += numCelulasPorRegiao[r];
      return idx + localCellIdx;
    }

    // iterar regiões e dentro delas células envolvidas
    for (let regionIdx = ra[0]; regionIdx <= rb[0]; regionIdx++) {
      const regionStart = ra[0] === regionIdx ? (ra[1] - espessura[regionIdx]) : undefined; // not used directly
      const nCells = numCelulasPorRegiao[regionIdx];
      const hCell = espessura[regionIdx] / nCells;

      // limites locais de integração dentro da região
      const localA = regionIdx === ra[0] ? a - (ra[1] - espessura[regionIdx]) : 0;
      const localB = regionIdx === rb[0] ? b - (rb[1] - espessura[regionIdx]) : espessura[regionIdx];

      // células que participam (índices locais)
      const firstCell = Math.floor(localA / hCell);
      const lastCell = Math.floor((localB - 1e-12) / hCell); // -eps para caso exato na fronteira

      for (let localCell = Math.max(0, firstCell); localCell <= Math.min(nCells - 1, lastCell); localCell++) {
        // limites de integração dentro da célula
        const cellLeftGlobalX = (localCell) * hCell;
        const cellRightGlobalX = (localCell + 1) * hCell;

        const ia = localCell === firstCell ? localA - localCell * hCell : 0;
        const ib = localCell === lastCell ? localB - localCell * hCell : hCell;

        // obtém parâmetros por região/célula
        if (isResultStateMultiplicative(result)) {
          const {
            mapeamento,
            coeficientesDifusao,
            choquesMacroscopicosAbs,
            choquesMacroscopicosFis,
            Ni,
            keff,
            noNi,
          } = result;
          const niValor = noNi ? Number(Ni) : 1;
          const zona = mapeamento[regionIdx];
          const D = coeficientesDifusao[zona - 1];
          const Sa = choquesMacroscopicosAbs[zona - 1];
          const Sf = choquesMacroscopicosFis[zona - 1];
          const B2 = (niValor * Sf) / keff - Sa;

          const cellGlobalIdx = getCellGlobalIndex(regionIdx, localCell);
          const A = solution_consts[2 * cellGlobalIdx];
          const C = solution_consts[2 * cellGlobalIdx + 1];

          if (B2 > 0) {
            const B = Math.sqrt(B2 / D);
            total += Sa * ((A / B) * (Math.sin(B * ib) - Math.sin(B * ia)) - (C / B) * (Math.cos(B * ib) - Math.cos(B * ia)));
          } else if (B2 < 0) {
            const alpha = Math.sqrt(-B2 / D);
            total += Sa * ((A / alpha) * (Math.sinh(alpha * ib) - Math.sinh(alpha * ia)) + (C / alpha) * (Math.cosh(alpha * ib) - Math.cosh(alpha * ia)));
          } else {
            // caso linear
            // integral de (A + C x) dx = A*(ib-ia) + C*(ib^2 - ia^2)/2
            total += Sa * (A * (ib - ia) + C * ((ib * ib - ia * ia) / 2));
          }
        }
      }
    }

    return total;
  }

  /* ===========================================================
     RENDER
     ===========================================================*/
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
        {(fluxFunction(Number(filterPoint)) === -1 || isNaN(Number(filterPoint))) && (
          <p style={{ textAlign: 'center' }}>O ponto filtrado está fora do domínio</p>
        )}
        {!(fluxFunction(Number(filterPoint)) === -1 || isNaN(Number(filterPoint))) && (
          <p style={{ textAlign: 'center' }}>O valor em {filterPoint} é {fluxFunction(Number(filterPoint))}</p>
        )}
      </div>

      <ArrayFormInput
        label="Digite um intervalo"
        placeholder="Informe o intervalo para calcular a taxa de absorção (a;b)"
        value={filterInterval}
        msgAlert="Informe um intervalo do domínio para calcular a taxa de absorção"
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setFilterInterval(event.target.value)}
      />

      <div style={{ justifyContent: 'center', alignItems: 'center' }}>
        {(filterInterval.split(";").length === 2 && Number(filterInterval.split(";")[0]) >= 0 && Number(filterInterval.split(";")[1]) >= 0) && (
          <p style={{ textAlign: 'center' }}>O valor em {filterInterval} é {absorptionRate(Number(filterInterval.split(";")[0]), Number(filterInterval.split(";")[1]))}</p>
        )}
      </div>
    </div>
  );
}

export default ReconstructionComponent;
