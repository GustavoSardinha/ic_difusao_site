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
  let power = 0;

  if (isResultStateMultiplicative(result)) {
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

    // energia em J (assume 'energia' em MeV)
    const E = 1.602176634e-13 * Number(energia);

    const regInfosA = findAPoint(a);
    const regInfosB = findAPoint(b);
    if (regInfosA.length === 0 || regInfosB.length === 0) return -1;

    // soma de células para calcular índices globais
    const prefixCells: number[] = [];
    let acc = 0;
    for (let i = 0; i < numCelulasPorRegiao.length; i++) {
      prefixCells.push(acc);
      acc += numCelulasPorRegiao[i];
    }

    // percorre regiões entre A e B
    for (let i = regInfosA[0]; i <= regInfosB[0]; i++) {
      const zona = mapeamento[i];
      const D = coeficientesDifusao[zona - 1];
      const Sa = choquesMacroscopicosAbs[zona - 1];
      const Sf = choquesMacroscopicosFis[zona - 1];

      // limites locais dentro da região
      let dxa = 0;
      let dxb = espessura[i];
      if (i === regInfosA[0]) dxa = a - (regInfosA[1] - espessura[i]);
      if (i === regInfosB[0]) dxb = b - (regInfosB[1] - espessura[i]);
      if (dxb <= dxa) continue;

      const nCells = numCelulasPorRegiao[i];
      const hCell = espessura[i] / nCells;

      const B2 = (((noNi ? Number(Ni) : 1) * Sf) / keff) - Sa;

      // células afetadas dentro da região
      let startCell = Math.floor(dxa / hCell);
      let endCell = Math.floor((dxb - 1e-12) / hCell);
      if (startCell < 0) startCell = 0;
      if (endCell >= nCells) endCell = nCells - 1;

      for (let local = startCell; local <= endCell; local++) {
        // limites dentro da célula (0..hCell)
        const cellLocalStart = (local === startCell) ? dxa - local * hCell : 0;
        const cellLocalEnd = (local === endCell) ? dxb - local * hCell : hCell;
        if (cellLocalEnd <= cellLocalStart) continue;

        const thisCellGlobal = prefixCells[i] + local;
        const idxA = 2 * thisCellGlobal;
        const idxC = idxA + 1;
        if (idxC >= solution_consts.length) return -1; // proteção

        const A = solution_consts[idxA];
        const C = solution_consts[idxC];

        if (B2 > 0) {
          const B = Math.sqrt(B2 / D);
          const denom = Math.abs(B) > 1e-12 ? B : 1e-12;
          power +=
            E *
            Sf *
            ((A / denom) * (Math.sin(B * cellLocalEnd) - Math.sin(B * cellLocalStart)) -
              (C / denom) * (Math.cos(B * cellLocalEnd) - Math.cos(B * cellLocalStart)));
        } else if (B2 < 0) {
          const alpha = Math.sqrt(-B2 / D);
          const denom = Math.abs(alpha) > 1e-12 ? alpha : 1e-12;
          power +=
            E *
            Sf *
            ((A / denom) * (Math.sinh(alpha * cellLocalEnd) - Math.sinh(alpha * cellLocalStart)) +
              (C / denom) * (Math.cosh(alpha * cellLocalEnd) - Math.cosh(alpha * cellLocalStart)));
        } else {
          power +=
            E *
            Sf *
            (A * (cellLocalEnd - cellLocalStart) + (C / 2) * (Math.pow(cellLocalEnd, 2) - Math.pow(cellLocalStart, 2)));
        }
      }
    }
  }

  return power;
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
        {(fluxFunction(Number(filterPoint)) === -1 || isNaN(Number(filterPoint))) && (
          <p style={{ textAlign: 'center' }}>O ponto filtrado está fora do domínio</p>
        )}
        {!(fluxFunction(Number(filterPoint)) === -1 || isNaN(Number(filterPoint))) && (
          <p style={{ textAlign: 'center' }}>O valor em {filterPoint} é {fluxFunction(Number(filterPoint)).toExponential(5)}</p>
        )}
      </div>

      {isResultStateNonMultiplicative(result) &&( 
        <div>
          <ArrayFormInput
            label="Digite um intervalo"
            placeholder="Informe o intervalo para calcular a taxa de absorção a;b"
            value={filterInterval}
            msgAlert="Informe um intervalo do domínio para calcular a taxa de absorção"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setFilterInterval(event.target.value)}
          />
          <div style={{ justifyContent: 'center', alignItems: 'center' }}>
            {(filterInterval.split(";").length === 2 && Number(filterInterval.split(";")[0]) >= 0 && Number(filterInterval.split(";")[1]) >= 0) && (
              <p style={{ textAlign: 'center' }}>O valor em {filterInterval} é {absorptionRate(Number(filterInterval.split(";")[0]), Number(filterInterval.split(";")[1])).toExponential(5)}</p>
            )}
          </div>
        </div>
        )}
      {isResultStateMultiplicative(result) &&( 
        <div>
        <ArrayFormInput
          label="Digite um intervalo para determinar a potência local"
          placeholder="Informe o intervalo para calcular a potência local a;b"
          value={filterInterval}
          msgAlert="Informe um intervalo do domínio para calcular a potência local."
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setFilterInterval(event.target.value)}
        />
        <div style={{ justifyContent: 'center', alignItems: 'center' }}>
            {(filterInterval.split(";").length === 2 && Number(filterInterval.split(";")[0]) >= 0 && Number(filterInterval.split(";")[1]) >= 0) && (
              <p style={{ textAlign: 'center' }}>O valor em {filterInterval} é {powerRate(Number(filterInterval.split(";")[0]), Number(filterInterval.split(";")[1])).toExponential(5)}</p>
            )}
          </div>
        </div>
        )}
    </div>
  );
}

export default ReconstructionComponent;
