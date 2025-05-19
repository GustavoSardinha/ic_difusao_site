import main_img from './img/logo_uerj.png';
import logo from './img/atom.png';
import './Styles/App.css';
import FormInput from './Components/FormInput';
import ArrayFormInput from './Components/ArrayFormInput';
import { useState, useRef, useEffect } from 'react';
import { useValidation } from './Data/Validations';
import ContinueButton from './Components/ContinueButton';
import ContornoModal from './Components/ContornoModal';
import { thomasSimetrico } from './Services/numericalMath';
import api from './Services/API/quickchart';
import html2pdf from 'html2pdf.js/dist/html2pdf.bundle.min.js';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import CheckBoxInput from './Components/CheckBoxInput';


function App() {

  const [result, setResult] = useState(null);
  const [vector_solutions, setVector_solutions] = useState([]);
  const [esps, setEsps] = useState([]);


  function getComprimento() {
    if(result != null){
      return result.comprimento
    }
    return 0;
  }
  function calcEspessurasPorRegiao() {
    const { numRegioes, numCelulasPorRegiao, espessura} = result;
    const espsPorCels = [];
    for (let i = 0; i < numRegioes; i++) {
      const espPorCel = espessura[i] / numCelulasPorRegiao[i];
      espsPorCels.push(espPorCel);
    }
    return espsPorCels;
  }
  return (
    <BrowserRouter basename="/ic_difusao_site">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/relatorio" element={<Relatorio />} />
      </Routes>
    </BrowserRouter>
  );

  function Home(){
    const navigate = useNavigate();
    const [numRegioes, setNumRegioes] = useState("");
    const [zonasMateriais, setZonasMateriais] = useState("");
    const [mapeamento, setMapeamento] = useState("");
    const [numCelulasPorRegiao, setNumCelulasPorRegiao] = useState("");
    const [fonteNeutrons, setFonteNeutrons] = useState("");
    const [coeficientesDifusao, setCoeficientesDifusao] = useState("");
    const [choquesMacroscopicos, setChoquesMacroscopicos] = useState("");
    const [espessura, setEspessura] = useState("");
    const [stepGraphic, setStepGraphic] = useState("1");
    const [stepTable, setStepTable] = useState("1");
    const {validated, setValidated, runAll} = useValidation();
    const [err, setErr] = useState(null)
    const [contornoDir, setContornoDir] = useState("0;0")
    const [contornoEsq, setContornoEsq] = useState("0;0")
    const [incidenciaDir, setIncidenciaDir] = useState(0)
    const [incidenciaEsq, setIncidenciaEsq] = useState(0)
    const [hasGrafic, setHasGrafic] = useState(true)
    const [advancedOptions, setAdvancedOptions] = useState(false)
    const [noGamma, setNoGamma] = useState(false)
    const [filterPoint, setFilterPoint] = useState("0")
    const arrayFields = [
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
    const onSubmit = () => {
      try {
        setResult(runAll({
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
        }));
        setResult(result => ({
          ...result, 
          hasGrafic: hasGrafic,
          advancedOptions: advancedOptions,
          filterPoint: filterPoint,
          nogamma: noGamma
        }));
      } catch (err) {
        console.log(err);
        setErr(err);
      }
    };
    const generateVectors = () => {
      const vectorA = [];
      const vectorB = [];
      const vectorFonte = [];
    
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
    
      let xsx = [];
      let s = [];
      let nm = 0;
      let cond_left = contornoEsq.split(";");
      let cond_right = contornoDir.split(";");
      let espPorReg = [];
    
      for (let regioes = 0; regioes < numRegioes; regioes++) {
        const indice_mapeamento = mapeamento[regioes] - 1;
        const coef_difusao = coeficientesDifusao[indice_mapeamento];
        const coef_choque_macro = choquesMacroscopicos[indice_mapeamento];
        const fonte = fonteNeutrons[regioes];
        const h = espessura[regioes] / numCelulasPorRegiao[regioes];
        const xL = Math.sqrt(coef_difusao/coef_choque_macro);
        const z = h / (2 * xL);
        console.log(nogamma);
        let gamma = Math.tanh(z)/z;
        if(nogamma)
          gamma = 1;
    
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
    
      const esps = [];
      let pos = 0;
      espPorReg.forEach((esp) => {
        esps.push(pos);
        pos += esp;
      });
      setResult(result => ({
        ...result, 
        contornoDir: contornoDir,   
        incidenciaDir: incidenciaDir, 
        contornoEsq: contornoEsq,  
        incidenciaEsq: incidenciaEsq
      }));
      console.log(vectorA);
      console.log(vectorB);
      console.log(vectorFonte);
      console.log(solutions);
      console.log(result);
      setVector_solutions(solutions);
      setEsps(esps);
  
    };
    const solveProblem = async () => {
      setValidated(false);
      generateVectors();
      navigate("/relatorio");
    }
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
              onChange = {setNoGamma}>
            </CheckBoxInput>
            <FormInput
              label="Informe o número de regiões"
              placeholder="Digite o número de regiões."
              onChange={(value) => setNumRegioes(value)}
              value={numRegioes}
            />
            <FormInput
              label="Informe o número de zonas materiais"
              placeholder="Digite o número de zonas materiais."
              onChange={(value) => setZonasMateriais(value)}
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
                  onChange={(event) => setter(event.target.value)}
                />
              )
            )}
            <CheckBoxInput
              text = {"Saída gráfica"}
              value = {hasGrafic}
              onChange = {setHasGrafic}>
            </CheckBoxInput>
            {(hasGrafic) && (
              <FormInput
              label="Passo da malha de discretização no gráfico"
              placeholder="Informe o passo do gráfico"
              onChange={(value) => setStepGraphic(value)}
              value={stepGraphic}
             />
            )}
            <FormInput
              label="Passo da malha de discretização no tabela"
              placeholder="Informe o passo da tebela"
              onChange={(value) => setStepTable(value)}
              value={stepTable}
            />
            <CheckBoxInput
              text = {"Opções avançadas"}
              value = {advancedOptions}
              onChange = {setAdvancedOptions}>
            </CheckBoxInput>
            {((advancedOptions) && (
              <FormInput
              label="Ponto na malha de discretização (cm):"
              placeholder="Digite o ponto a filtrar na malha de discretização."
              onChange={(value) => setFilterPoint(value)}
              value={filterPoint}
              />
            ))}
            <ContinueButton
            onClick = {onSubmit}
            err = {err}>
            </ContinueButton>
            { (result != null) && (
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
            result = {result}
            ></ContornoModal>
            )}
          </div>
        </article>
      </div>
    );
  }
  function Relatorio(){
    const [graph, setGraph] = useState("");
    useEffect(() => {
      if (!graph) {
        (async () => {
          const chartHTML = await createGraphics();
          setGraph(chartHTML);
        })();
      }
    }, [graph]);
    const pdfRef = useRef();
    const navigate = useNavigate();
    const Back = () => {
      navigate("/");
      window.location.reload();
    }
    const exportPDF = () => {
      const element = pdfRef.current;
      const opt = {
        margin: 0.5,
        filename: `difusao_particulas_${Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, allowTaint: false }, 
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      html2pdf().set(opt).from(pdfRef.current).save();
      
    }; 
    const showCondicoesdeContorno = (value, index, inten) => {
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
    
    function generateSection(title, value) {
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
    const createFluxRegister = (position) => {
      try{
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
                <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">${Number(position)}</td>
                <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">${esps[Number(position - 1)]?.toFixed(5) || 0}</td>
                <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">${vector_solutions[Number(position - 1)].toExponential(5)}</td>
              </tr>
          </tbody>
        </table>
      `;
      }
      catch(error){
        console.log(error);
      }

    }
    const createFluxTable = () => {
      if (!vector_solutions || vector_solutions.length === 0 || !result) return "";
    
      const dataStep = (array, step) => {
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
    const createGraphics = async () => {
      if (!vector_solutions || vector_solutions.length === 0 || !result) return "";
    
      try {
        const dataStep = (array, step) => {
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
                    borderColor: "rgb(255, 99, 132)",
                    backgroundColor: "rgba(255, 99, 132, 0.2)",
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
    if(result == null){
       Back();
       return "";
    }

    return(
      <div>
        <div style={{margin: '5vh'}}>
        <input type='button' value={"Voltar"} className='Continue-button' onClick={Back}/>
          <input type='button' value={"Baixar PDF"} className='Continue-button' onClick={exportPDF}/>
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
              {generateSection('Número de Regiões', result.numRegioes)}
              {generateSection('Zonas Materiais', result.zonasMateriais)}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 15 }}>
              {generateSection('Mapeamento', result.mapeamento.join(' '))}
              {generateSection(
                'Número de Células por Região',
                result.numCelulasPorRegiao.join(' ')
              )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 15 }}>
              {generateSection('Fonte de Nêutrons', result.fonteNeutrons.join(' '))}
              {generateSection(
                'Coeficientes de Difusão',
                result.coeficientesDifusao.join(' ')
              )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 15 }}>
              {generateSection(
                'Seções de Choque Macroscópicas',
                result.choquesMacroscopicos.join(' ')
              )}
              {generateSection('Espessura de cada Região', result.espessura.join(' '))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 15,             pageBreakInside: 'avoid',
            breakInside: 'avoid-page', }}>
              {generateSection('Comprimento Total', getComprimento())}
              {generateSection(
                'Espessuras das células por região',
                calcEspessurasPorRegiao().join(' ')
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
                    {showCondicoesdeContorno(result.contornoEsq, '0', result.incidenciaEsq)}
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
                    Direita: <br></br>x = {result.comprimento}
                  </h3>
                  <div style={{ fontSize: 18, color: '#333', margin: 0 }}>
                    {showCondicoesdeContorno(result.contornoDir, 'L', result.incidenciaDir)}
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
            {console.log(result)}
            {(result.hasGrafic) && (
              <div style={{boxSizing:"border-box", width:"100%"}}
              dangerouslySetInnerHTML={{
                __html: graph
              }}
            />
            )}
            {(result.advancedOptions) && (
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
}

export default App;
