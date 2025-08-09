import { BrowserRouter } from 'react-router-dom';
import AnimatedRoutes from './Wrappers/AnimationWrapper';
import './Styles/App.css';

function App() {
  return (
    <BrowserRouter basename="/ic_difusao_site">
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;
