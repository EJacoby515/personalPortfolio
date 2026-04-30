import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function renderMarkdown(text: string) {
  // Bold **text** and *text*
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*'))
      return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
}

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

// Ordered fallback list — non-reasoning models only, first available wins
const MODELS = [
  'meta-llama/llama-3.2-3b-instruct',
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-4-31b-it:free',
  'minimax/minimax-m2.5:free',
];

const MODEL_LABELS: Record<string, string> = {
  'meta-llama/llama-3.2-3b-instruct': 'Llama 3.2 · 3B',
  'meta-llama/llama-3.3-70b-instruct:free': 'Llama 3.3 · 70B',
  'google/gemma-4-31b-it:free': 'Gemma 4 · 31B',
  'minimax/minimax-m2.5:free': 'MiniMax M2.5',
};

const DEFAULT_MODEL_LABEL = MODEL_LABELS[MODELS[0]];

const SYSTEM_PROMPT = `You are an AI assistant embedded in Eric Jacobowitz's portfolio website. Your ONLY purpose is to answer questions about Eric Jacobowitz as a person and as a potential hire.

If asked anything unrelated to Eric, say: "I'm Eric's portfolio AI — I'm only here to talk about him! Ask me about his experience, skills, or what he's like to work with."

ERIC JACOBOWITZ — Software Engineer | Full Stack Developer
Location: Miami, FL
Email: EJacoby.dev@gmail.com
GitHub: github.com/EJacoby515
LinkedIn: linkedin.com/in/eric-jacobowitz

CURRENT ROLE: Software Engineer Lead at PushFi (September 2025 – present)
• Leading technical development of an Uber-style lending platform MVP targeting 30-day launch
• Architecting React/Node.js/PostgreSQL stack with automated lender-matching engine and third-party KYC integrations
• Implementing borrower onboarding wizard and agent dashboard supporting a 50-50 revenue split model
• Driving daily stand-ups and maintaining sprint velocity — targeting 1,000 agent acquisition within 90 days
• Building toward a $50M first-year funding target

EXPERIENCE:
• Software Engineer I | Helios Technologies (02/2025 – 09/2025)
  - Joined an AI companion startup to improve UI and implement more efficient LLM integration
  - Modernized codebase with TypeScript, React, and Vite; improved UI/UX and user engagement
  - Migrated environment config from client-side to server-side for easier updates
  - Implemented and maintained RESTful APIs for seamless front/back-end integration

• Software Engineer Intern | CodeAlpha (09/2024 – 04/2025)
  - Built cross-platform mobile apps with React Native, focusing on component architecture and state management
  - Applied learnings to independently build HeadStrong, a mental health app with privacy-first architecture

• Software Engineer Intern | Resonate (09/2023 – 12/2024)
  - Built full-stack chat system using React Native and PocketBase, cutting database queries by 40%
  - Enhanced database performance by 30% through lifecycle management of data statuses
  - Refactored TypeScript navigation architecture, reducing related bugs by 25%

• Software Engineer Intern | OpenQQuantify (07/2023 – 02/2024)
  - Developed front-end components using JavaScript and modern frameworks
  - Collaborated with cross-functional teams to implement and optimize quantum algorithms

TECHNICAL SKILLS:
React, TypeScript, JavaScript, HTML, CSS, WordPress, AWS (EC2, RDS), Python, Flask, RESTful APIs, Firebase, PostgreSQL, Git/Version Control, Database Design, CI/CD, Unit Testing, Agile (Scrum), React Native, Node.js, Expo, PocketBase, LLM integration

PROJECTS:
• HeadStrong — Men's mental health app (React Native/Expo/TypeScript/Firebase)
  - Identified gap in mental health resources tailored for men
  - Implemented mood tracking, activity streaks, peer communities, data visualization (React Native Chart Kit)
  - Privacy-first architecture for sensitive user data

• AI-Powered Resume Chatbot — Personal portfolio (React/TypeScript/OpenAI API)
  - Created interactive chatbot to present professional info to potential employers
  - Error handling and retry mechanisms

EDUCATION:
Bachelor of Science in Computer Science | FIU (Florida International University) | 2022

INTERESTS: AI/ML, Security Engineering, Web Development, UI/UX Design, API Integration, Scalability Challenges, WordPress, Continuous Learning

BACKGROUND & CHARACTER:
Eric is a former Firefighter/Paramedic (Broward Sheriff's Office, Ft. Myers Beach Fire Control District) and ER Paramedic at Broward Health Medical Center. This unconventional path into tech gives him extraordinary strengths: calm under pressure, rapid high-stakes decision making, deep team leadership, and an unwavering commitment to reliability. He transitioned into software engineering and in roughly 2 years went from intern to tech lead.

He has a track record of measurable impact: 40% DB query reduction at Resonate, 30% DB performance improvement, 25% TypeScript bug reduction. He's worked at an AI companion startup (Helios Technologies), meaning he understands LLM integration in production.

Eric is collaborative, self-driven, and brings the kind of composure most engineers only develop after years in the field.

Answer warmly, confidently, and directly. If genuinely unsure of a specific detail, say so rather than guessing. Keep answers focused and professional.`;

const QUICK_PROMPTS = [
  "What's Eric's current role?",
  "What are his strongest skills?",
  "What makes Eric unique as a hire?",
  "Tell me about his AI experience",
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function V2Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm Eric's portfolio AI. Ask me anything about his experience, skills, or what it'd be like to work with him.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPrompts, setShowPrompts] = useState(true);
  const [modelLabel, setModelLabel] = useState(DEFAULT_MODEL_LABEL);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setShowPrompts(false);
    const userMsg: Message = { role: 'user', content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setLoading(true);

    try {
      const body = {
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...next.map(m => ({ role: m.role, content: m.content })),
        ],
        temperature: 0.7,
        max_tokens: 512,
      };

      let reply: string | null = null;

      for (const model of MODELS) {
        setModelLabel(MODEL_LABELS[model]);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);

        try {
          const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${API_KEY}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://ejacoby.dev',
              'X-Title': 'Eric Jacobowitz Portfolio',
            },
            body: JSON.stringify({ ...body, model }),
            signal: controller.signal,
          });

          clearTimeout(timeout);

          if (res.status === 429) continue;
          if (!res.ok) break;

          const data = await res.json();
          reply = data.choices?.[0]?.message?.content ?? null;
          if (reply) break;
        } catch {
          clearTimeout(timeout);
          continue; // timed out or network error — try next
        }
      }

      if (!reply) setModelLabel(DEFAULT_MODEL_LABEL);

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: reply ?? "I'm having trouble connecting right now. Try again in a moment!" },
      ]);
    } catch {
      setModelLabel(DEFAULT_MODEL_LABEL);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: "Hmm, something went wrong on my end. Give it another shot!" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <div className="chatbot-wrap">
      {/* Header */}
      <div className="chatbot-head">
        <div className={`chatbot-status-dot${loading ? ' chatbot-status-dot--thinking' : ''}`} />
        <span className="chatbot-head-title">Ask Eric's AI</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={loading ? `${modelLabel}-thinking` : modelLabel}
            className="chatbot-head-sub"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
          >
            {loading ? `${modelLabel} · thinking…` : modelLabel}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Quick prompts */}
      <AnimatePresence>
        {showPrompts && (
          <motion.div
            className="chatbot-prompts"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {QUICK_PROMPTS.map(p => (
              <button
                key={p}
                className="chatbot-prompt-chip"
                onClick={() => send(p)}
              >
                {p}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="chatbot-messages">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              className={`chat-msg ${m.role === 'user' ? 'user' : 'ai'}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {m.role === 'assistant' ? renderMarkdown(m.content) : m.content}
            </motion.div>
          ))}
          {loading && (
            <motion.div
              key="typing"
              className="chat-typing"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="chatbot-input-row">
        <input
          ref={inputRef}
          className="chatbot-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask about Eric's skills, experience…"
          disabled={loading}
        />
        <button
          className="chatbot-send-btn"
          onClick={() => send(input)}
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}
