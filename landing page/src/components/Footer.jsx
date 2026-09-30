import React from 'react';
import { SITE_DATA } from '../data/siteData';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="site-footer-lux">
      {/* Pre-Footer Action Banner */}
      <div className="footer-pre-strip">
        <div className="container footer-pre-container">
          <div className="footer-pre-left">
            <span className="footer-pre-kicker">Licensed UAE Systems Contractor</span>
            <h3 className="footer-pre-title">Ready to Engineer Your AV Architecture?</h3>
          </div>
          <div className="footer-pre-actions">
            <a href="tel:+97140000000" className="btn-secondary footer-action-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span>+971 4 000 0000</span>
            </a>
            <a href="#contact" className="btn-primary footer-action-btn">
              Request Systems Proposal &rarr;
            </a>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Main Footer Grid */}
        <div className="footer-main-grid">
          {/* Brand Authority Column */}
          <div className="footer-brand-col">
            <a href="#home" className="footer-brand-lockup" aria-label="Malas Electronics Home">
              <div className="footer-logo-frame">
                <img src="/logo.png" alt="Malas Electronics Official Logo" />
              </div>
              <div className="footer-brand-text">
                <span className="footer-brand-title">MALAS ELECTRONICS</span>
                <span className="footer-brand-tag">SYSTEMS INTEGRATOR · DUBAI</span>
              </div>
            </a>
            <p className="footer-brand-summary">
              Turnkey engineering contractor delivering broadcast-grade auditoriums, luxury residential automation, and corporate conferencing environments across the UAE.
            </p>

            <div className="footer-trust-strip">
              <span className="footer-trust-pill">Avixa CTS Practice</span>
              <span className="footer-trust-pill">UAE Licensed Contractor</span>
            </div>
          </div>

          {/* Links Grid: On mobile, collapses into a clean 2-column micro-grid */}
          <div className="footer-links-wrapper">
            {/* Col: AV Activities */}
            <div className="footer-nav-col">
              <h4 className="footer-col-header">AV Activities</h4>
              <ul className="footer-link-list">
                <li><a href="#services">Audio Systems & DSP</a></li>
                <li><a href="#services">LED Video Walls</a></li>
                <li><a href="#services">Video Production</a></li>
                <li><a href="#services">Architectural Lighting</a></li>
                <li><a href="#services">Smart Boardrooms</a></li>
                <li><a href="#services">Digital Signage</a></li>
              </ul>
            </div>

            {/* Col: Engineered Projects */}
            <div className="footer-nav-col">
              <h4 className="footer-col-header">Projects</h4>
              <ul className="footer-link-list">
                <li><a href="#projects">Auditorium Installations</a></li>
                <li><a href="#projects">Corporate Boardrooms</a></li>
                <li><a href="#projects">Control Rooms</a></li>
                <li><a href="#projects">Luxury Home Theatres</a></li>
                <li><a href="#projects">Broadcast Studios</a></li>
                <li><a href="#projects">Commercial Venues</a></li>
              </ul>
            </div>

            {/* Col: Dubai HQ Operations */}
            <div className="footer-nav-col footer-ops-col">
              <h4 className="footer-col-header">Dubai Operations</h4>
              <ul className="footer-link-list">
                <li className="footer-ops-item">
                  <span className="footer-ops-label">Headquarters</span>
                  <span className="footer-ops-val">{SITE_DATA.company.location}</span>
                </li>
                <li className="footer-ops-item">
                  <span className="footer-ops-label">Direct Lines</span>
                  <div className="footer-ops-links">
                    <a href={`tel:${SITE_DATA.company.phoneLandline.replace(/\s+/g, '')}`}>
                      {SITE_DATA.company.phoneLandline}
                    </a>
                  </div>
                </li>
                <li className="footer-ops-item">
                  <span className="footer-ops-label">Inquiries</span>
                  <a href={`mailto:${SITE_DATA.company.emailSales}`} className="footer-ops-val footer-email-link">
                    {SITE_DATA.company.emailSales}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sub-Footer / Copyright & Back to Top */}
        <div className="footer-sub-bar">
          <span className="footer-copy">
            &copy; {new Date().getFullYear()} {SITE_DATA.company.name}. All rights reserved.
          </span>
          <div className="footer-sub-actions">
            <span className="footer-jurisdiction">Dubai · Abu Dhabi · UAE</span>
            <span className="footer-sep">·</span>
            <button type="button" onClick={scrollToTop} className="footer-back-to-top-btn" aria-label="Back to top">
              Back to Top &uarr;
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
