import { solveSymmetricTridiagonal, integralDiffusionSimpson, relativeDeviation} from "../../Services/numericalMath";
import { ResultStateMultiplicative } from "../../Interfaces/ResultStateMultiplicative";


export const generateVectors = ( result: ResultStateMultiplicative,
    boundaryLeft: string, boundaryRight: string, noNi:boolean,
    keffTolerance:string, fluxTolerance:string, stoppingCriterion: boolean,
    steps:number, energy:string, power:string) => {

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
    let leftCondition = boundaryLeft.split(";").map(Number);
    let rightCondition = boundaryRight.split(";").map(Number);
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
    const p = Σf * integralDiffusionSimpson(solResult, h, start, end - 1) * E_fission_J / 1000000;
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

    return {solResult, positions, keffValues, powers, fluxIterations};
  };
