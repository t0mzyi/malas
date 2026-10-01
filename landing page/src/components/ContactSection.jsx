import React, { useState } from 'react';
import { SITE_DATA } from '../data/siteData';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    project: 'Auditorium AV Installation',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="contact" className="section-wrapper contact-section-lux" aria-labelledby="contact-title">
      <div className="container">
        {/* Section Header */}
        <div className="section-head-block contact-head-center">
          <span className="section-kicker">Direct Consultation</span>
          <h2 id="contact-title" className="section-title">
            Initiate Systems Consultation
          </h2>
          <p className="section-desc">
            Connect directly with our senior AV engineering team for site surveys, CAD single-line designs, and turnkey hardware proposals.
          </p>
        </div>

        {/* Quick Contact Action Strip */}
        <div className="contact-quick-strip">
          <a href={`tel:${SITE_DATA.company.phoneLandline.replace(/\s+/g, '')}`} className="contact-quick-card">
            <div className="contact-quick-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <div className="contact-quick-info">
              <span className="contact-quick-tag">Direct Engineering Telephony</span>
              <span className="contact-quick-val">{SITE_DATA.company.phoneLandline}</span>
            </div>
            <span className="contact-quick-action">Call &rarr;</span>
          </a>

          <a href={`mailto:${SITE_DATA.company.emailSales}`} className="contact-quick-card">
            <div className="contact-quick-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </svg>
            </div>
            <div className="contact-quick-info">
              <span className="contact-quick-tag">Official Proposals & RFPs</span>
              <span className="contact-quick-val">{SITE_DATA.company.emailSales}</span>
            </div>
            <span className="contact-quick-action">Email &rarr;</span>
          </a>

          <div className="contact-quick-card static-card">
            <div className="contact-quick-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <div className="contact-quick-info">
              <span className="contact-quick-tag">Engineering Headquarters</span>
              <span className="contact-quick-val">Deira, Dubai · UAE</span>
            </div>

          </div>
        </div>

        {/* Main Consultation Studio Layout */}
        <div className="contact-studio-layout">
          {/* Left Column: Trust, SLA & Consultation Protocol */}
          <div className="contact-studio-info-card">
            <div className="studio-card-top">
              <span className="studio-pill">Turnkey Engineering Protocol</span>
              <h3 className="studio-title">Consultation Process</h3>
            </div>

            <div className="studio-steps-list">
              <div className="studio-step-item">
                <div className="studio-step-num">01</div>
                <div>
                  <h4 className="studio-step-heading">CAD Single-Line Review</h4>
                  <p className="studio-step-desc">A certified AV engineer analyzes your venue dimensions, acoustics, and display sightlines.</p>
                </div>
              </div>

              <div className="studio-step-item">
                <div className="studio-step-num">02</div>
                <div>
                  <h4 className="studio-step-heading">On-Site Technical Survey</h4>
                  <p className="studio-step-desc">Comprehensive laser measurements and structural conduit verification across the UAE.</p>
                </div>
              </div>

              <div className="studio-step-item">
                <div className="studio-step-num">03</div>
                <div>
                  <h4 className="studio-step-heading">Itemized Commercial Proposal</h4>
                  <p className="studio-step-desc">Transparent Bill of Quantities (BOQ) with authorized tier-1 hardware pricing and SLA guarantee.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: High-End Proposal Form */}
          <div className="contact-studio-form-card">
            {submitted ? (
              <div className="rfp-success-banner">
                <div className="rfp-success-icon">✓</div>
                <h4>Proposal Specification Received</h4>
                <p>
                  Thank you, <strong>{formData.name || 'Valued Client'}</strong>. A senior systems engineer is reviewing your inquiry regarding <strong>{formData.project}</strong> and will connect with technical documentation shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="studio-form">
                <div className="studio-form-row">
                  <div className="studio-field">
                    <label className="studio-label">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tariq Al Mansoori"
                      className="studio-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="studio-field">
                    <label className="studio-label">Company / Organization</label>
                    <input
                      type="text"
                      placeholder="e.g. Emirates Holdings"
                      className="studio-input"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>
                </div>

                <div className="studio-form-row">
                  <div className="studio-field">
                    <label className="studio-label">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+971 50 000 0000"
                      className="studio-input"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="studio-field">
                    <label className="studio-label">Corporate Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="name@company.ae"
                      className="studio-input"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="studio-field">
                  <label className="studio-label">Target Project Scope</label>
                  <select
                    name="project-type"
                    className="studio-select"
                    value={formData.project}
                    onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                  >
                    <optgroup label="Engineered Projects">
                      {SITE_DATA.projects.map((p) => (
                        <option key={p.id} value={p.title}>
                          {p.title}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="AV Activities">
                      {SITE_DATA.activities.map((a) => (
                        <option key={a.id} value={a.title}>
                          {a.title}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div className="studio-field">
                  <label className="studio-label">Project Details / Venue Dimensions</label>
                  <textarea
                    rows={4}
                    placeholder="Briefly describe venue size, acoustic constraints, seating capacity, or timeline..."
                    className="studio-textarea"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn-primary studio-submit-btn">
                  Submit Systems Proposal Specification &rarr;
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
