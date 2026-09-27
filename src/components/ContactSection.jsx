import React, { useState } from 'react';
import { SITE_DATA } from '../data/siteData';

export default function ContactSection() {
  const [formState, setFormState] = useState({
    name: '',
    company: '',
    service: 'Audiovisual Systems',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <section id="contact" className="section-wrapper" aria-labelledby="contact-title">
      <div className="container">
        <div className="section-head-block">
          <span className="contained-eyebrow">Direct Communication</span>
          <h2 id="contact-title" className="section-title">
            Consult With Our Engineering Team
          </h2>
          <p className="section-desc">
            Direct communication with our engineers and procurement leads in Deira, Dubai.
          </p>
        </div>

        <div className="contact-layout-grid">
          {/* Form Pane with Obsidian Glass Surface */}
          <div className="contact-form-pane">
            {submitted ? (
              <div style={{ padding: '32px 0' }}>
                <span className="contained-eyebrow">Transmission Confirmed</span>
                <h3 style={{ color: 'var(--gold)', marginBottom: '14px', fontSize: '1.8rem' }}>Inquiry Received</h3>
                <p style={{ color: 'var(--paper-muted)', marginBottom: '28px', fontSize: '1.05rem' }}>
                  Thank you, <strong>{formState.name}</strong>. A Malas Electronics engineer will review your project requirements and follow up within one business day.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormState({ name: '', company: '', service: 'Audiovisual Systems', message: '' });
                  }}
                  className="btn btn-secondary"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group-item">
                  <label htmlFor="contact-name" className="form-field-label">Name *</label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    placeholder="Your Full Name"
                    value={formState.name}
                    onChange={handleChange}
                    className="form-control-input"
                  />
                </div>

                <div className="form-group-item">
                  <label htmlFor="contact-company" className="form-field-label">Organization / Company *</label>
                  <input
                    id="contact-company"
                    name="company"
                    type="text"
                    required
                    placeholder="Company Name"
                    value={formState.company}
                    onChange={handleChange}
                    className="form-control-input"
                  />
                </div>

                <div className="form-group-item">
                  <label htmlFor="contact-service" className="form-field-label">Discipline of Interest</label>
                  <select
                    id="contact-service"
                    name="service"
                    value={formState.service}
                    onChange={handleChange}
                    className="form-control-select"
                  >
                    <option value="Audiovisual Systems">Audiovisual Systems</option>
                    <option value="Robotics & Automation">Robotics & Automation</option>
                    <option value="Computer Systems & Infrastructure">Computer Systems & Infrastructure</option>
                    <option value="Control Systems">Control Systems</option>
                    <option value="Hardware Procurement / Wholesale BOM">Hardware Procurement / Wholesale BOM</option>
                    <option value="24/7 SLA Maintenance Contract">24/7 SLA Maintenance Contract</option>
                  </select>
                </div>

                <div className="form-group-item">
                  <label htmlFor="contact-message" className="form-field-label">Project Requirements *</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    rows={4}
                    value={formState.message}
                    onChange={handleChange}
                    placeholder="Tell us about your facility space, project timeline, or specific hardware needed..."
                    className="form-control-textarea"
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }}>
                  Submit Engineering Inquiry
                </button>
              </form>
            )}
          </div>

          {/* Details Pane */}
          <div className="contact-details-pane">
            <div>
              <span className="detail-item-title">Registered Office</span>
              <p className="detail-item-value">
                {SITE_DATA.company.name}<br />
                {SITE_DATA.company.location}
              </p>
            </div>

            <div>
              <span className="detail-item-title">Telephone</span>
              <p className="detail-item-value">
                Direct: <a href={`tel:${SITE_DATA.company.phoneDirect.replace(/\s+/g, '')}`} className="detail-link">{SITE_DATA.company.phoneDirect}</a><br />
                Landline: <a href={`tel:${SITE_DATA.company.phoneLandline.replace(/\s+/g, '')}`} className="detail-link">{SITE_DATA.company.phoneLandline}</a>
              </p>
            </div>

            <div>
              <span className="detail-item-title">Email</span>
              <p className="detail-item-value">
                General: <a href={`mailto:${SITE_DATA.company.emailGeneral}`} className="detail-link">{SITE_DATA.company.emailGeneral}</a><br />
                Sales: <a href={`mailto:${SITE_DATA.company.emailSales}`} className="detail-link">{SITE_DATA.company.emailSales}</a>
              </p>
            </div>

            <div>
              <span className="detail-item-title">Operating Schedule</span>
              <p className="detail-item-value">
                {SITE_DATA.company.hours}
              </p>
            </div>

            <div>
              <span className="detail-item-title">UAE Territory Coverage</span>
              <p className="detail-item-value">
                {SITE_DATA.company.coverage}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
