import { useState, useEffect, use} from 'react';
import {useNavigate } from 'react-router-dom';
import '../../Styles/App.css';
import FormInput from '../../Components/FormInput';
import ArrayFormInput from '../../Components/ArrayFormInput';
import { useValidation } from '../../Hooks/useValidationMultiplicative';
import ContinueButton from '../../Components/ContinueButton';
import BoundaryModal from '../../Components/BoundaryModal/Multiplicative';
import { solveSymmetricTridiagonal, relativeDeviation, numericalIntegral, integralDiffusionSimpson } from '../../Services/numericalMath';
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

  const [regionCount, setRegionCount] = useState<string>(initialState?.result?.regionCount?.toString() || "");
  const [materialZoneCount, setMaterialZoneCount] = useState<string>(initialState?.result?.materialZoneCount?.toString() || "");
  const [mapping, setMapping] = useState<string>(initialState?.result?.mapping?.join(';') || "");
  const [cellsPerRegion, setCellsPerRegion] = useState<string>(initialState?.result?.cellsPerRegion?.join(';') || "");
  const [diffusionCoefficients, setDiffusionCoefficients] = useState<string>(initialState?.result?.diffusionCoefficients?.join(';') || "");
  const [crossSectionsMacroscopicAbs, setCrossSectionsMacroscopicAbs] = useState<string>((initialState?.result as ResultStateMultiplicative)?.crossSectionsMacroscopicAbs?.join(';') || "");
  const [crossSectionsMacroscopicFis, setCrossSectionsMacroscopicFis] = useState<string>((initialState?.result as ResultStateMultiplicative)?.crossSectionsMacroscopicFis?.join(';') || "");
  const [thickness, setThickness] = useState<string>(initialState?.result?.thickness?.join(';') || "");
  const [stepGraphic, setStepGraphic] = useState<string>(initialState?.result?.stepGraphic?.toString() || "1");
  const [stepTable, setStepTable] = useState<string>(initialState?.result?.stepTable?.toString() || "1");
  const [boundaryRight, setBoundaryRight] = useState<string>(initialState?.result?.boundaryRight || "0;0");
  const [boundaryLeft, setBoundaryLeft] = useState<string>(initialState?.result?.boundaryLeft || "0;0");
  const [hasGraphic, setHasGraphic] = useState<boolean>(initialState?.result?.hasGraphic ?? true);
  const [advancedOptions, setAdvancedOptions] = useState<boolean>(initialState?.result?.advancedOptions || false);
  const [noGamma, setNoGamma] = useState<boolean>(initialState?.result?.noGamma || false);
  const [noNi, setNoNi] = useState<boolean>((initialState?.result as ResultStateMultiplicative)?.noNi|| false);
  const [neutronsPerFission, setNeutronsPerFission] = useState<string>((initialState?.result as ResultStateMultiplicative)?.neutronsPerFission?.toString() || "");
  const [power, setPower] = useState<string>((initialState?.result as ResultStateMultiplicative)?.power?.toString() || "");
  const [energy, setEnergy] = useState<string>((initialState?.result as ResultStateMultiplicative)?.energy?.toString() || "");
  const [keffTolerance, setLkeff] = useState<string>(
    (initialState?.result as ResultStateMultiplicative)?.keffTolerance ?? 1e-6
  );

  const [fluxTolerance, setFluxTolerance] = useState<string>(
    (initialState?.result as ResultStateMultiplicative)?.fluxTolerance ?? 1e-6
  );

  const [filterPoint, setFilterPoint] = useState<string>(initialState?.result?.filterPoint?.toString() || "0");
  const [err, setErr] = useState<Error | null>(null);

  const { validated, setValidated, runAll } = useValidation();
  const [cc_active, setCCActive] = useState<boolean>(false);

  const [msgErro, setMsgErro] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);

  const [stoppingCriterion, setCriterioParada] = useState<boolean>(false);
  const [steps, setSteps] = useState<number>(1);
  const [albedoL, setAlbedoL] = useState<boolean>((initialState?.result as ResultStateMultiplicative)?.albedoL || false);
  const [albedoR, setAlbedoR] = useState<boolean>((initialState?.result as ResultStateMultiplicative)?.albedoR || false);
  const [aL, setAL] = useState<string>((initialState?.result as ResultStateMultiplicative)?.aL?.toString() || "");
  const [bL, setBL] = useState<string>((initialState?.result as ResultStateMultiplicative)?.bL?.toString() || "");
  const [aR, setAR] = useState<string>((initialState?.result as ResultStateMultiplicative)?.aR?.toString() || "");
  const [bR, setBR] = useState<string>((initialState?.result as ResultStateMultiplicative)?.bR?.toString() || "");
  const [inf_bL, setInf_bL] = useState<boolean>((initialState?.result as ResultStateMultiplicative)?.inf_bL || false);
  const [inf_bR, setInf_bR] = useState<boolean>((initialState?.result as ResultStateMultiplicative)?.inf_bR || false);
  const [coefDiffusionRefL, setCoefDiffusionRefL] = useState<string>((initialState?.result as ResultStateMultiplicative)?.coefDiffusionRefL?.toString() || "");
  const [coefDiffusionRefR, setCoefDiffusionRefR] = useState<string>((initialState?.result as ResultStateMultiplicative)?.coefDiffusionRefR?.toString() || "");
  const [coefCrossSectionRefL, setCoefCrossSectionRefL] = useState<string>((initialState?.result as ResultStateMultiplicative)?.coefCrossSectionRefL?.toString() || "");
  const [coefCrossSectionRefR, setCoefCrossSectionRefR] = useState<string>((initialState?.result as ResultStateMultiplicative)?.coefCrossSectionRefR?.toString() || "");
  const [coefDiffusionBaffL, setCoefDiffusionBaffL] = useState<string>((initialState?.result as ResultStateMultiplicative)?.coefDiffusionBaffL?.toString() || "");
  const [coefDiffusionBaffR, setCoefDiffusionBaffR] = useState<string>((initialState?.result as ResultStateMultiplicative)?.coefDiffusionBaffR?.toString() || "");
  const [coefCrossSectionBaffL, setCoefCrossSectionBaffL] = useState<string>((initialState?.result as ResultStateMultiplicative)?.coefCrossSectionBaffL?.toString() || "");
  const [coefCrossSectionBaffR, setCoefCrossSectionBaffR] = useState<string>((initialState?.result as ResultStateMultiplicative)?.coefCrossSectionBaffR?.toString() || "");
  const [baffleL, setBaffleL] = useState<boolean>((initialState?.result as ResultStateMultiplicative)?.baffleL || false);
  const [baffleR, setBaffleR] = useState<boolean>((initialState?.result as ResultStateMultiplicative)?.baffleR || false);

  useEffect(() => {
    if (initialState?.result) {
      const savedState = (initialState?.result as ResultStateMultiplicative);
      setRegionCount(savedState.regionCount.toString());
      setMaterialZoneCount(savedState.materialZoneCount.toString());
      setMapping(savedState.mapping.join(';'));
      setCellsPerRegion(savedState.cellsPerRegion.join(';'));
      setDiffusionCoefficients(savedState.diffusionCoefficients.join(';'));
      setCrossSectionsMacroscopicAbs(savedState.crossSectionsMacroscopicAbs.join(';'));
      setCrossSectionsMacroscopicFis(savedState.crossSectionsMacroscopicFis.join(';'));
      setThickness(savedState.thickness.join(';'));
      setStepGraphic(savedState.stepGraphic.toString());
      setStepTable(savedState.stepTable.toString());
      setBoundaryRight(savedState.boundaryRight);
      setBoundaryLeft(savedState.boundaryLeft);
      setHasGraphic(savedState.hasGraphic);
      setAdvancedOptions(savedState.advancedOptions);
      setNoGamma(savedState.noGamma);
      setFilterPoint(savedState.filterPoint.toString());
    }
  }, [initialState]);
  useEffect(() => {
    if (!noNi) {
      setNeutronsPerFission("");
    }
  }, [noNi]);
  const arrayFields: ArrayField[] = [
    {
      key
      : 'mapping',
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
      key: 'macroscopicAbsorptionCrossSections',
      label: 'Seções de Choque Macroscópicas de Absorção:',
      placeholder: 'Informe os valores das seções de choque macroscópicas.',
      msgAlert:
        'Para informar os valores das seções choques macroscópicos de absorção corretamente, é necessário separar cada valor com um ponto e vírgula (;). Além disso, considere o (.) para passar valores decimais.',
      exAlert: 'Exemplo: 0.7;3;4.2;1',
      value: crossSectionsMacroscopicAbs,
      setter: setCrossSectionsMacroscopicAbs,
    },
    {
      key: 'macroscopicFissionCrossSections',
      label: 'Seções de Choque Macroscópicas de Fissão:',
      placeholder: 'Informe os valores das seções de choque macroscópicas.',
      msgAlert:
        'Para informar os valores das seções choques macroscópicos fissão corretamente, é necessário separar cada valor com um ponto e vírgula (;). Além disso, considere o (.) para passar valores decimais.',
      exAlert: 'Exemplo: 0.7;3;4.2;1',
      value: crossSectionsMacroscopicFis,
      setter: setCrossSectionsMacroscopicFis,
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
        diffusionCoefficients,
        crossSectionsMacroscopicAbs,
        crossSectionsMacroscopicFis,
        neutronsPerFission,
        noNi,
        thickness,
        power,
        energy,
        stepGraphic,
        stepTable,
        advancedOptions,
        filterPoint
      }) as ResultStateMultiplicative;
      if(energy == "")
        setEnergy("200");
      if(power == "")
        setPower("200");
      setResult({
        ...newResult,
        hasGraphic,
        advancedOptions,
        filterPoint: Number(filterPoint),
        noGamma: noGamma,
        boundaryRight,
        boundaryLeft,
      });
      setCCActive(true);
    } catch (err) {
      setErr(err as Error);
      onError(err as Error);
    }
  };
  const generateVectors = (boundaryLeftCurrent: string, boundaryRightCurrent: string) => {
    const startTime = performance.now();
    if (!result) return { solutions: [], positions: [] };

    const {
      regionCount,
      mapping,
      cellsPerRegion,
      diffusionCoefficients,
      crossSectionsMacroscopicAbs,
      crossSectionsMacroscopicFis,
      thickness,
      length,
      noGamma,
      neutronsPerFission: neutronYield
    } = result;
    let solResult: number[] = [];
    let positions: number[] = [];
    const { newBoundaryLeft, newBoundaryRight } = solveAlbedo(boundaryLeftCurrent, boundaryRightCurrent);
    let leftCondition = newBoundaryLeft.split(";").map(Number);
    let rightCondition = newBoundaryRight.split(";").map(Number);
    console.log(leftCondition);
    console.log(rightCondition);
    console.log(newBoundaryLeft);
    console.log(newBoundaryRight);
    let fluxIterations = 0;
    let keff: number = Math.sqrt(2);
    let keffValues: number[] = [keff];
    let keffPrevious: number = 0;
    let fluxAverage = 1/2;
    let fluxAveragePrevious = 0;
    let stepCount = 0;
    let sol_Previous: number = 0;
    let effectiveNeutronYield = noNi ? Number(neutronYield) : 1;

    while (((relativeDeviation(keff, keffPrevious) > Number(keffTolerance)) ||
        (relativeDeviation(fluxAverage, fluxAveragePrevious) > Number(fluxTolerance))) ||
        (stepCount >= 1000)){
      const vectorA: number[] = [];
      const vectorB: number[] = [];
      const vectorSource: number[] = [];
      positions = [];
      let xsx: number[] = [];
      let s: number[] = [];
      let nm = 0;
      let positionsPerRegion: number[] = [];
      if ((relativeDeviation(fluxAverage, fluxAveragePrevious) > Number(fluxTolerance)))
        fluxIterations++;
      for (let regions = 0; regions < regionCount; regions++) {
        const index_Mapping = mapping[regions] - 1;
        const coef_Diffusion = diffusionCoefficients[index_Mapping];
        const coef_CrossSection_macro = crossSectionsMacroscopicAbs[index_Mapping];
        const coef_CrossSection_fis = crossSectionsMacroscopicFis[index_Mapping];
        const h = thickness[regions] / cellsPerRegion[regions];
        let gamma = 1;
        console.log(coef_CrossSection_macro);
        console.log(coef_Diffusion);
        console.log(h);
        console.log(coef_CrossSection_fis);
        if(!noGamma){
          if(coef_CrossSection_macro - (effectiveNeutronYield*coef_CrossSection_fis)/keff > 0){
            const Lk = Math.sqrt(coef_Diffusion/(coef_CrossSection_macro - (effectiveNeutronYield*coef_CrossSection_fis)/keff));
            gamma = ((2*Lk)/h)*Math.tanh(h/(2*Lk));
            console.log(gamma);
          }
          else{
            const Lk = Math.sqrt(coef_Diffusion/((effectiveNeutronYield*coef_CrossSection_fis/keff - coef_CrossSection_macro)));
            gamma = ((2*Lk)/h)*Math.tan(h/(2*Lk));
            console.log(gamma);
          }
        }
        for (let j = 0; j < cellsPerRegion[regions]; j++) {
          nm++;
          positionsPerRegion.push(h);
          vectorB.push((coef_Diffusion/(gamma*h)) - coef_CrossSection_macro * h * gamma/ 4);
          xsx.push(coef_CrossSection_macro * h * gamma/ 4);
          s.push((effectiveNeutronYield * coef_CrossSection_fis / keff) * h * gamma / 2);
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
      positionsPerRegion.push(length);

      vectorA.push(vectorB[0] + 2*xsx[0] + Number(leftCondition[1]));
      vectorSource.push(s[0]);

      for (let i = 1; i < nm; i++) {
        vectorA.push(vectorB[i] + vectorB[i - 1] + 2*xsx[i] + 2*xsx[i - 1]);
        vectorSource.push(s[i] + s[i - 1]);
      }

      vectorA.push(vectorB[nm - 1] + 2*xsx[nm - 1] + Number(rightCondition[1]));
      vectorSource.push(s[nm - 1]);
      keffPrevious = keff;
      console.log(vectorA);
      console.log(vectorB);
      console.log(vectorSource);
      const solution = solveSymmetricTridiagonal(vectorA, vectorB, vectorSource);
      console.log(solution);
      let somaCurrent = 0;
      let somaPrevious = 0;
      fluxAveragePrevious = fluxAverage;
      fluxAverage = 0;
      for(let i = 0; i < vectorSource.length; i++){
        sol_Previous = solResult[i];
        somaPrevious += vectorSource[i];
        somaCurrent += vectorSource[i]*(solution[i]/sol_Previous);
        fluxAverage += solution[i]/solution.length;
        solResult[i] = solution[i];
      }
      keff = keffPrevious*(somaCurrent/somaPrevious);
      if((relativeDeviation(keff, keffPrevious) > Number(keffTolerance))){
        keffValues.push(keff);
      }
      stepCount++;
      if(stoppingCriterion)
        if(stepCount >= steps)
          break;
      let pos = 0;
      positionsPerRegion.forEach((position) => {
        positions.push(pos);
        pos += position;
      });
  }
  const E_fission_J = Number(energy) * 1.602176634e-13;
  const pot = Number(power) || 1;
  let estimatedPower = 0;
  let powers = [];
  let index = 1;
  let start = 0;
  let end = 0;

  for (let regions = 0; regions < regionCount; regions++) {
    const idx = mapping[regions] - 1;
    const Σf = crossSectionsMacroscopicFis[idx];
    const h = thickness[regions] / cellsPerRegion[regions];
    end = index + cellsPerRegion[regions];
    let p = 0;
    if(noGamma){
      p = Σf * integralDiffusionSimpson(solResult, h, start, end - 1) * E_fission_J / 1000000;
    }
    else{
      p = Σf * numericalIntegral(solResult, h, start, end - 1) * E_fission_J / 1000000;
    }
    powers.push(p);
    estimatedPower += p;
    index += cellsPerRegion[regions];
    start = end - 1;
  }

  if (estimatedPower > 0) {
    const factor = pot / estimatedPower;
    for (let i = 0; i < solResult.length; i++) {
      solResult[i] = solResult[i] * factor;
    }
    powers = powers.map(p => p * factor);
  }
  const endTime = performance.now();
  const executionTime = endTime - startTime;

  console.log(`Tempo de execução: ${executionTime.toFixed(4)} ms`);

    return {solResult, positions, keffValues, powers, fluxIterations};
  };

const validateBoundary = async (
  boundaryLeftCurrent: string,
  boundaryRightCurrent: string
) => {
  try{
    const lkeff = Number(keffTolerance);
    const numericFluxTolerance = Number(fluxTolerance);
    const albeldoL = Boolean(albedoL);
    const albeldoR = Boolean(albedoR);
    const a_l = Number(aL);
    const b_l = Number(bL);
    const a_r = Number(aR);
    const b_r = Number(bR);
    const reflectorDiffusionCoefficientLeft = Number(coefDiffusionRefL);
    const baffleDiffusionCoefficientLeft = Number(coefDiffusionBaffL);
    const reflectorDiffusionCoefficientRight = Number(coefDiffusionRefR);
    const baffleDiffusionCoefficientRight = Number(coefDiffusionBaffR);
    const reflectorCrossSectionLeft = Number(coefCrossSectionRefL);
    const reflectorCrossSectionRight = Number(coefCrossSectionRefR);
    const baffleCrossSectionLeft = Number(coefCrossSectionBaffL);
    const baffleCrossSectionRight = Number(coefCrossSectionBaffR);

    if (!Number.isFinite(lkeff) || lkeff === 0) {
      throw new Error("Valor inválido para critério de parada de keff");
    }
    if (!Number.isFinite(numericFluxTolerance) || numericFluxTolerance === 0) {
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
      if(isNaN(reflectorDiffusionCoefficientLeft) || reflectorDiffusionCoefficientLeft <= 0){
        throw new Error("Informe apenas valores numéricos maiores que zero para o coeficiente de difusão do refletor na esquerda");
      }
      if(isNaN(reflectorCrossSectionLeft) || reflectorCrossSectionLeft <= 0){
        throw new Error("Informe apenas valores numéricos maiores que zero para a seção de choque macroscópica do refletor na esquerda");
      }
      if(isNaN(reflectorDiffusionCoefficientRight) || reflectorDiffusionCoefficientRight <= 0){
        throw new Error("Informe apenas valores numéricos maiores que zero para o coeficiente de difusão do refletor na direita");
      }
      if(isNaN(reflectorCrossSectionRight) || reflectorCrossSectionRight <= 0){
        throw new Error("Informe apenas valores numéricos maiores que zero para a seção de choque macroscópica do refletor na direita");
      }
      if(baffleL){
        if(isNaN(baffleDiffusionCoefficientLeft) || baffleDiffusionCoefficientLeft <= 0){
          throw new Error("Informe apenas valores numéricos maiores que zero para o coeficiente de difusão do baffle na esquerda");
        }
        if(isNaN(baffleCrossSectionLeft) || baffleCrossSectionLeft <= 0){
          throw new Error("Informe apenas valores numéricos maiores que zero para a seção de choque macroscópica do baffle na esquerda");
        }
      }
      if(baffleR){
        if(isNaN(baffleDiffusionCoefficientRight) || baffleDiffusionCoefficientRight <= 0){
          throw new Error("Informe apenas valores numéricos maiores que zero para o coeficiente de difusão do baffle na direita");
        }
        if(isNaN(baffleCrossSectionRight) || baffleCrossSectionRight <= 0){
          throw new Error("Informe apenas valores numéricos maiores que zero para a seção de choque macroscópica do baffle na direita");
        }
      }
    }
    await solveProblem(
      boundaryLeftCurrent,
      boundaryRightCurrent
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
  const solveProblem = async (boundaryLeftCurrent: string, boundaryRightCurrent: string) => {
    setValidated(false);
    const {solResult, positions, keffValues, powers, fluxIterations} = generateVectors(boundaryLeftCurrent, boundaryRightCurrent);
    await new Promise(resolve => setTimeout(resolve, 0));
    const{newBoundaryLeft, newBoundaryRight} = solveAlbedo(boundaryLeftCurrent, boundaryRightCurrent);
    if(keffValues != undefined){
      navigate("/relatorio", {
        state: {
          result: {
            ...result!,
            hasGraphic,
            advancedOptions,
            filterPoint: Number(filterPoint),
            noGamma: noGamma,
            boundaryRight: newBoundaryRight,
            boundaryLeft: newBoundaryLeft,
            keff: keffValues[keffValues.length - 1],
            aL,
            bL,
            aR,
            bR,
            inf_bL,
            inf_bR,
            baffleL,
            baffleR,
            coefDiffusionRefL,
            coefDiffusionRefR,
            coefCrossSectionRefL,
            coefCrossSectionRefR,
            coefDiffusionBaffL,
            coefDiffusionBaffR,
            coefCrossSectionBaffL,
            coefCrossSectionBaffR,
            albedoL,
            albedoR
          },
          solutions: solResult,
          positions: positions,
          keffValues: keffValues,
          powers: powers,
          fluxIterations: fluxIterations
        }
      });
    }
  };
  const solveAlbedo = (boundaryLeftCurrent: string, boundaryRightCurrent: string) => {
    let leftCondition = boundaryLeftCurrent.split(";").map(Number);
    let rightCondition = boundaryRightCurrent.split(";").map(Number);
    console.log("beta_esq: " + leftCondition[1]);
    console.log("beta_dir: " + rightCondition[1]);
    let newBoundaryLeft = boundaryLeftCurrent;
    let newBoundaryRight = boundaryRightCurrent;

    if (albedoL) {
      const albedoValue = calculateAlbedo(
        Number(aL),
        Number(bL),
        leftCondition[1],
        Number(coefDiffusionRefL),
        Number(coefDiffusionBaffL),
        Number(coefCrossSectionRefL),
        Number(coefCrossSectionBaffL),
        Boolean(inf_bL),
        baffleL
      );

      newBoundaryLeft = `${leftCondition[0]};${albedoValue}`;
      setBoundaryLeft(newBoundaryLeft);
    }

    if (albedoR) {
      const albedoValue = calculateAlbedo(
        Number(aR),
        Number(bR),
        rightCondition[1],
        Number(coefDiffusionRefR),
        Number(coefDiffusionBaffR),
        Number(coefCrossSectionRefR),
        Number(coefCrossSectionBaffR),
        Boolean(inf_bR),
        baffleR
      );

      newBoundaryRight = `${rightCondition[0]};${albedoValue}`;
      setBoundaryRight(newBoundaryRight);
    }

    return {
      newBoundaryLeft,
      newBoundaryRight
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
            text = {"Incluir o ν"}
            value = {noNi}
            onChange = {setNoNi}
          />
          {(noNi) && (
            <FormInput
              label="Informe o número de nêutrons gerados por fissão:"
              placeholder="Informe um valor para ν"
              onChange={(value: string) => setNeutronsPerFission(value)}
              value={neutronsPerFission}
            />
          )}
          <div>
            <FormInputWithAlert
              label="Potência gerada pelo reator:"
              placeholder="Informe a potência em MW"
              onChange={(value: string) => setPower(value)}
              value={power}
              msgAlert='Se esse campo for deixado em branco, assume-se uma potência de 200 MW.'
              exAlert=''
            />
          </div>
          <div>
            <FormInputWithAlert
              label="Energia liberada por fissão:"
              placeholder="Informe a energia em MeV"
              onChange={(value: string) => setEnergy(value)}
              value={energy}
              msgAlert='Se esse campo for deixado em branco, assume-se uma energia de 200 MeV.'
              exAlert=''
            />
          </div>
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
            <BoundaryModal
              boundaryRight = {boundaryRight}
              setBoundaryRight = {setBoundaryRight}
              boundaryLeft = {boundaryLeft}
              setBoundaryLeft = {setBoundaryLeft}
              L = {getLength()}
              successFunc = {validateBoundary}
              keffTolerance={keffTolerance}
              setKeffTolerance={setLkeff}
              fluxTolerance={fluxTolerance}
              setFluxTolerance={setFluxTolerance}
              msgErroDialog={msgErro}
              showModal ={showModal}
              setShowModal={setShowModal}
              stoppingCriterion={stoppingCriterion}
              setCriterioParada={setCriterioParada}
              steps={steps}
              setSteps={setSteps}
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
              coefCrossSectionRefL={coefCrossSectionRefL}
              setCoefCrossSectionRefL={setCoefCrossSectionRefL}
              coefCrossSectionRefR={coefCrossSectionRefR}
              setCoefCrossSectionRefR={setCoefCrossSectionRefR}
              coefDiffusionRefL={coefDiffusionRefL}
              setCoefDiffusionRefL={setCoefDiffusionRefL}
              coefDiffusionRefR={coefDiffusionRefR}
              setCoefDiffusionRefR={setCoefDiffusionRefR}
              coefCrossSectionBaffL={coefCrossSectionBaffL}
              setCoefCrossSectionBaffL={setCoefCrossSectionBaffL}
              coefCrossSectionBaffR={coefCrossSectionBaffR}
              setCoefCrossSectionBaffR={setCoefCrossSectionBaffR}
              coefDiffusionBaffL={coefDiffusionBaffL}
              setCoefDiffusionBaffL={setCoefDiffusionBaffL}
              coefDiffusionBaffR={coefDiffusionBaffR}
              setCoefDiffusionBaffR={setCoefDiffusionBaffR}
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
