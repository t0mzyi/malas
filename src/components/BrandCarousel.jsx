import React from 'react';
import { BRAND_ROWS } from '../data/brandsData';
import { BRAND_SVGS } from '../data/brandLogos';

export default function BrandCarousel() {
  // Multiply items by 4 to ensure completely seamless, unending infinite loops
  const row1Items = [...BRAND_ROWS.row1, ...BRAND_ROWS.row1, ...BRAND_ROWS.row1, ...BRAND_ROWS.row1];
  const row2Items = [...BRAND_ROWS.row2, ...BRAND_ROWS.row2, ...BRAND_ROWS.row2, ...BRAND_ROWS.row2];

  return (
    <section id="brands" className="brand-carousel-section" aria-label="Authorized partner brands">
      <div className="container brand-carousel-header">
        <span className="brand-carousel-title">Authorized Integration & Hardware Partners</span>
      </div>

      <div className="marquee-wrapper-outer">
        {/* Row 1: Left to Right Flow */}
        <div className="marquee-row-wrapper">
          <div className="marquee-track-ltr">
            {row1Items.map((brand, idx) => {
              const SvgComponent = BRAND_SVGS[brand.name];
              return (
                <div key={`r1-${brand.name}-${idx}`} className="brand-pill-card">
                  {SvgComponent ? (
                    <SvgComponent className="brand-svg-mark" />
                  ) : (
                    <span className="brand-text-mark">{brand.name}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Row 2: Right to Left Flow */}
        <div className="marquee-row-wrapper">
          <div className="marquee-track-rtl">
            {row2Items.map((brand, idx) => {
              const SvgComponent = BRAND_SVGS[brand.name];
              return (
                <div key={`r2-${brand.name}-${idx}`} className="brand-pill-card">
                  {SvgComponent ? (
                    <SvgComponent className="brand-svg-mark" />
                  ) : (
                    <span className="brand-text-mark">{brand.name}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

