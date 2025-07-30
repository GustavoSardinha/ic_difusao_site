import ResultState from "../ResultState";

interface HomeWrapperProps {
  initialState?: {
    result?: ResultState;
    vector_solutions?: number[];
    esps?: number[];
  };
}

export default HomeWrapperProps;