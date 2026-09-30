import React from 'react';
import { SITE_DATA } from '../data/siteData';

export default function HeroSection() {
  return (
    <section id="home" className="hero-split-section">
      <div className="container hero-split-container">
        {/* Left Column: Brand Lockup, Headings, Mobile Visual, CTAs, Credibility */}
        <div className="hero-left-column">
          {/* Prominent Hero Brand Lockup */}
          <div id="hero-brand-lockup" className="hero-brand-lockup">
            <div className="hero-brand-logo-frame">
              <img src="/logo.png" alt="Malas Electronics Official Logo" />
            </div>
            <div className="hero-brand-text-stack">
              <span className="hero-brand-name-lead">MALAS ELECTRONICS</span>
              <span className="hero-brand-tag-lead">SYSTEMS INTEGRATOR · DUBAI</span>
            </div>
          </div>

          {/* Simple, Authoritative Brand Headline */}
          <h1 className="hero-display-headline">
            Audio-Visual Systems.
            <span className="brand-highlight">Engineered for Dubai & the UAE.</span>
          </h1>

          {/* Direct, Plain-Spoken Subline */}
          <p className="hero-subline-text">
            Turnkey commercial auditoriums, boardrooms, luxury residential automation, and comprehensive systems integration across the UAE.
          </p>

          {/* Mobile-Only Dedicated Visual Card (Clean, visual-first mobile experience) */}
          <div className="hero-mobile-image-card">
            <img
              src="/images/hero-auditorium.jpg"
              alt="High-Performance Audio-Visual Installation by Malas Electronics LLC"
              className="hero-mobile-img"
              loading="eager"
            />
          </div>

          {/* Core Actions */}
          <div className="hero-actions-group">
            <a href="#contact" className="btn-primary">
              Request Systems Proposal
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
            <a href="#services" className="btn-secondary">
              Explore Activities
            </a>
          </div>

          {/* Credibility Metric Strip */}
          <div className="hero-credibility-strip">
            {SITE_DATA.hero.stats.map((stat, idx) => (
              <div key={idx} className="credibility-metric-card">
                <span className="credibility-metric-val">{stat.value}</span>
                <span className="credibility-metric-lbl">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Faded Cinematic Image (Desktop Only) */}
        <div className="hero-right-column desktop-hero-right">
          <div className="hero-faded-image-wrapper">
            <img
              src="/images/hero-auditorium.jpg"
              alt="High-Performance Audio-Visual Installation by Malas Electronics LLC"
              className="hero-faded-image"
              loading="eager"
            />
            {/* Left Edge Fade for seamless text legibility */}
            <div className="hero-image-fade-left"></div>
            <div className="hero-image-fade-bottom"></div>
            <div className="hero-image-fade-top"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
