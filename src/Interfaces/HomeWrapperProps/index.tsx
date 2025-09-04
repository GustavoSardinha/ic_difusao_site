import ResultState from "../ResultState";

interface HomeWrapperProps {
  initialState?: {
    result?: ResultState;
    vector_solutions?: number[];
    vector_keffs?: number[];
    vector_pot?: number[];
    esps?: number[];
    itfluxo?: number;
  };
}

export default HomeWrapperProps;