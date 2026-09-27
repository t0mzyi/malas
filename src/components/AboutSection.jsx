import React from 'react';
import { SITE_DATA } from '../data/siteData';

export default function AboutSection() {
  return (
    <section id="about" className="section-wrapper" aria-labelledby="about-title">
      <div className="container">
        <div className="about-showcase-grid">
          {/* Left Text Block */}
          <div>
            <span className="hero-tag">The Malas Standard</span>
            <blockquote className="about-quote">
              "{SITE_DATA.about.quote}"
            </blockquote>
            <p className="about-desc">
              {SITE_DATA.about.description}
            </p>
            <div>
              <a href="#contact" className="btn btn-primary">
                Discuss Your Facility
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
