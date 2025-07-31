import ResultState from "../ResultState";

interface ResultStateNonMultiplicative extends ResultState {
  fonteNeutrons: number[];
  choquesMacroscopicos: number[];
  incidenciaDir: number;
  incidenciaEsq: number;
}

export default ResultStateNonMultiplicative;