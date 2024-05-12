import { HashRouter, Route, Routes, Link } from 'react-router-dom';
import routes from './config/routes';
import React from 'react';
import Navbar from './components/Navbar';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={
            <>
              <section className="hero">
                <h1>Welcome to My Portfolio</h1>
                <p>I'm a passionate developer creating amazing web experiences.</p>
              </section>
              <section className="projects">
                <h2>Projects</h2>
                <div className="project-grid">
                  <div className="project-item">Project 1</div>
                  <div className="project-item">Project 2</div>
                  <div className="project-item">Project 3</div>
                </div>
              </section>
              <section className="about">
                <h2>About Me</h2>
                <p>I'm a skilled developer with expertise in full-stack technologies.</p>
              </section>
              <section className="contact">
                <h2>Get in Touch</h2>
                <p>Feel free to reach out to me for any inquiries or collaborations.</p>
              </section>
            </>
          } />
          {routes.map((route: any, index: any) => (
            <Route
              key={index}
              path={route.path}
              element={<route.component />}
            />
          ))}
        </Routes>
        <footer className="footer">
          <p>&copy; 2024 EJacoby. All rights reserved.</p>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;