import React from 'react';
import { SITE_DATA } from '../../data/siteData';

export default function WhiteFooter() {
  return (
    <footer className="simple-footer">
      <div className="white-container">
        <div className="simple-footer-flex">
          <div>
            © {new Date().getFullYear()} {SITE_DATA.company.name}. All rights reserved.
          </div>
          <div>
            Dubai, United Arab Emirates · Authorized Systems Integrator
          </div>
        </div>
      </div>
    </footer>
  );
}
