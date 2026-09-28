import React from 'react';
import { BRAND_ROWS } from '../../data/brandsData';
import { BRAND_SVGS } from '../../data/brandLogos';

export default function WhiteBrandCarousel() {
  // Use first 8 primary brands for a clean, non-repetitive quiet strip
  const featuredBrands = BRAND_ROWS.row1.slice(0, 8);

  return (
    <div className="simple-brands">
      <div className="white-container">
        <div className="simple-brands-title">
          Authorized Integration Partners & Certified Hardware
        </div>
        <div className="simple-brands-track">
          {featuredBrands.map((brand, idx) => {
            const SvgComponent = BRAND_SVGS[brand.name];
            return (
              <div key={idx} className="simple-brand-item" title={brand.name}>
                {SvgComponent ? (
                  <SvgComponent />
                ) : (
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6B7280' }}>
                    {brand.name}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
