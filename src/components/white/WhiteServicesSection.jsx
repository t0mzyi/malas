import React from 'react';
import { SITE_DATA } from '../../data/siteData';

export default function WhiteServicesSection() {
  return (
    <section id="s-services" className="simple-section bg-subtle">
      <div className="white-container">
        {/* Simple Section Header */}
        <div className="simple-section-head">
          <span className="simple-kicker">Core Disciplines</span>
          <h2 className="simple-heading">Our 10 AV Activities</h2>
          <p className="simple-desc">
            End-to-end Audio-Visual capabilities designed, supplied, and supported by our engineering team in Dubai.
          </p>
        </div>

        {/* Clean 2-Column Grid */}
        <div className="simple-activities-grid">
          {SITE_DATA.activities.map((act) => (
            <div key={act.id} className="simple-activity-card">
              <div className="simple-act-header">
                <span className="simple-act-num">#{act.num}</span>
                <h3 className="simple-act-title">{act.title}</h3>
              </div>
              <div className="simple-act-sub">{act.subtitle}</div>
              <p className="simple-act-desc">{act.description}</p>
              <div className="simple-act-gear">
                <strong>Equipment:</strong> {act.equipmentList.join(', ')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
