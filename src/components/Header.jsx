import React from 'react';

export default function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        {/* Brand Lockup with Transparent White Logo */}
        <a href="#home" className="header-brand-lockup">
          <div className="brand-logo-crest">
            <img src="/logo.png" alt="Malas Electronics" className="header-logo-img" />
          </div>
          <div className="brand-header-text">
            <span className="brand-primary-name">MALAS ELECTRONICS</span>
            <span className="brand-header-spec">AV SYSTEMS INTEGRATOR</span>
          </div>
        </a>

        {/* Center Navigation */}
        <nav className="header-desktop-nav" aria-label="Main Navigation">
          <ul className="nav-links-list">
            <li><a href="#services" className="nav-link-anchor">Activities</a></li>
            <li><a href="#projects" className="nav-link-anchor">Projects</a></li>
            <li><a href="#about" className="nav-link-anchor">About</a></li>
            <li><a href="#contact" className="nav-link-anchor">Contact</a></li>
          </ul>
        </nav>

        {/* Right Action: Apple-style White Pill Button */}
        <div>
          <a href="#contact" className="btn-apple-pill">
            Get in Touch
          </a>
        </div>
      </div>
    </header>
  );
}
