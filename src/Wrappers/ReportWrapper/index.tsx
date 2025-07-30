import { useLocation } from 'react-router-dom';
import ReportComponent from '../../Pages/ReportComponent';

interface ReportState {
  [key: string]: any;
}

export default function ReportWrapper() {
  const location = useLocation();
  const initialState = (location.state ?? {}) as ReportState;

  return <ReportComponent initialState={initialState} />;
}
