import React from 'react';
import { SITE_DATA } from '../data/siteData';

export default function ProductsSection() {
  return (
    <section id="products" className="section-wrapper tall-media" aria-labelledby="products-title">
      <div className="container">
        <div className="section-head-block">
          <h2 id="products-title" className="section-title">
            Products
          </h2>
          <p className="section-desc">
            Authorized hardware procurement, custom fabrication, and certified installation for commercial environments.
          </p>
        </div>

        <div className="products-layout-grid">
          {SITE_DATA.products.map((product, idx) => (
            <div key={idx} className="product-card-item">
              {/* Media Container with Generous 24px Radius & Soft Shadow */}
              <div className="product-image-wrap">
                <img
                  src={product.image}
                  alt={product.imageAlt}
                  loading="lazy"
                />
                <span className="product-category-tag">{product.category}</span>
              </div>

              <div className="product-card-body">
                <h3 className="product-card-title">{product.title}</h3>

                {/* Clean Two-Column Unboxed Spec Rows */}
                <div className="spec-sheet-rows" style={{ marginTop: 'auto' }}>
                  {product.specs.map((spec, sIdx) => (
                    <div key={sIdx} className="spec-row">
                      <span className="spec-row-label">{spec.label}</span>
                      <span className="mono-val spec-row-value">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
