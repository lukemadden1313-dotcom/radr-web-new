"use client";

import { useEffect, useRef } from "react";

const APP_STORE_URL = "https://apps.apple.com/us/app/radr-calendar/id6758311100";

function createPaths(container: HTMLDivElement, position: number) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 696 316");
  svg.setAttribute("fill", "none");
  svg.setAttribute("preserveAspectRatio", "xMidYMid slice");

  for (let i = 0; i < 36; i++) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const p = position;
    const d = `M-${380 - i * 5 * p} -${189 + i * 6}C-${380 - i * 5 * p} -${189 + i * 6} -${312 - i * 5 * p} ${216 - i * 6} ${152 - i * 5 * p} ${343 - i * 6}C${616 - i * 5 * p} ${470 - i * 6} ${684 - i * 5 * p} ${875 - i * 6} ${684 - i * 5 * p} ${875 - i * 6}`;
    path.setAttribute("d", d);
    path.setAttribute("pathLength", "1");
    path.setAttribute("stroke", `rgba(12, 93, 233, ${0.03 + i * 0.015})`);
    path.setAttribute("stroke-width", (0.5 + i * 0.03).toString());
    path.style.animationDuration = 20 + Math.random() * 10 + "s";
    path.style.animationDelay = -Math.random() * 30 + "s";
    svg.appendChild(path);
  }
  container.appendChild(svg);
}

export default function HomePage() {
  const paths1Ref = useRef<HTMLDivElement>(null);
  const paths2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (paths1Ref.current && paths1Ref.current.childNodes.length === 0) {
      createPaths(paths1Ref.current, 1);
    }
    if (paths2Ref.current && paths2Ref.current.childNodes.length === 0) {
      createPaths(paths2Ref.current, -1);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".fade-up").forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  function toggleMobileNav() {
    document.querySelector(".nav-links")?.classList.toggle("open");
  }

  function closeMobileNav() {
    document.querySelector(".nav-links")?.classList.remove("open");
  }

  function toggleFaq(e: React.MouseEvent<HTMLButtonElement>) {
    e.currentTarget.parentElement?.classList.toggle("open");
  }

  return (
    <>
      <style>{pageStyles}</style>

      {/* NAV */}
      <nav>
        <a href="#" className="nav-logo">
          <img src="/assets/images/Radr blue logotype.png" alt="Radr" />
        </a>
        <button className="mobile-toggle" aria-label="Toggle menu" onClick={toggleMobileNav}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <ul className="nav-links">
          <li><a href="#how-it-works" onClick={closeMobileNav}>How It Works</a></li>
          <li><a href="#features" onClick={closeMobileNav}>Features</a></li>
          <li><a href="#community" onClick={closeMobileNav}>Community</a></li>
          <li><a href="#faq" onClick={closeMobileNav}>FAQ</a></li>
          <li><a href={APP_STORE_URL} target="_blank" rel="noopener" className="nav-cta">Download</a></li>
        </ul>
      </nav>

      {/* HERO */}
      <section className="hero" id="hero">
        <div className="floating-paths" ref={paths1Ref}></div>
        <div className="floating-paths" ref={paths2Ref}></div>
        <div className="hero-badge">
          <span>New</span>
          Now available on the App Store
        </div>
        <h1>The <span className="accent">Social Calendar</span> for Workouts.</h1>
        <p>See what your friends are training, share your schedule, and show up together. No more group chat chaos.</p>
        <div className="hero-buttons">
          <a href={APP_STORE_URL} target="_blank" rel="noopener" className="btn-primary">
            Download on iOS
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </a>
          <a href="#how-it-works" className="btn-secondary">See How It Works</a>
        </div>
        <div className="hero-phone">
          <div className="phone-frame">
            <img src="/assets/images/radr-tilt.png" alt="Who's on your Radr?" />
          </div>
          <div className="phone-glow"></div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works">
        <div className="section-container">
          <p className="section-label">How It Works</p>
          <h2 className="section-title">Three steps to better workouts.</h2>
          <p className="section-subtitle">Radr makes it effortless to plan, share, and show up — together.</p>
          <div className="steps-grid">
            <div className="step-card fade-up">
              <div className="step-number">01</div>
              <h3>Share Your Schedule</h3>
              <p>Post your upcoming workouts to your calendar. Your friends see what you&apos;re doing and when — no texting required.</p>
            </div>
            <div className="step-card fade-up">
              <div className="step-number">02</div>
              <h3>Discover &amp; Join</h3>
              <p>Browse what your crew has planned. See a session you like? Tap to join and it&apos;s on both your calendars instantly.</p>
            </div>
            <div className="step-card fade-up">
              <div className="step-number">03</div>
              <h3>Show Up Together</h3>
              <p>Get reminders, coordinate logistics, and actually follow through. Working out with friends has never been easier.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features">
        <div className="section-container">
          <p className="section-label">Features</p>
          <h2 className="section-title">Everything you need.<br />Nothing you don&apos;t.</h2>
          <p className="section-subtitle">Built for people who want to move more — and do it with friends.</p>
          <div className="features-grid">
            <div className="feature-card fade-up">
              <div className="feature-icon">
                <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
              </div>
              <h3>Social Calendar</h3>
              <p>A shared view of what everyone&apos;s doing this week. Plan at a glance, not through a group chat.</p>
            </div>
            <div className="feature-card fade-up">
              <div className="feature-icon">
                <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>
              </div>
              <h3>Crew Workouts</h3>
              <p>Create sessions, invite friends, and build a crew that actually shows up. Accountability made easy.</p>
            </div>
            <div className="feature-card fade-up">
              <div className="feature-icon">
                <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>
              </div>
              <h3>Find People Nearby</h3>
              <p>Discover workout spots and friends near you. See who&apos;s training at Equinox, Barry&apos;s, or the local park.</p>
            </div>
            <div className="feature-card fade-up">
              <div className="feature-icon">
                <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><path d="M22 6l-10 7L2 6" /></svg>
              </div>
              <h3>Google Calendar Sync</h3>
              <p>Connect your Google Calendar so workouts live alongside your real schedule. Everything in one place.</p>
            </div>
            <div className="feature-card fade-up">
              <div className="feature-icon">
                <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
              </div>
              <h3>No More Group Chats</h3>
              <p>Stop scrolling through 47 messages to find out when the run is. Plans live on the calendar, not buried in texts.</p>
            </div>
            <div className="feature-card fade-up">
              <div className="feature-icon">
                <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
              </div>
              <h3>Smart Reminders</h3>
              <p>Get notified before sessions start and when friends join your workouts. Never miss a session you committed to.</p>
            </div>
          </div>
        </div>
      </section>

      {/* COMMUNITY */}
      <section id="community">
        <div className="section-container">
          <p className="section-label">Community</p>
          <h2 className="section-title">Fitness is better together.</h2>
          <p className="section-subtitle">Built for the people who show up — rain or shine.</p>
          <div className="photo-grid">
            <div className="photo-card fade-up">
              <img src="/assets/photos/trail-run-group.jpg" alt="Group trail run through the woods" />
              <div className="photo-caption">Share your schedule</div>
            </div>
            <div className="photo-card fade-up">
              <img src="/assets/photos/meetup-crew.jpg" alt="Friends meeting up after a workout in the park" />
              <div className="photo-caption">Meet up</div>
            </div>
            <div className="photo-card fade-up">
              <img src="/assets/photos/track-run-group.jpg" alt="Group running on the track at night" />
              <div className="photo-caption">Move together</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq">
        <div className="section-container" style={{ textAlign: "center" }}>
          <p className="section-label">FAQ</p>
          <h2 className="section-title">Frequently Asked Questions</h2>
        </div>
        <div className="faq-list">
          {[
            { q: "What is Radr?", a: "Radr is a social calendar for workouts. It lets you share your training schedule with friends, see what they\u2019re doing, and join sessions with a single tap \u2014 no group chats needed." },
            { q: "Is Radr free?", a: "Yes! Radr is free to use. We\u2019re building this for the community first. Premium features may come later, but the core experience will always be free." },
            { q: "Where can I download it?", a: "Radr is available now on the App Store for iOS. Android is coming soon." },
            { q: "What platforms will Radr be on?", a: "Radr is coming to both iOS and Android. We\u2019re building native apps so you get the best experience on whichever device you use." },
            { q: "Do I need my friends to sign up too?", a: "Radr works best when your crew is on it \u2014 but you can easily invite friends via a link. They can sign up in seconds and start sharing their schedule right away." },
          ].map((item, i) => (
            <div className="faq-item" key={i}>
              <button className="faq-question" onClick={toggleFaq}>
                {item.q}
                <svg className="faq-chevron" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
              </button>
              <div className="faq-answer">
                <p>{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" id="get-access">
        <div className="section-container">
          <div className="cta-box">
            <h2>What&apos;s on your Radr?</h2>
            <p>Download Radr and start sharing your workouts with friends today.</p>
            <a href={APP_STORE_URL} target="_blank" rel="noopener" className="btn-primary">
              Download on iOS
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <div className="footer-left">
            <img src="/assets/images/Radr blue logotype.png" alt="Radr" />
            <span>&copy; 2026 Radr. All rights reserved.</span>
          </div>
          <div className="footer-socials">
            <a href="https://instagram.com/getradr" target="_blank" rel="noopener" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><path d="M17.5 6.5h.01" /></svg>
            </a>
            <a href="https://tiktok.com/@getradr" target="_blank" rel="noopener" aria-label="TikTok">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13a8.28 8.28 0 005.58 2.17v-3.4a4.85 4.85 0 01-3.58-1.5V6.69h3.58z" /></svg>
            </a>
            <a href="https://x.com/getradr" target="_blank" rel="noopener" aria-label="X">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </a>
          </div>
          <ul className="footer-links">
            <li><a href="/terms.html">Terms of Use</a></li>
            <li><a href="/privacy.html">Privacy Policy</a></li>
            <li><a href="/cookies.html">Cookie Policy</a></li>
            <li><a href="mailto:getradrapp@gmail.com">Contact</a></li>
          </ul>
        </div>
      </footer>
    </>
  );
}

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
  @import url('https://fonts.cdnfonts.com/css/aileron');

  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --blue: #0C5DE9;
    --blue-light: #3A7EF2;
    --blue-dark: #0A4FC5;
    --night: #121212;
    --cream: #FFFFF7;
    --bg-dark: #0A0A0A;
    --bg-card: #1A1A1A;
    --bg-card-hover: #222222;
    --text-primary: #FFFFF7;
    --text-secondary: #A0A0A0;
    --text-muted: #666666;
    --border: #2A2A2A;
    --glow: rgba(12, 93, 233, 0.15);
  }

  html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; }
  body {
    font-family: 'IBM Plex Sans', -apple-system, sans-serif;
    background: var(--bg-dark);
    color: var(--text-primary);
    line-height: 1.7;
    overflow-x: hidden;
  }

  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    padding: 0 clamp(1.5rem, 5vw, 4rem); height: 72px;
    display: flex; align-items: center; justify-content: space-between;
    background: rgba(10, 10, 10, 0.85);
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(42, 42, 42, 0.5);
  }
  .nav-logo img { height: 28px; width: auto; }
  .nav-links { display: flex; align-items: center; gap: 2rem; list-style: none; }
  .nav-links a {
    color: var(--text-secondary); text-decoration: none;
    font-size: 0.875rem; font-weight: 500; letter-spacing: 0.01em;
    transition: color 0.2s ease;
  }
  .nav-links a:hover, .nav-links a:focus-visible { color: var(--text-primary); }
  .nav-cta {
    background: var(--blue); color: var(--cream) !important;
    padding: 0.5rem 1.25rem; border-radius: 8px; font-weight: 600;
    transition: transform 0.2s ease, background 0.2s ease;
  }
  .nav-cta:hover { background: var(--blue-dark); transform: translateY(-1px); }
  .nav-cta:active { transform: translateY(0); }
  .mobile-toggle {
    display: none; background: none; border: none;
    color: var(--text-primary); cursor: pointer; padding: 8px;
  }
  .mobile-toggle svg { display: block; }

  .hero {
    min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center; text-align: center;
    padding: 120px clamp(1.5rem, 5vw, 4rem) 60px; position: relative; overflow: hidden;
  }
  .hero::before {
    content: ''; position: absolute; top: -300px; left: 50%; transform: translateX(-50%);
    width: 900px; height: 900px;
    background: radial-gradient(circle, rgba(12, 93, 233, 0.1) 0%, transparent 65%);
    pointer-events: none;
  }

  .floating-paths {
    position: absolute; inset: 0; pointer-events: none; z-index: 0;
    opacity: 0; animation: pathsFadeIn 2s ease forwards;
  }
  @keyframes pathsFadeIn { to { opacity: 1; } }
  .floating-paths svg { width: 100%; height: 100%; }
  .floating-paths path { stroke-dasharray: 0.3 0.7; animation: pathFlow linear infinite; }
  @keyframes pathFlow { 0% { stroke-dashoffset: 1; } 100% { stroke-dashoffset: -1; } }

  .hero-badge, .hero h1, .hero p, .hero-buttons, .hero-phone { position: relative; z-index: 1; }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: 100px; padding: 0.4rem 1rem 0.4rem 0.6rem;
    font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: 2rem;
  }
  .hero-badge span {
    background: var(--blue); color: var(--cream); font-size: 0.6875rem;
    font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 100px;
    text-transform: uppercase; letter-spacing: 0.05em;
  }
  .hero h1 {
    font-family: 'Aileron', sans-serif; font-size: clamp(2.75rem, 7vw, 5rem);
    font-weight: 700; line-height: 1.08; letter-spacing: -0.03em;
    max-width: 720px; margin-bottom: 1.25rem; color: var(--cream);
  }
  .hero h1 .accent {
    background: linear-gradient(135deg, var(--blue), var(--blue-light));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .hero p {
    font-size: clamp(1rem, 2vw, 1.25rem); color: var(--text-secondary);
    max-width: 520px; margin-bottom: 2.5rem; line-height: 1.7;
  }
  .hero-buttons { display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; }

  .btn-primary {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: var(--blue); color: var(--cream); text-decoration: none;
    padding: 0.875rem 2rem; border-radius: 12px; font-weight: 600; font-size: 1rem;
    border: none; cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
    box-shadow: 0 4px 24px rgba(12, 93, 233, 0.3), 0 1px 3px rgba(0,0,0,0.3);
  }
  .btn-primary:hover {
    background: var(--blue-dark); transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(12, 93, 233, 0.4), 0 2px 6px rgba(0,0,0,0.3);
  }
  .btn-primary:active { transform: translateY(0); }
  .btn-secondary {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: var(--bg-card); color: var(--text-primary); text-decoration: none;
    padding: 0.875rem 2rem; border-radius: 12px; font-weight: 600; font-size: 1rem;
    border: 1px solid var(--border); cursor: pointer;
    transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
  }
  .btn-secondary:hover {
    background: var(--bg-card-hover); border-color: var(--text-muted); transform: translateY(-2px);
  }
  .btn-secondary:active { transform: translateY(0); }

  .hero-phone { margin-top: 4rem; position: relative; display: flex; justify-content: center; padding-bottom: 2rem; }
  .phone-frame { position: relative; width: 700px; max-width: 90vw; }
  .phone-frame img {
    display: block; width: 100%; height: auto;
    filter: drop-shadow(0 30px 60px rgba(0,0,0,0.4)) drop-shadow(0 0 60px rgba(12, 93, 233, 0.12));
  }
  .phone-glow {
    position: absolute; bottom: -40px; left: 50%; transform: translateX(-50%);
    width: 750px; height: 280px;
    background: radial-gradient(ellipse, rgba(12, 93, 233, 0.18) 0%, transparent 70%);
    pointer-events: none; z-index: 0;
  }

  section { padding: clamp(4rem, 10vw, 8rem) clamp(1.5rem, 5vw, 4rem); }
  .section-container { max-width: 1100px; margin: 0 auto; }
  .section-label {
    font-size: 0.8125rem; font-weight: 600; color: var(--blue);
    text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.75rem;
  }
  .section-title {
    font-family: 'Aileron', sans-serif; font-size: clamp(2rem, 4.5vw, 3rem);
    font-weight: 700; letter-spacing: -0.02em; line-height: 1.15;
    margin-bottom: 1rem; color: var(--cream);
  }
  .section-subtitle {
    font-size: clamp(1rem, 2vw, 1.125rem); color: var(--text-secondary);
    max-width: 560px; line-height: 1.7;
  }

  #how-it-works { border-top: 1px solid var(--border); }
  .steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; margin-top: 3.5rem; }
  .step-card {
    background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; padding: 2rem;
    transition: transform 0.3s ease, border-color 0.3s ease;
  }
  .step-card:hover { transform: translateY(-4px); border-color: rgba(12, 93, 233, 0.35); }
  .step-number {
    font-family: 'Aileron', sans-serif; font-size: 3rem; font-weight: 700;
    background: linear-gradient(135deg, var(--blue), var(--blue-light));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    line-height: 1; margin-bottom: 1.25rem;
  }
  .step-card h3 {
    font-family: 'Aileron', sans-serif; font-size: 1.25rem; font-weight: 600;
    margin-bottom: 0.75rem; letter-spacing: -0.01em; color: var(--cream);
  }
  .step-card p { color: var(--text-secondary); font-size: 0.9375rem; line-height: 1.65; }

  #features { border-top: 1px solid var(--border); }
  .features-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-top: 3.5rem; }
  .feature-card {
    background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; padding: 2rem;
    transition: transform 0.3s ease, border-color 0.3s ease;
  }
  .feature-card:hover { transform: translateY(-4px); border-color: rgba(12, 93, 233, 0.35); }
  .feature-icon {
    width: 48px; height: 48px; border-radius: 12px;
    background: rgba(12, 93, 233, 0.1);
    display: flex; align-items: center; justify-content: center; margin-bottom: 1.25rem;
  }
  .feature-icon svg { width: 24px; height: 24px; color: var(--blue); }
  .feature-card h3 {
    font-family: 'Aileron', sans-serif; font-size: 1.125rem; font-weight: 600;
    margin-bottom: 0.5rem; letter-spacing: -0.01em; color: var(--cream);
  }
  .feature-card p { color: var(--text-secondary); font-size: 0.9375rem; line-height: 1.65; }

  #community { border-top: 1px solid var(--border); }
  .photo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-top: 3.5rem; }
  .photo-card {
    border-radius: 20px; overflow: hidden; position: relative; aspect-ratio: 3 / 4;
    border: 1px solid var(--border); transition: transform 0.3s ease, border-color 0.3s ease;
  }
  .photo-card:hover { transform: translateY(-4px); border-color: rgba(12, 93, 233, 0.35); }
  .photo-card img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .photo-card::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(10, 10, 10, 0.6) 0%, transparent 50%);
    pointer-events: none;
  }
  .photo-card .photo-caption {
    position: absolute; bottom: 1.25rem; left: 1.25rem; z-index: 2;
    font-size: 0.875rem; font-weight: 600; color: var(--cream);
  }

  #faq { border-top: 1px solid var(--border); }
  .faq-list { max-width: 720px; margin: 3.5rem auto 0; }
  .faq-item { border-bottom: 1px solid var(--border); }
  .faq-question {
    width: 100%; background: none; border: none; color: var(--cream);
    font-family: 'IBM Plex Sans', sans-serif; font-size: 1rem; font-weight: 600;
    text-align: left; padding: 1.5rem 0; cursor: pointer;
    display: flex; align-items: center; justify-content: space-between; gap: 1rem;
    transition: color 0.2s ease;
  }
  .faq-question:hover { color: var(--blue-light); }
  .faq-question:focus-visible { outline: 2px solid var(--blue); outline-offset: 4px; border-radius: 4px; }
  .faq-chevron {
    flex-shrink: 0; width: 20px; height: 20px; color: var(--text-muted);
    transition: transform 0.3s ease;
  }
  .faq-item.open .faq-chevron { transform: rotate(180deg); }
  .faq-answer { max-height: 0; overflow: hidden; transition: max-height 0.35s ease, padding 0.35s ease; }
  .faq-item.open .faq-answer { max-height: 200px; }
  .faq-answer p { color: var(--text-secondary); font-size: 0.9375rem; line-height: 1.7; padding-bottom: 1.5rem; }

  .cta-section { border-top: 1px solid var(--border); text-align: center; }
  .cta-box {
    max-width: 640px; margin: 0 auto;
    background: linear-gradient(135deg, rgba(12, 93, 233, 0.1) 0%, rgba(12, 93, 233, 0.02) 100%);
    border: 1px solid rgba(12, 93, 233, 0.25); border-radius: 24px;
    padding: clamp(3rem, 6vw, 4rem); position: relative; overflow: hidden;
  }
  .cta-box::before {
    content: ''; position: absolute; top: -100px; left: 50%; transform: translateX(-50%);
    width: 500px; height: 400px;
    background: radial-gradient(circle, rgba(12, 93, 233, 0.1) 0%, transparent 70%);
    pointer-events: none;
  }
  .cta-box h2 {
    font-family: 'Aileron', sans-serif; font-size: clamp(1.75rem, 4vw, 2.5rem);
    font-weight: 700; letter-spacing: -0.02em; margin-bottom: 0.75rem;
    position: relative; color: var(--cream);
  }
  .cta-box p { color: var(--text-secondary); margin-bottom: 2rem; font-size: 1.0625rem; position: relative; }
  .cta-box .btn-primary { position: relative; }

  footer { border-top: 1px solid var(--border); padding: 3rem clamp(1.5rem, 5vw, 4rem); }
  .footer-inner {
    max-width: 1100px; margin: 0 auto; display: flex;
    align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem;
  }
  .footer-left { display: flex; align-items: center; gap: 1.5rem; }
  .footer-left img { height: 22px; width: auto; }
  .footer-left span { color: var(--text-muted); font-size: 0.8125rem; }
  .footer-socials { display: flex; align-items: center; gap: 1rem; }
  .footer-socials a { color: var(--text-muted); transition: color 0.2s ease; }
  .footer-socials a:hover { color: var(--text-primary); }
  .footer-socials svg { width: 20px; height: 20px; }
  .footer-links { display: flex; gap: 1.5rem; list-style: none; }
  .footer-links a { color: var(--text-muted); text-decoration: none; font-size: 0.8125rem; transition: color 0.2s ease; }
  .footer-links a:hover { color: var(--text-primary); }

  @media (max-width: 768px) {
    .nav-links { display: none; }
    .nav-links.open {
      display: flex; flex-direction: column; position: absolute;
      top: 72px; left: 0; right: 0; background: var(--bg-dark);
      border-bottom: 1px solid var(--border); padding: 1.5rem; gap: 1.25rem;
    }
    .mobile-toggle { display: block; }
    .steps-grid { grid-template-columns: 1fr; }
    .features-grid { grid-template-columns: 1fr; }
    .photo-grid { grid-template-columns: 1fr; }
    .footer-inner { flex-direction: column; text-align: center; }
    .phone-frame { width: 480px; }
  }

  .fade-up { opacity: 0; transform: translateY(30px); }
  .fade-up.visible {
    opacity: 1; transform: translateY(0);
    transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .fade-up.visible:nth-child(2) { transition-delay: 0.1s; }
  .fade-up.visible:nth-child(3) { transition-delay: 0.2s; }
  .fade-up.visible:nth-child(4) { transition-delay: 0.3s; }
`;
