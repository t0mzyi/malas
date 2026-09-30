import React, { useState } from 'react';
import { SITE_DATA } from '../../data/siteData';

export default function WhiteContactSection() {
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
    <section id="s-contact" className="simple-section">
      <div className="white-container">
        <div className="simple-section-head">
          <span className="simple-kicker">Get in Touch</span>
          <h2 className="simple-heading">Contact Our Engineering Team</h2>
          <p className="simple-desc">
            Schedule an on-site survey or request an AV proposal for your upcoming project in Dubai or the UAE.
          </p>
        </div>

        <div className="simple-contact-grid">
          {/* Left Info Blocks */}
          <div className="simple-contact-info">
            <div className="simple-info-block">
              <span className="simple-info-lbl">Location</span>
              <div className="simple-info-val">{SITE_DATA.company.location}</div>
            </div>

            <div className="simple-info-block">
              <span className="simple-info-lbl">Direct Phone</span>
              <div className="simple-info-val">
                {SITE_DATA.company.phoneLandline} · {SITE_DATA.company.phoneDirect}
              </div>
            </div>

            <div className="simple-info-block">
              <span className="simple-info-lbl">Email Address</span>
              <div className="simple-info-val">
                {SITE_DATA.company.emailSales}
              </div>
            </div>

            <div className="simple-info-block">
              <span className="simple-info-lbl">Emergency SLA Support</span>
              <div className="simple-info-val" style={{ fontSize: '0.86rem', color: '#4B5563' }}>
                Active 24/7 field engineer dispatch for ongoing maintenance clients across the UAE.
              </div>
            </div>
          </div>

          {/* Right Simple Form */}
          <div className="simple-form">
            {sent ? (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <div style={{ fontSize: '2rem', color: '#10B981', marginBottom: '10px' }}>✓</div>
                <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.3rem', color: '#111827', marginBottom: '8px' }}>
                  Thank you for reaching out
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#4B5563' }}>
                  A Malas Electronics engineer will contact you shortly regarding your specifications.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="simple-form-row">
                  <div className="simple-form-group">
                    <label className="simple-label">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tariq Al Mansoori"
                      className="simple-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="simple-form-group">
                    <label className="simple-label">Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="+971 50 000 0000"
                      className="simple-input"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="simple-form-group">
                  <label className="simple-label">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    className="simple-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="simple-form-group">
                  <label className="simple-label">Project Type</label>
                  <select
                    className="simple-select"
                    value={formData.project}
                    onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                  >
                    <optgroup label="15 Project Types">
                      {SITE_DATA.projects.map((p) => (
                        <option key={p.id} value={p.title}>
                          {p.number}. {p.title}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="10 Core Activities">
                      {SITE_DATA.activities.map((a) => (
                        <option key={a.id} value={a.title}>
                          {a.num}. {a.title}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div className="simple-form-group">
                  <label className="simple-label">Project Details / Requirements</label>
                  <textarea
                    rows={3}
                    placeholder="Tell us about the venue, equipment needs, or timeline..."
                    className="simple-textarea"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  ></textarea>
                </div>

                <button type="submit" className="simple-submit-btn">
                  Send Inquiry &rarr;
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
