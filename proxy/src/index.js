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
  'https://ejcodes.com',
  'https://www.ejcodes.com',
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

ERIC JACOBOWITZ: Full-Stack Software Engineer | AI & Healthtech
Location: Miami, FL
Email: EJacoby.dev@gmail.com
GitHub: github.com/EJacoby515
LinkedIn: linkedin.com/in/eric-jacobowitz

SUMMARY: Fullstack engineer building secure, compliant software in healthcare AI. Previously led engineering at a fintech startup; independent operator behind a live mental-health platform with a RAG-backed AI guide.

CURRENT ROLE: Software Engineer II, Innovation (Innovation Solutions Engineer) at Independent Living Systems, Miami, FL (09/2026 - present)
• Builds and ships secure, HIPAA-compliant healthcare software on the Innovation team, translating requirements from healthcare professionals, data scientists, and product managers into production systems
• Leading the migration off a legacy HL7 engine and modernizing the eCare stack for improved interoperability and reliability
• Contributing to an internal, enterprise AI platform built on in-house Claude-based agents, with human-in-the-loop design to keep PHI protected and compliant
• Owns a Postgres + JSONB settings architecture from design through implementation

PREVIOUS EXPERIENCE:
• Lead Software Engineer | PushFi | Remote (10/2025 - 09/2026)
  - Worked directly with two non-technical founders translating business logic into system architecture; owned deployment decisions and engineering direction
  - Architected and shipped the MVP in 30 days: lender-matching engine, KYC integrations, borrower onboarding, and agent admin tooling on React, Node, and PostgreSQL
  - Scrapped inherited NextAuth and rebuilt authentication on Auth0 to meet compliance requirements in the fintech regulatory environment
  - Ran engineering standups Mon/Wed/Fri and the Monday leadership debrief; held hiring authority for the engineering team
  - Mentored junior developers with file-level blueprints and code snippets, getting them shipping production code

• Software Engineer I | Helios Technologies | Remote (08/2024 - 09/2025)
  - Restructured prompts and context-window handling for an AI companion product, cutting latency and tightening response accuracy
  - Hardened retry and error handling around LLM calls so flaky model responses stopped breaking conversations
  - Built a reusable TypeScript component library with Vite that sped up every feature ship that followed
  - Moved environment config from client to server, enabling fixes without shipping a new build
  - Built and maintained REST APIs; partnered with design and product to turn rough requirements into UIs that converted

• Software Engineer Intern | CodeAlpha | Remote (07/2023 - 07/2024)
  - Built cross-platform mobile apps in React Native with modular components and clean state management
  - Tuned mobile UI/UX for varied screen sizes and device constraints, lifting engagement

• Software Engineer Intern | Resonate | Remote (01/2023 - 06/2023)
  - Built a real-time chat system in React Native and PocketBase, cutting query overhead 40%
  - Improved data persistence and retrieval 30% with a tighter status-lifecycle model
  - Rewrote the TypeScript navigation layer with stricter types, dropping runtime regressions 25%

• Software Engineer Intern | OpenQQuantify | Remote (06/2022 - 12/2022)
  - Built frontend components in modern JS frameworks to visualize quantum datasets; collaborated with researchers to implement quantum algorithms

TECHNICAL SKILLS:
Languages & Frontend: TypeScript, JavaScript (ES6+), Python, React, React Native, Next.js, Vite, HTML5, CSS3
Backend & Data: Node.js, Express, Flask, PostgreSQL, MySQL, Firebase, REST APIs
Cloud & Infra: AWS (EC2, RDS), Auth0, CI/CD, Git, Unit Testing
AI: LLM APIs, RAG, prompt engineering, AI-assisted development workflows

SIDE VENTURE & PROJECTS:
• HeadStrong (Founder & Engineer): mental health platform for men, with live users
  - Independent venture: React Native, Expo, TypeScript on Firebase with real-time sync for mood tracking, activity streaks, and secure peer communities
  - Shipping a RAG-backed LLM companion for context-aware journaling and check-ins; owns product, engineering, and roadmap end-to-end

• AI-Powered Resume Chatbot: this portfolio's chat (OpenRouter API, React, TypeScript) with retry and error handling

EDUCATION:
B.S. Computer Science | Florida International University (FIU) | 2022

BACKGROUND & CHARACTER:
Eric is an active firefighter/paramedic on a 24-on/48-off schedule and works as a full-time software engineer around it. His fire/EMS background includes Broward Sheriff's Office, Ft. Myers Beach Fire Control District, and ER paramedic work at Broward Health Medical Center. That background shows up in how he works: calm under pressure, fast high-stakes decisions, clear team leadership, and a commitment to reliability.

He has a track record of measurable impact: 40% less query overhead and 30% better data persistence/retrieval at Resonate, 25% fewer runtime regressions from a stricter TypeScript navigation layer, and a fintech MVP architected and shipped in 30 days at PushFi. He works on LLM systems in production, from an AI companion product at Helios to an enterprise Claude-based agent platform in healthcare at Independent Living Systems.

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
