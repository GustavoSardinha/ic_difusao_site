import ResultState from "../ResultState";

export interface ResultStateNonMultiplicative extends ResultState {
  fonteNeutrons: number[];
  choquesMacroscopicos: number[];
  incidenciaDir: number;
  incidenciaEsq: number;
}


export function isResultStateNonMultiplicative(obj: any): obj is ResultStateNonMultiplicative {
  return obj && typeof obj === 'object' && 'incidenciaEsq' in obj;
}
