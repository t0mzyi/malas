import React, { useState, useEffect } from 'react';

export default function Header({ theme = 'white', onToggleTheme }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBrand, setShowBrand] = useState(false);

  // Local theme fallback if not passed from parent
  const [localTheme, setLocalTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('/white') || window.location.search.toLowerCase().includes('white')) {
        return 'white';
      }
    }
    return theme || 'white';
  });

  const activeTheme = onToggleTheme ? theme : localTheme;

  const handleToggle = () => {
    if (onToggleTheme) {
      onToggleTheme();
    } else {
      const nextTheme = localTheme === 'white' ? 'dark' : 'white';
      setLocalTheme(nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
      try {
        localStorage.setItem('malas_theme_user_set', nextTheme);
        localStorage.setItem('malas_theme', nextTheme);
      } catch {}
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const heroBrand = document.getElementById('hero-brand-lockup');
      if (heroBrand) {
        const rect = heroBrand.getBoundingClientRect();
        // Reveal in navbar when the hero brand lockup scrolls out of view above navbar (~72px)
        setShowBrand(rect.bottom <= 72);
      } else {
        setShowBrand(window.scrollY > 120);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <header className="site-header">
        <div className="container">
          <div className="header-inner">
            {/* Brand Identity: Hidden while hero brand is visible, smoothly reveals on scroll */}
            <a
              href="#home"
              className={`header-brand ${showBrand ? 'is-scrolled-visible' : 'is-scrolled-hidden'}`}
              aria-label="Malas Electronics Home"
            >
              <div className="header-logo-frame">
                <img src="/logo.png" alt="Malas Electronics" />
              </div>
              <span className="header-brand-title">MALAS ELECTRONICS</span>
            </a>

            {/* Desktop Navigation */}
            <nav className="header-nav" aria-label="Primary Navigation">
              <ul className="header-nav-list">
                <li><a href="#services" className="header-nav-link">Activities</a></li>
                <li><a href="#projects" className="header-nav-link">Projects</a></li>
                <li><a href="#process" className="header-nav-link">Execution</a></li>
                <li><a href="#about" className="header-nav-link">Standards</a></li>
                <li><a href="#contact" className="header-nav-link">Contact</a></li>
              </ul>
            </nav>

            {/* Direct Contact & Mobile Actions */}
            <div className="header-actions">
              {/* Theme Toggle Button (Dark / White) */}
              <button
                type="button"
                className="theme-toggle-btn"
                onClick={handleToggle}
                aria-label={`Switch to ${activeTheme === 'white' ? 'Dark' : 'White'} Mode`}
                title={`Switch to ${activeTheme === 'white' ? 'Dark' : 'White'} Mode`}
              >
                {activeTheme === 'white' ? (
                  // Moon Icon for switching to Dark Mode
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                ) : (
                  // Sun Icon for switching to White Mode
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                )}
              </button>

              {/* Mobile Quick Call Button */}
              <a
                href="tel:+97140000000"
                className="mobile-quick-call-btn"
                aria-label="Call Malas Electronics Dubai"
                title="Call Malas Electronics"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </a>

              {/* Desktop RFP Button */}
              <a href="#contact" className="btn-primary desktop-only" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                Request Proposal
              </a>

              {/* Mobile Hamburger Button */}
              <button
                className={`mobile-menu-btn ${mobileMenuOpen ? 'is-active' : ''}`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
                aria-expanded={mobileMenuOpen}
              >
                <span className="burger-bar top-bar"></span>
                <span className="burger-bar middle-bar"></span>
                <span className="burger-bar bottom-bar"></span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Mobile Drawer Overlay */}
      <div
        className={`mobile-drawer-backdrop ${mobileMenuOpen ? 'is-open' : ''}`}
        onClick={closeMenu}
        aria-hidden={!mobileMenuOpen}
      />

      <aside
        className={`mobile-drawer ${mobileMenuOpen ? 'is-open' : ''}`}
        aria-label="Mobile Navigation"
        aria-hidden={!mobileMenuOpen}
      >
        <div className="mobile-drawer-header">
          <div className="mobile-drawer-brand">
            <img src="/logo.png" alt="Malas Electronics" className="drawer-logo" />
            <div>
              <span className="drawer-brand-name">MALAS ELECTRONICS</span>
              <span className="drawer-brand-sub">AV SYSTEMS INTEGRATOR · DUBAI</span>
            </div>
          </div>
          <button
            className="drawer-close-btn"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            &times;
          </button>
        </div>

        <nav className="mobile-drawer-nav">
          <ul className="drawer-nav-list">
            <li>
              <a href="#services" onClick={closeMenu} className="drawer-nav-link">
                <span className="drawer-link-text">Audio-Visual Activities</span>
                <span className="drawer-link-arrow">&rarr;</span>
              </a>
            </li>
            <li>
              <a href="#projects" onClick={closeMenu} className="drawer-nav-link">
                <span className="drawer-link-text">Project Showcase</span>
                <span className="drawer-link-arrow">&rarr;</span>
              </a>
            </li>
            <li>
              <a href="#process" onClick={closeMenu} className="drawer-nav-link">
                <span className="drawer-link-text">Execution Standard</span>
                <span className="drawer-link-arrow">&rarr;</span>
              </a>
            </li>
            <li>
              <a href="#about" onClick={closeMenu} className="drawer-nav-link">
                <span className="drawer-link-text">Technical Standards & SLA</span>
                <span className="drawer-link-arrow">&rarr;</span>
              </a>
            </li>
            <li>
              <a href="#contact" onClick={closeMenu} className="drawer-nav-link">
                <span className="drawer-link-text">Contact Engineers</span>
                <span className="drawer-link-arrow">&rarr;</span>
              </a>
            </li>
          </ul>
        </nav>

        {/* Quick Contact & Action Section in Mobile Drawer */}
        <div className="mobile-drawer-footer">

          <div className="drawer-contact-cards">
            <a href="tel:+97140000000" className="drawer-contact-pill">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span>+971 4 000 0000</span>
            </a>
            <a href="mailto:info@malaselectronics.com" className="drawer-contact-pill">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </svg>
              <span>Email Engineers</span>
            </a>
          </div>

          <div className="drawer-theme-toggle-row">
            <span className="drawer-theme-label">Interface Appearance</span>
            <button
              type="button"
              className="drawer-theme-toggle-btn"
              onClick={handleToggle}
            >
              {activeTheme === 'white' ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                  <span>White Mode</span>
                </>
              )}
            </button>
          </div>

          <a href="#contact" onClick={closeMenu} className="btn-primary drawer-rfp-btn">
            Request Systems Proposal &rarr;
          </a>
        </div>
      </aside>
    </>
  );
}
