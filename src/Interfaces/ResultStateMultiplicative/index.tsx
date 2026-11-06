import ResultState from "../ResultState";

export interface ResultStateMultiplicative extends ResultState{
  crossSectionsMacroscopicAbs: number[];
  crossSectionsMacroscopicFis: number[];
  noNi: boolean;
  ni: number;
  neutronsPerFission: number;
  power: number;
  energy: number;
  keffTolerance: string;
  fluxTolerance: string;
  keff: number;
  solutions: number[];
  albedoL: boolean;
  albedoR: boolean;
  inf_bL: boolean;
  inf_bR: boolean;
  aL: number;
  aR: number;
  bL: number;
  bR: number;
  coefDiffusionRefL: number;
  coefDiffusionRefR: number;
  coefCrossSectionRefL: number;
  coefCrossSectionRefR: number;
  coefDiffusionBaffL: number;
  coefDiffusionBaffR: number;
  coefCrossSectionBaffL: number;
  coefCrossSectionBaffR: number;
  baffleL: boolean;
  baffleR: boolean;
}

export function isResultStateMultiplicative(obj: any): obj is ResultStateMultiplicative {
  return obj && typeof obj === 'object' && 'crossSectionsMacroscopicFis' in obj;
}
