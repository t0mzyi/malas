import React from 'react';
import { SITE_DATA } from '../data/siteData';

export default function ProcessSection() {
  return (
    <section id="process" className="section-wrapper bg-elevated" aria-labelledby="process-title">
      <div className="container">
        <div className="section-head-block">
          <span className="section-kicker">Delivery Standard</span>
          <h2 id="process-title" className="section-title">
            Execution Standard
          </h2>
          <p className="section-desc">
            A rigorous engineering methodology applied to every commercial, institutional, and residential deployment across the UAE.
          </p>
        </div>

        {/* Centered Architectural Divider Line on Execution */}
        <div className="execution-center-divider" aria-hidden="true">
          <span className="execution-center-line"></span>
          <span className="execution-center-diamond"></span>
          <span className="execution-center-line reverse"></span>
        </div>

        <div className="process-stepper-grid">
          {SITE_DATA.process.map((step, idx) => (
            <div key={step.title} className="process-step-column">
              <div className="process-step-header">
                <span className="process-step-number-badge">
                  {idx + 1}
                </span>
                <span className="process-step-phase-tag">
                  Phase {idx + 1}
                </span>
              </div>
              <h3 className="process-step-name">{step.title}</h3>
              <p className="process-step-details">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
