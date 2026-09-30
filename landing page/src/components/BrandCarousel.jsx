import React from 'react';
import { BRAND_ROWS } from '../data/brandsData';
import { BRAND_SVGS } from '../data/brandLogos';

export default function BrandCarousel() {
  const row1Items = [...BRAND_ROWS.row1, ...BRAND_ROWS.row1, ...BRAND_ROWS.row1];
  const row2Items = [...BRAND_ROWS.row2, ...BRAND_ROWS.row2, ...BRAND_ROWS.row2];

  return (
    <section id="brands" className="brand-matrix-section" aria-label="Authorized Integration Partners">
      <div className="container brand-matrix-header">
        <span className="brand-matrix-label">Authorized Hardware & Integration Partners</span>
      </div>

      <div className="brand-marquee-container">
        {/* Row 1: Flow Left */}
        <div className="brand-marquee-row">
          <div className="brand-marquee-track-left">
            {row1Items.map((brand, idx) => {
              const SvgComponent = BRAND_SVGS[brand.name];
              return (
                <div key={`m1-${brand.name}-${idx}`} className="brand-faceplate-card">
                  {SvgComponent ? (
                    <SvgComponent className="brand-faceplate-svg" />
                  ) : (
                    <span className="brand-faceplate-text">{brand.name}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Row 2: Flow Right */}
        <div className="brand-marquee-row">
          <div className="brand-marquee-track-right">
            {row2Items.map((brand, idx) => {
              const SvgComponent = BRAND_SVGS[brand.name];
              return (
                <div key={`m2-${brand.name}-${idx}`} className="brand-faceplate-card">
                  {SvgComponent ? (
                    <SvgComponent className="brand-faceplate-svg" />
                  ) : (
                    <span className="brand-faceplate-text">{brand.name}</span>
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
