import { useState, useEffect, use} from 'react';
import {useNavigate } from 'react-router-dom';
import '../../Styles/App.css';
import FormInput from '../../Components/FormInput';
import ArrayFormInput from '../../Components/ArrayFormInput';
import { useValidation } from '../../Hooks/useValidationMultiplicative';
import ContinueButton from '../../Components/ContinueButton';
import ContornoModal from '../../Components/ContornoModal/Multiplicative';
import { thomasSimetrico, desvioRelativo, integralNumerica, integralDifusaoSimpson } from '../../Services/numericalMath';
import CheckBoxInput from '../../Components/CheckBoxInput';
import main_img from '../../img/logo_uerj.png';
import logo from '../../img/atom.png';
import ArrayField from '../../Interfaces/ArrayField';
import HomeWrapperProps from '../../Interfaces/HomeWrapperProps';
import {ResultStateMultiplicative} from '../../Interfaces/ResultStateMultiplicative';
import FormInputWithAlert from '../../Components/FormInputWithAlert';
import { calculateAlbedo } from '../../Hooks/useAlbedoSolver';


function MultiplicativeComponent({ initialState }: HomeWrapperProps) {
  const navigate = useNavigate();
  const [result, setResult] = useState<ResultStateMultiplicative | null>((initialState?.result as ResultStateMultiplicative) || null);
  
  const [numRegioes, setNumRegioes] = useState<string>(initialState?.result?.numRegioes?.toString() || "");
  const [zonasMateriais, setZonasMateriais] = useState<string>(initialState?.result?.zonasMateriais?.toString() || "");
  const [mapeamento, setMapeamento] = useState<string>(initialState?.result?.mapeamento?.join(';') || "");
  const [numCelulasPorRegiao, setNumCelulasPorRegiao] = useState<string>(initialState?.result?.numCelulasPorRegiao?.join(';') || "");
  const [coeficientesDifusao, setCoeficientesDifusao] = useState<string>(initialState?.result?.coeficientesDifusao?.join(';') || "");
  const [choquesMacroscopicosAbs, setChoquesMacroscopicosAbs] = useState<string>((initialState?.result as ResultStateMultiplicative)?.choquesMacroscopicosAbs?.join(';') || "");
  const [choquesMacroscopicosFis, setChoquesMacroscopicosFis] = useState<string>((initialState?.result as ResultStateMultiplicative)?.choquesMacroscopicosFis?.join(';') || "");
  const [espessura, setEspessura] = useState<string>(initialState?.result?.espessura?.join(';') || "");
  const [stepGraphic, setStepGraphic] = useState<string>(initialState?.result?.stepGraphic?.toString() || "1");
  const [stepTable, setStepTable] = useState<string>(initialState?.result?.stepTable?.toString() || "1");
  const [contornoDir, setContornoDir] = useState<string>(initialState?.result?.contornoDir || "0;0");
  const [contornoEsq, setContornoEsq] = useState<string>(initialState?.result?.contornoEsq || "0;0");
  const [hasGrafic, setHasGrafic] = useState<boolean>(initialState?.result?.hasGrafic ?? true);
  const [advancedOptions, setAdvancedOptions] = useState<boolean>(initialState?.result?.advancedOptions || false);
  const [noGamma, setNoGamma] = useState<boolean>(initialState?.result?.nogamma || false);
  const [noNi, setNoNi] = useState<boolean>((initialState?.result as ResultStateMultiplicative)?.noNi|| false);
  const [Ni, setNi] = useState<string>((initialState?.result as ResultStateMultiplicative)?.Ni?.toString() || "");
  const [potencia, setPotencia] = useState<string>((initialState?.result as ResultStateMultiplicative)?.potencia?.toString() || "");
  const [energia, setEnergia] = useState<string>((initialState?.result as ResultStateMultiplicative)?.energia?.toString() || "");
  const [Lkeff, setLkeff] = useState<string>(
    (initialState?.result as ResultStateMultiplicative)?.Lkeff ?? 1e-6
  );

  const [Lfluxo, setfluxo] = useState<string>(
    (initialState?.result as ResultStateMultiplicative)?.Lfluxo ?? 1e-6
  );

  const [filterPoint, setFilterPoint] = useState<string>(initialState?.result?.filterPoint?.toString() || "0");
  const [err, setErr] = useState<Error | null>(null);
  
  const { validated, setValidated, runAll } = useValidation();
  const [cc_active, setCCActive] = useState<boolean>(false);

  const [msgErro, setMsgErro] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);

  const [criterioParada, setCriterioParada] = useState<boolean>(false);
  const [passos, setPassos] = useState<number>(1);
  const [albedoL, setAlbedoL] = useState<boolean>((initialState?.result as ResultStateMultiplicative)?.albedoL || false);
  const [albedoR, setAlbedoR] = useState<boolean>((initialState?.result as ResultStateMultiplicative)?.albedoR || false);
  const [aL, setAL] = useState<string>((initialState?.result as ResultStateMultiplicative)?.aL?.toString() || "");
  const [bL, setBL] = useState<string>((initialState?.result as ResultStateMultiplicative)?.bL?.toString() || "");  
  const [aR, setAR] = useState<string>((initialState?.result as ResultStateMultiplicative)?.aR?.toString() || "");
  const [bR, setBR] = useState<string>((initialState?.result as ResultStateMultiplicative)?.bR?.toString() || ""); 
  const [inf_bL, setInf_bL] = useState<boolean>((initialState?.result as ResultStateMultiplicative)?.inf_bL || false);
  const [inf_bR, setInf_bR] = useState<boolean>((initialState?.result as ResultStateMultiplicative)?.inf_bR || false);
  const [coefDifusaoRefL, setCoefDifuRefL] = useState<string>((initialState?.result as ResultStateMultiplicative)?.coefDifusaoRefL?.toString() || "");
  const [coefDifusaoRefR, setCoefDifuRefR] = useState<string>((initialState?.result as ResultStateMultiplicative)?.coefDifusaoRefR?.toString() || "");
  const [coefChoqueRefL, setCoefChoqueRefL] = useState<string>((initialState?.result as ResultStateMultiplicative)?.coefChoqueRefL?.toString() || "");
  const [coefChoqueRefR, setCoefChoqueRefR] = useState<string>((initialState?.result as ResultStateMultiplicative)?.coefChoqueRefR?.toString() || "");
  const [coefDifusaoBaffL, setCoefDifuBaffL] = useState<string>((initialState?.result as ResultStateMultiplicative)?.coefDifusaoBaffL?.toString() || "");
  const [coefDifusaoBaffR, setCoefDifuBaffR] = useState<string>((initialState?.result as ResultStateMultiplicative)?.coefDifusaoBaffR?.toString() || "");
  const [coefChoqueBaffL, setCoefChoqueBaffL] = useState<string>((initialState?.result as ResultStateMultiplicative)?.coefChoqueBaffL?.toString() || "");
  const [coefChoqueBaffR, setCoefChoqueBaffR] = useState<string>((initialState?.result as ResultStateMultiplicative)?.coefChoqueBaffR?.toString() || "");
  const [baffleL, setBaffleL] = useState<boolean>((initialState?.result as ResultStateMultiplicative)?.baffleL || false);
  const [baffleR, setBaffleR] = useState<boolean>((initialState?.result as ResultStateMultiplicative)?.baffleR || false);

  useEffect(() => {
    if (initialState?.result) {
      const savedState = (initialState?.result as ResultStateMultiplicative);
      setNumRegioes(savedState.numRegioes.toString());
      setZonasMateriais(savedState.zonasMateriais.toString());
      setMapeamento(savedState.mapeamento.join(';'));
      setNumCelulasPorRegiao(savedState.numCelulasPorRegiao.join(';'));
      setCoeficientesDifusao(savedState.coeficientesDifusao.join(';'));
      setChoquesMacroscopicosAbs(savedState.choquesMacroscopicosAbs.join(';'));
      setChoquesMacroscopicosFis(savedState.choquesMacroscopicosFis.join(';'));
      setEspessura(savedState.espessura.join(';'));
      setStepGraphic(savedState.stepGraphic.toString());
      setStepTable(savedState.stepTable.toString());
      setContornoDir(savedState.contornoDir);
      setContornoEsq(savedState.contornoEsq);
      setHasGrafic(savedState.hasGrafic);
      setAdvancedOptions(savedState.advancedOptions);
      setNoGamma(savedState.nogamma);
      setFilterPoint(savedState.filterPoint.toString());
    }
  }, [initialState]);
  useEffect(() => {
    if (!noNi) {
      setNi("");
    }
  }, [noNi]);
  const arrayFields: ArrayField[] = [
    {
      key
      : 'mapeamento',
      label: 'Mapeamento:',
      placeholder: 'Digite os índices do mapeamento.',
      msgAlert:
        'Para informar o mapeamento corretamente, é necessário separar cada valor com um ponto e vírgula (;).',
      exAlert: 'Exemplo: 1;2;3;1',
      value: mapeamento,
      setter: setMapeamento,
    },
    {
      key: 'numCelulasPorRegiao',
      label: 'Número de células por Região:',
      placeholder: 'Informe o número de células por região.',
      msgAlert:
        'Para informar o número de células por região corretamente, é necessário separar cada valor com um ponto e vírgula (;).',
      exAlert: 'Exemplo: 1000;800;1000;500',
      value: numCelulasPorRegiao,
      setter: setNumCelulasPorRegiao,
    },
    {
      key: 'coeficientesDifusao',
      label: 'Coeficientes de difusão:',
      placeholder: 'Informe os valores dos coeficientes de difusão.',
      msgAlert:
        'Para informar os coeficientes de difusão corretamente, é necessário separar cada valor com um ponto e vírgula (;). Além disso, considere o (.) para passar valores decimais.',
      exAlert: 'Exemplo: 1.5;3.83;2.3;1',
      value: coeficientesDifusao,
      setter: setCoeficientesDifusao,
    },
    {
      key: 'choquesMacroscopicosAbs',
      label: 'Seções de Choque Macroscópicas de Absorção:',
      placeholder: 'Informe os valores das seções de choque macroscópicas.',
      msgAlert:
        'Para informar os valores das seções choques macroscópicos de absorção corretamente, é necessário separar cada valor com um ponto e vírgula (;). Além disso, considere o (.) para passar valores decimais.',
      exAlert: 'Exemplo: 0.7;3;4.2;1',
      value: choquesMacroscopicosAbs,
      setter: setChoquesMacroscopicosAbs,
    },
    {
      key: 'choquesMacroscopicosFis',
      label: 'Seções de Choque Macroscópicas de Fissão:',
      placeholder: 'Informe os valores das seções de choque macroscópicas.',
      msgAlert:
        'Para informar os valores das seções choques macroscópicos fissão corretamente, é necessário separar cada valor com um ponto e vírgula (;). Além disso, considere o (.) para passar valores decimais.',
      exAlert: 'Exemplo: 0.7;3;4.2;1',
      value: choquesMacroscopicosFis,
      setter: setChoquesMacroscopicosFis,
    },    
    {
      key: 'espessura',
      label: 'Espessura de cada Região (cm):',
      placeholder: 'Informe os valores das espessuras em cm.',
      msgAlert:
        'Para informar as espessuras corretamente, é necessário separar cada valor com um ponto e vírgula (;). Além disso, considere o (.) para passar valores decimais e que a unidade de espessura é centímetros.',
      exAlert: 'Exemplo: 2;1.4;1.7;2.3',
      value: espessura,
      setter: setEspessura,
    },
  ];
  
  function getComprimento(): number {
    if(result != null){
      return result.comprimento;
    }
    return 0;
  }
  
  const onSubmit = (onError: (err: Error) => void) => {
    try {
      const newResult = runAll({
        numRegioes,
        zonasMateriais,
        mapeamento,
        numCelulasPorRegiao,
        coeficientesDifusao,
        choquesMacroscopicosAbs,
        choquesMacroscopicosFis,
        Ni,
        noNi,
        espessura,
        potencia,
        energia,
        stepGraphic,
        stepTable,
        advancedOptions,
        filterPoint
      }) as ResultStateMultiplicative;
      if(energia == "")
        setEnergia("200");
      if(potencia == "")
        setPotencia("200");
      setResult({
        ...newResult,
        hasGrafic,
        advancedOptions,
        filterPoint: Number(filterPoint),
        nogamma: noGamma,
        contornoDir,
        contornoEsq,
      });
      setCCActive(true);
    } catch (err) {
      setErr(err as Error);
      onError(err as Error);
    }
  };
  const generateVectors = (contornoEsqAtual: string, contornoDirAtual: string) => {
    
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
    const { newContornoEsq, newContornoDir } = solveAlbedo(contornoEsqAtual, contornoDirAtual);
    let cond_left = newContornoEsq.split(";").map(Number);
    let cond_right = newContornoDir.split(";").map(Number);
    console.log(cond_left);
    console.log(cond_right);
    console.log(newContornoEsq);
    console.log(newContornoDir);
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

const valitadionContorno = async (
  contornoEsqAtual: string,
  contornoDirAtual: string
) => {
  try{
    const lkeff = Number(Lkeff);
    const lfluxo = Number(Lfluxo);
    const albeldoL = Boolean(albedoL);
    const albeldoR = Boolean(albedoR);
    const a_l = Number(aL);
    const b_l = Number(bL);
    const a_r = Number(aR);
    const b_r = Number(bR);
    const coef_difu_ref_l = Number(coefDifusaoRefL);
    const coef_difu_baff_l = Number(coefDifusaoBaffL);
    const coef_difu_ref_r = Number(coefDifusaoRefR);
    const coef_difu_baff_r = Number(coefDifusaoBaffR);
    const coef_choque_ref_l = Number(coefChoqueRefL);
    const coef_choque_ref_r = Number(coefChoqueRefR);
    const coef_choque_baff_l = Number(coefChoqueBaffL);
    const coef_choque_baff_r = Number(coefChoqueBaffR);

    if (!Number.isFinite(lkeff) || lkeff === 0) {
      throw new Error("Valor inválido para critério de parada de keff");
    }
    if (!Number.isFinite(lfluxo) || lfluxo === 0) {
      throw new Error("Valor inválido para critério de parada do fluxo");
    }
    if(albeldoL){
      if(baffleL){
        if (!Number.isFinite(a_l) || a_l === 0) {
          throw new Error("Valor inválido para comprimento do baffle na esquerda");
        }
      }
      if(!inf_bL){
        if (!Number.isFinite(b_l) || b_l === 0) {
          throw new Error("Valor inválido para comprimento do refletor na esquerda");
        }
      }
      if(albeldoR){
        if(baffleR){
          if (!Number.isFinite(a_r) || a_r === 0) {
            throw new Error("Valor inválido para comprimento do baffle na direita");
          }
        }
        if(!inf_bR){
          if (!Number.isFinite(b_r) || b_r === 0) {
            throw new Error("Valor inválido para comprimento do refletor na direita");
          }
        }
      } 
      if(isNaN(coef_difu_ref_l) || coef_difu_ref_l <= 0){
        throw new Error("Informe apenas valores numéricos maiores que zero para o coeficiente de difusão do refletor na esquerda");
      }
      if(isNaN(coef_choque_ref_l) || coef_choque_ref_l <= 0){
        throw new Error("Informe apenas valores numéricos maiores que zero para a seção de choque macroscópica do refletor na esquerda");
      }
      if(isNaN(coef_difu_ref_r) || coef_difu_ref_r <= 0){
        throw new Error("Informe apenas valores numéricos maiores que zero para o coeficiente de difusão do refletor na direita");
      }
      if(isNaN(coef_choque_ref_r) || coef_choque_ref_r <= 0){
        throw new Error("Informe apenas valores numéricos maiores que zero para a seção de choque macroscópica do refletor na direita");
      }
      if(baffleL){
        if(isNaN(coef_difu_baff_l) || coef_difu_baff_l <= 0){
          throw new Error("Informe apenas valores numéricos maiores que zero para o coeficiente de difusão do baffle na esquerda");
        }
        if(isNaN(coef_choque_baff_l) || coef_choque_baff_l <= 0){
          throw new Error("Informe apenas valores numéricos maiores que zero para a seção de choque macroscópica do baffle na esquerda");
        }
      }
      if(baffleR){
        if(isNaN(coef_difu_baff_r) || coef_difu_baff_r <= 0){
          throw new Error("Informe apenas valores numéricos maiores que zero para o coeficiente de difusão do baffle na direita");
        }
        if(isNaN(coef_choque_baff_r) || coef_choque_baff_r <= 0){
          throw new Error("Informe apenas valores numéricos maiores que zero para a seção de choque macroscópica do baffle na direita");
        }
      }
    }
    await solveProblem(
      contornoEsqAtual,
      contornoDirAtual
    );
  }
  catch (e) {
    if (e instanceof Error) {
      setMsgErro(e.message);
    } else {
      setMsgErro("Erro inesperado");
    }
    setShowModal(true);
  }
}
  const solveProblem = async (contornoEsqAtual: string, contornoDirAtual: string) => {
    setValidated(false);
    const {solResult, newEsps, keffs, potenciais, itfluxo} = generateVectors(contornoEsqAtual, contornoDirAtual);
    await new Promise(resolve => setTimeout(resolve, 0));
    const{newContornoEsq, newContornoDir} = solveAlbedo(contornoEsqAtual, contornoDirAtual);
    if(keffs != undefined){
      navigate("/relatorio", { 
        state: { 
          result: {
            ...result!,
            hasGrafic,
            advancedOptions,
            filterPoint: Number(filterPoint),
            nogamma: noGamma,
            contornoDir: newContornoDir,
            contornoEsq: newContornoEsq,
            keff: keffs[keffs.length - 1],
            aL,
            bL,
            aR,
            bR,
            inf_bL,
            inf_bR,
            baffleL,
            baffleR,
            coefDifusaoRefL,
            coefDifusaoRefR,
            coefChoqueRefL,
            coefChoqueRefR,
            coefDifusaoBaffL,
            coefDifusaoBaffR,
            coefChoqueBaffL,
            coefChoqueBaffR,
            albedoL,
            albedoR
          },
          vector_solutions: solResult,
          esps: newEsps,
          vector_keffs: keffs,
          vector_pot: potenciais,
          itfluxo: itfluxo
        } 
      });
    }
  };
  const solveAlbedo = (contornoEsqAtual: string, contornoDirAtual: string) => {
    let cond_left = contornoEsqAtual.split(";").map(Number);
    let cond_right = contornoDirAtual.split(";").map(Number);
    console.log("beta_esq: " + cond_left[1]);
    console.log("beta_dir: " + cond_right[1]);
    let newContornoEsq = contornoEsqAtual;
    let newContornoDir = contornoDirAtual;

    if (albedoL) {
      const albedoValue = calculateAlbedo(
        Number(aL),
        Number(bL),
        cond_left[1],
        Number(coefDifusaoRefL),
        Number(coefDifusaoBaffL),
        Number(coefChoqueRefL),
        Number(coefChoqueBaffL),
        Boolean(inf_bL),
        baffleL
      );

      newContornoEsq = `${cond_left[0]};${albedoValue}`;
      setContornoEsq(newContornoEsq);
    }

    if (albedoR) {
      const albedoValue = calculateAlbedo(
        Number(aR),
        Number(bR),
        cond_right[1],
        Number(coefDifusaoRefR),
        Number(coefDifusaoBaffR),
        Number(coefChoqueRefR),
        Number(coefChoqueBaffR),
        Boolean(inf_bR),
        baffleR
      );

      newContornoDir = `${cond_right[0]};${albedoValue}`;
      setContornoDir(newContornoDir);
    }

    return {
      newContornoEsq,
      newContornoDir
    };
  };
  return (
    <div className="App">
      <header className="App-header">
        <nav>
          <img src={logo} className="App-logo" alt="logo" />
        </nav>
      </header>
      <article className="App-body">
        <div className="App-Container">
          <div className="Title-container">
            <h1 className="App-title">
              Meios Multiplicativos
            </h1>
          </div>
          <CheckBoxInput
            text = {"Diferenças Finitas"}
            value = {noGamma}
            onChange = {setNoGamma}
          />
          <FormInput
            label="Informe o número de regiões:"
            placeholder="Digite o número de regiões."
            onChange={(value: string) => setNumRegioes(value)}
            value={numRegioes}
          />
          <FormInput
            label="Informe o número de zonas materiais:"
            placeholder="Digite o número de zonas materiais."
            onChange={(value: string) => setZonasMateriais(value)}
            value={zonasMateriais}
          />
  
          {arrayFields.map(
            ({ key, label, placeholder, msgAlert, exAlert, value, setter }) => (
              <ArrayFormInput
                key={key}
                label={label}
                placeholder={placeholder}
                msgAlert={msgAlert}
                exAlert={exAlert}
                value={value}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setter(event.target.value)}
              />
            )
          )}
          <CheckBoxInput
            text = {"Incluir o ν"}
            value = {noNi}
            onChange = {setNoNi}
          />
          {(noNi) && (
            <FormInput
              label="Informe o número de nêutrons gerados por fissão:"
              placeholder="Informe um valor para ν"
              onChange={(value: string) => setNi(value)}
              value={Ni}
            />
          )}
          <div>
            <FormInputWithAlert
              label="Potência gerada pelo reator:"
              placeholder="Informe a potência em MW"
              onChange={(value: string) => setPotencia(value)}
              value={potencia}
              msgAlert='Se esse campo for deixado em branco, assume-se uma potência de 200 MW.'
              exAlert=''
            />
          </div>
          <div>
            <FormInputWithAlert
              label="Energia liberada por fissão:"
              placeholder="Informe a energia em MeV"
              onChange={(value: string) => setEnergia(value)}
              value={energia}
              msgAlert='Se esse campo for deixado em branco, assume-se uma energia de 200 MeV.'
              exAlert=''
            />
          </div>
          <CheckBoxInput
            text = {"Saída gráfica"}
            value = {hasGrafic}
            onChange = {setHasGrafic}
          />
          {(hasGrafic) && (
            <FormInput
              label="Passo da malha de discretização no gráfico:"
              placeholder="Informe o passo do gráfico"
              onChange={(value: string) => setStepGraphic(value)}
              value={stepGraphic}
            />
          )}
          <FormInput
            label="Passo da malha de discretização na tabela:"
            placeholder="Informe o passo da tabela"
            onChange={(value: string) => setStepTable(value)}
            value={stepTable}
          />
          <CheckBoxInput
            text = {"Opções avançadas"}
            value = {advancedOptions}
            onChange = {setAdvancedOptions}
          />
          {((advancedOptions) && (
            <FormInput
              label="Ponto na malha de discretização:"
              placeholder="Digite o ponto a filtrar na malha de discretização."
              onChange={(value: string) => setFilterPoint(value)}
              value={filterPoint}
            />
          ))}
          <ContinueButton
            onClick = {onSubmit}
            err = {err}
          />
          { (cc_active) && (
            <ContornoModal
              contornoDir = {contornoDir}
              setContornoDir = {setContornoDir}
              contornoEsq = {contornoEsq}
              setContornoEsq = {setContornoEsq}
              L = {getComprimento()}
              successFunc = {valitadionContorno}
              Lkeff={Lkeff}
              setLKeff={setLkeff}
              Lfluxo={Lfluxo}
              setLfluxo={setfluxo}
              msgErroDialog={msgErro}
              showModal ={showModal}
              setShowModal={setShowModal}
              criterioParada={criterioParada}
              setCriterioParada={setCriterioParada}
              passos={passos}
              setPassos={setPassos}
              setCCActive={setCCActive}
              albedoL={albedoL}
              setAlbedoL={setAlbedoL}
              albedoR={albedoR}
              setAlbedoR={setAlbedoR}
              aL={aL}
              setAL={setAL}
              bL={bL}
              setBL={setBL}
              aR={aR}
              setAR={setAR}
              bR={bR}
              setBR={setBR}
              inf_bL={inf_bL}
              setInf_bL={setInf_bL}
              inf_bR={inf_bR}
              setInf_bR={setInf_bR}
              coefChoqueRefL={coefChoqueRefL}
              setCoefChoqueRefL={setCoefChoqueRefL}
              coefChoqueRefR={coefChoqueRefR}
              setCoefChoqueRefR={setCoefChoqueRefR}
              coefDifusaoRefL={coefDifusaoRefL}
              setCoefDifuRefL={setCoefDifuRefL}
              coefDifusaoRefR={coefDifusaoRefR}
              setCoefDifuRefR={setCoefDifuRefR}
              coefChoqueBaffL={coefChoqueBaffL}
              setCoefChoqueBaffL={setCoefChoqueBaffL}
              coefChoqueBaffR={coefChoqueBaffR}
              setCoefChoqueBaffR={setCoefChoqueBaffR}
              coefDifusaoBaffL={coefDifusaoBaffL}
              setCoefDifuBaffL={setCoefDifuBaffL}
              coefDifusaoBaffR={coefDifusaoBaffR}
              setCoefDifuBaffR={setCoefDifuBaffR}
              baffleL={baffleL}
              setBafflebL={setBaffleL}
              baffleR={baffleR}
              setBaffleR={setBaffleR}
            />
          )}
        </div>
      </article>
    </div>
  );
}

export default MultiplicativeComponent;