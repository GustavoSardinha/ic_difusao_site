import { thomasSimetrico, integralDifusaoSimpson, desvioRelativo} from "../../Services/numericalMath";
import { ResultStateMultiplicative } from "../../Interfaces/ResultStateMultiplicative";


export const generateVectors = ( result: ResultStateMultiplicative, 
    contornoEsq: string, contornoDir: string, noNi:boolean,
    Lkeff:string, Lfluxo:string, criterioParada: boolean, 
    passos:number, energia:string, potencia:string) => {
    
    if (!result) return { solutions: [], newEsps: [] };
    
    const {
      numRegioes,
      mapeamento,
      numCelulasPorRegiao,
      coeficientesDifusao,
      choquesMacroscopicosAbs,
      choquesMacroscopicosFis,
      espessura,
      comprimento,
      nogamma,
      Ni
    } = result;
    let solResult: number[] = [];
    let newEsps: number[] = [];
    let cond_left = contornoEsq.split(";").map(Number);
    let cond_right = contornoDir.split(";").map(Number);
    let itfluxo = 0;
    let keff: number = Math.sqrt(2);
    let keffs: number[] = [keff];
    let keffAnt: number = 0;
    let fluxoMedio = 1/2;
    let fluxoMedioAnt = 0;
    let numPassos = 0;
    let sol_ant: number = 0;
    let niValor = noNi ? Number(Ni) : 1;

    while (((desvioRelativo(keff, keffAnt) > Number(Lkeff)) || 
        (desvioRelativo(fluxoMedio, fluxoMedioAnt) > Number(Lfluxo))) || 
        (numPassos >= 1000)){
      const vectorA: number[] = [];
      const vectorB: number[] = [];
      const vectorFonte: number[] = [];
      newEsps = [];
      let xsx: number[] = [];
      let s: number[] = [];
      let nm = 0;
      let espPorReg: number[] = [];
      if ((desvioRelativo(fluxoMedio, fluxoMedioAnt) > Number(Lfluxo)))
        itfluxo++;
      for (let regioes = 0; regioes < numRegioes; regioes++) {
        const indice_mapeamento = mapeamento[regioes] - 1;
        const coef_difusao = coeficientesDifusao[indice_mapeamento];
        const coef_choque_macro = choquesMacroscopicosAbs[indice_mapeamento];
        const coef_choque_fis = choquesMacroscopicosFis[indice_mapeamento];
        const h = espessura[regioes] / numCelulasPorRegiao[regioes];
        let gamma = 1;
        console.log(coef_choque_macro);
        console.log(coef_difusao);
        console.log(h);
        console.log(coef_choque_fis);
        if(!nogamma){
          if(coef_choque_macro - (niValor*coef_choque_fis)/keff > 0){
            const Lk = Math.sqrt(coef_difusao/(coef_choque_macro - (niValor*coef_choque_fis)/keff));
            gamma = ((2*Lk)/h)*Math.tanh(h/(2*Lk));
            console.log(gamma);
          }
          else{
            const Lk = Math.sqrt(coef_difusao/((niValor*coef_choque_fis/keff - coef_choque_macro)));
            gamma = ((2*Lk)/h)*Math.tan(h/(2*Lk));
            console.log(gamma);
          }
        }
        for (let j = 0; j < numCelulasPorRegiao[regioes]; j++) {
          nm++;
          espPorReg.push(h);
          vectorB.push((coef_difusao/(gamma*h)) - coef_choque_macro * h * gamma/ 4);
          xsx.push(coef_choque_macro * h * gamma/ 4);
          s.push((niValor * coef_choque_fis / keff) * h * gamma / 2);                       
        }
      }
      if(solResult.length == 0){
        for(let i = 0; i < nm + 1; i++){
          solResult.push(1);
        }
      }
      for(let i = 0; i < s.length; i++){
        s[i] *= (solResult[i] + solResult[i + 1])/2;
      }
      espPorReg.push(comprimento);

      vectorA.push(vectorB[0] + 2*xsx[0] + Number(cond_left[1]));
      vectorFonte.push(s[0]);
      
      for (let i = 1; i < nm; i++) {
        vectorA.push(vectorB[i] + vectorB[i - 1] + 2*xsx[i] + 2*xsx[i - 1]);
        vectorFonte.push(s[i] + s[i - 1]);
      }
      
      vectorA.push(vectorB[nm - 1] + 2*xsx[nm - 1] + Number(cond_right[1]));
      vectorFonte.push(s[nm - 1]);
      keffAnt = keff;
      console.log(vectorA);
      console.log(vectorB);
      console.log(vectorFonte);
      const solu = thomasSimetrico(vectorA, vectorB, vectorFonte);
      console.log(solu);
      let somaAtual = 0;
      let somaAnt = 0;
      fluxoMedioAnt = fluxoMedio;
      fluxoMedio = 0;
      for(let i = 0; i < vectorFonte.length; i++){
        sol_ant = solResult[i];
        somaAnt += vectorFonte[i];
        somaAtual += vectorFonte[i]*(solu[i]/sol_ant);
        fluxoMedio += solu[i]/solu.length;
        solResult[i] = solu[i];
      }
      keff = keffAnt*(somaAtual/somaAnt);
      if((desvioRelativo(keff, keffAnt) > Number(Lkeff))){
        keffs.push(keff);
      }
      numPassos++;
      if(criterioParada)
        if(numPassos >= passos)
          break;
      let pos = 0;
      espPorReg.forEach((esp) => {
        newEsps.push(pos);
        pos += esp;
      });
  }
  const E_fission_J = Number(energia) * 1.602176634e-13;
  const pot = Number(potencia) || 1;
  let potencialFicitio = 0;
  let potenciais = [];
  let indice = 1;
  let inicio = 0;
  let fim = 0;

  for (let regioes = 0; regioes < numRegioes; regioes++) {
    const idx = mapeamento[regioes] - 1;
    const Σf = choquesMacroscopicosFis[idx];
    const h = espessura[regioes] / numCelulasPorRegiao[regioes];
    fim = indice + numCelulasPorRegiao[regioes];
    const p = Σf * integralDifusaoSimpson(solResult, h, inicio, fim - 1) * E_fission_J / 1000000;
    potenciais.push(p);
    potencialFicitio += p;
    indice += numCelulasPorRegiao[regioes];
    inicio = fim - 1;
  }

  if (potencialFicitio > 0) {
    const factor = pot / potencialFicitio;
    for (let i = 0; i < solResult.length; i++) {
      solResult[i] = solResult[i] * factor;
    }
    potenciais = potenciais.map(p => p * factor);
  }

    return {solResult, newEsps, keffs, potenciais, itfluxo};  
  };