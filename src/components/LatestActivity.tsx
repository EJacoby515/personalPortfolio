import React, { useEffect, useState } from 'react';

const LatestActivity: React.FC<{ repos: any[] }> = ({ repos }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % repos.length);
    }, 3000);

    return () => {
      clearInterval(intervalId);
    };
  }, [repos]);

  if (repos.length === 0) {
    return null;
  }

  return (
    <div className="latest-activity-carousel">
      <h3>Latest GitHub Activity</h3>
      <div className="carousel-container">
        {repos.map((repo, index) => (
          <div
            key={repo.id}
            className={`carousel-item ${index === currentIndex ? 'active' : ''}`}
          >
            <div className="repo-info">
              <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                {repo.name}
              </a>
              <p>{repo.latest_commit}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LatestActivity;