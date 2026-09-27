import React from 'react';
import { SITE_DATA } from '../data/siteData';

export default function ProcessSection() {
  return (
    <section id="process" className="section-wrapper" aria-labelledby="process-title">
      <div className="container">
        <div className="section-head-block">
          <span className="hero-tag">Methodology</span>
          <h2 id="process-title" className="section-title">
            The 4-Stage Execution Standard
          </h2>
          <p className="section-desc">
            Applied to every commercial and industrial installation across Dubai and the Northern Emirates.
          </p>
        </div>

        {/* Connected Horizontal Timeline */}
        <div className="process-timeline">
          {SITE_DATA.process.map((step) => (
            <div key={step.num} className="process-timeline-step">
              <div className="process-step-node">
                {step.num}
              </div>
              <h3 className="process-step-title">{step.title}</h3>
              <p className="process-step-desc">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
