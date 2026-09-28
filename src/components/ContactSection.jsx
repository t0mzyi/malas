import React, { useState } from 'react';
import { SITE_DATA } from '../data/siteData';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    project: 'Auditorium AV Installation',
    message: ''
  });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <section id="contact" className="section-wrapper">
      <div className="container">
        {/* Section Header */}
        <div className="apple-section-head">
          <span className="apple-kicker">Get in Touch</span>
          <h2 className="apple-heading">Contact Our Engineering Team</h2>
          <p className="apple-desc">
            Schedule an on-site survey or request an AV proposal for your upcoming project in Dubai or the UAE.
          </p>
        </div>

        {/* 2-Column Apple Grid (NO GRADIENTS) */}
        <div className="apple-contact-grid">
          {/* Left Info Stack */}
          <div className="apple-contact-info-stack">
            <div className="apple-info-card">
              <span className="apple-info-tag">Location</span>
              <div className="apple-info-value">{SITE_DATA.company.location}</div>
            </div>

            <div className="apple-info-card">
              <span className="apple-info-tag">Direct Phone</span>
              <div className="apple-info-value">
                {SITE_DATA.company.phoneLandline} · {SITE_DATA.company.phoneDirect}
              </div>
            </div>

            <div className="apple-info-card">
              <span className="apple-info-tag">Email Address</span>
              <div className="apple-info-value">{SITE_DATA.company.emailSales}</div>
            </div>

            <div className="apple-info-card">
              <span className="apple-info-tag">24/7 SLA Dispatch</span>
              <div className="apple-info-value" style={{ fontSize: '0.86rem', color: '#86868B', lineHeight: 1.5 }}>
                Active on-site engineer deployment within 2 hours across Dubai and Abu Dhabi for contract clients.
              </div>
            </div>
          </div>

          {/* Right Rounded Form Card */}
          <div className="apple-form-card">
            {sent ? (
              <div style={{ textAlign: 'center', padding: '36px 12px' }}>
                <div style={{ fontSize: '2.2rem', color: '#10B981', marginBottom: '12px' }}>✓</div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: '#FFFFFF', marginBottom: '8px' }}>
                  Thank you for reaching out
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#86868B' }}>
                  A Malas Electronics systems engineer will review your project requirements and contact you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="apple-form-row">
                  <div className="apple-form-group">
                    <label className="apple-label">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tariq Al Mansoori"
                      className="apple-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="apple-form-group">
                    <label className="apple-label">Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="+971 50 000 0000"
                      className="apple-input"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="apple-form-group">
                  <label className="apple-label">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    className="apple-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="apple-form-group">
                  <label className="apple-label">Project Type</label>
                  <select
                    className="apple-select"
                    value={formData.project}
                    onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                  >
                    <optgroup label="15 Specialized AV Projects">
                      {SITE_DATA.projects.map((p) => (
                        <option key={p.id} value={p.title}>
                          Project #{p.number}: {p.title}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="10 Core Activities">
                      {SITE_DATA.activities.map((a) => (
                        <option key={a.id} value={a.title}>
                          Activity #{a.num}: {a.title}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div className="apple-form-group">
                  <label className="apple-label">Project Details / Scope</label>
                  <textarea
                    rows={3}
                    placeholder="Specify venue dimensions, acoustic requirements, or target timeline..."
                    className="apple-textarea"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  ></textarea>
                </div>

                <button type="submit" className="btn-apple-solid" style={{ width: '100%', justifyContent: 'center' }}>
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
