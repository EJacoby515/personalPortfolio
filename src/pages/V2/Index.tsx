import { useState, useEffect, useRef, type RefObject } from 'react';
import {
  motion,
  useInView,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
  AnimatePresence,
  MotionConfig,
  type MotionValue,
  type Variants,
} from 'framer-motion';
import './v2styles.css';
import V2Chatbot from './V2Chatbot';

// ── Data ────────────────────────────────────────────────────

// Keep in sync with public/resume.pdf and the chat proxy prompt (proxy/src/index.js)
const EXPERIENCE = [
  {
    role: 'Software Engineer II, Innovation',
    company: 'Independent Living Systems',
    dates: 'Sep 2026 - Present',
    current: true,
    bullets: [
      'Build and ship secure, HIPAA-compliant healthcare software on the Innovation team, translating requirements from healthcare professionals, data scientists, and product managers into production systems',
      'Leading the migration off a legacy HL7 engine and modernizing the eCare stack for improved interoperability and reliability',
      'Contributing to an internal, enterprise AI platform built on in-house Claude-based agents, with human-in-the-loop design to keep PHI protected and compliant',
      'Own a Postgres + JSONB settings architecture from design through implementation',
    ],
  },
  {
    role: 'Lead Software Engineer',
    company: 'PushFi',
    dates: 'Oct 2025 - Sep 2026',
    current: false,
    bullets: [
      'Worked directly with two non-technical founders translating business logic into system architecture; owned deployment decisions and engineering direction',
      'Architected and shipped MVP in 30 days: lender-matching engine, KYC integrations, borrower onboarding, and agent admin tooling on React, Node, and PostgreSQL',
      'Scrapped inherited NextAuth and rebuilt authentication on Auth0 to meet compliance requirements in the fintech regulatory environment',
      'Ran engineering standups Mon/Wed/Fri and the Monday leadership debrief; held hiring authority for the engineering team',
      'Mentored junior developers with file-level blueprints and code snippets, getting them shipping production code on the lending platform',
    ],
  },
  {
    role: 'Software Engineer I',
    company: 'Helios Technologies',
    dates: 'Aug 2024 - Sep 2025',
    current: false,
    bullets: [
      'Restructured prompts and context-window handling for an AI companion product, cutting latency and tightening response accuracy',
      'Hardened retry and error handling around LLM calls so flaky model responses stopped breaking conversations',
      'Built a reusable TypeScript component library with Vite that sped up every feature ship that followed',
      'Moved environment config from client to server, enabling fixes without shipping a new build',
      'Built and maintained REST APIs; partnered with design and product to turn rough requirements into UIs that converted',
    ],
  },
  {
    role: 'Software Engineer Intern',
    company: 'CodeAlpha',
    dates: 'Jul 2023 - Jul 2024',
    current: false,
    bullets: [
      'Built cross-platform mobile apps in React Native with modular components and clean state management',
      'Tuned mobile UI/UX for varied screen sizes and device constraints, lifting engagement',
    ],
  },
  {
    role: 'Software Engineer Intern',
    company: 'Resonate',
    dates: 'Jan 2023 - Jun 2023',
    current: false,
    bullets: [
      'Built a real-time chat system in React Native and PocketBase, cutting query overhead 40%',
      'Improved data persistence and retrieval 30% with a tighter status-lifecycle model',
      'Rewrote the TypeScript navigation layer with stricter types, dropping runtime regressions 25%',
    ],
  },
  {
    role: 'Software Engineer Intern',
    company: 'OpenQQuantify',
    dates: 'Jun 2022 - Dec 2022',
    current: false,
    bullets: [
      'Built frontend components in modern JS frameworks to visualize quantum datasets; collaborated with researchers to implement quantum algorithms',
    ],
  },
];

const SKILLS = [
  {
    label: 'Languages & Frontend',
    tags: ['TypeScript', 'JavaScript (ES6+)', 'Python', 'React', 'React Native', 'Next.js', 'Vite', 'HTML5', 'CSS3'],
  },
  {
    label: 'Backend & Data',
    tags: ['Node.js', 'Express', 'Flask', 'PostgreSQL', 'MySQL', 'Firebase', 'REST APIs'],
  },
  {
    label: 'Cloud & Infra',
    tags: ['AWS (EC2, RDS)', 'Auth0', 'CI/CD', 'Git', 'Unit Testing'],
  },
  {
    label: 'AI',
    tags: ['LLM APIs', 'RAG', 'Prompt Engineering', 'AI-Assisted Development Workflows'],
  },
];

const FEATURED_PROJECTS = [
  {
    tag: 'Founder & Engineer',
    name: 'HeadStrong',
    desc: 'Mental health platform for men with live users. React Native, Expo, and TypeScript on Firebase with real-time sync for mood tracking, activity streaks, and secure peer communities. Shipping a RAG-backed LLM companion for context-aware journaling and check-ins.',
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

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 48 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: EASE } },
};

const fadeIn: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE } },
};

const lineDraw: Variants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.7, ease: EASE } },
};

const maskUp: Variants = {
  hidden: { y: '110%' },
  visible: { y: '0%', transition: { duration: 0.8, ease: EASE } },
};

const cardRise: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: EASE } },
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

function SectionHeading({ index, label, title }: { index: string; label: string; title: string }) {
  return (
    <RevealSection>
      <div className="section-label">
        <motion.span className="section-index" variants={fadeIn}>{index}</motion.span>
        <motion.span className="section-label-line" variants={lineDraw} />
        <motion.span variants={fadeIn}>{label}</motion.span>
      </div>
      <h2 className="section-title">
        <span className="reveal-mask">
          <motion.span variants={maskUp}>
            {title}<span className="title-dot">.</span>
          </motion.span>
        </span>
      </h2>
    </RevealSection>
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

// Rail fills orange as the visitor scrolls through the roles
function Timeline({ containerRef }: { containerRef: RefObject<HTMLDivElement> }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    container: containerRef,
    target: ref,
    offset: ['start 80%', 'end 55%'],
  });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <div className="timeline" ref={ref}>
      <div className="timeline-rail" />
      <motion.div className="timeline-progress" style={{ scaleY: fill }} />
      {EXPERIENCE.map((entry, i) => (
        <TimelineEntry key={i} entry={entry} index={i} />
      ))}
    </div>
  );
}

// Geometric hex wireframe for hero; rotates and lifts as the hero scrolls away
function GeoHex({ progress }: { progress: MotionValue<number> }) {
  const reduceMotion = useReducedMotion();
  const rotate = useTransform(progress, [0, 1], [0, reduceMotion ? 0 : 30]);
  const y = useTransform(progress, [0, 1], [0, reduceMotion ? 0 : -90]);
  return (
    <motion.svg className="hero-geo" style={{ rotate, y }} viewBox="0 0 520 520" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      <motion.line x1="10" y1="140" x2="510" y2="380" stroke="#ff7a2f" strokeWidth="0.4"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.4 }}
        transition={{ duration: 2, delay: 1.8 }}
      />
      <motion.line x1="510" y1="140" x2="10" y2="380" stroke="#ff7a2f" strokeWidth="0.4"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.4 }}
        transition={{ duration: 2, delay: 2.1 }}
      />
    </motion.svg>
  );
}

// ── Main component ───────────────────────────────────────────

export default function V2Index() {
  const [activeSection, setActiveSection] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const [repos, setRepos] = useState<Repo[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({ container: containerRef });
  const progressBar = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  const { scrollYProgress: heroProgress } = useScroll({
    container: containerRef,
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(heroProgress, [0, 1], [0, reduceMotion ? 0 : 140]);
  const heroOpacity = useTransform(heroProgress, [0, 0.7], [1, 0]);

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
    <MotionConfig reducedMotion="user">
    <div className="v2-container" ref={containerRef}>
      <motion.div className="scroll-progress" style={{ scaleX: progressBar }} />

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
      <section id="home" className="v2-section" style={{ padding: 0 }} ref={heroRef}>
        <div className="geo-grid" />
        <div className="hero-glow" />
        <div style={{ padding: '0 56px', display: 'flex', alignItems: 'center', minHeight: '100vh', position: 'relative' }}>
          <motion.div className="hero-inner" style={{ y: heroY, opacity: heroOpacity }}>
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
                Full-Stack Software Engineer · <span className="hero-title-highlight">AI &amp; Healthtech</span>
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
          </motion.div>

          {/* Geometric hex wireframe */}
          <GeoHex progress={heroProgress} />

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
          <SectionHeading index="01" label="Experience" title="Where I've Built" />

          <div className="exp-layout">
            {/* Left: Bio + Skills */}
            <RevealSection>
              <motion.p className="exp-bio" variants={fadeUp}>
                Active <span className="exp-bio-highlight">firefighter/paramedic</span> on a 24-on/48-off schedule,
                and a full-time engineer around it. The fire service is why I stay calm under pressure, lead clearly
                when things are ambiguous, and ship software that actually works. Today I build HIPAA-compliant
                healthcare software on the Innovation team at{' '}
                <span className="exp-bio-highlight">Independent Living Systems</span>, after leading engineering at a
                fintech startup and hardening LLM integrations at an AI companion company.
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
            <Timeline containerRef={containerRef} />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          PROJECTS
      ════════════════════════════════════════════════ */}
      <section id="projects" className="v2-section">
        <div className="section-inner">
          <SectionHeading index="02" label="Projects" title="Things I've Shipped" />

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
                variants={cardRise}
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
                    variants={cardRise}
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
          <SectionHeading index="03" label="Contact" title="Let's Talk" />

          <div className="contact-layout">
            {/* Left: Info */}
            <RevealSection>
              <motion.p className="contact-intro" variants={fadeUp}>
                Open to full-time roles, contract work, and interesting problems.
                Whether you want to talk shop, ask about my background, or just say hi,
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
              transition={{ duration: 0.6, ease: EASE }}
            >
              <V2Chatbot />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="v2-footer">
        <span>© {new Date().getFullYear()} Eric Jacobowitz</span>
        <div className="footer-links">
          <a href="https://github.com/EJacoby515" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://linkedin.com/in/eric-jacobowitz" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="mailto:EJacoby.dev@gmail.com">Email</a>
        </div>
      </footer>
    </div>
    </MotionConfig>
  );
}
