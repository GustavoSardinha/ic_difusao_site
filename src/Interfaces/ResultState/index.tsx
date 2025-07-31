interface ResultState {
  numRegioes: number;
  zonasMateriais: number;
  mapeamento: number[];
  numCelulasPorRegiao: number[];
  coeficientesDifusao: number[];
  espessura: number[];
  comprimento: number;
  stepGraphic: number;
  stepTable: number;
  hasGrafic: boolean;
  advancedOptions: boolean;
  nogamma: boolean;
  filterPoint: number;
  contornoDir: string;
  contornoEsq: string;
}

export default ResultState;