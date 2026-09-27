import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            className="mobile-drawer-overlay open"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <ul className="mobile-drawer-links">
              {[
                { label: 'Services', href: '#services' },
                { label: 'About', href: '#about' },
                { label: 'Brands', href: '#brands' },
                { label: 'Process', href: '#process' },
                { label: 'Contact', href: '#contact' }
              ].map((link, idx) => (
                <motion.li 
                  key={link.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + (idx * 0.05), duration: 0.3 }}
                >
                  <a href={link.href} className="mobile-drawer-item" onClick={handleLinkClick}>
                    <span>{link.label}</span>
                    <span className="arrow">&rarr;</span>
                  </a>
                </motion.li>
              ))}
            </ul>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <a href="#contact" className="btn btn-primary" style={{ width: '100%' }} onClick={handleLinkClick}>
                Request Consultation
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
