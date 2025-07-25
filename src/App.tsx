import { useState, useEffect, useRef, ReactNode } from 'react';
import { createBrowserRouter, RouterProvider, useLocation, useNavigate } from 'react-router-dom';
import './Styles/App.css';
import FormInput from './Components/FormInput';
import ArrayFormInput from './Components/ArrayFormInput';
import { useValidation } from './Data/Validations';
import ContinueButton from './Components/ContinueButton';
import ContornoModal from './Components/ContornoModal';
import { thomasSimetrico } from './Services/numericalMath';
import api from './Services/API/quickchart';
import html2pdf from 'html2pdf.js/dist/html2pdf.bundle.min.js';
import CheckBoxInput from './Components/CheckBoxInput';
import main_img from './img/logo_uerj.png';
import logo from './img/atom.png';
import Plot from 'react-plotly.js';
import PlotComponent from './Components/AnaliticalGraphics/PlotComponent';

interface ResultState {
  numRegioes: number;
  zonasMateriais: number;
  mapeamento: number[];
  numCelulasPorRegiao: number[];
  fonteNeutrons: number[];
  coeficientesDifusao: number[];
  choquesMacroscopicos: number[];
  espessura: number[];
  comprimento: number;
  stepGraphic: number;
  stepTable: number;
  hasGrafic: boolean;
  advancedOptions: boolean;
  nogamma: boolean;
  filterPoint: number;
  contornoDir: string;
  contornoEsq: string;
  incidenciaDir: number;
  incidenciaEsq: number;
}

interface HomeWrapperProps {
  initialState?: {
    result?: ResultState;
    vector_solutions?: number[];
    esps?: number[];
  };
}

interface ArrayField {
  key: string;
  label: string;
  placeholder: string;
  msgAlert: string;
  exAlert: string;
  value: string;
  setter: React.Dispatch<React.SetStateAction<string>>;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeWrapper />,
  },
  {
    path: "/relatorio",
    element: <RelatorioWrapper />,
  },
  {
    path: "/reconstrucao",
    element: <ReconstrucaoWrapper />,
  },
], { basename: "/ic_difusao_site" });

function HomeWrapper() {
  const location = useLocation();
  return <Home initialState={location.state} />;
}

function RelatorioWrapper() {
  const location = useLocation();
  return <Relatorio initialState={location.state} />;
}

function ReconstrucaoWrapper() {
  const location = useLocation();
  return <Reconstrucao initialState={location.state} />;
}

function App() {
  return <RouterProvider router={router} />;
}

function Home({ initialState }: HomeWrapperProps) {
  const navigate = useNavigate();
  const [result, setResult] = useState<ResultState | null>(initialState?.result || null);
  const [vector_solutions, setVector_solutions] = useState<number[]>(initialState?.vector_solutions || []);
  const [esps, setEsps] = useState<number[]>(initialState?.esps || []);
  
  const [numRegioes, setNumRegioes] = useState<string>(initialState?.result?.numRegioes?.toString() || "");
  const [zonasMateriais, setZonasMateriais] = useState<string>(initialState?.result?.zonasMateriais?.toString() || "");
  const [mapeamento, setMapeamento] = useState<string>(initialState?.result?.mapeamento?.join(';') || "");
  const [numCelulasPorRegiao, setNumCelulasPorRegiao] = useState<string>(initialState?.result?.numCelulasPorRegiao?.join(';') || "");
  const [fonteNeutrons, setFonteNeutrons] = useState<string>(initialState?.result?.fonteNeutrons?.join(';') || "");
  const [coeficientesDifusao, setCoeficientesDifusao] = useState<string>(initialState?.result?.coeficientesDifusao?.join(';') || "");
  const [choquesMacroscopicos, setChoquesMacroscopicos] = useState<string>(initialState?.result?.choquesMacroscopicos?.join(';') || "");
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
  const [filterPoint, setFilterPoint] = useState<string>(initialState?.result?.filterPoint?.toString() || "0");
  const [err, setErr] = useState<Error | null>(null);
  
  const { validated, setValidated, runAll } = useValidation();
  const [cc_active, setCCActive] = useState<boolean>(false);

  useEffect(() => {
    if (initialState?.result) {
      const savedState = initialState.result;
      setNumRegioes(savedState.numRegioes.toString());
      setZonasMateriais(savedState.zonasMateriais.toString());
      setMapeamento(savedState.mapeamento.join(';'));
      setNumCelulasPorRegiao(savedState.numCelulasPorRegiao.join(';'));
      setFonteNeutrons(savedState.fonteNeutrons.join(';'));
      setCoeficientesDifusao(savedState.coeficientesDifusao.join(';'));
      setChoquesMacroscopicos(savedState.choquesMacroscopicos.join(';'));
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
      key: 'fonteNeutrons',
      label: 'Fonte de nêutrons:',
      placeholder: 'Informe os valores das fontes de nêutrons.',
      msgAlert:
        'Para informar as fontes de nêutrons corretamente, é necessário separar cada valor com um ponto e vírgula (;).',
      exAlert: 'Exemplo: 4;0;0;2',
      value: fonteNeutrons,
      setter: setFonteNeutrons,
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
      key: 'choquesMacroscopicos',
      label: 'Seções de Choque Macroscópicas:',
      placeholder: 'Informe os valores das seções de choque macroscópicas.',
      msgAlert:
        'Para informar os valores dos choques macroscópicos corretamente, é necessário separar cada valor com um ponto e vírgula (;). Além disso, considere o (.) para passar valores decimais.',
      exAlert: 'Exemplo: 0.7;3;4.2;1',
      value: choquesMacroscopicos,
      setter: setChoquesMacroscopicos,
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
        fonteNeutrons,
        coeficientesDifusao,
        choquesMacroscopicos,
        espessura,
        stepGraphic,
        stepTable,
        advancedOptions,
        filterPoint
      }) as ResultState;

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
  
  const generateVectors = () => {
    const vectorA: number[] = [];
    const vectorB: number[] = [];
    const vectorFonte: number[] = [];
    
    if (!result) return { solutions: [], newEsps: [] };
    
    const {
      numRegioes,
      mapeamento,
      numCelulasPorRegiao,
      fonteNeutrons,
      coeficientesDifusao,
      choquesMacroscopicos,
      espessura,
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
    vectorFonte.push(s[0] + Number(incidenciaDir) * Number(cond_left[0]));
    
    for (let i = 1; i < nm; i++) {
      vectorA.push(vectorB[i] + vectorB[i - 1] + 2*xsx[i] + 2*xsx[i - 1]);
      vectorFonte.push(s[i] + s[i - 1]);
    }
    
    vectorA.push(vectorB[nm - 1] + 2*xsx[nm - 1] + Number(cond_right[1]));
    vectorFonte.push(s[nm - 1] + Number(incidenciaEsq) * Number(cond_right[0]));
    
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

  const solveProblem = async () => {
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
  };

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
            label="Informe o número de regiões"
            placeholder="Digite o número de regiões."
            onChange={(value: string) => setNumRegioes(value)}
            value={numRegioes}
          />
          <FormInput
            label="Informe o número de zonas materiais"
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
            text = {"Saída gráfica"}
            value = {hasGrafic}
            onChange = {setHasGrafic}
          />
          {(hasGrafic) && (
            <FormInput
              label="Passo da malha de discretização no gráfico"
              placeholder="Informe o passo do gráfico"
              onChange={(value: string) => setStepGraphic(value)}
              value={stepGraphic}
            />
          )}
          <FormInput
            label="Passo da malha de discretização no tabela"
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
              successFunc = {solveProblem}
            />
          )}
        </div>
      </article>
    </div>
  );
}

function Relatorio({ initialState }: HomeWrapperProps) {
  const [result, setResult] = useState<ResultState | null>(initialState?.result || null);
  const [vector_solutions, setVector_solutions] = useState<number[]>(initialState?.vector_solutions || []);
  const [esps, setEsps] = useState<number[]>(initialState?.esps || []);
  const [graph, setGraph] = useState<string>("");
  const pdfRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log(initialState);
    if (!graph) {
      (async () => {
        const chartHTML = await createGraphics();
        setGraph(chartHTML);
      })();
    }
  }, [graph, initialState]);

  const getComprimento = (): number => {
    return result?.comprimento || 0;
  };

  const calcEspessurasPorRegiao = (): number[] => {
    if (!result) return [];
    return result.espessura.map((e, i) => 
      e / result.numCelulasPorRegiao[i]
    );
  };

  const createGraphics = async (): Promise<string> => {
    if (!vector_solutions || vector_solutions.length === 0 || !result) return "";
  
    try {
      const dataStep = (array: number[], step: number) => {
        return array
          .map((value, index) => ({ index, value }))
          .filter((_, i) => i % step === 0 || i === array.length - 1);
      };
  
      const stepData = dataStep(vector_solutions, Number(result.stepGraphic));
  
      const data = stepData.map((info) => ({
        x: esps[info.index].toFixed(5),
        y: info.value.toFixed(5),
      }));
  
      const response = await api.post(
        "chart",
        {
          version: "2",
          backgroundColor: "transparent",
          width: 500,
          height: 300,
          devicePixelRatio: 1.0,
          format: "png",
          chart: {
            type: "scatter",
            data: {
              datasets: [
                {
                  label: "Ponto da malha de discretização",
                  borderColor: "rgb(255, 99, 132, 0.0)",
                  backgroundColor: "rgba(255, 99, 132, 0.8)",
                  pointRadius: 1.5,
                  data: data,
                },
              ],
            },
            options: {
              title: {
                display: true,
                text: "Fluxo de Nêutrons X Posição",
              },
            },
          },
        },
        { responseType: "arraybuffer" }
      );
  
      const bytes = new Uint8Array(response.data);
      const binary = Array.from(bytes).map((b) => String.fromCharCode(b)).join("");
      const base64ImageString = btoa(binary);
      const srcValue = "data:image/png;base64," + base64ImageString;
  
      return `
        <h3 style="font-size: 25px; color: #0056b3; margin-bottom: 10px; text-align: center;">Gráfico do Fluxo de Nêutrons</h3>
        <img src="${srcValue}" alt="Chart Image" style="max-width: 100%; height: auto; display: block; margin: 0 auto;" />
      `;
    } catch (error) {
      console.error("Erro ao gerar o gráfico:", error);
      return `<p>Erro ao gerar o gráfico</p>`;
    }
  };

  const exportPDF = () => {
    if (!pdfRef.current) return;
    const element = pdfRef.current;
    const opt = {
      margin: 0.5,
      filename: `difusao_particulas_${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, allowTaint: false }, 
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  }; 
  
  const showCondicoesdeContorno = (value: string, index: string, inten: number): ReactNode => {
    const infos = value.split(";");
    if (infos.length !== 2) return "erro";
  
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#0056b3' }}>
          α_{index} = {infos[0]}
        </span>
        <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#0056b3' }}>
          β_{index} = {infos[1]}
        </span>
        <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#0056b3' }}>
          I_{index} = {inten}
        </span>
      </div>
    );
  };
  
  function generateSection(title: string, value: string | number): ReactNode {
    return (
      <div
        style={{
          flex: '1 1 300px',
          background: '#fff',
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        <p
          style={{
            fontSize: '18px',
            color: '#333',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          <strong style={{ color: '#0056b3' }}>{title}:</strong> {value}
        </p>
      </div>
    );
  }
  
  const createFluxRegister = (position: number): string => {
    try {
      return `
      <h3 style="font-size: 25px; color: #0056b3; margin-bottom: 10px; text-align: center;">Ponto filtrado na malha de discretização</h3>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #ccc;">
        <thead>
          <tr>
            <th style="padding: 8px; background-color: #f2f2f2; text-align: center;">Índice</th>
            <th style="padding: 8px; background-color: #f2f2f2; text-align: center;">Posição (cm)</th>
            <th style="padding: 8px; background-color: #f2f2f2; text-align: center;">Fluxo de Nêutrons</th>
          </tr>
        </thead>
        <tbody>
            <tr>
              <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">${position}</td>
              <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">${esps[position - 1]?.toFixed(5) || 0}</td>
              <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">${vector_solutions[position - 1].toExponential(5)}</td>
            </tr>
        </tbody>
      </table>
    `;
    }
    catch(error) {
      console.log(error);
      return "";
    }
  }

  const createFluxTable = (): string => {
    if (!vector_solutions || vector_solutions.length === 0 || !result) return "";
  
    const dataStep = (array: number[], step: number) => {
      return array
        .map((value, index) => ({ index, value }))
        .filter((_, i) => i % step === 0 || i === array.length - 1);
    };
  
    const data = dataStep(vector_solutions, Number(result.stepTable));
  
    return `
      <h3 style="font-size: 25px; color: #0056b3; margin-bottom: 10px; text-align: center;">Tabela do Fluxo de Nêutrons</h3>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #ccc;">
        <thead>
          <tr>
            <th style="padding: 8px; background-color: #f2f2f2; text-align: center;">Índice</th>
            <th style="padding: 8px; background-color: #f2f2f2; text-align: center;">Posição (cm)</th>
            <th style="padding: 8px; background-color: #f2f2f2; text-align: center;">Fluxo de Nêutrons</th>
          </tr>
        </thead>
        <tbody>
          ${data.map((info) => `
            <tr>
              <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">${info.index + 1}</td>
              <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">${esps[info.index]?.toFixed(5) || 0}</td>
              <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">${info.value.toExponential(5)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  };
  
  const Back = () => {
    navigate("/");
    window.location.reload();
  }
  
  const BackwithData = () => {
    navigate("/", { 
      state: { result, vector_solutions, esps },
      replace: true
    });
  };
  
  const Reconstrucition = () => {
    navigate("/reconstrucao", { 
      state: { result, vector_solutions, esps }
    });
  }
  
  return(
    <div>
      <div style={{margin: '5vh'}}>
        <input type='button' value={"Voltar"} className='Continue-button' onClick={Back}/>
        <input type='button' value={"Voltar com dados anteriores"} className='Continue-button' onClick={BackwithData}/>
        <input type='button' value={"Baixar PDF"} className='Continue-button' onClick={exportPDF}/>
        {(!result?.nogamma) && (
          <input type='button' value={"Reconstrução analítica"} className='Continue-button' onClick={Reconstrucition}/>
        )}
      </div>
      <div
        ref={pdfRef}
        style={{
          background: '#f9f9f9',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          padding: '2vh',
          fontFamily: 'Arial, sans-serif',
          maxWidth: '800px',
          margin: 'auto',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >

        <div style={{ display: 'flex', justifyContent: 'center'}}>
          <img
            src={main_img}
            alt="UERJ Logo"
            style={{ maxWidth: 200, height: 'auto' }}
            crossOrigin="anonymous"
          />
        </div>
        <h1
          style={{
            textAlign: 'center',
            fontSize: 30,
            fontWeight: 'bold',
            color: '#004085',
            textTransform: 'uppercase',
            margin: 0
          }}
        >
          Difusão de Partículas Neutras
        </h1>

        <div
          style={{
            padding: 25,
            borderRadius: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: 20
          }}
        >
          <h2
            style={{
              fontSize: 24,
              textAlign: 'center',
              color: '#003366',
              margin: '0 0 15px 0',
              borderBottom: '2px solid #0056b3',
              paddingBottom: 10
            }}
          >
            ENTRADAS
          </h2>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 15 }}>
            {generateSection('Número de Regiões', result?.numRegioes.toString() || "")}
            {generateSection('Zonas Materiais', result?.zonasMateriais.toString() || "")}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 15 }}>
            {generateSection('Mapeamento', result?.mapeamento.join(' ') || "")}
            {generateSection(
              'Número de Células por Região',
              result?.numCelulasPorRegiao.join(' ') || ""
            )}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 15 }}>
            {generateSection('Fonte de Nêutrons', result?.fonteNeutrons.join(' ') || "")}
            {generateSection(
              'Coeficientes de Difusão',
              result?.coeficientesDifusao.join(' ') || ""
            )}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 15 }}>
            {generateSection(
              'Seções de Choque Macroscópicas',
              result?.choquesMacroscopicos.join(' ') || ""
            )}
            {generateSection('Espessura de cada Região', result?.espessura.join(' ') || "")}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 15, pageBreakInside: 'avoid', breakInside: 'avoid-page' }}>
            {generateSection('Comprimento Total', getComprimento().toString())}
            {generateSection(
              'Espessuras das células por região',
              calcEspessurasPorRegiao().join(' ') || ""
            )}
          </div>

          <div style={{ padding: 20 }}>
            <h2
              style={{
                fontSize: 24,
                textAlign: 'center',
                color: '#003366',
                margin: '0 0 15px 0',
                borderBottom: '2px solid #0056b3',
                paddingBottom: 10
              }}
            >
              Condições de Contorno
            </h2>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 20,
                justifyContent: 'center'
              }}
            >
              <div
                style={{
                  flex: '1 1 300px',
                  background: '#fff',
                  padding: 20,
                  borderRadius: 8,
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}
              >
                <h3
                  style={{
                    fontSize: 25,
                    color: '#0056b3',
                    marginBottom: 10
                  }}
                >
                  Esquerda: <br></br> x = 0
                </h3>
                <div style={{ fontSize: 18, color: '#333', margin: 0 }}>
                  {showCondicoesdeContorno(result?.contornoEsq || "", '0', result?.incidenciaEsq || 0)}
                </div>
              </div>
              <div
                style={{
                  flex: '1 1 300px',
                  background: '#fff',
                  padding: 20,
                  borderRadius: 8,
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}
              >
                <h3
                  style={{
                    fontSize: 25,
                    color: '#0056b3',
                    marginBottom: 10
                  }}
                >
                  Direita: <br></br>x = {result?.comprimento || 0}
                </h3>
                <div style={{ fontSize: 18, color: '#333', margin: 0 }}>
                  {showCondicoesdeContorno(result?.contornoDir || "", 'L', result?.incidenciaDir || 0)}
                </div>
              </div>
            </div>
          </div>

          <div style={{ pageBreakBefore: 'always' }} />

          <h2
            style={{
              fontSize: 24,
              textAlign: 'center',
              color: '#003366',
              margin: '0 0 15px 0',
              borderBottom: '2px solid #0056b3',
              paddingBottom: 10
            }}
          >
            SAÍDAS
          </h2>
          {(result?.hasGrafic) && (
            <div style={{boxSizing:"border-box", width:"100%"}}
              dangerouslySetInnerHTML={{
                __html: graph
              }}
            />
          )}
          {(result?.advancedOptions) && (
            <div
              dangerouslySetInnerHTML={{
                __html: createFluxRegister(result.filterPoint)
              }}
            />
          )}
          <div
            dangerouslySetInnerHTML={{
              __html: createFluxTable()
            }}
          />
        </div>
      </div>
    </div>
  );
}

function Reconstrucao({initialState}: HomeWrapperProps){
  const [result, setResult] = useState<ResultState | null>(initialState?.result || null);
  const [vector_solutions, setVector_solutions] = useState<number[]>(initialState?.vector_solutions || []);
  const [esps, setEsps] = useState<number[]>(initialState?.esps || []);
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
      mapeamento,
      fonteNeutrons,
      coeficientesDifusao,
      choquesMacroscopicos,
      espessura,
      comprimento,
    } = result;
    
    let size = 0;
    let numReg = numRegioes - 1;
    if((x >= 0) && (x <= comprimento)){
      for(let i = 0; i < numRegioes; i++){
        if(size < x){
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
      numRegioes,
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
      numRegioes,
      mapeamento,
      fonteNeutrons,
      coeficientesDifusao,
      choquesMacroscopicos,
      espessura,
      comprimento,
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
      <PlotComponent 
      f = {(x) => {return fluxFunction(x)}}
      L = {1000}
      range={[0, getComprimento()]}
        ></PlotComponent>
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

export default App;
