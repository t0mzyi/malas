import React, { useState, useEffect } from 'react';
import { SITE_DATA } from '../data/siteData';

export default function FloatingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('menu-locked');
    } else {
      document.body.classList.remove('menu-locked');
    }
    return () => document.body.classList.remove('menu-locked');
  }, [mobileMenuOpen]);

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <div className="floating-nav-wrapper">
        <nav className={`floating-nav-pill ${scrolled ? 'scrolled' : ''}`} aria-label="Main Navigation">
          {/* Logo & Brand Name */}
          <a href="#" className="nav-brand-pill" aria-label="Malas Electronics Home" onClick={handleLinkClick}>
            <img src={SITE_DATA.company.logo} alt="Malas Electronics" className="nav-brand-pill-logo" />
            <span className="nav-brand-pill-text">Malas Electronics</span>
          </a>

          {/* Desktop Nav Links */}
          <ul className="nav-pill-links">
            <li><a href="#services" className="nav-pill-link">Services</a></li>
            <li><a href="#about" className="nav-pill-link">About</a></li>
            <li><a href="#brands" className="nav-pill-link">Brands</a></li>
            <li><a href="#process" className="nav-pill-link">Process</a></li>
            <li><a href="#contact" className="nav-pill-link">Contact</a></li>
          </ul>

          {/* Desktop CTA Pill */}
          <div className="nav-pill-cta">
            <a href="#contact" className="btn btn-primary">Request Consultation</a>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            className="nav-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </nav>
      </div>

      {/* Mobile Drawer Overlay */}
      <div className={`mobile-drawer-overlay ${mobileMenuOpen ? 'open' : ''}`}>
        <ul className="mobile-drawer-links">
          <li>
            <a href="#services" className="mobile-drawer-item" onClick={handleLinkClick}>
              <span>Services</span>
              <span className="arrow">&rarr;</span>
            </a>
          </li>
          <li>
            <a href="#about" className="mobile-drawer-item" onClick={handleLinkClick}>
              <span>About</span>
              <span className="arrow">&rarr;</span>
            </a>
          </li>
          <li>
            <a href="#brands" className="mobile-drawer-item" onClick={handleLinkClick}>
              <span>Brands</span>
              <span className="arrow">&rarr;</span>
            </a>
          </li>
          <li>
            <a href="#process" className="mobile-drawer-item" onClick={handleLinkClick}>
              <span>Process</span>
              <span className="arrow">&rarr;</span>
            </a>
          </li>
          <li>
            <a href="#contact" className="mobile-drawer-item" onClick={handleLinkClick}>
              <span>Contact</span>
              <span className="arrow">&rarr;</span>
            </a>
          </li>
        </ul>
        <a href="#contact" className="btn btn-primary" style={{ width: '100%' }} onClick={handleLinkClick}>
          Request Consultation
        </a>
      </div>
    </>
  );
}
