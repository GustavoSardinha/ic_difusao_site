import ResultState from "../ResultState";

export interface ResultStateNonMultiplicative extends ResultState {
  sourceNeutrons: number[];
  crossSectionsMacroscopic: number[];
  incidenceRight: number;
  incidenceLeft: number;
}


export function isResultStateNonMultiplicative(obj: any): obj is ResultStateNonMultiplicative {
  return obj && typeof obj === 'object' && 'incidenceLeft' in obj;
}
