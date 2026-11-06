import ResultState from "../ResultState";

interface HomeWrapperProps {
  initialState?: {
    result?: ResultState;
    solutions?: number[];
    keffValues?: number[];
    powers?: number[];
    positions?: number[];
    fluxIterations?: number;
  };
}

export default HomeWrapperProps;