import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LatestActivity from '../components/LatestActivity';

interface Repo {
  id: number;
  name: string;
  html_url: string;
  description: string;
  pushed_at: string;
  latest_commit: string;
}

const Projects: React.FC = () => {
  const [repos, setRepos] = useState<Repo[]>([]);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const response = await axios.get(
          'https://api.github.com/users/EJacoby515/repos',
          {
            params: {
              sort: 'pushed',
              per_page: 5,
            },
          }
        );

        const reposWithCommits = await Promise.all(
          response.data.map(async (repo: Repo) => {
            const commitResponse = await axios.get(
              `https://api.github.com/repos/EJacoby515/${repo.name}/commits`,
              {
                params: {
                  per_page: 1,
                },
              }
            );
            const latestCommit = commitResponse.data[0].commit.message;
            return { ...repo, latest_commit: latestCommit };
          })
        );

        setRepos(reposWithCommits);
      } catch (error) {
        console.error('Error fetching repositories:', error);
      }
    };

    fetchRepos();
  }, []);

  return (
    <div className="projects">
      <h1>My Projects</h1>
      <div className="project-grid">
        <div className="project-item">
          <h3>Project 1</h3>
          <p>A detailed description of Project 1.</p>
          <a href="#" target="_blank" rel="noopener noreferrer">View Project</a>
        </div>
        <div className="project-item">
          <h3>Project 2</h3>
          <p>A detailed description of Project 2.</p>
          <a href="#" target="_blank" rel="noopener noreferrer">View Project</a>
        </div>
        <div className="project-item">
          <h3>Project 3</h3>
          <p>A detailed description of Project 3.</p>
          <a href="#" target="_blank" rel="noopener noreferrer">View Project</a>
        </div>
      </div>
      <section className="recent-projects">
        <h2>Latest GitHub Activity</h2>
        <LatestActivity repos={repos} />
      </section>
    </div>
  );
};

export default Projects;