interface ResultState {
  regionCount: number;
  materialZoneCount: number;
  mapping: number[];
  cellsPerRegion: number[];
  diffusionCoefficients: number[];
  thickness: number[];
  length: number;
  stepGraphic: number;
  stepTable: number;
  hasGraphic: boolean;
  advancedOptions: boolean;
  noGamma: boolean;
  filterPoint: number;
  boundaryRight: string;
  boundaryLeft: string;
}

export default ResultState;