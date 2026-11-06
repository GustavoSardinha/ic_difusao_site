import { useState, useEffect} from 'react';
import {useNavigate } from 'react-router-dom';
import '../../Styles/App.css';
import FormInput from '../../Components/FormInput';
import ArrayFormInput from '../../Components/ArrayFormInput';
import { useValidation } from '../../Hooks/useValidationNonMultiplicative';
import ContinueButton from '../../Components/ContinueButton';
import BoundaryModal from '../../Components/BoundaryModal/NonMultiplicative';
import { getNonMultiplicativeFluxProfile } from '../../Services/nonMultiplicativeSolver';
import CheckBoxInput from '../../Components/CheckBoxInput';
import main_img from '../../img/logo_uerj.png';
import logo from '../../img/atom.png';
import {ResultStateNonMultiplicative} from '../../Interfaces/ResultStateNonMultiplicative';
import ArrayField from '../../Interfaces/ArrayField';
import HomeWrapperProps from '../../Interfaces/HomeWrapperProps';


function NonMultiplicativeComponent({ initialState }: HomeWrapperProps) {
  const navigate = useNavigate();
  const [result, setResult] = useState<ResultStateNonMultiplicative | null>((initialState?.result as ResultStateNonMultiplicative) || null);

  const [regionCount, setRegionCount] = useState<string>(initialState?.result?.regionCount?.toString() || "");
  const [materialZoneCount, setMaterialZoneCount] = useState<string>(initialState?.result?.materialZoneCount?.toString() || "");
  const [mapping, setMapping] = useState<string>(initialState?.result?.mapping?.join(';') || "");
  const [cellsPerRegion, setCellsPerRegion] = useState<string>(initialState?.result?.cellsPerRegion?.join(';') || "");
  const [sourceNeutrons, setSourceNeutrons] = useState<string>((initialState?.result as ResultStateNonMultiplicative)?.sourceNeutrons?.join(';') || "");
  const [diffusionCoefficients, setDiffusionCoefficients] = useState<string>(initialState?.result?.diffusionCoefficients?.join(';') || "");
  const [crossSectionsMacroscopic, setCrossSectionsMacroscopic] = useState<string>((initialState?.result as ResultStateNonMultiplicative)?.crossSectionsMacroscopic?.join(';') || "");
  const [thickness, setThickness] = useState<string>(initialState?.result?.thickness?.join(';') || "");
  const [stepGraphic, setStepGraphic] = useState<string>(initialState?.result?.stepGraphic?.toString() || "1");
  const [stepTable, setStepTable] = useState<string>(initialState?.result?.stepTable?.toString() || "1");
  const [boundaryRight, setBoundaryRight] = useState<string>(initialState?.result?.boundaryRight || "0;0");
  const [boundaryLeft, setBoundaryLeft] = useState<string>(initialState?.result?.boundaryLeft || "0;0");
  const [incidenceRight, setIncidenceRight] = useState<number>((initialState?.result as ResultStateNonMultiplicative)?.incidenceRight || 0);
  const [incidenceLeft, setIncidenceLeft] = useState<number>((initialState?.result as ResultStateNonMultiplicative)?.incidenceLeft || 0);
  const [hasGraphic, setHasGraphic] = useState<boolean>(initialState?.result?.hasGraphic ?? true);
  const [advancedOptions, setAdvancedOptions] = useState<boolean>(initialState?.result?.advancedOptions || false);
  const [noGamma, setNoGamma] = useState<boolean>(initialState?.result?.noGamma || false);
  const [filterPoint, setFilterPoint] = useState<string>(initialState?.result?.filterPoint?.toString() || "0");
  const [err, setErr] = useState<Error | null>(null);

  const { validated, setValidated, runAll } = useValidation();
  const [cc_active, setCCActive] = useState<boolean>(false);

  useEffect(() => {
    if (initialState?.result) {
      const savedState = (initialState?.result as ResultStateNonMultiplicative);
      setRegionCount(savedState.regionCount.toString());
      setMaterialZoneCount(savedState.materialZoneCount.toString());
      setMapping(savedState.mapping.join(';'));
      setCellsPerRegion(savedState.cellsPerRegion.join(';'));
      setSourceNeutrons(savedState.sourceNeutrons.join(';'));
      setDiffusionCoefficients(savedState.diffusionCoefficients.join(';'));
      setCrossSectionsMacroscopic(savedState.crossSectionsMacroscopic.join(';'));
      setThickness(savedState.thickness.join(';'));
      setStepGraphic(savedState.stepGraphic.toString());
      setStepTable(savedState.stepTable.toString());
      setBoundaryRight(savedState.boundaryRight);
      setBoundaryLeft(savedState.boundaryLeft);
      setIncidenceRight(savedState.incidenceRight);
      setIncidenceLeft(savedState.incidenceLeft);
      setHasGraphic(savedState.hasGraphic);
      setAdvancedOptions(savedState.advancedOptions);
      setNoGamma(savedState.noGamma);
      setFilterPoint(savedState.filterPoint.toString());
    }
  }, [initialState]);

  const arrayFields: ArrayField[] = [
    {
      key: 'mapping',
      label: 'Mapeamento:',
      placeholder: 'Digite os índices do mapeamento.',
      msgAlert:
        'Para informar o mapeamento corretamente, é necessário separar cada valor com um ponto e vírgula (;).',
      exAlert: 'Exemplo: 1;2;3;1',
      value: mapping,
      setter: setMapping,
    },
    {
      key: 'cellsPerRegion',
      label: 'Número de células por Região:',
      placeholder: 'Informe o número de células por região.',
      msgAlert:
        'Para informar o número de células por região corretamente, é necessário separar cada valor com um ponto e vírgula (;).',
      exAlert: 'Exemplo: 1000;800;1000;500',
      value: cellsPerRegion,
      setter: setCellsPerRegion,
    },
    {
      key: 'neutronSource',
      label: 'Fonte de nêutrons:',
      placeholder: 'Informe os valores das fontes de nêutrons.',
      msgAlert:
        'Para informar as fontes de nêutrons corretamente, é necessário separar cada valor com um ponto e vírgula (;).',
      exAlert: 'Exemplo: 4;0;0;2',
      value: sourceNeutrons,
      setter: setSourceNeutrons,
    },
    {
      key: 'diffusionCoefficients',
      label: 'Coeficientes de difusão:',
      placeholder: 'Informe os valores dos coeficientes de difusão.',
      msgAlert:
        'Para informar os coeficientes de difusão corretamente, é necessário separar cada valor com um ponto e vírgula (;). Além disso, considere o (.) para passar valores decimais.',
      exAlert: 'Exemplo: 1.5;3.83;2.3;1',
      value: diffusionCoefficients,
      setter: setDiffusionCoefficients,
    },
    {
      key: 'macroscopicCrossSections',
      label: 'Seções de Choque Macroscópicas:',
      placeholder: 'Informe os valores das seções de choque macroscópicas.',
      msgAlert:
        'Para informar os valores dos choques macroscópicos corretamente, é necessário separar cada valor com um ponto e vírgula (;). Além disso, considere o (.) para passar valores decimais.',
      exAlert: 'Exemplo: 0.7;3;4.2;1',
      value: crossSectionsMacroscopic,
      setter: setCrossSectionsMacroscopic,
    },
    {
      key: 'thickness',
      label: 'Espessura de cada Região (cm):',
      placeholder: 'Informe os valores das espessuras em cm.',
      msgAlert:
        'Para informar as espessuras corretamente, é necessário separar cada valor com um ponto e vírgula (;). Além disso, considere o (.) para passar valores decimais e que a unidade de espessura é centímetros.',
      exAlert: 'Exemplo: 2;1.4;1.7;2.3',
      value: thickness,
      setter: setThickness,
    },
  ];

  function getLength(): number {
    if(result != null){
      return result.length;
    }
    return 0;
  }

  const onSubmit = (onError: (err: Error) => void) => {
    try {
      const newResult = runAll({
        regionCount,
        materialZoneCount,
        mapping,
        cellsPerRegion,
        sourceNeutrons,
        diffusionCoefficients,
        crossSectionsMacroscopic,
        thickness,
        stepGraphic,
        stepTable,
        advancedOptions,
        filterPoint
      }) as ResultStateNonMultiplicative;

      setResult({
        ...newResult,
        hasGraphic,
        advancedOptions,
        filterPoint: Number(filterPoint),
        noGamma: noGamma,
        boundaryRight,
        boundaryLeft,
        incidenceRight,
        incidenceLeft
      });
      setCCActive(true);
    } catch (err) {
      setErr(err as Error);
      onError(err as Error);
    }
  };

  const solveProblem = async () => {
    setValidated(false);
    if (!result) return;

    const calculationResult: ResultStateNonMultiplicative = {
      ...result,
      hasGraphic,
      advancedOptions,
      filterPoint: Number(filterPoint),
      noGamma,
      boundaryRight,
      boundaryLeft,
      incidenceRight,
      incidenceLeft
    };
    const { solutions, positions } = getNonMultiplicativeFluxProfile(calculationResult);

    await new Promise(resolve => setTimeout(resolve, 0));
    navigate("/relatorio", {
      state: {
        result: calculationResult,
        solutions,
        positions
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
              Meios não multiplicativos
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
            onChange={(value: string) => setRegionCount(value)}
            value={regionCount}
          />
          <FormInput
            label="Informe o número de zonas materiais:"
            placeholder="Digite o número de zonas materiais."
            onChange={(value: string) => setMaterialZoneCount(value)}
            value={materialZoneCount}
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
            value = {hasGraphic}
            onChange = {setHasGraphic}
          />
          {(hasGraphic) && (
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
            <BoundaryModal
              boundaryRight = {boundaryRight}
              setBoundaryRight = {setBoundaryRight}
              boundaryLeft = {boundaryLeft}
              setBoundaryLeft = {setBoundaryLeft}
              incidenceRight = {incidenceRight}
              setIncidenceRight = {setIncidenceRight}
              incidenceLeft = {incidenceLeft}
              setIncidenceLeft = {setIncidenceLeft}
              L = {getLength()}
              successFunc = {solveProblem}
            />
          )}
        </div>
      </article>
    </div>
  );
}

export default NonMultiplicativeComponent;
