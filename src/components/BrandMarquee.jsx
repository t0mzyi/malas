import React from 'react';
import { BRANDS } from '../data/brandsData';

export default function BrandMarquee() {
  // Duplicate array 3 times for a completely seamless, continuous infinite loop
  const marqueeItems = [...BRANDS, ...BRANDS, ...BRANDS];

  return (
    <section id="brands" className="marquee-section" aria-label="Authorized partner brands">
      <div className="container marquee-header">
        <span className="marquee-title">Authorized partner for</span>
      </div>

      <div className="marquee-container" tabIndex={0} aria-label="Partner brand logos marquee, auto-playing continuous scroll">
        <div className="marquee-track">
          {marqueeItems.map((brand, idx) => (
            <div key={`${brand.name}-${idx}`} className="marquee-brand-item">
              {brand.logo ? (
                <img
                  src={brand.logo}
                  alt={`${brand.name} logo`}
                  className="marquee-brand-logo"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent && !parent.querySelector('.marquee-brand-wordmark')) {
                      const span = document.createElement('span');
                      span.className = 'marquee-brand-wordmark';
                      span.textContent = brand.name;
                      parent.appendChild(span);
                    }
                  }}
                />
              ) : (
                <span className="marquee-brand-wordmark">{brand.name}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
