import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import './v2styles.css';
import V2Chatbot from './V2Chatbot';

// ── Data ────────────────────────────────────────────────────

const EXPERIENCE = [
  {
    role: 'Software Engineer Lead',
    company: 'PushFi',
    dates: 'Sep 2025 — Present',
    current: true,
    bullets: [
      'Leading technical development of Uber-style lending platform MVP targeting 30-day launch',
      'Architecting React / Node.js / PostgreSQL stack with automated lender-matching engine and KYC integrations',
      'Driving daily stand-ups and sprint velocity — targeting 1,000 agent acquisition within 90 days',
      'Building borrower onboarding and agent dashboards to support $50M first-year funding target',
    ],
  },
  {
    role: 'Software Engineer I',
    company: 'Helios Technologies',
    dates: 'Feb 2025 — Sep 2025',
    current: false,
    bullets: [
      'Joined AI companion startup to improve UI and implement more efficient LLM integration',
      'Developed reusable components with TypeScript, React, and Vite — improving UI/UX and engagement',
      'Migrated environment config from client-side to server-side for streamlined updates',
      'Implemented and maintained RESTful APIs for seamless front/back-end integration',
    ],
  },
  {
    role: 'Software Engineer Intern',
    company: 'CodeAlpha',
    dates: 'Sep 2024 — Apr 2025',
    current: false,
    bullets: [
      'Built cross-platform mobile apps with React Native, focusing on component architecture and state management',
      'Independently built HeadStrong — a mental health app with privacy-first architecture for sensitive user data',
    ],
  },
  {
    role: 'Software Engineer Intern',
    company: 'Resonate',
    dates: 'Sep 2023 — Dec 2024',
    current: false,
    bullets: [
      'Built full-stack chat system using React Native and PocketBase, cutting database queries by 40%',
      'Enhanced database performance by 30% through lifecycle management of data statuses',
      'Refactored TypeScript navigation architecture with enhanced type safety, reducing bugs by 25%',
    ],
  },
  {
    role: 'Software Engineer Intern',
    company: 'OpenQQuantify',
    dates: 'Jul 2023 — Feb 2024',
    current: false,
    bullets: [
      'Developed front-end components using JavaScript and modern frameworks',
      'Collaborated with cross-functional teams to implement and optimize quantum algorithms',
    ],
  },
];

const SKILLS = [
  {
    label: 'Frontend',
    tags: ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'React Native', 'Vite', 'Expo'],
  },
  {
    label: 'Backend & Cloud',
    tags: ['Node.js', 'Python', 'Flask', 'PostgreSQL', 'Firebase', 'AWS EC2', 'AWS RDS', 'PocketBase'],
  },
  {
    label: 'AI & APIs',
    tags: ['LLM Integration', 'OpenAI API', 'OpenRouter', 'RESTful APIs', 'AI Companion Systems'],
  },
  {
    label: 'Tooling',
    tags: ['Git', 'CI/CD', 'Agile / Scrum', 'Unit Testing', 'Database Design', 'WordPress'],
  },
];

const FEATURED_PROJECTS = [
  {
    tag: 'Mobile App',
    name: 'HeadStrong',
    desc: 'Mental health app for men built with React Native, Expo, TypeScript, and Firebase. Mood tracking, activity streaks, peer communities, and privacy-first data architecture.',
    lang: 'TypeScript',
    url: 'https://github.com/EJacoby515',
  },
  {
    tag: 'AI Integration',
    name: 'AI Resume Chatbot',
    desc: 'Interactive portfolio chatbot built with React, TypeScript, and LLM APIs. Lets employers explore professional experience conversationally with error handling and retry logic.',
    lang: 'TypeScript',
    url: 'https://github.com/EJacoby515',
  },
];

interface Repo {
  id: number;
  name: string;
  html_url: string;
  language: string;
  description: string | null;
}

// ── Animation variants ───────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 48 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const fadeLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const staggerFast = {
  visible: { transition: { staggerChildren: 0.07 } },
};

// ── Sub-components ───────────────────────────────────────────

function RevealSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface TimelineEntryData {
  role: string;
  company: string;
  dates: string;
  current: boolean;
  bullets: string[];
}

function TimelineEntry({ entry, index }: { entry: TimelineEntryData; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      className="timeline-entry"
      variants={fadeLeft}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      transition={{ delay: index * 0.08 }}
    >
      <div className={`timeline-dot ${entry.current ? 'active' : ''}`} />
      <div className="timeline-role">{entry.role}</div>
      <div className="timeline-company">{entry.company}</div>
      <div className="timeline-dates">{entry.dates}</div>
      <ul className="timeline-bullets">
        {entry.bullets.map((b, j) => (
          <li key={j}>{b}</li>
        ))}
      </ul>
    </motion.div>
  );
}

// Geometric hex wireframe for hero
function GeoHex() {
  return (
    <svg className="hero-geo" viewBox="0 0 520 520" fill="none" xmlns="http://www.w3.org/2000/svg">
      {[0, 40, 80, 120, 160].map((inset, i) => (
        <motion.polygon
          key={i}
          points={`260,${10 + inset} ${510 - inset},${140 + inset * 0.6} ${510 - inset},${380 - inset * 0.6} 260,${510 - inset} ${10 + inset},${380 - inset * 0.6} ${10 + inset},${140 + inset * 0.6}`}
          stroke="#7a9e7e"
          strokeWidth={i === 0 ? 1 : 0.6}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.5, delay: i * 0.3, ease: 'easeInOut' }}
        />
      ))}
      {/* Diagonal accent lines */}
      <motion.line x1="10" y1="140" x2="510" y2="380" stroke="#c4a267" strokeWidth="0.4"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.4 }}
        transition={{ duration: 2, delay: 1.8 }}
      />
      <motion.line x1="510" y1="140" x2="10" y2="380" stroke="#c4a267" strokeWidth="0.4"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.4 }}
        transition={{ duration: 2, delay: 2.1 }}
      />
    </svg>
  );
}

// ── Main component ───────────────────────────────────────────

export default function V2Index() {
  const [activeSection, setActiveSection] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const [repos, setRepos] = useState<Repo[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll detection
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrolled(container.scrollTop > 40);

      const sections = ['home', 'experience', 'projects', 'contact'];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (!el) continue;
        const { top } = el.getBoundingClientRect();
        const containerTop = container.getBoundingClientRect().top;
        const relative = top - containerTop;
        if (relative <= container.clientHeight * 0.5 && relative + el.clientHeight >= container.clientHeight * 0.5) {
          setActiveSection(id);
          break;
        }
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // GitHub repos
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('https://api.github.com/users/EJacoby515/repos?sort=pushed&per_page=8');
        const data: any[] = await res.json();
        const filtered = data
          .filter(r => !['personalportfolio', 'headstrong'].some(skip => r.name.toLowerCase().includes(skip)))
          .slice(0, 6);

        const withLangs: Repo[] = await Promise.all(
          filtered.map(async r => {
            try {
              const lRes = await fetch(r.languages_url);
              const langs = await lRes.json();
              return {
                id: r.id,
                name: r.name,
                html_url: r.html_url,
                language: Object.keys(langs)[0] ?? 'Code',
                description: r.description,
              };
            } catch {
              return { id: r.id, name: r.name, html_url: r.html_url, language: r.language ?? 'Code', description: r.description };
            }
          })
        );
        setRepos(withLangs);
      } catch {
        // silent fail — no repos shown
      }
    })();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    const container = containerRef.current;
    if (el && container) {
      container.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/resume.pdf';
    link.download = 'Eric_Jacobowitz_Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const navItems = ['home', 'experience', 'projects', 'contact'];

  return (
    <div className="v2-container" ref={containerRef}>

      {/* ── Navigation ── */}
      <nav className={`v2-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-logo" onClick={() => scrollTo('home')}>
          E<span className="nav-logo-accent">J</span>
        </div>
        <ul className="nav-links">
          {navItems.map(id => (
            <li key={id}>
              <button
                className={activeSection === id ? 'nav-active' : ''}
                onClick={() => scrollTo(id)}
              >
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* ════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════ */}
      <section id="home" className="v2-section" style={{ padding: 0 }}>
        <div className="geo-grid" />
        <div style={{ padding: '0 56px', display: 'flex', alignItems: 'center', minHeight: '100vh', position: 'relative' }}>
          <div className="hero-inner">
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              {/* Eyebrow */}
              <motion.div className="hero-eyebrow" variants={fadeUp}>
                <span className="hero-eyebrow-line" />
                Miami, FL · Available for Opportunities
              </motion.div>

              {/* Name */}
              <motion.h1 className="hero-name" variants={fadeUp}>
                Eric<br />
                <span className="hero-name-accent">Jacob</span>owitz
              </motion.h1>

              {/* Title */}
              <motion.p className="hero-title" variants={fadeUp}>
                Software Engineer &amp; <span className="hero-title-highlight">AI Integrations</span>
              </motion.p>

              {/* Meta */}
              <motion.div className="hero-meta" variants={fadeUp}>
                <span className="hero-meta-item">
                  <span className="hero-meta-dot" />
                  BS Computer Science · FIU
                </span>
                <span className="hero-meta-item">
                  <span className="hero-meta-dot" />
                  React · TypeScript · LLMs
                </span>
                <span className="hero-meta-item">
                  <span className="hero-meta-dot" />
                  EJacoby.dev@gmail.com
                </span>
              </motion.div>

              {/* CTAs */}
              <motion.div className="hero-cta" variants={fadeUp}>
                <motion.button
                  className="btn-primary"
                  onClick={() => scrollTo('projects')}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  View My Work
                </motion.button>
                <motion.button
                  className="btn-ghost"
                  onClick={() => scrollTo('contact')}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Chat With AI
                </motion.button>
                <motion.button
                  className="btn-ghost"
                  onClick={handleDownload}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Resume ↓
                </motion.button>
              </motion.div>
            </motion.div>
          </div>

          {/* Geometric hex wireframe */}
          <GeoHex />

          {/* Scroll indicator */}
          <div className="scroll-indicator">
            <div className="scroll-indicator-line" />
            <span className="scroll-indicator-text">Scroll</span>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          EXPERIENCE
      ════════════════════════════════════════════════ */}
      <section id="experience" className="v2-section">
        <div className="section-inner">
          <RevealSection>
            <motion.div className="section-label" variants={fadeUp}>Experience</motion.div>
            <motion.h2 className="section-title" variants={fadeUp}>Where I've Built</motion.h2>
          </RevealSection>

          <div className="exp-layout">
            {/* Left: Bio + Skills */}
            <RevealSection>
              <motion.p className="exp-bio" variants={fadeUp}>
                Former <span className="exp-bio-highlight">Firefighter/Paramedic</span> turned software engineer.
                That path isn't a detour — it's the reason I operate well under pressure, lead clearly in ambiguity,
                and ship things that actually work. In two years I went from intern to{' '}
                <span className="exp-bio-highlight">tech lead</span>, with stops at an AI companion startup and a
                fintech MVP with a $50M funding target.
              </motion.p>

              <motion.div className="skill-groups" variants={staggerFast}>
                {SKILLS.map(group => (
                  <motion.div key={group.label} className="skill-group" variants={fadeUp}>
                    <div className="skill-group-label">{group.label}</div>
                    <div className="skill-tags">
                      {group.tags.map(tag => (
                        <span key={tag} className="skill-tag">{tag}</span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </RevealSection>

            {/* Right: Timeline */}
            <div className="timeline">
              <div className="timeline-rail" />
              {EXPERIENCE.map((entry, i) => (
                <TimelineEntry key={i} entry={entry} index={i} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          PROJECTS
      ════════════════════════════════════════════════ */}
      <section id="projects" className="v2-section">
        <div className="section-inner">
          <RevealSection>
            <motion.div className="section-label" variants={fadeUp}>Projects</motion.div>
            <motion.h2 className="section-title" variants={fadeUp}>Things I've Shipped</motion.h2>
          </RevealSection>

          {/* Featured */}
          <motion.div
            className="projects-grid"
            style={{ marginBottom: '1.25rem' }}
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {FEATURED_PROJECTS.map(p => (
              <motion.a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="project-card"
                variants={fadeUp}
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <div className="project-tag">{p.tag} · Featured</div>
                <div className="project-name">{p.name}</div>
                <div className="project-desc">{p.desc}</div>
                <div className="project-footer">
                  <span className="project-link-text">View on GitHub →</span>
                  <span className="project-lang-badge">{p.lang}</span>
                </div>
              </motion.a>
            ))}
          </motion.div>

          {/* GitHub repos */}
          <AnimatePresence>
            {repos.length > 0 && (
              <motion.div
                className="projects-grid"
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
              >
                {repos.map(repo => (
                  <motion.a
                    key={repo.id}
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-card"
                    variants={fadeUp}
                    whileHover={{ y: -6 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  >
                    <div className="project-tag">GitHub</div>
                    <div className="project-name">{repo.name.replace(/-/g, ' ')}</div>
                    {repo.description && (
                      <div className="project-desc">{repo.description}</div>
                    )}
                    <div className="project-footer">
                      <span className="project-link-text">View repo →</span>
                      <span className="project-lang-badge">{repo.language}</span>
                    </div>
                  </motion.a>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          CONTACT
      ════════════════════════════════════════════════ */}
      <section id="contact" className="v2-section">
        <div className="section-inner">
          <RevealSection>
            <motion.div className="section-label" variants={fadeUp}>Contact</motion.div>
            <motion.h2 className="section-title" variants={fadeUp}>Let's Talk</motion.h2>
          </RevealSection>

          <div className="contact-layout">
            {/* Left: Info */}
            <RevealSection>
              <motion.p className="contact-intro" variants={fadeUp}>
                Open to full-time roles, contract work, and interesting problems.
                Whether you want to talk shop, ask about my background, or just say hi —
                reach out.
              </motion.p>

              {[
                { label: 'Email', value: <a href="mailto:EJacoby.dev@gmail.com">EJacoby.dev@gmail.com</a> },
                { label: 'GitHub', value: <a href="https://github.com/EJacoby515" target="_blank" rel="noopener noreferrer">github.com/EJacoby515</a> },
                { label: 'LinkedIn', value: <a href="https://linkedin.com/in/eric-jacobowitz" target="_blank" rel="noopener noreferrer">eric-jacobowitz</a> },
                { label: 'Location', value: <span>Miami, FL</span> },
                { label: 'Education', value: <span>BS Computer Science · FIU · 2022</span> },
              ].map(item => (
                <motion.div key={item.label} className="contact-item" variants={fadeUp}>
                  <div className="contact-item-label">{item.label}</div>
                  <div className="contact-item-value">{item.value}</div>
                </motion.div>
              ))}

              <motion.div style={{ marginTop: '2rem' }} variants={fadeUp}>
                <motion.button
                  className="btn-primary"
                  onClick={handleDownload}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Download Resume
                </motion.button>
              </motion.div>
            </RevealSection>

            {/* Right: Chatbot */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <V2Chatbot />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="v2-footer">
        <span>© 2025 Eric Jacobowitz</span>
        <div className="footer-links">
          <a href="https://github.com/EJacoby515" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://linkedin.com/in/eric-jacobowitz" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="mailto:EJacoby.dev@gmail.com">Email</a>
        </div>
      </footer>
    </div>
  );
}
