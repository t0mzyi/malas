import React from 'react';
import { SITE_DATA } from '../data/siteData';

export default function AboutSection() {
  return (
    <section id="about" className="section-wrapper bg-elevated">
      <div className="container">
        <div className="apple-about-grid">
          {/* Left Text */}
          <div className="apple-about-narrative">
            <span className="apple-kicker">About Malas Electronics</span>
            <h3 className="apple-about-headline">
              15+ Years of Systems Integration in Dubai & UAE.
            </h3>
            <p className="apple-about-paragraph">
              Malas Electronics LLC is an established systems integrator delivering end-to-end Audio-Visual, acoustic engineering, and automation solutions. We operate across corporate, commercial, hospitality, education, and luxury residential sectors.
            </p>
            <p className="apple-about-paragraph">
              Every installation conforms to international Avixa performance standards, backed by certified brand hardware and active 24/7 emergency maintenance contracts.
            </p>
            <div style={{ marginTop: '28px' }}>
              <a href="#contact" className="btn-apple-solid">
                Consult With Our Engineers &rarr;
              </a>
            </div>
          </div>

          {/* Right Rounded Stat Cards (NO GRADIENTS) */}
          <div className="apple-about-stats-stack">
            <div className="apple-stat-card">
              <div className="apple-stat-number">500+</div>
              <div className="apple-stat-label">AV Projects Delivered Across UAE</div>
            </div>
            <div className="apple-stat-card">
              <div className="apple-stat-number">15+</div>
              <div className="apple-stat-label">Years Established in Dubai</div>
            </div>
            <div className="apple-stat-card">
              <div className="apple-stat-number">&lt; 2h</div>
              <div className="apple-stat-label">Emergency SLA On-Site Dispatch</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
