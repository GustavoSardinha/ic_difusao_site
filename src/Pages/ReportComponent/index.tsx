import { useState, useEffect, useRef, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeWrapperProps from '../../Interfaces/HomeWrapperProps';
import ResultState from '../../Interfaces/ResultState';
import '../../Styles/App.css';
import api from '../../Services/API/quickchart';
import html2pdf from 'html2pdf.js/dist/html2pdf.bundle.min.js';
import main_img from '../../img/logomarca-uerj.png'
import { ResultStateNonMultiplicative, isResultStateNonMultiplicative } from '../../Interfaces/ResultStateNonMultiplicative';
import { ResultStateMultiplicative, isResultStateMultiplicative } from '../../Interfaces/ResultStateMultiplicative';

function ReportComponent({ initialState }: HomeWrapperProps) {
  const [result, setResult] = useState<ResultState | null>(initialState?.result || null);
  const [vector_solutions, setVector_solutions] = useState<number[]>(initialState?.vector_solutions || []);
  const [vector_keffs, setVector_keffs] = useState<number[]>(initialState?.vector_keffs || []);
  const [vector_pot, setVector_pot] = useState<number[]>(initialState?.vector_pot || []);
  const [itfluxo, setItfluxo] = useState<number>(initialState?.itfluxo || 0);
  const [esps, setEsps] = useState<number[]>(initialState?.esps || []);
  const [graph, setGraph] = useState<string>("");
  const pdfRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
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
    return result.espessura.map((e, i) => e / result.numCelulasPorRegiao[i]);
  };

  const findBoundaryConditionType = (value: string): string => {
    switch (value) {
      case "0;0":
        return "Reflexiva";
      case "0;99999999999999999999":
        return "Fluxo escalar nulo";
      case "0.5;0.5":
        return "Vácuo";
      default:
        return "Desconhecido";
    }
  };

  const renderMultiplicativeLabel = (albedo: boolean, baffle: boolean, bound: string): ReactNode => {
    if (!isResultStateMultiplicative(result)) return null;

    if (albedo && baffle) {
      return <div className="info-text"><strong>Tipo:</strong> Albedo Baffle-Refletor</div>;
    }
    if (albedo && !baffle) {
      return <div className="info-text"><strong>Tipo:</strong> Albedo Refletor</div>;
    }
    return <div className="info-text"><strong>Tipo:</strong> {findBoundaryConditionType(bound)}</div>;
  };

  const createGraphics = async (): Promise<string> => {
    if (!vector_solutions || vector_solutions.length === 0 || !result) return "";

    try {
      const dataStep = (array: number[], step: number) =>
        array
          .map((value, index) => ({ index, value }))
          .filter((_, i) => i % step === 0 || i === array.length - 1);

      const stepData = dataStep(vector_solutions, Number(result.stepGraphic));

      const data = stepData.map((info) => ({
        x: Number(esps[info.index]).toExponential(2),
        y: Number(info.value).toExponential(2),
      }));

      const response = await api.post(
        "chart",
        {
          version: "4",
          backgroundColor: "transparent",
          width: 600,
          height: 350,
          devicePixelRatio: 1.5,
          format: "png",
          chart: {
            type: "scatter",
            data: {
              datasets: [{
                label: "Ponto da malha",
                borderColor: "#0056b3",
                backgroundColor: "#0056b3",
                pointRadius: 1.0,
                data: data,
              }],
            },
            options: {
              plugins: { legend: { display: false } },
              scales: {
                x: { title: { display: true, text: 'Posição (cm)' } },
                y: { title: { display: true, text: 'Fluxo de Nêutrons' } }
              }
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
        <div class="avoid-page-break">
          <h3 class="section-subtitle">Gráfico do Fluxo de Nêutrons</h3>
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${srcValue}" alt="Chart Image" style="max-width: 90%; height: auto; border: 1px solid #eaeaea; border-radius: 8px; padding: 10px;" />
          </div>
        </div>
      `;
    } catch (error: any) {
      console.error("Erro ao gerar o gráfico:", error);
      return `<p>Erro ao gerar o gráfico</p>`;
    }
  };

  const exportPDF = () => {
    if (!pdfRef.current) return;
    const element = pdfRef.current;
    const opt = {
      margin: [15, 15, 15, 15],
      filename: `relatorio_difusao_${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        scrollY: 0
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: {
        mode: ['css', 'legacy'],
        before: '.page-break',
        avoid: ['.avoid-page-break', 'table', 'tr', 'td', '.info-card', '.convergence-box', 'img']
      }
    };
    html2pdf().set(opt).from(element).save();
  };

  const showCondicoesdeContorno = (value: string, index: string, inten?: number): ReactNode => {
    const infos = value.split(";");
    if (infos.length !== 2) return <>Erro ao ler contorno</>;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <span className="equation-text">α_{index} = {infos[0]}</span>
        <span className="equation-text">β_{index} = {infos[1]}</span>
        {typeof inten === "number" && (
          <span className="equation-text">I_{index} = {inten}</span>
        )}
      </div>
    );
  };

  function generateSection(title: string, value: string | number): ReactNode {
    return (
      <div className="info-card">
        <p style={{ margin: 0, fontSize: '13px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</p>
        <p style={{ margin: '5px 0 0 0', fontSize: '16px', color: '#111', fontWeight: '500' }}>{value}</p>
      </div>
    );
  }

  const createFluxRegister = (position: number): string => {
    try {
      return `
        <div class="avoid-page-break">
          <h3 class="section-subtitle">Ponto filtrado na malha de discretização</h3>
          <table class="modern-table">
            <thead>
              <tr>
                <th>Índice</th>
                <th>Posição (cm)</th>
                <th>Fluxo de Nêutrons</th>
              </tr>
            </thead>
            <tbody>
                <tr>
                  <td>${position}</td>
                  <td>${esps[position - 1]?.toFixed(5) || 0}</td>
                  <td><strong>${vector_solutions[position - 1].toExponential(5)}</strong></td>
                </tr>
            </tbody>
          </table>
        </div>
      `;
    } catch (error) {
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
      <div class="avoid-page-break">
        <h3 class="section-subtitle">Tabela do Fluxo de Nêutrons</h3>
        <table class="modern-table">
          <thead>
            <tr>
              <th>Índice</th>
              <th>Posição (cm)</th>
              <th>Fluxo de Nêutrons</th>
            </tr>
          </thead>
          <tbody>
            ${data.map((info) => `
              <tr>
                <td>${info.index + 1}</td>
                <td>${esps[info.index]?.toFixed(5) || 0}</td>
                <td>${info.value.toExponential(5)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  };

  const createKeffTable = (): string => {
    if (!vector_keffs || vector_keffs.length === 0 || !result) return "";
    const data = vector_keffs.map((value, index) => ({ index, value }));

    return `
      <div class="avoid-page-break">
        <h3 class="section-subtitle">Fator de Multiplicação Efetivo (Keff)</h3>
        <table class="modern-table">
          <thead>
            <tr>
              <th>Iteração</th>
              <th>Keff</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(info => `
              <tr>
                <td>${info.index + 1}</td>
                <td>${info.value.toExponential(5)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  };

  const createPotTable = (): string => {
    if (!vector_pot || vector_pot.length === 0 || !result) return "";
    const linesPerPage = 25;
    const data = vector_pot.map((value, index) => ({ index, value }));

    const chunkArray = <T,>(arr: T[], size: number): T[][] => {
      const out: T[][] = [];
      for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
      return out;
    };

    const chunks = chunkArray(data, linesPerPage);

    return chunks.map((chunk) => `
      <div class="avoid-page-break" style="margin-bottom: 20px;">
        <h3 class="section-subtitle">Densidade de Potências</h3>
        <table class="modern-table">
          <thead>
            <tr>
              <th>Região</th>
              <th>Densidade Potência</th>
            </tr>
          </thead>
          <tbody>
            ${chunk.map(info => `
              <tr>
                <td>${info.index + 1}</td>
                <td>${info.value.toExponential(5)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `).join('');
  };

  const PotenciaTotal = () => {
    if (!vector_pot || vector_pot.length === 0 || !result) return 0;
    return vector_pot.reduce((acc, curr) => acc + curr, 0);
  }

  const Back = () => {
    navigate("/");
    window.location.reload();
  }

  const BackwithData = () => {
    if (isResultStateNonMultiplicative(result)) {
      navigate("/naomultiplicativo", { state: { result, vector_solutions, esps }, replace: true });
    } else {
      navigate("/multiplicativo", { state: { result, vector_solutions, esps }, replace: true });
    }
  };

  const Reconstrucition = () => navigate("/reconstrucao", { state: { result, vector_solutions, esps } });
  const DrivenPower = () => navigate("/estabilizar-potencia", { state: { result, vector_solutions, esps } });

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '20px' }}>
      
      <div style={{ display: 'flex', margin: '0 5vh', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', marginBottom: '30px' }}>
        <button className='Continue-button modern-btn' onClick={Back}>Voltar</button>
        <button className='Continue-button modern-btn' onClick={BackwithData}>Voltar com dados anteriores</button>
        <button className='Continue-button modern-btn primary-btn' onClick={exportPDF}>Baixar PDF</button>
        {(!result?.nogamma) && <button className='Continue-button modern-btn' onClick={Reconstrucition}>Reconstrução analítica</button>}
        {isResultStateMultiplicative(result) && (!result?.keff || result?.keff < 1) && (
          <button className='Continue-button modern-btn' onClick={DrivenPower}>Estabilização de Potência</button>
        )}
      </div>

      <div
        ref={pdfRef}
        style={{
          background: '#ffffff',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          padding: '20mm',
          fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          maxWidth: '210mm',
          margin: 'auto',
          color: '#333'
        }}
      >
        <style dangerouslySetInnerHTML={{__html: `
          .section-title { font-size: 20px; color: #003366; border-bottom: 2px solid #0056b3; padding-bottom: 8px; margin: 35px 0 15px 0; text-transform: uppercase; font-weight: bold; page-break-before: always; break-before: page; }
          .section-title.first-section { page-break-before: avoid; break-before: avoid; }
          .section-subtitle { font-size: 16px; color: #0056b3; margin-bottom: 12px; text-align: center; font-weight: 600; }
          .info-card { flex: 1 1 calc(50% - 15px); background: #fdfdfd; border: 1px solid #e0e0e0; padding: 12px 15px; border-radius: 6px; box-sizing: border-box; page-break-inside: avoid; break-inside: avoid; }
          .modern-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; page-break-inside: avoid !important; break-inside: avoid !important; overflow: visible !important; }
          .modern-table th { background-color: #0056b3; color: white; padding: 8px; text-align: center; border: 1px solid #004085; }
          .modern-table td { padding: 6px; border: 1px solid #ddd; text-align: center; color: #444; page-break-inside: avoid !important; break-inside: avoid !important; }
          .modern-table tr { page-break-inside: avoid !important; break-inside: avoid !important; }
          .modern-table tr:nth-child(even) { background-color: #f8f9fa; }
          .equation-text { font-size: 14px; font-weight: 600; color: #0056b3; font-family: 'Courier New', monospace; }
          .info-text { font-size: 13px; color: #555; }
          .convergence-box { background-color: #e9f2fb; border-left: 4px solid #0056b3; padding: 15px; border-radius: 4px; margin-top: 20px; page-break-inside: avoid; break-inside: avoid; }
          .convergence-text { font-size: 13px; margin: 5px 0; color: #333; }
          .convergence-value { font-weight: bold; color: #0056b3; font-size: 14px; }
          .flex-grid { display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 15px; page-break-inside: avoid; break-inside: avoid; }
          .header-container { display: flex; align-items: center; justify-content: center; flex-direction: column; margin-bottom: 30px; page-break-inside: avoid; break-inside: avoid; }
          .avoid-page-break { page-break-inside: avoid !important; break-inside: avoid !important; }
        `}} />

        <div className="header-container">
          <img src={main_img} alt="UERJ Logo" style={{ width: '180px', marginBottom: '15px' }} crossOrigin="anonymous" />
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#004085', margin: 0, textAlign: 'center' }}>
            Relatório da Simulação Numérica
          </h1>
          <h2 style={{ fontSize: '16px', fontWeight: 'normal', color: '#666', margin: '5px 0 0 0', textAlign: 'center' }}>
            Difusão de Partículas Neutras
          </h2>
        </div>

        <h2 className="section-title first-section">Parâmetros de Entrada</h2>
        
        <div className="flex-grid">
          {generateSection('Método', result?.nogamma ? "Diferenças Finitas" : "Espectronodal")}
          {generateSection('Regiões / Zonas', `${result?.numRegioes || 0} / ${result?.zonasMateriais || 0}`)}
        </div>

        <div className="flex-grid">
          {generateSection('Mapeamento', result?.mapeamento.join(' ') || "-")}
          {generateSection('Células por Região', result?.numCelulasPorRegiao.join(' ') || "-")}
        </div>

        {isResultStateNonMultiplicative(result) && (
          <div className="avoid-page-break">
            <div className="flex-grid">
              {generateSection('Fonte de Nêutrons', result.fonteNeutrons.join(' '))}
              {generateSection('Coef. de Difusão', result.coeficientesDifusao.join(' '))}
            </div>
            <div className="flex-grid">
              {generateSection('Choques Macroscópicos', result.choquesMacroscopicos.join(' '))}
            </div>
          </div>
        )}

        {isResultStateMultiplicative(result) && (
          <div className="avoid-page-break">
            <div className="flex-grid">
              {generateSection('Seções de Choques de Absorção', result.choquesMacroscopicosAbs.join(' '))}
              {generateSection('Coeficientes de Difusão', result.coeficientesDifusao.join(' '))}
            </div>
            <div className="flex-grid">
              {generateSection('Seções de Choques de Fissão', result.choquesMacroscopicosFis.join(' '))}
            </div>
          </div>
        )}

        <div className="flex-grid">
          {generateSection('Comprimento Total', `${getComprimento()} cm`)}
          {generateSection('Espessuras (Células/Região)', calcEspessurasPorRegiao().map(v => v.toFixed(4)).join(' | '))}
        </div>

        {isResultStateMultiplicative(result) && (
          <div className="flex-grid">
            {generateSection('Potência Gerada', `${result.potencia} MW`)}
            {generateSection('Energia Liberada por Fissão', `${result.energia} MeV`)}
          </div>
        )}

        <h2 className="section-title">Condições de Contorno</h2>
        <div className="flex-grid">
          <div className="info-card" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '15px', color: '#0056b3', margin: '0 0 10px 0' }}>Fronteira Esquerda</h3>
            {isResultStateMultiplicative(result) 
              ? renderMultiplicativeLabel(result.albedoL, result.baffleL, result.contornoEsq)
              : showCondicoesdeContorno(result?.contornoEsq || '', '0', isResultStateNonMultiplicative(result) ? result.incidenciaEsq : undefined)
            }
          </div>
          <div className="info-card" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '15px', color: '#0056b3', margin: '0 0 10px 0' }}>Fronteira Direita</h3>
            {isResultStateMultiplicative(result)
              ? renderMultiplicativeLabel(result.albedoR, result.baffleR, result.contornoDir)
              : showCondicoesdeContorno(result?.contornoDir || '', 'L', isResultStateNonMultiplicative(result) ? result.incidenciaDir : undefined)
            }
          </div>
        </div>

        <h2 className="section-title">Resultados da Simulação</h2>
        
        {isResultStateMultiplicative(result) && (
          <div className="info-card avoid-page-break" style={{ marginBottom: '20px', textAlign: 'center', backgroundColor: '#eaf4ff' }}>
            <h3 style={{ margin: 0, color: '#004085', fontSize: '18px' }}>
              Potência Total Calculada: <strong>{PotenciaTotal().toFixed(2)} MW</strong>
            </h3>
          </div>
        )}

        {isResultStateMultiplicative(result) && (
          <div className="convergence-box">
            <p className="convergence-text">
              Fator de multiplicação efetivo convergiu em <span className="convergence-value">{vector_keffs.length}</span> iteração(ões).
            </p>
            <p className="convergence-text">
              Fluxo escalar de partículas convergiu em <span className="convergence-value">{itfluxo}</span> iteração(ões).
            </p>
          </div>
        )}

        {result?.hasGrafic && (
          <div style={{ marginTop: '20px' }} dangerouslySetInnerHTML={{ __html: graph }} />
        )}

        {isResultStateMultiplicative(result) && (
          <div dangerouslySetInnerHTML={{ __html: createKeffTable() }} />
        )}

        {isResultStateMultiplicative(result) && (
          <div dangerouslySetInnerHTML={{ __html: createPotTable() }} />
        )}

        {result?.advancedOptions && result.filterPoint && (
          <div dangerouslySetInnerHTML={{ __html: createFluxRegister(result.filterPoint) }} />
        )}

        <div dangerouslySetInnerHTML={{ __html: createFluxTable() }} />
        
      </div>
    </div>
  );
}

export default ReportComponent;