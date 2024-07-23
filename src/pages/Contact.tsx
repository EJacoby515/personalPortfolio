import React from 'react';

function Contact() {
  const handleDownload = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    
    const docId = '1T38ODvwOWSbajBzZa5dC80HF3Giz14uLHvC4C921SGc';
    
    const downloadUrl = `https://docs.google.com/document/d/${docId}/export?format=pdf`;
    
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'Elisha_Jacobowitz_Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
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
  );
}

export default Contact;