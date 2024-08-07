

function Home() {
  return (
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
  );
}

export default Home;
