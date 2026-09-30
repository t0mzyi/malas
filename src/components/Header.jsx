import React, { useState, useEffect } from 'react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            {/* Brand Identity: Logo + MALAS ELECTRONICS */}
            <a
              href="#home"
              className="header-brand"
              aria-label="Malas Electronics Home"
            >
              <div className="header-logo-frame">
                <img src="/logo.png" alt="Malas Electronics" />
              </div>
              <span className="header-brand-title">MALAS ELECTRONICS</span>
            </a>

            {/* Hamburger Menu Button */}
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
          <div className="drawer-status-pill">
            <span className="status-live-dot"></span>
            <span>Dubai Engineering Center Active · 24/7 SLA</span>
          </div>

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

          <a href="#contact" onClick={closeMenu} className="btn-primary drawer-rfp-btn">
            Request Systems Proposal &rarr;
          </a>
        </div>
      </aside>
    </>
  );
}
