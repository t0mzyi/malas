import React, { useState, useEffect, useRef } from 'react';
import { SITE_DATA } from '../data/siteData';

export default function ProjectsSection() {
  const [filter, setFilter] = useState('All');
  const [flippedCardId, setFlippedCardId] = useState(null);
  const [activeMobileIdx, setActiveMobileIdx] = useState(0);

  const filterTabs = [
    { id: 'All', label: 'All Projects' },
    { id: 'Corporate', label: 'Corporate & Education' },
    { id: 'Venues', label: 'Venues & Stages' },
    { id: 'Residential', label: 'Residential & Automation' }
  ];

  const filteredProjects = SITE_DATA.projects.filter((p) => {
    if (filter === 'All') return true;
    if (filter === 'Corporate') {
      return ['Corporate', 'Education & Training', 'Commercial'].some(c => p.category.includes(c));
    }
    if (filter === 'Venues') {
      return ['Venues & Stages', 'Media & Production', 'Enterprise & Security'].some(c => p.category.includes(c));
    }
    if (filter === 'Residential') {
      return ['Luxury Residential', 'Venues & Luxury', 'Automation'].some(c => p.category.includes(c));
    }
    return true;
  });

  // 2-second Auto-carousel on Mobile View Only
  useEffect(() => {
    let intervalId = null;

    const updateTimer = () => {
      if (typeof window === 'undefined') return;
      if (window.innerWidth <= 768) {
        if (!intervalId) {
          intervalId = setInterval(() => {
            if (window.innerWidth <= 768) {
              setActiveMobileIdx((prev) => (prev < filteredProjects.length - 1 ? prev + 1 : 0));
            }
          }, 2000);
        }
      } else {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }
    };

    updateTimer();
    window.addEventListener('resize', updateTimer);

    return () => {
      if (intervalId) clearInterval(intervalId);
      window.removeEventListener('resize', updateTimer);
    };
  }, [filteredProjects.length]);

  const handleFilterChange = (id) => {
    setFilter(id);
    setActiveMobileIdx(0);
  };

  const toggleFlip = (id) => {
    setFlippedCardId(flippedCardId === id ? null : id);
  };

  // Mobile Carousel Navigation
  const handlePrevMobile = () => {
    setActiveMobileIdx((prev) => (prev > 0 ? prev - 1 : filteredProjects.length - 1));
  };

  const handleNextMobile = () => {
    setActiveMobileIdx((prev) => (prev < filteredProjects.length - 1 ? prev + 1 : 0));
  };

  const touchStartX = useRef(0);
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 35) {
      if (diff > 0) {
        handleNextMobile();
      } else {
        handlePrevMobile();
      }
    }
  };

  const currentProject = filteredProjects[activeMobileIdx] || filteredProjects[0];

  return (
    <section id="projects" className="section-wrapper" aria-labelledby="projects-title">
      <div className="container">
        {/* Section Header */}
        <div className="section-head-block">
          <span className="section-kicker">Project Portfolio</span>
          <h2 id="projects-title" className="section-title">
            Engineered Projects
          </h2>
          <p className="section-desc">
            Proven implementations across high-stakes corporate boardrooms, public auditoriums, broadcasting studios, and bespoke residential sanctuaries.
          </p>
        </div>

        {/* Filter Navigation */}
        <div className="portfolio-filter-bar">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleFilterChange(tab.id)}
              className={`filter-tab-pill ${filter === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ============================================================
            MOBILE VIEW: CAROUSEL WITH IMAGE + HEADING + SLIDERS (NO HOVER NEEDED)
            ============================================================ */}
        {currentProject && (
          <div
            className="projects-mobile-carousel-card"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="mobile-carousel-photo-stage">
              <img
                src={currentProject.image}
                alt={currentProject.imageAlt || currentProject.title}
                className="mobile-carousel-img"
                key={currentProject.id}
              />
              <div className="mobile-carousel-gradient-overlay" />

              {/* Heading & Meta on Mobile */}
              <div className="mobile-carousel-heading-wrap">
                <span className="mobile-carousel-kicker">{currentProject.category}</span>
                <h3 className="mobile-carousel-title">{currentProject.title}</h3>
                <span className="mobile-carousel-subtitle">{currentProject.scope || currentProject.description}</span>
              </div>

              {/* Prev Slider Button */}
              <button
                type="button"
                className="mobile-carousel-arrow prev"
                onClick={handlePrevMobile}
                aria-label="Previous project"
              >
                &#10094;
              </button>

              {/* Next Slider Button */}
              <button
                type="button"
                className="mobile-carousel-arrow next"
                onClick={handleNextMobile}
                aria-label="Next project"
              >
                &#10095;
              </button>

              {/* Step counter badge */}
              <div className="mobile-carousel-step-counter">
                <span>{activeMobileIdx + 1} / {filteredProjects.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            DESKTOP VIEW: 4-COLUMN 3D FLIP CARDS ON HOVER
            ============================================================ */}
        <div className="portfolio-cards-grid desktop-only-grid">
          {filteredProjects.map((project) => {
            const isFlipped = flippedCardId === project.id;
            return (
              <div
                key={project.id}
                className={`portfolio-flip-card ${isFlipped ? 'is-flipped' : ''}`}
                onClick={() => toggleFlip(project.id)}
                role="region"
                aria-label={project.title}
              >
                <div className="portfolio-flip-inner">
                  {/* FRONT: ONLY image and heading on top of that image */}
                  <div className="portfolio-card-front">
                    <img
                      src={project.image}
                      alt={project.imageAlt || project.title}
                      className="portfolio-front-image"
                      loading="lazy"
                    />
                    <div className="portfolio-front-overlay">
                      <div className="portfolio-front-meta">
                        <span className="portfolio-front-category">{project.category}</span>
                        <h3 className="portfolio-front-title">{project.title}</h3>
                      </div>
                      <span className="portfolio-flip-hint">
                        <span>Details</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="23 4 23 10 17 10"></polyline>
                          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                        </svg>
                      </span>
                    </div>
                  </div>

                  {/* BACK: Flipped details on hover/tap */}
                  <div className="portfolio-card-back">
                    <div className="portfolio-back-top">
                      <span className="portfolio-back-category">{project.category}</span>
                    </div>

                    <div className="portfolio-back-content">
                      <h3 className="portfolio-back-title">{project.title}</h3>
                      <p className="portfolio-back-desc">{project.description}</p>
                      
                      <div className="portfolio-back-hw">
                        <strong>Hardware:</strong> {project.includedEquipment}
                      </div>
                    </div>

                    <div className="portfolio-back-footer">
                      <a
                        href="#contact"
                        className="portfolio-back-link"
                        onClick={(e) => {
                          e.stopPropagation();
                          const select = document.querySelector('select[name="project-type"]');
                          if (select) {
                            select.value = project.title;
                          }
                        }}
                      >
                        Inquire Scope &rarr;
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
