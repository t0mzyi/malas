import React, { useState, useEffect, useRef } from 'react';
import { SITE_DATA } from '../data/siteData';

export default function HeroSection() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const heroRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      if (rect.top <= windowHeight && rect.bottom >= 0) {
        const progress = Math.min(Math.max((windowHeight - rect.top) / (windowHeight + rect.height), 0), 1);
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const imageScale = 1 + scrollProgress * 0.05;

  return (
    <section ref={heroRef} className="hero-section" aria-labelledby="hero-title">
      <div className="container">
        <div className="hero-grid">
          {/* Left Text Block */}
          <div className="hero-text-block">
            <span className="hero-tag">
              Dubai · Abu Dhabi · Sharjah · UAE
            </span>
            <h1 id="hero-title" className="hero-headline">
              {SITE_DATA.hero.headline}
            </h1>
            <p className="hero-subline">
              {SITE_DATA.hero.subline}
            </p>
            <div className="hero-actions">
              <a href="#contact" className="btn btn-primary">
                Request a Consultation
              </a>
              <a href={`tel:${SITE_DATA.company.phoneDirect.replace(/\s+/g, '')}`} className="btn btn-secondary">
                Call {SITE_DATA.company.phoneDirect}
              </a>
            </div>
          </div>

          {/* Right Image Block with Real Asset & Luxury Badge */}
          <div className="hero-image-block">
            <img
              src={SITE_DATA.hero.image}
              alt={SITE_DATA.hero.imageAlt}
              loading="eager"
              style={{ transform: `scale(${imageScale})` }}
            />
            <div className="hero-image-badge">
              CURVED LED AUDITORIUM · DUBAI INSTALLATION
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
