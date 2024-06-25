import React, { useState } from 'react'
import Chatbot from './Chatbot'


const ChatbotPopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <button className="chatbot-toggle-button" onClick={toggleChatbot}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>
      {isOpen && (
        <div className={`chatbot-popup ${isOpen ? 'open' : ''}`}>
          <Chatbot />
        </div>
      )}
    </div>
  );
};

export default ChatbotPopup;