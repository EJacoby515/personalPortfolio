

function Contact() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Contact Me</h1>
      <p className="text-xl mb-8">
        Feel free to reach out to me via email at <a href="mailto:EJacobowitz515@gmail.com" className="text-blue-500 hover:underline">EJacobowitz515@gmail.com</a>
      </p>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Download My Resume</h2>
        <a
          href="https://drive.google.com/file/d/1FF7scPnxXK8Po09HaNw6r_XxAS4wcL7d/view?usp=drive_link"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
          download
        >
          Download Resume
        </a>
      </div>
    </div>
  );
}

export default Contact;
