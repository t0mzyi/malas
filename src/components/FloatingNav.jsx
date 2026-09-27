import React, { useState, useEffect } from 'react';
import { SITE_DATA } from '../data/siteData';

export default function FloatingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <div className="floating-nav-wrapper">
        <nav className={`floating-nav-pill ${scrolled ? 'scrolled' : ''}`} aria-label="Main Navigation">
          {/* Logo */}
          <a href="#" className="nav-brand-pill" aria-label="Malas Electronics Home">
            <img src={SITE_DATA.company.logo} alt="Malas Electronics" className="nav-brand-pill-logo" />
            <span className="nav-brand-pill-text">Malas Electronics</span>
          </a>

          {/* Desktop Nav Links (No Products link) */}
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
          <li><a href="#services" className="nav-pill-link" onClick={handleLinkClick}>Services</a></li>
          <li><a href="#about" className="nav-pill-link" onClick={handleLinkClick}>About</a></li>
          <li><a href="#brands" className="nav-pill-link" onClick={handleLinkClick}>Brands</a></li>
          <li><a href="#process" className="nav-pill-link" onClick={handleLinkClick}>Process</a></li>
          <li><a href="#contact" className="nav-pill-link" onClick={handleLinkClick}>Contact</a></li>
        </ul>
        <a href="#contact" className="btn btn-primary" style={{ width: '100%' }} onClick={handleLinkClick}>
          Request Consultation
        </a>
      </div>
    </>
  );
}
