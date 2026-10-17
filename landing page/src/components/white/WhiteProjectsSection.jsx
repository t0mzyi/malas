import React, { useState } from 'react';
import { SITE_DATA } from '../../data/siteData';

export default function WhiteProjectsSection() {
  const [filter, setFilter] = useState('All');

  const filterTabs = [
    { id: 'All', label: 'All Projects (15)' },
    { id: 'Workspaces', label: 'Workspaces & Studios' },
    { id: 'Venues', label: 'Venues & Events' },
    { id: 'Residential', label: 'Residential & Luxury' }
  ];

  const filteredProjects = SITE_DATA.projects.filter((p) => {
    if (filter === 'All') return true;
    if (filter === 'Workspaces') {
      return ['Workspaces & Studios', 'Education & Training', 'Display & Visuals', 'Corporate', 'Commercial'].some(c => p.category.includes(c));
    }
    if (filter === 'Venues') {
      return ['Venues & Stages', 'Venues & Hospitality', 'Media & Production', 'Operations & Security', 'Enterprise & Security'].some(c => p.category.includes(c));
    }
    if (filter === 'Residential') {
      return ['Luxury Residential', 'Venues & Luxury', 'Automation', 'Venues & Residences'].some(c => p.category.includes(c));
    }
    return true;
  });

  return (
    <section id="s-projects" className="simple-section">
      <div className="white-container">
        {/* Header */}
        <div className="simple-section-head">
          <span className="simple-kicker">Project Portfolio</span>
          <h2 className="simple-heading">Our 15 AV Project Types</h2>
          <p className="simple-desc">
            Explore our verified systems integrations across private residences, auditoriums, broadcast studios, and bespoke spaces.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="simple-filter-row">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`simple-filter-btn ${filter === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Simple 3-Column Card Grid */}
        <div className="simple-projects-grid">
          {filteredProjects.map((project) => (
            <div key={project.id} className="simple-project-card">
              <div>
                <div className="simple-proj-top">
                  <span className="simple-proj-num">PROJECT {project.number}</span>
                  <span className="simple-proj-cat">{project.category}</span>
                </div>
                <h3 className="simple-proj-title">{project.title}</h3>
                <p className="simple-proj-desc">{project.description}</p>
                <div className="simple-proj-eq">
                  <strong>Hardware:</strong> {project.includedEquipment}
                </div>
              </div>

              <div className="simple-proj-footer">
                <a href="#s-contact" className="simple-proj-link">
                  Inquire Scope &rarr;
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
