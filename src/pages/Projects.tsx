import { useEffect, useState } from "react";

interface Repo {
  id: number;
  name: string;
  html_url: string;
}

function Projects() {
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
      setRepos(data);
    } catch (error) {
      console.error("Error fetching repositories:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Recent Projects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {repos.map((repo) => (
          <div key={repo.id} className="bg-gradient-to-l from-gray-800 to-gray-900 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">{repo.name}</h2>
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
  );
}

export default Projects;
