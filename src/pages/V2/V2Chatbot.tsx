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

// Chat goes through a serverless proxy that holds the OpenRouter key
// server-side. The key is NEVER shipped to the browser. See /proxy.
const PROXY_URL = import.meta.env.VITE_CHAT_PROXY_URL;

// Labels for the model badge. The proxy decides which model actually runs and
// returns its id; we map that id to a friendly label here.
const MODEL_LABELS: Record<string, string> = {
  'meta-llama/llama-3.2-3b-instruct': 'Llama 3.2 · 3B',
  'meta-llama/llama-3.3-70b-instruct:free': 'Llama 3.3 · 70B',
  'google/gemma-4-31b-it:free': 'Gemma 4 · 31B',
  'minimax/minimax-m2.5:free': 'MiniMax M2.5',
};

const DEFAULT_MODEL_LABEL = MODEL_LABELS['meta-llama/llama-3.2-3b-instruct'];

// NOTE: the system prompt (Eric's resume/context) now lives server-side in the
// proxy Worker (proxy/src/index.js). It must NOT be sent from the client — a
// caller could otherwise override it. The client only sends the conversation.

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
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);

      let reply: string | null = null;
      try {
        // The proxy handles the system prompt, model fallback, and the API key.
        // We only send the conversation turns.
        const res = await fetch(PROXY_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: next.map(m => ({ role: m.role, content: m.content })),
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          reply = data?.reply ?? null;
          setModelLabel(
            data?.model && MODEL_LABELS[data.model]
              ? MODEL_LABELS[data.model]
              : DEFAULT_MODEL_LABEL
          );
        } else {
          setModelLabel(DEFAULT_MODEL_LABEL);
        }
      } catch {
        clearTimeout(timeout);
        setModelLabel(DEFAULT_MODEL_LABEL);
      }

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
