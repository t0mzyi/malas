import React, { useState } from 'react';
import { SITE_DATA } from '../data/siteData';

export default function ProjectsSection() {
  const [filter, setFilter] = useState('All');

  const filterTabs = [
    { id: 'All', label: 'All Projects (15)' },
    { id: 'Corporate', label: 'Corporate & Education' },
    { id: 'Venues', label: 'Venues & Events' },
    { id: 'Residential', label: 'Residential & Automation' }
  ];

  const filteredProjects = SITE_DATA.projects.filter((p) => {
    if (filter === 'All') return true;
    if (filter === 'Corporate') {
      return ['Corporate', 'Education & Training', 'Commercial'].some(c => p.category.includes(c));
    }
    if (filter === 'Venues') {
      return ['Venues & Stages', 'Media & Production', 'Enterprise & Security'].some(c => p.category.includes(c));
    }
    if (filter === 'Residential') {
      return ['Luxury Residential', 'Venues & Luxury', 'Automation'].some(c => p.category.includes(c));
    }
    return true;
  });

  return (
    <section id="projects" className="section-wrapper">
      <div className="container">
        {/* Section Header */}
        <div className="apple-section-head">
          <span className="apple-kicker">Project Portfolio</span>
          <h2 className="apple-heading">Our 15 AV Project Types</h2>
          <p className="apple-desc">
            Explore our verified systems integrations across corporate boardrooms, public venues, and residential spaces.
          </p>
        </div>

        {/* Apple Pill Filters (NO GRADIENTS) */}
        <div className="apple-filter-pills-row">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`apple-filter-pill ${filter === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 3-Column Apple Rounded Cards Grid (NO GRADIENTS) */}
        <div className="apple-projects-grid">
          {filteredProjects.map((project) => (
            <div key={project.id} className="apple-project-card">
              <div>
                <div className="apple-proj-top">
                  <span className="apple-proj-num">PROJECT {project.number}</span>
                  <span className="apple-proj-cat">{project.category}</span>
                </div>
                <h3 className="apple-proj-title">{project.title}</h3>
                <p className="apple-proj-desc">{project.description}</p>
                <div className="apple-proj-hardware">
                  <strong>Hardware:</strong> {project.includedEquipment}
                </div>
              </div>

              <div className="apple-proj-footer">
                <span className="apple-proj-status">
                  <span className="apple-status-dot"></span>
                  Commissioned
                </span>
                <a href="#contact" className="apple-proj-action-link">
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
