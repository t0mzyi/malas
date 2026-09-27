import React from 'react';
import { SITE_DATA } from '../data/siteData';

export default function ServicesSection() {
  return (
    <section id="services" className="section-wrapper" aria-labelledby="services-title">
      <div className="container">
        <div className="section-head-block">
          <span className="hero-tag">Engineering Disciplines</span>
          <h2 id="services-title" className="section-title">
            Specialized Technology Systems
          </h2>
          <p className="section-desc">
            End-to-end engineering, hardware procurement, certified commissioning, and 24/7 SLA maintenance across four technical verticals.
          </p>
        </div>

        <div className="services-showcase-grid">
          {SITE_DATA.services.map((service, idx) => {
            const isReverse = idx % 2 === 1;
            return (
              <div key={service.id} className={`service-item-row ${isReverse ? 'reverse' : ''}`}>
                {/* Media Side */}
                <div className="service-media-wrap">
                  <img
                    src={service.image}
                    alt={service.imageAlt}
                    loading="lazy"
                  />
                </div>

                {/* Content Side */}
                <div className="service-content-wrap">
                  <span className="service-category-tag">Discipline 0{idx + 1}</span>
                  <h3 className="service-title">{service.title}</h3>
                  <p className="service-scope">{service.scope}</p>
                  <p className="service-capabilities">
                    <strong style={{ color: 'var(--paper)', fontWeight: 600 }}>Capabilities: </strong>
                    {service.capabilities}
                  </p>

                  {/* Clean Two-Column Unboxed Spec Rows */}
                  <div className="spec-sheet-rows">
                    {service.specs.map((spec, sIdx) => (
                      <div key={sIdx} className="spec-row">
                        <span className="spec-row-label">{spec.label}</span>
                        <span className="mono-val spec-row-value">{spec.value}</span>
                      </div>
                    ))}
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
