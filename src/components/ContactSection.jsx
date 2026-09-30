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
    <section id="contact" className="section-wrapper bg-elevated" aria-labelledby="contact-title">
      <div className="container">
        <div className="section-head-block">
          <span className="section-kicker">Direct Consultation</span>
          <h2 id="contact-title" className="section-title">
            Initiate Systems Consultation
          </h2>
          <p className="section-desc">
            Connect directly with our senior AV engineering team for site surveys, CAD single-line designs, and turnkey hardware proposals.
          </p>
        </div>

        <div className="contact-dossier-grid">
          {/* Engineering Channels Dossier */}
          <div className="contact-channels-column">
            <div className="contact-card-box">
              <div className="contact-card-label">Dubai Engineering Headquarters</div>
              <div className="contact-card-value">{SITE_DATA.company.location}</div>
            </div>

            <div className="contact-card-box">
              <div className="contact-card-label">Direct Engineering Telephony</div>
              <div className="contact-card-value">
                <a href={`tel:${SITE_DATA.company.phoneLandline.replace(/\s+/g, '')}`}>
                  {SITE_DATA.company.phoneLandline}
                </a>
                <span style={{ color: 'var(--text-muted)', margin: '0 8px' }}>·</span>
                <a href={`tel:${SITE_DATA.company.phoneDirect.replace(/\s+/g, '')}`}>
                  {SITE_DATA.company.phoneDirect}
                </a>
              </div>
            </div>

            <div className="contact-card-box">
              <div className="contact-card-label">Official RFP & Inquiries</div>
              <div className="contact-card-value">
                <a href={`mailto:${SITE_DATA.company.emailSales}`}>
                  {SITE_DATA.company.emailSales}
                </a>
              </div>
            </div>

            <div className="contact-sla-guarantee">
              <div className="contact-card-label">2-Hour Emergency SLA Dispatch</div>
              <p>
                Active on-site engineer deployment guaranteed within 2 hours across Dubai, Abu Dhabi, and Sharjah for contracted clients.
              </p>
            </div>
          </div>

          {/* Proposal / RFP Form */}
          <div className="rfp-form-card">
            {submitted ? (
              <div className="rfp-success-banner">
                <div className="rfp-success-icon">✓</div>
                <h4>Proposal Specification Received</h4>
                <p>
                  Thank you, {formData.name || 'Valued Client'}. A Malas Electronics systems engineer is reviewing your inquiry regarding <strong>{formData.project}</strong> and will connect with technical documentation shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="rfp-form-grid-row">
                  <div className="rfp-form-group">
                    <label className="rfp-form-label">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tariq Al Mansoori"
                      className="rfp-form-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="rfp-form-group">
                    <label className="rfp-form-label">Company / Organization</label>
                    <input
                      type="text"
                      placeholder="e.g. Emirates Holdings"
                      className="rfp-form-input"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>
                </div>

                <div className="rfp-form-grid-row">
                  <div className="rfp-form-group">
                    <label className="rfp-form-label">Contact Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+971 50 000 0000"
                      className="rfp-form-input"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="rfp-form-group">
                    <label className="rfp-form-label">Corporate Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="t.mansoori@company.ae"
                      className="rfp-form-input"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="rfp-form-group">
                  <label className="rfp-form-label">Target AV Scope / Project Type</label>
                  <select
                    name="project-type"
                    className="rfp-form-select"
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

                <div className="rfp-form-group">
                  <label className="rfp-form-label">Project Details / Venue Dimensions</label>
                  <textarea
                    rows={4}
                    placeholder="Describe venue capacity, acoustic requirements, target launch date, or specific brand hardware requested..."
                    className="rfp-form-textarea"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  ></textarea>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem' }}>
                  Transmit AV Specification &rarr;
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
