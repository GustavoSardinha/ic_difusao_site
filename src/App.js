import main_img from './img/logo_uerj.png';
import logo from './img/atom.png';
import './Styles/App.css';
import FormInput from './Components/FormInput';
import ArrayFormInput from './Components/ArrayFormInput';
import { useState } from 'react';
import { useValidation } from './Data/Validations';
import ContinueButton from './Components/ContinueButton';
import ContornoModal from './Components/ContornoModal';
function App() {

  const [numRegioes, setNumRegioes] = useState("");
  const [zonasMateriais, setZonasMateriais] = useState("");
  const [mapeamento, setMapeamento] = useState("");
  const [numCelulasPorRegiao, setNumCelulasPorRegiao] = useState("");
  const [fonteNeutrons, setFonteNeutrons] = useState("");
  const [coeficientesDifusao, setCoeficientesDifusao] = useState("");
  const [choquesMacroscopicos, setChoquesMacroscopicos] = useState("");
  const [espessura, setEspessura] = useState("");
  const [stepGraphic, setStepGraphic] = useState(1);
  const [stepTable, setStepTable] = useState(1);
  const {validated, runAll} = useValidation();
  const [err, setErr] = useState(null)
  const [contornoDir, setContornoDir] = useState(0)
  const [contornoEsq, setContornoEsq] = useState(0)
  const [incidenciaDir, setIncidenciaDir] = useState(0)
  const [incidenciaEsq, setIncidenciaEsq] = useState(0)
  const [result, setResult] = useState(null);

  function getComprimento() {
    if(result != null){
      return result.comprimento
    }
    return 0;
  }
  
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
      }));
      console.log(result);
    } catch (err) {
      setErr(err);
    }
  };
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
         <FormInput
            label="Passo da malha de discretização no gráfico"
            placeholder="Informe o passo do gráfico"
            onChange={(value) => setStepGraphic(value)}
            value={stepGraphic}
          />
          <FormInput
            label="Passo da malha de discretização no tabela"
            placeholder="Informe o passo da tebela"
            onChange={(value) => setStepTable(value)}
            value={stepTable}
          />
          <ContinueButton
          onClick = {onSubmit}
          err = {err}>
          </ContinueButton>
          {validated && (
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
          ></ContornoModal>
          )}
        </div>
      </article>
    </div>
  );
}

export default App;
