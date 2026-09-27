import React from 'react';
import { SITE_DATA } from '../data/siteData';

export default function HeroSection() {
  const stats = [
    {
      value: '15+',
      label: 'Years of Engineering',
    },
    {
      value: '500+',
      label: 'Projects Completed',
    },
    {
      value: '99.8%',
      label: 'Client Satisfaction',
    },
    {
      value: '26+',
      label: 'Industry Partners',
    },
  ];

  return (
    <section className="split-hero-section" aria-labelledby="hero-title">
      <div className="split-hero-container">
        {/* Left Side Content */}
        <div className="split-hero-content">
          <div className="split-text-area">
            <span className="split-eyebrow">Enterprise Systems Integrator</span>
            <h1 id="hero-title" className="split-headline">
              Powering The Future. <br />
              <span className="split-gold">Built For Precision.</span>
            </h1>
            <p className="split-desc">
              End-to-end trading, expert implementation, and meticulous maintenance of advanced electrical, high-performance audiovisual, robotics, and precision control infrastructure across the UAE.
            </p>
            <div className="split-cta">
              <a href="#services" className="btn btn-luxury-gold">
                Explore Solutions
              </a>
              <a href="#contact" className="btn btn-luxury-ghost">
                Get In Touch
              </a>
            </div>
          </div>
        </div>

        {/* Right Side Media */}
        <div className="split-hero-media">
          <img
            src={SITE_DATA.hero.image}
            alt={SITE_DATA.hero.imageAlt}
            className="split-img"
            loading="eager"
          />
        </div>
      </div>

      {/* Stats Bar */}
      <div className="split-stats-wrapper container">
        <div className="split-stats-bar">
          {stats.map((stat, idx) => (
            <div key={idx} className="split-stat-cell">
              <div className="split-stat-number">{stat.value}</div>
              <div className="split-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

