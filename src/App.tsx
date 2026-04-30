
import { HashRouter, Route, Routes } from 'react-router-dom';
import V2Index from './pages/V2/Index';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/*" element={<V2Index />} />
      </Routes>
    </HashRouter>
  );
}

export default App;