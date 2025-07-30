import { useState, useEffect} from 'react';
import {useNavigate } from 'react-router-dom';
import '../../Styles/App.css';
import FormInput from '../../Components/FormInput';
import ArrayFormInput from '../../Components/ArrayFormInput';
import { useValidation } from '../../Hooks/useValidationMultiplicative';
import ContinueButton from '../../Components/ContinueButton';
import ContornoModal from '../../Components/ContornoModal';
import { thomasSimetrico } from '../../Services/numericalMath';
import CheckBoxInput from '../../Components/CheckBoxInput';
import main_img from '../../img/logo_uerj.png';
import logo from '../../img/atom.png';
import ArrayField from '../../Interfaces/ArrayField';
import HomeWrapperProps from '../../Interfaces/HomeWrapperProps';
import ResultStateMultiplicative from '../../Interfaces/ResultStateMultiplicative';
import FormInputWithAlert from '../../Components/FormInputWithAlert';


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
  const [incidenciaDir, setIncidenciaDir] = useState<number>(initialState?.result?.incidenciaDir || 0);
  const [incidenciaEsq, setIncidenciaEsq] = useState<number>(initialState?.result?.incidenciaEsq || 0);
  const [hasGrafic, setHasGrafic] = useState<boolean>(initialState?.result?.hasGrafic ?? true);
  const [advancedOptions, setAdvancedOptions] = useState<boolean>(initialState?.result?.advancedOptions || false);
  const [noGamma, setNoGamma] = useState<boolean>(initialState?.result?.nogamma || false);
  const [noNi, setNoNi] = useState<boolean>((initialState?.result as ResultStateMultiplicative)?.noNi|| false);
  const [Ni, setNi] = useState<string>((initialState?.result as ResultStateMultiplicative)?.Ni?.toString() || "");
  const [potencia, setPotencia] = useState<string>((initialState?.result as ResultStateMultiplicative)?.potencia?.toString() || "");
  const [energia, setEnergia] = useState<string>((initialState?.result as ResultStateMultiplicative)?.energia?.toString() || "");


  const [filterPoint, setFilterPoint] = useState<string>(initialState?.result?.filterPoint?.toString() || "0");
  const [err, setErr] = useState<Error | null>(null);
  
  const { validated, setValidated, runAll } = useValidation();
  const [cc_active, setCCActive] = useState<boolean>(false);

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
      setIncidenciaDir(savedState.incidenciaDir);
      setIncidenciaEsq(savedState.incidenciaEsq);
      setHasGrafic(savedState.hasGrafic);
      setAdvancedOptions(savedState.advancedOptions);
      setNoGamma(savedState.nogamma);
      setFilterPoint(savedState.filterPoint.toString());
    }
  }, [initialState]);

  const arrayFields: ArrayField[] = [
    {
      key: 'mapeamento',
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
        'Para informar os valores dos choques macroscópicos corretamente, é necessário separar cada valor com um ponto e vírgula (;). Além disso, considere o (.) para passar valores decimais.',
      exAlert: 'Exemplo: 0.7;3;4.2;1',
      value: choquesMacroscopicosAbs,
      setter: setChoquesMacroscopicosAbs,
    },
    {
      key: 'choquesMacroscopicosFis',
      label: 'Seções de Choque Macroscópicas de Fissão:',
      placeholder: 'Informe os valores das seções de choque macroscópicas.',
      msgAlert:
        'Para informar os valores dos choques macroscópicos corretamente, é necessário separar cada valor com um ponto e vírgula (;). Além disso, considere o (.) para passar valores decimais.',
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
  
  const onSubmit = () => {
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

      setResult({
        ...newResult,
        hasGrafic,
        advancedOptions,
        filterPoint: Number(filterPoint),
        nogamma: noGamma,
        contornoDir,
        contornoEsq,
        incidenciaDir,
        incidenciaEsq
      });
      setCCActive(true);
    } catch (err) {
      setErr(err as Error);
    }
  };
  /*
  const generateVectors = () => {
    const vectorA: number[] = [];
    const vectorB: number[] = [];
    const vectorFonte: number[] = [];
    
    if (!result) return { solutions: [], newEsps: [] };
    
    const {
      numRegioes,
      mapeamento,
      numCelulasPorRegiao,
      coeficientesDifusao,
      choquesMacroscopicosAbs,
      choquesMacroscopicosFis,
      Ni,
      espessura,
      potencia,
      energia,
      comprimento,
      nogamma
    } = result;
    
    let xsx: number[] = [];
    let s: number[] = [];
    let nm = 0;
    let cond_left = contornoEsq.split(";").map(Number);
    let cond_right = contornoDir.split(";").map(Number);
    let espPorReg: number[] = [];
    
    for (let regioes = 0; regioes < numRegioes; regioes++) {
      const indice_mapeamento = mapeamento[regioes] - 1;
      const coef_difusao = coeficientesDifusao[indice_mapeamento];
      const coef_choque_macro = choquesMacroscopicos[indice_mapeamento];
      const fonte = fonteNeutrons[regioes];
      const h = espessura[regioes] / numCelulasPorRegiao[regioes];
      const xL = Math.sqrt(coef_difusao/coef_choque_macro);
      const z = h / (2 * xL);
      let gamma = nogamma ? 1 : Math.tanh(z)/z;
    
      for (let j = 0; j < numCelulasPorRegiao[regioes]; j++) {
        nm++;
        espPorReg.push(h);
        vectorB.push((coef_difusao/(gamma*h)) - coef_choque_macro * h * gamma/ 4);
        xsx.push(coef_choque_macro * h * gamma/ 4);
        s.push(fonte * h * gamma / 2);                        
      }
    }
    
    espPorReg.push(comprimento);

    vectorA.push(vectorB[0] + 2*xsx[0] + Number(cond_left[1]));
    vectorFonte.push(s[0] + Number(incidenciaEsq) * Number(cond_left[0]));
    
    for (let i = 1; i < nm; i++) {
      vectorA.push(vectorB[i] + vectorB[i - 1] + 2*xsx[i] + 2*xsx[i - 1]);
      vectorFonte.push(s[i] + s[i - 1]);
    }
    
    vectorA.push(vectorB[nm - 1] + 2*xsx[nm - 1] + Number(cond_right[1]));
    vectorFonte.push(s[nm - 1] + Number(incidenciaDir) * Number(cond_right[0]));
    
    const solutions = thomasSimetrico(vectorA, vectorB, vectorFonte);
    
    const newEsps: number[] = [];
    let pos = 0;
    espPorReg.forEach((esp) => {
      newEsps.push(pos);
      pos += esp;
    });
    
    setResult(result => ({
      ...result!, 
      contornoDir,   
      incidenciaDir, 
      contornoEsq,  
      incidenciaEsq
    }));
    
    return {solutions, newEsps};
  };
*/
  /*const solveProblem = async () => {
    setValidated(false);
    const { solutions, newEsps} = generateVectors();
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
          incidenciaDir,
          incidenciaEsq
        },
        vector_solutions: solutions,
        esps: newEsps
      } 
    });
  };*/

  return (
    <div className="App">
      <header className="App-header">
        <nav>
          <img src={logo} className="App-logo" alt="logo" />
        </nav>
      </header>
      <article className="App-body">
        <div className="App-container">
          <img src={main_img} className="Main-img" alt="logo" />
          <div className="Title-container">
            <h1 className="App-title">
              Difusão de Partículas Neutras Unidimensional
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
              label="Informe o número de neutrôns gerados por fissão:"
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
            <FormInput
              label="Energia liberada por fissão:"
              placeholder="Informe a energia em MeV"
              onChange={(value: string) => setEnergia(value)}
              value={energia}
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
            label="Passo da malha de discretização no tabela:"
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
              label="Ponto na malha de discretização (cm):"
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
              incidenciaDir = {incidenciaDir}
              setIncidenciaDir = {setIncidenciaDir}
              incidenciaEsq = {incidenciaEsq}
              setIncidenciaEsq = {setIncidenciaEsq}
              L = {getComprimento()}
              successFunc = {f}
            />
          )}
        </div>
      </article>
    </div>
  );
}
function f(){


}

export default MultiplicativeComponent;