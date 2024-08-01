import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Repo {
  id: number;
  name: string;
  html_url: string;
}

interface NavbarProps {
  onV2Mentioned: () => void;
  showV2Link: boolean;
}

function Navbar({onV2Mentioned, showV2Link}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [recentRepos, setRecentRepos] = useState<Repo[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const fetchRecentRepos = async () => {
    try {
      const response = await fetch(
        'https://api.github.com/users/EJacoby515/repos?sort=pushed&per_page=3'
      );
      const data = await response.json();
      setRecentRepos(data);
    } catch (error) {
      console.error('Error fetching recent repositories:', error);
    }
  };

  useEffect(() => {
    fetchRecentRepos();
  }, []);

  const handleMouseEnter = () => {
    if (window.innerWidth >= 768) { // Only open on hover for desktop
      setDropdownOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (window.innerWidth >= 768) { // Only close on hover for desktop
      setDropdownOpen(false);
    }
  };

  const handleClick = () => {
    if (window.innerWidth < 768) { // Only toggle on click for mobile
      setDropdownOpen(!dropdownOpen);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-gray-800 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="text-white text-7xl font-bold tracking-tight">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={80} height={80}>
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontWeight="bold">
                  <tspan fill="#1e88e5" fontSize={80}>E</tspan>
                  <tspan fill="#ffffff" fontSize={60} dx={-10} dy={5}>J</tspan>
                </text>
                <path d="M 20 90 C 40 80, 60 80, 80 90" stroke="#1e88e5" strokeWidth={4} fill="none" />
              </svg>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                to="/"
                className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium"
              >
                Home
              </Link>
              {showV2Link && (
              <Link
                to="/v2"
                className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium"
              >
                V2 Portfolio
              </Link>
              )}
              <Link
                to="/about"
                className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium"
              >
                About
              </Link>
              <div
                className="relative group"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  to="/projects"
                  className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium"
                  onClick={handleClick}
                >
                  Projects
                </Link>
                <div
                  className={`absolute mt-2 w-48 bg-white rounded-md shadow-lg transition-opacity duration-300 ${dropdownOpen ? 'opacity-100' : 'opacity-0'}`}
                >
                  {recentRepos.map((repo) => (
                    <a
                      key={repo.id}
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
                    >
                      {repo.name}
                    </a>
                  ))}
                </div>
              </div>
              <Link
                to="/contact"
                className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium"
              >
                Contact
              </Link>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={toggleMenu}
              className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-gray-700 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="text-white block px-3 py-2 rounded-md text-base font-medium"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-white block px-3 py-2 rounded-md text-base font-medium"
            >
              About
            </Link>
            <Link
              to="/projects"
              className="text-white block px-3 py-2 rounded-md text-base font-medium"
              onClick={handleClick}
            >
              Projects
            </Link>
            {dropdownOpen && (
              <div className="mt-2 w-full bg-white rounded-md shadow-lg">
                {recentRepos.map((repo) => (
                  <a
                    key={repo.id}
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
                  >
                    {repo.name}
                  </a>
                ))}
              </div>
            )}
            <Link
              to="/contact"
              className="text-white block px-3 py-2 rounded-md text-base font-medium"
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
