import { useState, useEffect} from 'react';
import '../../Styles/App.css';
import HomeWrapperProps from '../../Interfaces/HomeWrapperProps';
import ResultState from '../../Interfaces/ResultState';
import ArrayFormInput from '../../Components/ArrayFormInput';
import PlotComponent from '../../Components/AnaliticalGraphics/PlotComponent';
import {ResultStateNonMultiplicative} from '../../Interfaces/ResultStateNonMultiplicative';

function ReconstructionComponent({initialState}: HomeWrapperProps){
  const [result, setResult] = useState<ResultStateNonMultiplicative | null>((initialState?.result as ResultStateNonMultiplicative) || null);
  const [vector_solutions, setVector_solutions] = useState<number[]>(initialState?.vector_solutions || []);
  const [solution_consts, setSolutionsConst] = useState<number[]>([]);
  const [filterPoint, setFilterPoint] = useState<string>("");
  const [filterInterval, setFilterInterval] = useState<string>("");

  useEffect(() => {
    if(solution_consts.length === 0)
      generateConstants();
      fluxFunction(4.2);
  }, [solution_consts]);
  function getComprimento(): number{
    return Number(result?.comprimento);
  }
  function generateConstants(): void {
    const sol_const: number[] = [];
    if (!result) return;
    
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
    for(let i = 0; i < numRegioes; i++){
      const h = espessura[i];
      const zona = mapeamento[i];
      const L = Math.sqrt(coeficientesDifusao[zona - 1]/choquesMacroscopicos[zona - 1]);
      sol_const.push((((vector_solutions[cells + numCelulasPorRegiao[i]] - fonteNeutrons[i]/choquesMacroscopicos[zona - 1]) - (vector_solutions[cells] - fonteNeutrons[i]/choquesMacroscopicos[zona - 1])*(Math.pow(Math.E, (- h/L))))/(Math.pow(Math.E, h/L) - Math.pow(Math.E, (-h/L)))));
      sol_const.push(((- (vector_solutions[cells + numCelulasPorRegiao[i]] - fonteNeutrons[i]/choquesMacroscopicos[zona - 1]) + (vector_solutions[cells] - fonteNeutrons[i]/choquesMacroscopicos[zona - 1])*(Math.pow(Math.E, (h/L))))/(Math.pow(Math.E, h/L) - Math.pow(Math.E, (-h/L)))));
      cells += numCelulasPorRegiao[i];
    }
    console.log(sol_const);
    setSolutionsConst(sol_const);
  }
  function findAPoint(x: number): number[]{
    if (!result) return [];
    const {
      numRegioes,
      espessura,
      comprimento,
    } = result;
    
    let size = 0;
    let numReg = numRegioes - 1;
    if((x >= 0) && (x <= comprimento)){
      for(let i = 0; i < numRegioes; i++){
        if(size <= x){
          size += espessura[i];
          if(size >= x){
            numReg = i;
            break;
          }
        }
      }
      return [numReg, size];
  }
  return [];
}
  function fluxFunction(x: number): number {
    if (!result) return -1;
    
    const {
      mapeamento,
      fonteNeutrons,
      coeficientesDifusao,
      choquesMacroscopicos,
      espessura,
      comprimento,
    } = result;
    const regInfos = findAPoint(x);
      let dx = x;
      if(espessura[regInfos[0]] != null)
        dx = x - (regInfos[1] - espessura[regInfos[0]]);
      const zona = mapeamento[regInfos[0]];
      const L = Math.sqrt(coeficientesDifusao[zona - 1]/choquesMacroscopicos[zona - 1]);
      const flux = solution_consts[2*regInfos[0]]*Math.pow(Math.E, dx/L) + solution_consts[2*regInfos[0] + 1]*Math.pow(Math.E, -dx/L) + fonteNeutrons[regInfos[0]]/choquesMacroscopicos[zona - 1];
      return flux;
    }
  function absorptionRate(a: number, b:number) : number{
    if (!result) return -1;
    const {
      mapeamento,
      fonteNeutrons,
      coeficientesDifusao,
      choquesMacroscopicos,
      espessura,
    } = result;
    const regInfosA = findAPoint(a);
    const regInfosB = findAPoint(b);
    
    let absRate = 0;
    for(let i = regInfosA[0]; i <= regInfosB[0]; i++){
      console.log(regInfosA);
      console.log(regInfosB);
      const zona = mapeamento[i];
      const L = Math.sqrt(coeficientesDifusao[zona - 1]/choquesMacroscopicos[zona - 1]);
      let dxa = 0;
      let dxb = espessura[i];
      if(i == regInfosA[0])
        dxa = a - (regInfosA[1] - espessura[i]);
      if(i == regInfosB[0])
        dxb = b - (regInfosB[1] - espessura[i]);
      console.log(dxa);
      console.log(dxb);
      absRate += L*choquesMacroscopicos[zona - 1]*(solution_consts[2*i]*(Math.pow(Math.E, dxb/L) - Math.pow(Math.E, dxa/L)) - solution_consts[2*i + 1]*(Math.pow(Math.E, - dxb/L) - Math.pow(Math.E, - dxa/L))) + fonteNeutrons[i]*(dxb - dxa)
    }
    return absRate;
  }
  return(
    <div>
      <div>
        <PlotComponent 
        f = {(x) => {return fluxFunction(x)}}
        L = {1000}
        range={[0, getComprimento()]}
          ></PlotComponent>
      </div>
      <ArrayFormInput
      label='Digite um ponto para ser filtrado'
      placeholder='Informe a posição em cm'
      value={filterPoint}
      msgAlert='Informe um ponto do domínio para calcular o fluxo'
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => setFilterPoint(event.target.value)}
      ></ArrayFormInput>
      <div style={{justifyContent: 'center', alignItems: 'center'}}>
        {(fluxFunction(Number(filterPoint)) == -1) && (
          <p style={{textAlign: 'center'}}>O ponto filtrado está fora do domínio</p>
        )}
        {(fluxFunction(Number(filterPoint)) >= 0) && (
          <p style={{textAlign: 'center'}}>O valor em {filterPoint} é {fluxFunction(Number(filterPoint))}</p>
        )}
      </div>

      <ArrayFormInput
      label='Digite um intervalo'
      placeholder='Informe o intervalo para calcular a taxa de absorção'
      value={filterInterval}
      msgAlert='Informe um intervalo do domínio para calcular a taxa de absorção'
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => setFilterInterval(event.target.value)}
      ></ArrayFormInput>
      <div style={{justifyContent: 'center', alignItems: 'center'}}>
        {( (filterInterval.split(";").length == 2) && (Number(filterInterval.split(";")[0]) >= 0) && (Number(filterInterval.split(";")[1]) >= 0)) && (
          <p style={{textAlign: 'center'}}>O valor em {filterInterval} é {absorptionRate(Number(filterInterval.split(";")[0]), Number(filterInterval.split(";")[1]))}</p>
        )}  
      </div>
    </div>
  );
}

export default ReconstructionComponent;