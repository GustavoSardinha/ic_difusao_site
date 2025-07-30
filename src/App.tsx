import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './Styles/App.css';
import ReportWrapper from './Wrappers/ReportWrapper';
import ReconstructionWrapper from './Wrappers/ReconstructionWrapper';
import NonMultiplicativeWrapper from './Wrappers/NonMultiplicativeWrapper';
import HomeComponent from './Pages/HomeComponent';
import MultiplicativeWrapper from './Wrappers/MultiplicativeWrapper';

const router = createBrowserRouter(
  [
    { path: '/', element: <HomeComponent /> },
    { path: '/naomultiplicativo', element: <NonMultiplicativeWrapper /> },
    { path: '/multiplicativo', element: <MultiplicativeWrapper /> },
    { path: '/relatorio', element: <ReportWrapper /> },
    { path: '/reconstrucao', element: <ReconstructionWrapper /> },
  ],
  { basename: '/ic_difusao_site' }
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
