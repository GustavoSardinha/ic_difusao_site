import { useLocation } from 'react-router-dom';
import DrivenPowerComponent from '../../Pages/DrivenPowerComponent';

interface DrivenPowerState {
  [key: string]: any;
}

export default function DrivenPowerWrapper() {
  const location = useLocation();
  const initialState = (location.state ?? {}) as DrivenPowerState;

  return <DrivenPowerComponent initialState={initialState} />;
}
