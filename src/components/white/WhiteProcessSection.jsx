import React from 'react';
import { SITE_DATA } from '../../data/siteData';

export default function WhiteProcessSection() {
  const steps = Array.isArray(SITE_DATA.process) ? SITE_DATA.process : (SITE_DATA.process?.steps || []);

  return (
    <section id="w-process" className="white-section" aria-labelledby="w-process-title">
      <div className="container" style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 40px' }}>
        <div className="white-section-head white-head-centered">
          <span className="white-section-kicker">ENGINEERING METHODOLOGY</span>
          <h2 id="w-process-title" className="white-section-title">
            Our 4-Stage Turnkey Execution Process
          </h2>
          <div className="white-gold-divider"></div>
          <p className="white-section-desc">
            A systematic, Avixa-compliant workflow guaranteeing flawless acoustic fidelity, crystal-clear 4K/8K visuals, and 99.9% system uptime across the UAE.
          </p>
        </div>

        <div className="white-process-grid">
          {steps.map((step, idx) => (
            <div key={idx} className="white-process-step">
              <div className="white-step-num-badge">STAGE {step.num || `0${idx + 1}`}</div>
              <h3 className="white-step-title">{step.title}</h3>
              <p className="white-step-desc">{step.description}</p>
              <div className="white-step-milestone">
                <span className="white-milestone-dot"></span>
                <span>Verified Milestones</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
