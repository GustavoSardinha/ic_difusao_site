import ResultState from "../ResultState";

interface ResultStateMultiplicative extends ResultState{
  choquesMacroscopicosAbs: number[];
  choquesMacroscopicosFis: number[];
  noNi: boolean;
  Ni: number;
  potencia: number;
  energia: number;
  Lkeff: number;
  Lfluxo: number;
  keff: number;
  solutions: number[];
}

export default ResultStateMultiplicative;