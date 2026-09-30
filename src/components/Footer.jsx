import React from 'react';
import { SITE_DATA } from '../data/siteData';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top-grid">
          {/* Brand Bio */}
          <div className="footer-brand-bio">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#11141B', border: '1px solid #1E232E' }}>
                <img src="/logo.png" alt="Malas Electronics" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-pure)', fontSize: '1.05rem' }}>
                MALAS ELECTRONICS
              </span>
            </div>
            <p>
              Premier Audio-Visual systems integrator and engineering contractor. Licensed and operating across Dubai, Abu Dhabi, Sharjah, and the Northern Emirates.
            </p>
          </div>

          {/* Core Activities */}
          <div>
            <h4 className="footer-column-heading">Activities</h4>
            <ul className="footer-link-list">
              <li><a href="#services">Audio Setup & DSP</a></li>
              <li><a href="#services">LED Video Walls</a></li>
              <li><a href="#services">Video Production</a></li>
              <li><a href="#services">Stage & Event Lighting</a></li>
              <li><a href="#services">Smart Meeting Rooms</a></li>
              <li><a href="#services">Digital Signage</a></li>
            </ul>
          </div>

          {/* Project Types */}
          <div>
            <h4 className="footer-column-heading">Projects</h4>
            <ul className="footer-link-list">
              <li><a href="#projects">Auditorium AV</a></li>
              <li><a href="#projects">Boardroom Systems</a></li>
              <li><a href="#projects">Control Rooms</a></li>
              <li><a href="#projects">Luxury Home Cinema</a></li>
              <li><a href="#projects">Classroom Training</a></li>
              <li><a href="#projects">Commercial Sound</a></li>
            </ul>
          </div>

          {/* Engineering HQ */}
          <div>
            <h4 className="footer-column-heading">Dubai Operations</h4>
            <ul className="footer-link-list">
              <li style={{ color: 'var(--text-body)', fontSize: '0.85rem' }}>
                {SITE_DATA.company.location}
              </li>
              <li>
                <a href={`tel:${SITE_DATA.company.phoneLandline.replace(/\s+/g, '')}`}>
                  {SITE_DATA.company.phoneLandline}
                </a>
              </li>
              <li>
                <a href={`mailto:${SITE_DATA.company.emailSales}`}>
                  {SITE_DATA.company.emailSales}
                </a>
              </li>
              <li style={{ color: 'var(--accent-bronze)', fontSize: '0.8rem', marginTop: '6px' }}>
                Emergency SLA Dispatch: Active 24/7
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <div>
            © {new Date().getFullYear()} {SITE_DATA.company.name}. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>Avixa CTS-D & CTS-I Certified Practice</span>
            <span>Dubai, United Arab Emirates</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
