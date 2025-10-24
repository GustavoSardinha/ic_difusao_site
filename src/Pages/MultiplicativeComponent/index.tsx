import { useState, useEffect, use} from 'react';
import {useNavigate } from 'react-router-dom';
import '../../Styles/App.css';
import FormInput from '../../Components/FormInput';
import ArrayFormInput from '../../Components/ArrayFormInput';
import { useValidation } from '../../Hooks/useValidationMultiplicative';
import ContinueButton from '../../Components/ContinueButton';
import ContornoModal from '../../Components/ContornoModal/Multiplicative';
import { thomasSimetrico, desvioRelativo, integralNumerica } from '../../Services/numericalMath';
import CheckBoxInput from '../../Components/CheckBoxInput';
import main_img from '../../img/logo_uerj.png';
import logo from '../../img/atom.png';
import ArrayField from '../../Interfaces/ArrayField';
import HomeWrapperProps from '../../Interfaces/HomeWrapperProps';
import {ResultStateMultiplicative} from '../../Interfaces/ResultStateMultiplicative';
import FormInputWithAlert from '../../Components/FormInputWithAlert';
import { number } from 'framer-motion';


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
const generateVectors = () => {
  if (!result) return { solu: [], newEsps: [] };

  const {
    numRegioes,
    mapeamento,
    numCelulasPorRegiao,
    coeficientesDifusao,
    choquesMacroscopicosAbs,
    choquesMacroscopicosFis,
    Ni,
    comprimento,
    espessura,
    nogamma,
    noNi
  } = result;

  let itfluxo = 0;
  let keff = 0.1;
  let keffAnt = keff;
  let fluxoMedio = 1;
  let fluxoMedioAnt = 0;
  let keffs: number[] = [keff];
  let solResult: number[] = []; 
  let numPassos = 0;
  let first = true;
  const niValor = noNi ? Number(Ni) : 1;

  
  const parseCond = (c: string) => (c ? c.split(";").map(Number) : [0, 0]);

  const MAX_IT = 1000;


  const dentroTolerancia = (k: number, kAnt: number, f: number, fAnt: number) => {
    const lk = Number(Lkeff);
    const lf = Number(Lfluxo);
    const dK = desvioRelativo(k, kAnt);
    const dF = desvioRelativo(f, fAnt);
    return dK <= lk && dF <= lf;
  };


  while (true) {
    keffAnt = keff;
    fluxoMedioAnt = fluxoMedio;

    let nm = 0;
    const espPorReg: number[] = [];
    const vectorA: number[] = [];
    const vectorB: number[] = [];
    const vectorFonte: number[] = [];
    const s: number[] = [];
    const xsx: number[] = [];

    const cond_left = parseCond(contornoEsq);
    const cond_right = parseCond(contornoDir);

    for (let regioes = 0; regioes < numRegioes; regioes++) {
      const indice_mapeamento = mapeamento[regioes] - 1;
      const coef_difusao = coeficientesDifusao[indice_mapeamento];
      const coef_choque_macro = choquesMacroscopicosAbs[indice_mapeamento];
      const SigmaF = choquesMacroscopicosFis[indice_mapeamento];
      const h = espessura[regioes] / numCelulasPorRegiao[regioes];

      let gamma = 1;
      if (first) {
        keff += SigmaF / coef_choque_macro;
        first = false;
      }

      if(!noGamma){
        if (coef_choque_macro - niValor * SigmaF / keff > 0) {
          const xL = Math.sqrt(coef_difusao / (coef_choque_macro - niValor * SigmaF / keff));
          const z = h / (2 * xL);
          gamma = Math.tanh(z) / z;
        } else {
          const xL = Math.sqrt(coef_difusao / (Math.max(1e-12, niValor * SigmaF / keff - coef_choque_macro)));
          const z = h / (2 * xL);
          gamma = Math.tan(z) / z;
        }
      }
      console.log("gamma: " + gamma);
      for (let j = 0; j < numCelulasPorRegiao[regioes]; j++) {
        nm++;
        espPorReg.push(h);
        vectorB.push((coef_difusao / (gamma * h)) - (coef_choque_macro * h * gamma) / 4);
        xsx.push((coef_choque_macro * h * gamma) / 4);
        s.push((niValor * SigmaF / keff) * h * gamma / 2);
      }
    }

    if (solResult.length === 0) solResult = Array(nm + 1).fill(1);

  
    for (let i = 0; i < s.length; i++) {
      const denom = (solResult[i] ?? 1) + (solResult[i + 1] ?? 1);
      s[i] *= denom;
    }

    vectorA.push(vectorB[0] + 2 * xsx[0] + Number(cond_left[1] ?? 0));
    vectorFonte.push(s[0] + Number(cond_left[0] ?? 0));

    for (let i = 1; i < nm; i++) {
      const aVal = (vectorB[i] ?? 0) + (vectorB[i - 1] ?? 0) + 2 * (xsx[i] ?? 0) + 2 * (xsx[i - 1] ?? 0);
      vectorA.push(aVal);
      vectorFonte.push((s[i] ?? 0) + (s[i - 1] ?? 0));
    }

    vectorA.push((vectorB[nm - 1] ?? 0) + 2 * (xsx[nm - 1] ?? 0) + Number(cond_right[1] ?? 0));
    vectorFonte.push((s[nm - 1] ?? 0) + Number(cond_right[0] ?? 0));

    
    let solu: number[] | null = null;
    try {
      console.log("A:" + vectorA);
      console.log("B: " + vectorB);
      console.log("C: "+ vectorFonte);
      solu = thomasSimetrico(vectorA, vectorB, vectorFonte);
    } catch (e) {
      console.error("Erro no solver Thomas:", e);
      solu = null;
    }
    if (!solu) {
      console.warn("Solução nula do solver — interrompendo iteração.");
      break;
    }

    fluxoMedio = solu.reduce((acc, v) => acc + v, 0) / solu.length;

    const somaAnt = vectorFonte.reduce((acc, v) => acc + v, 0);
    let somaAtual = 0;
    for (let i = 0; i < vectorFonte.length; i++) {
      const prev = solResult[i] ?? 1;
      if (prev === 0) continue;
      somaAtual += vectorFonte[i] * (solu[i] / prev);
    }

    if (somaAnt > 0) {
      keff = keffAnt * (somaAtual / somaAnt);
    } else {
      console.warn("somaAnt === 0 ao recalcular keff — mantendo keff anterior.");
      keff = keffAnt;
    }

    if (desvioRelativo(keff, keffAnt) > Number(Lkeff)) {
      keffs.push(keff);
    }

    solResult = solu.slice();

    numPassos++;
    if (desvioRelativo(fluxoMedio, fluxoMedioAnt) > Number(Lfluxo)) {
      itfluxo++;
    }

    if (dentroTolerancia(keff, keffAnt, fluxoMedio, fluxoMedioAnt)) {
      break;
    }
    if (criterioParada && numPassos >= Number(passos)) {
      break;
    }
    if (numPassos >= MAX_IT) {
      console.warn("Máximo de iterações atingido.");
      break;
    }
  }

  const newEsps: number[] = [];
  let pos = 0;
  const espPorRegFinal: number[] = [];
  for (let r = 0; r < numRegioes; r++) {
    const h = espessura[r] / numCelulasPorRegiao[r];
    for (let j = 0; j < numCelulasPorRegiao[r]; j++) {
      espPorRegFinal.push(h);
    }
  }
  espPorRegFinal.forEach((esp) => {
    newEsps.push(pos);
    pos += esp;
  });
  newEsps.push(comprimento);

 
  let potencialFicitio = 0;
  const potenciais: number[] = [];
  if (solResult && solResult.length > 0) {
    let indice = 1;
    let inicio = 0;
    let fim = 0;
    for (let regioes = 0; regioes < numRegioes; regioes++) {
      const idx = mapeamento[regioes] - 1;
      const SigmaF = choquesMacroscopicosFis[idx];
      const h = espessura[regioes] / numCelulasPorRegiao[regioes];
      fim = indice + numCelulasPorRegiao[regioes];
      potencialFicitio += SigmaF * integralNumerica(solResult, h, inicio, fim);
      indice += numCelulasPorRegiao[regioes];
      inicio = fim - 1;
    }

    potencialFicitio *= Number(energia) * 1.6e-13;


    const potKW = (Number(potencia) * 1000) || 1;
    if (potencialFicitio === 0) {
      console.warn("potencialFicitio === 0 -> mantendo solução sem reescalonamento.");
    } else {
      const factor = potKW / potencialFicitio;
      for (let i = 0; i < solResult.length; i++) {
        solResult[i] = solResult[i] * factor;
      }
    }

    let indice2 = 1;
    let inicio2 = 0;
    let fim2 = 0;
    let potencialNominal = 0;
    for (let regioes = 0; regioes < numRegioes; regioes++) {
      const idx = mapeamento[regioes] - 1;
      const SigmaF = choquesMacroscopicosFis[idx];
      const h = espessura[regioes] / numCelulasPorRegiao[regioes];
      fim2 = indice2 + numCelulasPorRegiao[regioes];
      const p = SigmaF * integralNumerica(solResult, h, inicio2, fim2) * Number(energia) * 1.6e-13 / 1000;
      potencialNominal += p;
      potenciais.push(p);
      indice2 += numCelulasPorRegiao[regioes];
      inicio2 = fim2 - 1;
    }
  }

  return { solu: solResult, newEsps, keffs, potenciais, itfluxo };
};

const valitadionContorno = async () => {
  try{
    const lkeff = Number(Lkeff);
    const lfluxo = Number(Lfluxo);
    if (!Number.isFinite(lkeff) || lkeff === 0) {
      throw new Error("Valor inválido para critério de parada de keff");
    }
    if (!Number.isFinite(lfluxo) || lfluxo === 0) {
      throw new Error("Valor inválido para critério de parada do fluxo");
    }
    await solveProblem();
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
  const solveProblem = async () => {
    setValidated(false);
    const {solu, newEsps, keffs, potenciais, itfluxo} = generateVectors();
    console.log(potenciais);
    console.log(newEsps);
    await new Promise(resolve => setTimeout(resolve, 0));
    navigate("/relatorio", { 
      state: { 
        result: {
          ...result!,
          hasGrafic,
          advancedOptions,
          filterPoint: Number(filterPoint),
          nogamma: noGamma,
          contornoDir,
          contornoEsq,
        },
        vector_solutions: solu,
        esps: newEsps,
        vector_keffs: keffs,
        vector_pot: potenciais,
        itfluxo: itfluxo
      } 
    });
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
            />
          )}
        </div>
      </article>
    </div>
  );
}

export default MultiplicativeComponent;