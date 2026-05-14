import ResultState from "../ResultState";

export interface ResultStateMultiplicative extends ResultState{
  choquesMacroscopicosAbs: number[];
  choquesMacroscopicosFis: number[];
  noNi: boolean;
  Ni: number;
  potencia: number;
  energia: number;
  Lkeff: string;
  Lfluxo: string;
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
  coefDifusaoRefL: number;
  coefDifusaoRefR: number;
  coefChoqueRefL: number;
  coefChoqueRefR: number;
  coefDifusaoBaffL: number;
  coefDifusaoBaffR: number;
  coefChoqueBaffL: number;
  coefChoqueBaffR: number;
  baffleL: boolean;
  baffleR: boolean;
}

export function isResultStateMultiplicative(obj: any): obj is ResultStateMultiplicative {
  return obj && typeof obj === 'object' && 'choquesMacroscopicosFis' in obj;
}
