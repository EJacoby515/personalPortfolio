// Cloudflare Worker — OpenRouter proxy for Eric's portfolio chatbot.
//
// WHY THIS EXISTS:
// The browser must never see the OpenRouter key. A `VITE_`-prefixed key is
// baked into the public JS bundle at build time, so anyone can scrape it and
// drain the account (this is exactly what happened — ~$100 in minutes).
// The key now lives ONLY here, as a Worker secret (`OPENROUTER_KEY`).
//
// DEFENSE IN DEPTH (so even a direct hit on this Worker stays cheap):
//   - Origin allowlist enforced server-side (not just browser CORS).
//   - Model allowlist enforced server-side — the client cannot pick a model.
//     Worst-case abuse is bounded to small / free models.
//   - System prompt injected server-side — a client cannot override it.
//   - Hard caps on tokens, message count, and input size.

const ALLOWED_ORIGINS = [
  'https://ejacoby.dev',
  'https://www.ejacoby.dev',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
];

// Ordered fallback list — first available wins. Enforced server-side so a
// caller can NEVER run an expensive model through this proxy.
const MODELS = [
  'meta-llama/llama-3.2-3b-instruct',
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-4-31b-it:free',
  'minimax/minimax-m2.5:free',
];

const MAX_TOKENS = 512;   // cap output per reply
const MAX_MESSAGES = 20;  // cap conversation turns kept
const MAX_CHARS = 8000;   // cap total input characters
const UPSTREAM_TIMEOUT_MS = 15000;

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

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : '';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors },
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, cors);
    }
    // Browser CORS is not a security boundary (curl ignores it), so enforce
    // the origin allowlist on the server too.
    if (!ALLOWED_ORIGINS.includes(origin)) {
      return json({ error: 'Forbidden origin' }, 403, cors);
    }
    if (!env.OPENROUTER_KEY) {
      return json({ error: 'Proxy misconfigured' }, 500, cors);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ error: 'Invalid JSON' }, 400, cors);
    }

    // Keep only user/assistant turns; drop any client-supplied system prompt.
    const incoming = Array.isArray(payload?.messages) ? payload.messages : [];
    const convo = incoming
      .filter(
        (m) =>
          m &&
          (m.role === 'user' || m.role === 'assistant') &&
          typeof m.content === 'string'
      )
      .slice(-MAX_MESSAGES)
      .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));

    const totalChars = convo.reduce((n, m) => n + m.content.length, 0);
    if (!convo.length || totalChars > MAX_CHARS) {
      return json({ error: 'Bad request' }, 400, cors);
    }

    const messages = [{ role: 'system', content: SYSTEM_PROMPT }, ...convo];

    for (const model of MODELS) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
      try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.OPENROUTER_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://ejacoby.dev',
            'X-Title': 'Eric Jacobowitz Portfolio',
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: 0.7,
            max_tokens: MAX_TOKENS,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (res.status === 429) continue; // rate limited — try next model
        if (!res.ok) break; // hard error — stop trying

        const data = await res.json();
        const reply = data?.choices?.[0]?.message?.content ?? null;
        if (reply) return json({ reply, model }, 200, cors);
      } catch {
        clearTimeout(timeout); // timeout or network error — try next model
        continue;
      }
    }

    return json(
      { reply: null, error: 'All models unavailable' },
      200,
      cors
    );
  },
};
