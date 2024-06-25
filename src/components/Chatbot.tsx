import React, { useState } from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from '@chatscope/chat-ui-kit-react';

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
if (!API_KEY) {
  console.error('OpenAI API key not found. Please check your .env.local file.');
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

console.log('All environment variables:', import.meta.env);
console.log('VITE_OPENAI_API_KEY:', import.meta.env.VITE_OPENAI_API_KEY);
console.log('API_KEY variable:', API_KEY);

const sendTextMessage = async (message: string) => {
  try {
    const response = await fetch('/api/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });
    if (!response.ok) {
      throw new Error('Failed to send SMS');
    }
    console.log('SMS sent successfully');
  } catch (error) {
    console.error('Error sending SMS:', error);
  }
};

type MessageModel = {
  message: string;
  sentTime: string;
  sender: string;
  direction: 'incoming' | 'outgoing';
  position: 0 | 1 | 2 | 3 | 'single' | 'first' | 'normal' | 'last';
};

const Chatbot: React.FC = () => {
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<MessageModel[]>([
    {
      message: 'What would you like to know about Eric?',
      sentTime: 'just now',
      sender: 'ChatGPT',
      direction: 'incoming',
      position: 'single',
    },
  ]);

  const handleSend = async (text: string) => {
    const newMessage: MessageModel = {
      message: text,
      sentTime: 'just now',
      sender: 'user',
      direction: 'outgoing',
      position: 'single',
    };
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setTyping(true);

    await processMessages(newMessages);
  };

  const processMessages = async (messages: MessageModel[], retryCount = 0) => {
    if (!API_KEY) {
      console.error('No API key provided');
      return;
    }
    const apiMessages = messages.map((messageObject) => {
      let role = '';
      if (messageObject.sender === 'ChatGPT') {
        role = 'assistant';
      } else {
        role = 'user';
      }
      return { role: role, content: messageObject.message };
    });

    const systemMessage = {
      role: 'system',
      content: 'You are a helpful assistant that summarizes resume content for potential employers.',
    };

    const resumeMessages = [
      { role: 'user', content: "Here is the resume of Eric Jacobowitz, a Full-Stack software developer." },
      { role: 'user', content: "Here is the resume of Eric Jacobowitz, a Full-Stack software developer." },
      { role: 'user', content: "Personal Information:\n- Name: Eric Jacobowitz\n- Location: Miami, FL\n- Phone: (954) 243-3376\n- Email: EJacobowitz515@gmail.com\n- Github: https://github.com/EJacoby515\n- Linkedin: https://linkedin.com/in/eric-jacobowitz" },
      { role: 'user', content: "Summary:\nExperienced Full Stack Software Developer Engineer with a strong background in both emergency services and software development. Proven ability to implement complex tech stacks and create scalable, user-centric applications. Excels in delivering high-quality solutions in both independent and collaborative team environments." },
      { role: 'user', content: "Technical Skills:\n- Languages: JavaScript, HTML5, CSS3, Python\n- Frameworks/Libraries: React, Flask, SQLAlchemy, Flask-WTF\n- Databases: PostgreSQL\n- Tools/DevOps: GitHub, RESTful APIs, Firebase, AWS EC2, AWS RDS\n- Certifications: Coding Temple - Full Stack Development\n- Other: Team Building, Operations, Leadership, Problem Solving, Web Development, Communication, Analytical Skills, Management" },
      { role: 'user', content: "Projects:\n1. FLO Focus Companion (Software Engineer)\n   - Technologies: HTML, CSS, JavaScript, Chrome Extension API\n   - Key Results:\n     - Implemented goal and subtask setting, increasing user task completion by 30%.\n     - Integrated Pomodoro timers for each subtask or overall goal, boosting user focus and productivity by 25%.\n     - Created a quick notes tab for taking and saving study notes as .DOC or .PDF files, improving user note-taking efficiency by 20%.\n     - Developed a study tracker that logs daily study sessions and rewards study streaks, increasing user engagement and motivation by 35%.\n   - Metrics:\n     - Achieved a 40% increase in user study time within the first month of launch.\n     - Collaborated with a small team to deliver a fully functional MVP within an 8-week timeframe, meeting 100% of the project's objectives." },
      { role: 'user', content: "2. Flask Task Management App (Software Engineer)\n   - Technologies: Python, Flask, Jinja, Firebase Auth, PostgreSQL, AWS EC2, AWS RDS, ChatGPT API\n   - Key Results:\n     - Developed a task management app featuring CRUD operations, priority ordering, and role-based management.\n     - Integrated ChatGPT API to prompt and reorder tasks based on the highest priority, enhancing overall task management efficiency.\n     - Achieved a 25% increase in task completion rates by users, demonstrating the app's effectiveness in improving productivity.\n     - Leveraged cloud technologies for secure and scalable storage.\n     - Implemented OOP principles for modularity and deployed the app on AWS EC2." },
      { role: 'user', content: "3. Flask Car Inventory Web App (Software Engineer)\n   - Technologies: Python, Flask, SQLAlchemy, Flask-WTF, Flask-Login\n   - Key Results:\n     - Created a dynamic web application for managing car inventories with an intuitive user interface.\n     - Integrated robust data validation and secure user authentication.\n     - Demonstrated proficiency in developing scalable applications and database integration." },
      { role: 'user', content: "Experience:\n1. Software Engineer Resident at Co.Lab | Remote | 05/2024 - 06/2024\n   - Collaborated closely with a small team consisting of a Product Manager, a Designer, and two Developers, including myself. Over 8 weeks, we engaged in the complete lifecycle of a product to deliver a functioning MVP." },
      { role: 'user', content: "2. Software Engineer Trainee at Coding Temple | Remote | 10/2023 - 05/2024\n   - Technologies: HTML, CSS, Bootstrap, FlexBox, Python, Flask, JavaScript, TypeScript, React,JS, PostgreSQL\n   - Engineered a full-stack multi-page self-development web application with React frontend and Flask backend, improving user engagement by 30%.\n   - Wrote Python scripts to create RESTful APIs for data storage and user input handling, reducing server response times by 20%,\n   - Designed user dashboards supporting asynchronous tasks such as to-do lists and journal components, enhancing user productivity by 25%." },
      { role: 'user', content: "3. Firefighter/Paramedic at Broward Sheriff's Office | Broward County, FL | 01/2018 - Present\n   - Implemented effective fire suppression and control strategies, decreasing fire damage incidents by 15%\n   - Delivered precise emergency medical services and conducted specialized rescue operations, improving patient survival rates by 10%\n   - Conducted a public education initiative on fire safety, increasing community awareness and preparedness by 20%" },
      { role: 'user', content: "4. Firefighter/Paramedic at Ft. Myers Beach Fire Control District | Fort Myers Beach, FL | 09/2017 - 01/2018\n   - Executed proactive fire prevention measures, reducing the number of fire-related incidents by 12%.\n   - Enhanced public education initiatives, raising community engagement in safety programs by 15%." },
      { role: 'user', content: "5. ER Paramedic at Broward Health Medical Center | Fort Lauderdale, FL | December 2016 - January 2018\n   - Responded to traumas and provided critical support to cardiac arrest patients, improving patient outcomes by 18%.\n   - Skillfully executed 12-lead ECGs, blood draws, and IV care, enhancing procedural efficiency by 20%." },
      { role: 'user', content: "Education:\n- Coding Temple, Certificate - Software Engineering\n- Broward College, Paramedic certificate / A.S. in Emergency Medical Services\n- Broward Fire Academy - Firefighter 1 & 2" },
      { role: 'user', content: "Achievements:\n- Successfully transitioned from a paramedic and firefighter to a software engineer, leveraging skills in problem-solving, teamwork, and leadership.\n- Consistently recognized for improving processes and implementing effective solutions in both emergency services and software development." },
      { role: 'user', content: "Certifications:\n- Co.Lab29 Software Developer Certificate\n  - Completed the Co.Lab29 cohort as a Software Developer\n  - Gained real-world experience in cross-functional teamwork, shipping a real MVP, Agile best practices, team-based experience, and stakeholder management\n  - Worked within a cross-functional team of product managers, UX/UI designers, and software engineers to build products over an 8-week program\n  - Engaged in ideation, problem discovery, customer interviews, product design, and development with the support of mentors from companies like Apple, Amazon, Google, and more" },
    ];

    const apiRequestBody = {
      model: 'gpt-3.5-turbo-1106',
      messages: [systemMessage, ...resumeMessages, ...apiMessages],
    };

    console.log('API request body:', apiRequestBody);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(apiRequestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('OpenAI API response:', data);

      const aiResponse = data.choices[0].message.content;
      console.log('AI response:', aiResponse);

      if (
        aiResponse.toLowerCase().includes("i don't have information") ||
        aiResponse.toLowerCase().includes("i don't know") ||
        aiResponse.toLowerCase().includes("i don't have specific details") ||
        aiResponse.toLowerCase().includes("i don't have enough context")
      ) {
        const lastUserMessage = messages[messages.length - 1].message;
        console.log('Sending SMS for unanswered question:', lastUserMessage);

        try {
          await sendTextMessage(`New unanswered question in chatbot: "${lastUserMessage}"`);
          console.log('SMS sent successfully');
        } catch (error) {
          console.error('Error sending SMS:', error);
        }

        const chatGPTMessage: MessageModel = {
          message: "I don't have enough information to answer that question, but I've notified Eric. He'll get back to you with an answer soon!",
          sentTime: 'just now',
          sender: 'ChatGPT',
          direction: 'incoming',
          position: 'single',
        };
        setMessages([...messages, chatGPTMessage]);
      } else {
        const chatGPTMessage: MessageModel = {
          message: aiResponse,
          sentTime: 'just now',
          sender: 'ChatGPT',
          direction: 'incoming',
          position: 'single',
        };
        setMessages([...messages, chatGPTMessage]);
      }
    } catch (error) {
      console.error('Error processing messages:', error);

      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY}ms... (Attempt ${retryCount + 1})`);
        setTimeout(() => {
          processMessages(messages, retryCount + 1);
        }, RETRY_DELAY);
      } else {
        console.error('Max retries reached. Please try again later.');
      }
    } finally {
      setTyping(false);
    }
  };

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <MainContainer style={{
        backgroundColor: '#1a1a1a',
        border: 'none',
        borderRadius: '10px',
        height: '100%',
      }}>
        <ChatContainer style={{height: '100%'}}>
          <MessageList 
            typingIndicator={typing ? <TypingIndicator content="Thinking" /> : null}
            style={{
              backgroundColor: '#1a1a1a',
              padding: '10px',
            }}
          >
            {messages.map((message, index) => (
              <Message 
                key={index} 
                model={message} 
                style={{
                  backgroundColor: message.sender === 'ChatGPT' ? '#1e88e5' : '#2a2a2a',
                  color: '#ffffff',
                  padding: '10px',
                  borderRadius: '10px',
                  marginBottom: '10px'
                }}
              />
            ))}
          </MessageList>
          <MessageInput 
            placeholder="Ask about Eric's skills..." 
            onSend={handleSend} 
            style={{
              backgroundColor: '#2a2a2a',
              color: '#ffffff',
              border: 'none',
              borderTop: '1px solid #1e88e5'
            }}
          />
        </ChatContainer>
      </MainContainer>
    </div>
  );
};

export default Chatbot;