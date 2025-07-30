import { useLocation } from 'react-router-dom';
import MultiplicativeComponent from '../../Pages/MultiplicativeComponent';

interface MultiplicativeState {
  [key: string]: any;
}

export default function MultiplicativeWrapper() {
  const location = useLocation();
  const initialState = (location.state ?? {}) as MultiplicativeState;

  return <MultiplicativeComponent initialState={initialState} />;
}
