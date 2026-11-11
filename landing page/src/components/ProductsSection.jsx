import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config/api';

export default function ProductsSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/products`)
      .then(res => res.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.products)) {
          setProducts(data.products);
        }
      })
      .catch(err => {
        console.warn('Could not load products from API:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Do not render if loading or if database has no products
  if (loading || products.length === 0) {
    return null;
  }

  return (
    <section id="products" className="section-wrapper tall-media" aria-labelledby="products-title">
      <div className="container">
        <div className="section-head-block">
          <h2 id="products-title" className="section-title">
            Hardware Catalog & Products
          </h2>
          <p className="section-desc">
            Authorized hardware procurement, custom fabrication, and certified installation for commercial environments.
          </p>
        </div>

        <div className="products-layout-grid">
          {products.map((product) => {
            // Parse specs if available (e.g. "Label: Value | Label2: Value2")
            const specList = [];
            if (product.specifications) {
              const parts = product.specifications.split('|');
              parts.forEach(part => {
                const sub = part.split(':');
                if (sub.length >= 2) {
                  specList.push({ label: sub[0].trim(), value: sub.slice(1).join(':').trim() });
                } else if (sub[0].trim()) {
                  specList.push({ label: 'Spec', value: sub[0].trim() });
                }
              });
            }

            return (
              <div key={product.id} className="product-card-item">
                <div className="product-image-wrap">
                  <img
                    src={product.image_url || '/logo.png'}
                    alt={product.name}
                    loading="lazy"
                    onError={(e) => { e.target.src = '/logo.png'; }}
                  />
                  {product.category_name && (
                    <span className="product-category-tag">{product.category_name}</span>
                  )}
                </div>

                <div className="product-card-body">
                  <h3 className="product-card-title">{product.name}</h3>
                  {product.model_number && (
                    <div className="mono-val" style={{ fontSize: '0.8rem', color: 'var(--text-muted, #888)', marginBottom: '8px' }}>
                      SKU: {product.model_number}
                    </div>
                  )}
                  {product.tagline && (
                    <p style={{ fontSize: '0.9rem', marginBottom: '12px' }}>{product.tagline}</p>
                  )}

                  {specList.length > 0 && (
                    <div className="spec-sheet-rows" style={{ marginTop: 'auto' }}>
                      {specList.slice(0, 4).map((spec, sIdx) => (
                        <div key={sIdx} className="spec-row">
                          <span className="spec-row-label">{spec.label}</span>
                          <span className="mono-val spec-row-value">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
