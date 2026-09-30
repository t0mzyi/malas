import React from 'react';
import { SITE_DATA } from '../data/siteData';

export default function AboutSection() {
  return (
    <section id="about" className="section-wrapper" aria-labelledby="about-title">
      <div className="container">
        <div className="standards-split-layout">
          {/* Narrative Column */}
          <div className="standards-narrative">
            <span className="section-kicker">Integrity & Heritage</span>
            <h2 id="about-title" className="section-title">
              15+ Years of Systems Integration in Dubai & UAE.
            </h2>
            <p>
              Malas Electronics LLC is an authorized systems integrator delivering turnkey Audio-Visual, acoustic engineering, and automation solutions. We operate across corporate, commercial, hospitality, education, and luxury residential sectors.
            </p>
            <p>
              Every installation conforms to international Avixa performance standards, backed by certified brand hardware and active 24/7 emergency maintenance contracts.
            </p>

            <div className="standards-cert-pill-row">
              <span className="standards-cert-pill">Avixa CTS-D & CTS-I Standards</span>
              <span className="standards-cert-pill">Dante Network Certified</span>
              <span className="standards-cert-pill">Authorized Tier-1 Hardware</span>
            </div>

            <div>
              <a href="#contact" className="btn-primary">
                Consult With Our Engineers
              </a>
            </div>
          </div>

          {/* Telemetry Metric Stack */}
          <div className="standards-telemetry-panel">
            <div className="standards-metric-tile">
              <span className="standards-metric-num">500+</span>
              <div>
                <div className="standards-metric-text">AV Projects Delivered</div>
                <div className="standards-metric-sub">Commercial, corporate, and luxury venues across the UAE</div>
              </div>
            </div>

            <div className="standards-metric-tile">
              <span className="standards-metric-num">15+</span>
              <div>
                <div className="standards-metric-text">Years UAE Experience</div>
                <div className="standards-metric-sub">Continuous presence and licensed operations in Dubai</div>
              </div>
            </div>

            <div className="standards-metric-tile">
              <span className="standards-metric-num">&lt; 2h</span>
              <div>
                <div className="standards-metric-text">Emergency SLA On-Site Dispatch</div>
                <div className="standards-metric-sub">Rapid technical response active across Dubai and Abu Dhabi</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
