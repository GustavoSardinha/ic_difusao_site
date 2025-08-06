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
}

export function isResultStateMultiplicative(obj: any): obj is ResultStateMultiplicative {
  return obj && typeof obj === 'object' && 'choquesMacroscopicosFis' in obj;
}
