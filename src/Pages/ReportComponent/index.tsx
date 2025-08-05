import { useState, useEffect, useRef, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeWrapperProps from '../../Interfaces/HomeWrapperProps';
import ResultState from '../../Interfaces/ResultState';
import '../../Styles/App.css';
import api from '../../Services/API/quickchart';
import html2pdf from 'html2pdf.js/dist/html2pdf.bundle.min.js';
import main_img from '../../img/logo_uerj.png';
import ResultStateNonMultiplicative from '../../Interfaces/ResultStaeNonMultiplicative';
import ResultStateMultiplicative from '../../Interfaces/ResultStateMultiplicative';


function ReportComponent({ initialState }: HomeWrapperProps) {
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
  
const showCondicoesdeContorno = (
  value: string,
  index: string,
  inten?: number
): ReactNode => {
  const infos = value.split(";");
  if (infos.length !== 2) return <>Erro ao ler contorno</>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <span style={{ fontSize: "16px", fontWeight: "bold", color: "#0056b3" }}>
        α_{index} = {infos[0]}
      </span>
      <span style={{ fontSize: "16px", fontWeight: "bold", color: "#0056b3" }}>
        β_{index} = {infos[1]}
      </span>

      {typeof inten === "number" && (
        <span style={{ fontSize: "16px", fontWeight: "bold", color: "#0056b3" }}>
          I_{index} = {inten}
        </span>
      )}
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
          {result && 'fonteNeutrons' in result && (
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 15 }}>
                {generateSection('Fonte de Nêutrons', (result as ResultStateNonMultiplicative).fonteNeutrons.join(' '))}
                {generateSection('Coeficientes de Difusão', result.coeficientesDifusao.join(' '))}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 15 }}>
                {generateSection('Seções de Choque Macroscópicas', (result as ResultStateNonMultiplicative).choquesMacroscopicos.join(' '))}
              </div>
            </>
          )}
          {result && 'choquesMacroscopicosFis' in result && (
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 15 }}>
                {generateSection('Seções de Choque Macroscópicas de Absorção', (result as ResultStateMultiplicative).choquesMacroscopicosAbs.join(' '))}
                {generateSection('Coeficientes de Difusão', result.coeficientesDifusao.join(' '))}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 15 }}>
                {generateSection('Seções de Choque Macroscópicas de Fissão', (result as ResultStateMultiplicative).choquesMacroscopicosFis.join(' '))}
              </div>
            </>
          )}
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
                  { result && 'incidenciaEsq' in result
                    ? showCondicoesdeContorno(
                        result.contornoEsq,
                        '0',
                        (result as ResultStateNonMultiplicative).incidenciaEsq
                      )
                    : showCondicoesdeContorno(
                        result?.contornoEsq || '',
                        '0'
                      )}
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
                  { result && 'incidenciaDir' in result
                    ? showCondicoesdeContorno(
                        result.contornoDir,
                        '0',
                        (result as ResultStateNonMultiplicative).incidenciaDir
                      )
                    : showCondicoesdeContorno(
                        result?.contornoEsq || '',
                        '0'
                      )}
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

export default ReportComponent;