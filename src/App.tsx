import React from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import routes from './config/routes';
import ChatPopup from './components/Chatpopup'

function App() {
  console.log('app component is running');
  return (
    <div>
      <HashRouter>
        <Navbar />
        <Routes>
          {routes.map((route, index) => (
            <Route key={index} path={route.path} element={<route.component />} />
          ))}
        </Routes>
      </HashRouter>
      <ChatPopup />
    </div>
  );
}

export default App;