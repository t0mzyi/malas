import React, { useState, useEffect, useRef } from 'react';
import { SITE_DATA } from '../data/siteData';

export default function ServicesSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef(null);
  const pillRefs = useRef([]);
  const activities = SITE_DATA.activities;
  const total = activities.length;

  const shortNames = [
    'Audio',
    'Visual',
    'Video',
    'Lighting',
    'Presentation',
    'Events',
    'Installation',
    'Conferencing',
    'Signage',
    'Smart Rooms'
  ];

  // Sync scroll position with active activity on desktop (original on-scroll pinned behavior)
  useEffect(() => {
    const handleScroll = () => {
      if (!trackRef.current) return;
      if (window.innerWidth <= 768) return;

      const rect = trackRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const scrollableDist = rect.height - windowHeight;

      if (scrollableDist <= 0) return;

      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / scrollableDist));
      const index = Math.min(total - 1, Math.floor(progress * total));
      setActiveIndex(index);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [total]);

  // Auto-center the active pill on mobile as user changes slides
  useEffect(() => {
    if (pillRefs.current[activeIndex] && window.innerWidth <= 768) {
      pillRefs.current[activeIndex].scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  }, [activeIndex]);

  // Click on indicator dot to scroll straight to that activity
  const jumpToActivity = (index) => {
    setActiveIndex(index);

    if (window.innerWidth <= 768) {
      return;
    }

    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const trackTop = rect.top + scrollTop;
    const scrollableDist = rect.height - window.innerHeight;
    const targetScroll = trackTop + (index / total) * scrollableDist + 10;

    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
  };

  const handlePrev = () => {
    const nextIdx = activeIndex > 0 ? activeIndex - 1 : total - 1;
    jumpToActivity(nextIdx);
  };

  const handleNext = () => {
    const nextIdx = activeIndex < total - 1 ? activeIndex + 1 : 0;
    jumpToActivity(nextIdx);
  };

  // Mobile Touch Swipe Handling
  const touchStartX = useRef(0);
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 30) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  const currentActivity = activities[activeIndex] || activities[0];

  return (
    <section id="services" className="activities-scroll-track" ref={trackRef} aria-label="Audio-Visual Activities">
      <div className="activities-sticky-viewport">
        <div className="container activities-viewport-container">
          {/* Top Control Bar: Kicker + Heading + Interactive Tab Strip */}
          <div className="activities-toolbar-row">
            <div className="activities-heading-group">
              <span className="section-kicker" style={{ marginBottom: '4px' }}>Core Capabilities</span>
              <h2 className="activities-sticky-title">Audio-Visual Activities</h2>
            </div>

            {/* Interactive Progress Strip (Desktop: pure pills; Mobile: prev/next + pills) */}
            <div className="activities-progress-strip" role="tablist" aria-label="Activities Navigation">
              {/* Prev button on left of Audio (mobile-only) */}
              <button
                type="button"
                onClick={handlePrev}
                className="strip-nav-btn prev mobile-only"
                aria-label="Previous Activity"
              >
                &larr; Prev
              </button>

              {activities.map((act, idx) => (
                <button
                  key={act.id}
                  ref={(el) => (pillRefs.current[idx] = el)}
                  onClick={() => jumpToActivity(idx)}
                  className={`progress-step-pill ${activeIndex === idx ? 'active' : ''}`}
                  role="tab"
                  aria-selected={activeIndex === idx}
                  aria-label={`Jump to ${act.title}`}
                >
                  <span className="progress-step-label">{shortNames[idx] || act.title}</span>
                </button>
              ))}

              {/* Next button on right of activities (mobile-only) */}
              <button
                type="button"
                onClick={handleNext}
                className="strip-nav-btn next mobile-only"
                aria-label="Next Activity"
              >
                Next &rarr;
              </button>
            </div>

            {/* Active Label Badge (No Numbers) */}
            <div className="activities-counter-badge">
              <span className="counter-current">{currentActivity.title}</span>
            </div>
          </div>

          {/* ============================================================
              MOBILE VIEW: ONLY SHOW IMAGES AND HEADING WITH NEXT/PREV SLIDERS (1-SEC AUTO MOVING)
              ============================================================ */}
          <div
            className="activities-mobile-carousel-card"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Carousel Image Stage */}
            <div className="mobile-carousel-photo-stage">
              <img
                src={currentActivity.image}
                alt={currentActivity.imageAlt || currentActivity.title}
                className="mobile-carousel-img"
                key={currentActivity.id}
              />
              <div className="mobile-carousel-gradient-overlay" />

              {/* Prominent Heading On Mobile View */}
              <div className="mobile-carousel-heading-wrap">
                <span className="mobile-carousel-kicker">Malas Engineering</span>
                <h3 className="mobile-carousel-title">{currentActivity.title}</h3>
                <span className="mobile-carousel-subtitle">{currentActivity.subtitle}</span>
              </div>

              {/* Left / Prev Slider Button */}
              <button
                type="button"
                className="mobile-carousel-arrow prev"
                onClick={handlePrev}
                aria-label="Previous slide"
              >
                &#10094;
              </button>

              {/* Right / Next Slider Button */}
              <button
                type="button"
                className="mobile-carousel-arrow next"
                onClick={handleNext}
                aria-label="Next slide"
              >
                &#10095;
              </button>

              {/* 1-Sec Carousel Progress Dots */}
              <div className="mobile-carousel-dots">
                {activities.map((_, idx) => (
                  <span
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`carousel-dot ${activeIndex === idx ? 'active' : ''}`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ============================================================
              DESKTOP VIEW: CINEMATIC SHOWCASE CARD WITH 3-COLUMN COCKPIT
              ============================================================ */}
          <article className="activities-cinematic-card desktop-showcase-card">
            {/* Top Widescreen Photography Stage */}
            <div className="activities-photo-stage">
              <img
                src={currentActivity.image}
                alt={currentActivity.imageAlt || currentActivity.title}
                className="activities-photo-img"
                key={currentActivity.id}
              />
              <div className="activities-photo-overlay-badge">
                <span className="photo-num-tag">{currentActivity.title}</span>
                <span className="photo-sub-tag">{currentActivity.subtitle}</span>
              </div>
            </div>

            {/* Bottom 3-Column Cockpit Grid */}
            <div className="activities-cockpit-grid">
              {/* Column 1: Scope & RFP Button */}
              <div className="cockpit-col-narrative">
                <h3 className="cockpit-title">{currentActivity.title}</h3>
                <p className="cockpit-desc">{currentActivity.description}</p>
                <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                  <a
                    href="#contact"
                    className="btn-primary"
                    style={{ padding: '10px 20px', fontSize: '0.88rem' }}
                    onClick={() => {
                      const select = document.querySelector('select[name="project-type"]');
                      if (select) {
                        select.value = currentActivity.title;
                      }
                    }}
                  >
                    Request Proposal &rarr;
                  </a>
                </div>
              </div>

              {/* Column 2: Engineered Hardware List */}
              <div className="cockpit-col-hardware">
                <div className="cockpit-panel-label">Engineered Hardware & Deployment</div>
                <ul className="cockpit-equipment-list">
                  {currentActivity.equipmentList.map((item, i) => (
                    <li key={i} className="cockpit-equipment-item">
                      <span className="cockpit-dot"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 3: Technical Specifications Matrix */}
              <div className="cockpit-col-specs">
                <div className="cockpit-panel-label">Technical Specifications</div>
                <div className="cockpit-specs-matrix">
                  {currentActivity.specs && currentActivity.specs.map((spec, i) => (
                    <div key={i} className="cockpit-spec-box">
                      <span className="cockpit-spec-lbl">{spec.label}</span>
                      <span className="cockpit-spec-val">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
