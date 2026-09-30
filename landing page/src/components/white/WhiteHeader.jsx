import React from 'react';
import { SITE_DATA } from '../../data/siteData';

export default function WhiteHeader() {
  return (
    <header className="white-header">
      <div className="white-container">
        <div className="white-header-inner">
          {/* Logo & Title */}
          <a href="#s-hero" className="white-brand">
            <div className="white-brand-logo">
              <img src={SITE_DATA.company.logo} alt="Malas Electronics" />
            </div>
            <span className="white-brand-title">Malas Electronics</span>
          </a>

          {/* Simple Navigation */}
          <nav aria-label="Main Navigation">
            <ul className="white-nav-links">
              <li><a href="#s-services" className="white-nav-a">Activities</a></li>
              <li><a href="#s-projects" className="white-nav-a">Projects</a></li>
              <li><a href="#s-about" className="white-nav-a">About</a></li>
              <li><a href="#s-contact" className="white-nav-a">Contact</a></li>
            </ul>
          </nav>

          {/* Contact Button */}
          <a href="#s-contact" className="white-header-cta">
            Get in Touch
          </a>
        </div>
      </div>
    </header>
  );
}
