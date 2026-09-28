import React from 'react';
import { SITE_DATA } from '../data/siteData';

export default function ServicesSection() {
  return (
    <section id="services" className="section-wrapper bg-elevated">
      <div className="container">
        {/* Section Header */}
        <div className="apple-section-head">
          <span className="apple-kicker">Core Disciplines</span>
          <h2 className="apple-heading">Our 10 AV Activities</h2>
          <p className="apple-desc">
            Complete Audio-Visual capabilities designed, supplied, installed, and maintained by our engineering team across Dubai and the UAE.
          </p>
        </div>

        {/* 10 Clean Rounded Cards (NO GRADIENTS) */}
        <div className="apple-activities-grid">
          {SITE_DATA.activities.map((act) => (
            <div key={act.id} className="apple-activity-card">
              <div className="apple-act-header">
                <span className="apple-act-pill">#{act.num}</span>
                <h3 className="apple-act-title">{act.title}</h3>
              </div>
              <div className="apple-act-sub">{act.subtitle}</div>
              <p className="apple-act-desc">{act.description}</p>
              <div className="apple-act-gear">
                <strong>Equipment:</strong> {act.equipmentList.join(', ')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
