import { useLocation } from 'react-router-dom';
import NonMultiplicativeComponent from '../../Pages/NonMultiplicativeComponent';

interface NonMultiplicativeState {
  [key: string]: any;
}

export default function NonMultiplicativeWrapper() {
  const location = useLocation();
  const initialState = (location.state ?? {}) as NonMultiplicativeState;

  return <NonMultiplicativeComponent initialState={initialState} />;
}
