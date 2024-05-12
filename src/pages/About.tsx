import React from 'react';

const About: React.FC = () => {
  return (
    <div className="about">
      <h1>About Me</h1>
      <p>
        Hi, I'm Eric Jacobowitz, a skilled developer with expertise in full-stack technologies.
        I have a passion for creating innovative and user-friendly applications.
      </p>
      <section className="skills">
        <h2>My Skills</h2>
        <ul>
          <li>HTML/CSS</li>
          <li>JavaScript/TypeScript</li>
          <li>React</li>
          <li>Node.js</li>
          <li>Python</li>
          <li>Flask/DJango</li>
          <li>AWS Cloud services</li>
        </ul>
      </section>
    </div>
  );
};

export default About;