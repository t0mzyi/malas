import React from 'react';
import { SITE_DATA } from '../data/siteData';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-flex-row">
          <div className="footer-copy">
            © {new Date().getFullYear()} {SITE_DATA.company.name}. All rights reserved.
          </div>
          <div className="footer-meta">
            DUBAI · ABU DHABI · SHARJAH · NORTHERN EMIRATES · 24/7 SLA ACTIVE
          </div>
        </div>
      </div>
    </footer>
  );
}
