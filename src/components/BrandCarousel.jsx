import React from 'react';
import { BRAND_ROWS } from '../data/brandsData';

export default function BrandCarousel() {
  // Triple items for perfectly smooth, continuous infinite loops
  const row1Items = [...BRAND_ROWS.row1, ...BRAND_ROWS.row1, ...BRAND_ROWS.row1];
  const row2Items = [...BRAND_ROWS.row2, ...BRAND_ROWS.row2, ...BRAND_ROWS.row2];

  return (
    <section id="brands" className="brand-carousel-section" aria-label="Authorized partner brands">
      <div className="container brand-carousel-header">
        <span className="brand-carousel-title">Authorized Integration & Hardware Partners</span>
      </div>

      <div className="marquee-mask" tabIndex={0} aria-label="Continuous flowing partner brand logos in two opposing rows">
        {/* Row 1: Left to Right Flow */}
        <div className="marquee-row-ltr">
          {row1Items.map((brand, idx) => (
            <div key={`r1-${brand.name}-${idx}`} className="brand-pill-chip">
              {brand.logo ? (
                <img
                  src={brand.logo}
                  alt={`${brand.name} logo`}
                  className="brand-pill-logo"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent && !parent.querySelector('.brand-pill-name')) {
                      const span = document.createElement('span');
                      span.className = 'brand-pill-name';
                      span.textContent = brand.name;
                      parent.appendChild(span);
                    }
                  }}
                />
              ) : (
                <span className="brand-pill-name">{brand.name}</span>
              )}
            </div>
          ))}
        </div>

        {/* Row 2: Right to Left Flow */}
        <div className="marquee-row-rtl">
          {row2Items.map((brand, idx) => (
            <div key={`r2-${brand.name}-${idx}`} className="brand-pill-chip">
              {brand.logo ? (
                <img
                  src={brand.logo}
                  alt={`${brand.name} logo`}
                  className="brand-pill-logo"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent && !parent.querySelector('.brand-pill-name')) {
                      const span = document.createElement('span');
                      span.className = 'brand-pill-name';
                      span.textContent = brand.name;
                      parent.appendChild(span);
                    }
                  }}
                />
              ) : (
                <span className="brand-pill-name">{brand.name}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
