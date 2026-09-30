import React from 'react';
import { SITE_DATA } from '../../data/siteData';

export default function WhiteHeroSection() {
  return (
    <section id="s-hero" className="simple-hero">
      <div className="white-container">
        {/* Simple Pill */}
        <div className="simple-hero-badge">
          <span>Malas Electronics LLC · Dubai, UAE</span>
        </div>

        {/* Clear Headline */}
        <h1 className="simple-hero-title">
          Complete Audio-Visual Integration & <span>Event Technology.</span>
        </h1>

        {/* Clear Description of What They Do */}
        <p className="simple-hero-desc">
          We design, install, and support professional sound systems, LED video walls, live streaming production, smart meeting rooms, and corporate event technology across Dubai and the UAE.
        </p>

        {/* Action Buttons */}
        <div className="simple-hero-actions">
          <a href="#s-contact" className="simple-btn-primary">
            Request an AV Proposal &rarr;
          </a>
          <a href="#s-projects" className="simple-btn-secondary">
            View 15 Projects
          </a>
        </div>

        {/* Single Framed Hero Image */}
        <div className="simple-hero-media">
          <img
            src={SITE_DATA.hero.image}
            alt={SITE_DATA.hero.imageAlt}
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
}
