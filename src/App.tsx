
import { HashRouter, Route, Routes } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/Navbar';
import routes from './config/routes';
import V2Index from './pages/V2/Index'
import ChatPopup from './components/Chatpopup'


function App() {
  const [ showV2Link, setShowV2Link] = useState(false);

  const handleV2Mentioned = () => {
    setShowV2Link(true);
  };


  return (
    <div>
    <HashRouter>
      <Routes>
        <Route path="/v2/*" element={<V2Index />} />
        <Route
          path="/*"
          element={
            <>
              <Navbar onV2Mentioned={handleV2Mentioned} showV2Link={showV2Link} />
              <Routes>
                {routes.map((route, index) => (
                  <Route key={index} path={route.path} element={<route.component />} />
                ))}
              </Routes>
              <ChatPopup onV2Mentioned={ handleV2Mentioned } />
              </>
              }
            />
      </Routes>
    </HashRouter>
  </div>
);
}

export default App;