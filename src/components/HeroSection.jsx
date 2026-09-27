import React from 'react';
import { motion } from 'framer-motion';
import { SITE_DATA } from '../data/siteData';

export default function HeroSection() {
  const stats = [
    {
      value: '15+',
      label: 'Years of Engineering',
    },
    {
      value: '500+',
      label: 'Projects Completed',
    },
    {
      value: '99.8%',
      label: 'Client Satisfaction',
    },
    {
      value: '26+',
      label: 'Industry Partners',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 40 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }
    }
  };

  return (
    <section className="contained-hero-section" aria-labelledby="hero-title">
      <div className="container">
        {/* Top Text Content */}
        <motion.div 
          className="contained-hero-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.span variants={itemVariants} className="contained-eyebrow">Enterprise Systems Integrator</motion.span>
          <motion.h1 variants={itemVariants} id="hero-title" className="contained-headline">
            Powering The Future. <br />
            <span className="contained-gold" style={{ wordSpacing: '0.6em' }}>Built For Precision.</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="contained-desc">
            End-to-end trading, expert implementation, and meticulous maintenance of advanced electrical, high-performance audiovisual, robotics, and precision control infrastructure across the UAE.
          </motion.p>
          <motion.div variants={itemVariants} className="contained-cta">
            <a href="#services" className="btn btn-luxury-gold">
              Explore Solutions
            </a>
            <a href="#contact" className="btn btn-luxury-ghost">
              Get In Touch
            </a>
          </motion.div>
        </motion.div>

        {/* Floating Center Media */}
        <motion.div 
          className="contained-hero-media"
          variants={imageVariants}
          initial="hidden"
          animate="visible"
        >
          <img
            src={SITE_DATA.hero.image}
            alt={SITE_DATA.hero.imageAlt}
            className="contained-img"
            loading="eager"
          />
        </motion.div>
      </div>

      {/* Stats Bar */}
      <motion.div 
        className="contained-stats-wrapper container"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
      >
        <div className="contained-stats-bar">
          {stats.map((stat, idx) => (
            <div key={idx} className="contained-stat-cell">
              <div className="contained-stat-number">{stat.value}</div>
              <div className="contained-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
