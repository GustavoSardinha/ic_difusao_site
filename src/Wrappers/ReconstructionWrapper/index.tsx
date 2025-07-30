import { useLocation } from 'react-router-dom';
import ReconstructionComponent from '../../Pages/ReconstructionComponent';

interface ReconstructionState {
  [key: string]: any;
}

export default function ReconstructionWrapper() {
  const location = useLocation();
  const initialState = (location.state ?? {}) as ReconstructionState;

  return <ReconstructionComponent initialState={initialState} />;
}
