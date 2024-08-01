// ChatbotPopup.tsx
import React, { useState } from 'react'
import Chatbot from './Chatbot'

interface ChatbotPopupProps {
  onV2Mentioned: () => void;
}

const ChatbotPopup: React.FC<ChatbotPopupProps> = ({ onV2Mentioned }) => {
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
          <Chatbot onV2Mentioned={onV2Mentioned} />
        </div>
      )}
    </div>
  );
};

export default ChatbotPopup;