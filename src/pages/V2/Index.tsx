import React, { useEffect, useState, useRef } from 'react';
import './v2styles.css';

function V2Index() {
  const [activeSection, setActiveSection] = useState('home');
  const containerRef = useRef<HTMLDivElement>(null);

  const updateActiveSection = () => {
    const container = containerRef.current;
    if (!container) return;

    
    const containerHeight = container.clientHeight;

    

    const sections = ['home', 'about', 'projects', 'contact'];

    for (const section of sections) {
      const element = document.getElementById(section);
      if (element) {
        const { top } = element.getBoundingClientRect();
        const topRelativeToContainer = top - container.getBoundingClientRect().top;
          if (topRelativeToContainer <= containerHeight / 2 && topRelativeToContainer + element.clientHeight >= containerHeight / 2) {
          setActiveSection(section);
          break;
        }
      }
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', updateActiveSection);
      updateActiveSection(); 
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', updateActiveSection);
      }
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section && containerRef.current) {
      containerRef.current.scrollTo({
        top: section.offsetTop,
        behavior: 'smooth'
      });
      // Force update after smooth scroll
      setTimeout(updateActiveSection, 500);
    }
  };

  interface Repo {
    id: number;
    name: string;
    html_url: string;
    language: string;
  }
  
   const [repos, setRepos] = useState<Repo[]>([]);
  
    useEffect(() => {
      fetchRepos();
    }, []);
  
    const fetchRepos = async () => {
      try {
        const response = await fetch(
          "https://api.github.com/users/EJacoby515/repos?sort=pushed&per_page=5"
        );
        const data = await response.json();
  
        const repoLanguagesPromises = data.map(async (repo: any) => {
          if (repo.name.toLowerCase() === 'personalportfolio') {
            return null; // Skip this repo
          }
  
          const languagesResponse = await fetch(repo.languages_url);
          const languages = await languagesResponse.json();
          const primaryLanguage = languages ? Object.keys(languages)[0] : 'Unknown';
  
          return {
            id: repo.id,
            name: repo.name,
            html_url: repo.html_url,
            language: primaryLanguage
          };
        });
  
        const repositoriesWithLanguages = await Promise.all(repoLanguagesPromises);
        const filteredRepositories = repositoriesWithLanguages.filter((repo) => repo !== null);
        setRepos(filteredRepositories as Repo[]);
      } catch (error) {
        console.error("Error fetching repositories:", error);
      }
    };

    const handleDownload = (e: { preventDefault: () => void; }) => {
      e.preventDefault();
      
      const docId = '1T38ODvwOWSbajBzZa5dC80HF3Giz14uLHvC4C921SGc';
      
      const downloadUrl = `https://docs.google.com/document/d/${docId}/export?format=pdf`;
      
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'Eric_Jacobowitz_Resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    return (
      <div className="v2-container" ref={containerRef}>
        <nav className="v2-nav">
          <div className="logo-container">
          <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontWeight="bold">
    <tspan fill="#3c6e71" fontSize={80}>E</tspan>
    <tspan fill="#ffffff" fontSize={60} dx={-10} dy={5}>J</tspan>
  </text>
  <path d="M 20 90 C 40 80, 60 80, 80 90" stroke="#3c6e71" strokeWidth={4} fill="none" />
</svg>
          </div>
          <ul>
            {['home', 'about', 'projects', 'contact'].map((section) => (
              <li key={section}>
                <button 
                  onClick={() => scrollToSection(section)}
                  className={activeSection === section ? 'active' : ''}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </button>
              </li>
            ))}
          </ul>
        </nav>

      <div id="home" className="v2-section">
        <div className='container'>
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Eric Jacobowitz</h1>
      <p className="text-xl mb-8">
        Full-Stack Software Developer
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 p-4 rounded shadow-md">
          <h2 className="text-2xl font-bold">Technical Skills</h2>
          <ul className="list-disc list-inside">
            <li>Languages: JavaScript, HTML5, CSS3, Python</li>
            <li>Frameworks/Libraries: React, Flask, SQLAlchemy</li>
            <li>Databases: PostgreSQL</li>
            <li>Tools/DevOps: GitHub, RESTful APIs, Firebase, AWS EC2, AWS RDS</li>
          </ul>
        </div>
        <div className="bg-gray-800 p-4 rounded shadow-md">
          <h2 className="text-2xl font-bold">Certifications</h2>
          <ul className="list-disc list-inside">
            <li><a href="https://www.credly.com/badges/6c634715-42c5-4744-a121-ae31f9c78760/public_url" target ="_blank">Coding Temple - Full Stack Development</a></li>
            <li><a href="https://www.joincolab.io/certificate/eric-jacobowitz" target="_blank">Co.Lab - Software Developer</a></li>
          </ul>
        </div>
      </div>
    </div>
    </div>
      </div>

      <div id="about" className="v2-section">
        <div className='container'>
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">About Me</h1>
      <p className="text-xl mb-8">
        I am an experienced Full-Stack Software Developer Engineer with a strong background in both emergency services and software development. 
        I have a proven ability to implement complex tech stacks and create scalable, user-centric applications. I excel in delivering high-quality 
        solutions in both independent and collaborative team environments.
      </p>
      <h2 className="text-2xl font-bold mb-4">Experience</h2>
      <ul className="list-disc list-inside mb-8">
        <li>Front-End Software Egnineer Intern at PanPalz </li>
        <li>Software Engineer Resident at Co.Lab</li>
        <li>Software Engineer Trainee at Coding Temple</li>
        <li>Firefighter/Paramedic at Broward Sheriff's Office</li>
        <li>Firefighter/Paramedic at Ft. Myers Beach Fire Control District</li>
        <li>ER Paramedic at Broward Health Medical Center</li>
      </ul>
      <h2 className="text-2xl font-bold mb-4">Education</h2>
      <ul className="list-disc list-inside mb-8">
        <li>Co.Lab, Certificate - Software Developer</li>
        <li>Coding Temple, Certificate - Software Engineering</li>
        <li>Broward College, Paramedic certificate / A.S. in Emergency Medical Services</li>
        <li>Broward Fire Academy - Firefighter 1 & 2</li>
      </ul>
    </div>
    </div>
    </div>
      

      <div id="projects" className="v2-section">
        <div className='container'>
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Recent Projects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {repos.map((repo) => (
          <div key={repo.id} className="bg-gradient-to-l from-gray-800 to-gray-900 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">{repo.name}</h2>
            <p className="text-gray-400 mb-4">Primary Language: {repo.language}</p>
            <div className="mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 50" className="w-full h-auto">
                {/* Example colored lines */}
                <rect x="10" y="10" width="180" height="5" fill="#ce426c" />
                <rect x="10" y="20" width="150" height="5" fill="#e2b72f" />
                <rect x="10" y="30" width="170" height="5" fill="#a7c07b" />
                <rect x="10" y="40" width="140" height="5" fill="#8b68c4" />
              </svg>
            </div>
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {repo.name}
            </a>
          </div>
        ))}
      </div>
    </div>
    </div>
      </div>

      <div id="contact" className="v2-section">
        <div className='container'>
      <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Contact Me</h1>
      <p className="text-xl mb-8">
        Feel free to reach out to me via email at <a href="mailto:EJacobowitz515@gmail.com" className="text-blue-500 hover:underline">EJacobowitz515@gmail.com</a>
      </p>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Download My Resume</h2>
        <button
          onClick={handleDownload}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Download Resume
        </button>
      </div>
    </div>
      </div>
    </div>
    </div>
  );
}

export default V2Index;