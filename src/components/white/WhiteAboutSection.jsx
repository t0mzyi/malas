import React from 'react';
import { SITE_DATA } from '../../data/siteData';

export default function WhiteAboutSection() {
  return (
    <section id="s-about" className="simple-section bg-subtle">
      <div className="white-container">
        <div className="simple-about-grid">
          {/* Left Narrative */}
          <div className="simple-about-text">
            <span className="simple-kicker">About Malas Electronics</span>
            <h3>15+ Years of Systems Integration in Dubai & UAE.</h3>
            <p>
              Malas Electronics LLC is an established systems integrator delivering end-to-end Audio-Visual, acoustic engineering, and automation solutions. We operate across corporate, commercial, hospitality, education, and luxury residential sectors.
            </p>
            <p>
              Every installation conforms to international Avixa performance standards, backed by certified brand hardware and active 24/7 emergency maintenance contracts.
            </p>
            <div style={{ marginTop: '24px' }}>
              <a href="#s-contact" className="simple-btn-primary">
                Consult With Our Engineers &rarr;
              </a>
            </div>
          </div>

          {/* Right Simple Stats */}
          <div className="simple-stats-list">
            <div className="simple-stat-box">
              <div className="simple-stat-val">500+</div>
              <div className="simple-stat-lbl">AV Projects Delivered Across UAE</div>
            </div>
            <div className="simple-stat-box">
              <div className="simple-stat-val">15+</div>
              <div className="simple-stat-lbl">Years Established in Dubai</div>
            </div>
            <div className="simple-stat-box">
              <div className="simple-stat-val">&lt; 2h</div>
              <div className="simple-stat-lbl">Emergency SLA On-Site Dispatch</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
