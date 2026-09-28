import React from 'react';
import { motion } from 'framer-motion';
import { SITE_DATA } from '../data/siteData';

export default function ProcessSection() {
  return (
    <section id="process" className="section-wrapper bg-elevated" aria-labelledby="process-title">
      <div className="container">
        <motion.div 
          className="section-head-block"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <span className="section-kicker">Methodology</span>
          <h2 id="process-title" className="section-title">
            The 4-Stage Execution Standard
          </h2>
          <p className="section-desc">
            Applied to every commercial and industrial installation across Dubai and the Northern Emirates.
          </p>
        </motion.div>

        {/* Connected Horizontal Timeline */}
        <div className="process-timeline">
          {SITE_DATA.process.map((step, idx) => (
            <motion.div 
              key={step.num} 
              className="process-timeline-step"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, delay: idx * 0.15, ease: 'easeOut' }}
            >
              <div className="process-step-node">
                {step.num}
              </div>
              <div className="process-step-content">
                <h3 className="process-step-title">{step.title}</h3>
                <p className="process-step-desc">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
