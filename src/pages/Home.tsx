import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="home">
      <section className="hero">
        <h1>Welcome to My Portfolio</h1>
        <p>I'm a passionate developer creating amazing web experiences.</p>
      </section>
      <section className="featured-projects">
        <h2>Featured Projects</h2>
        <div className="project-grid">
          <div className="project-item">
            <h3>Project 1</h3>
            <p>A brief description of Project 1.</p>
          </div>
          <div className="project-item">
            <h3>Project 2</h3>
            <p>A brief description of Project 2.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;