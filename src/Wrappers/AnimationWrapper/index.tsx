// AnimatedRoutes.jsx
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import HomeComponent from '../../Pages/HomeComponent';
import MultiplicativeWrapper from '../MultiplicativeWrapper';
import NonMultiplicativeWrapper from '../NonMultiplicativeWrapper';
import ReportWrapper from '../ReportWrapper';
import ReconstructionWrapper from '../ReconstructionWrapper';

export default function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ height: '100%' }}
      >
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomeComponent />} />
          <Route path="/naomultiplicativo" element={<NonMultiplicativeWrapper />} />
          <Route path="/multiplicativo" element={<MultiplicativeWrapper />} />
          <Route path="/relatorio" element={<ReportWrapper />} />
          <Route path="/reconstrucao" element={<ReconstructionWrapper />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}
