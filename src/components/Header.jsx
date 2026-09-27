import React, { useState, useEffect } from 'react';
import { SITE_DATA } from '../data/siteData';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header-nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="nav-grid">
          {/* Logo & Brand Name */}
          <a href="#" className="nav-brand" aria-label="Malas Electronics Home">
            <img src={SITE_DATA.company.logo} alt="Malas Electronics LLC logo" className="nav-brand-logo" />
            <div className="nav-brand-text">
              <span className="nav-brand-name">Malas Electronics LLC</span>
              <span className="nav-brand-sub">Dubai · UAE</span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <ul className="nav-links">
            <li><a href="#services" className="nav-link">Services</a></li>
            <li><a href="#products" className="nav-link">Products</a></li>
            <li><a href="#brands" className="nav-link">Brands</a></li>
            <li><a href="#process" className="nav-link">Process</a></li>
            <li><a href="#contact" className="nav-link">Contact</a></li>
          </ul>

          {/* Nav CTA */}
          <div className="nav-cta">
            <a href="#contact" className="btn btn-primary">Request a Consultation</a>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            className="mobile-nav-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div className={`mobile-menu-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <ul className="mobile-menu-links">
          <li><a href="#services" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Services</a></li>
          <li><a href="#products" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Products</a></li>
          <li><a href="#brands" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Brands</a></li>
          <li><a href="#process" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Process</a></li>
          <li><a href="#contact" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Contact</a></li>
        </ul>
        <a href="#contact" className="btn btn-primary" style={{ width: '100%' }} onClick={() => setMobileMenuOpen(false)}>
          Request a Consultation
        </a>
      </div>
    </header>
  );
}
