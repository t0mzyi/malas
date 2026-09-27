import React from 'react';
import { SITE_DATA } from '../data/siteData';

export default function AboutSection() {
  return (
    <section id="about" className="section-wrapper" aria-labelledby="about-title">
      <div className="container">
        <div className="about-showcase-grid">
          {/* Left Text Block */}
          <div>
            <span className="service-category-tag">About Malas Electronics LLC</span>
            <blockquote className="about-quote">
              "At the forefront of technological innovation, delivering comprehensive solutions designed to power the future."
            </blockquote>
            <p style={{ color: 'var(--gold-bright)', fontSize: '1.05rem', fontWeight: 500, marginBottom: '16px', lineHeight: 1.6 }}>
              {SITE_DATA.about.highlight}
            </p>
            <p className="about-desc">
              {SITE_DATA.about.description}
            </p>
            <div>
              <a href="#contact" className="btn btn-primary">
                Consult With Our Specialists
              </a>
            </div>
          </div>

          {/* Right Media Block with Real Facility Photo */}
          <div className="about-media-wrap">
            <img
              src={SITE_DATA.about.image}
              alt={SITE_DATA.about.imageAlt}
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
