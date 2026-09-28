import React from 'react';
import { motion } from 'framer-motion';
import { SITE_DATA } from '../data/siteData';

export default function HeroSection() {
  // Stagger animation container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 22 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section id="home" className="hero-apple-section">
      <div className="container">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="hero-motion-wrapper"
        >
          {/* Brand Name & Brand Logo Showcase Centerpiece */}
          <motion.div variants={itemVariants} className="hero-brand-centerpiece-wrap">
            <motion.div
              className="hero-brand-centerpiece"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              {/* Prominent Official Logo */}
              <div className="hero-brand-logo-frame">
                <img
                  src="/logo.png"
                  alt="Malas Electronics Official Logo"
                  className="hero-brand-logo-img"
                />
              </div>

              {/* Brand Typography & Verification */}
              <div className="hero-brand-text-block">
                <div className="hero-brand-name-row">
                  <span className="hero-brand-title-large">MALAS ELECTRONICS</span>
                  <span className="hero-official-badge">
                    <span className="chip-dot-green pulse-dot"></span>
                    VERIFIED
                  </span>
                </div>
                <span className="hero-brand-spec-line">
                  AUDIO-VISUAL SYSTEMS INTEGRATOR & EVENT TECHNOLOGY
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* Main Headline */}
          <motion.h1 variants={itemVariants} className="hero-apple-title">
            Next-Generation Audio-Visual <br />
            Engineering & Integration.
          </motion.h1>

          {/* What They Do Description */}
          <motion.p variants={itemVariants} className="hero-apple-desc">
            {SITE_DATA.company.whatWeDo}
          </motion.p>

          {/* Core Capabilities Chips */}
          <motion.div variants={itemVariants} className="hero-apple-chips-row">
            {SITE_DATA.hero.capabilities.map((cap, idx) => (
              <motion.span
                key={idx}
                className="hero-apple-chip"
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <span className="chip-dot-green"></span>
                {cap}
              </motion.span>
            ))}
          </motion.div>

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="hero-apple-actions">
            <motion.a
              href="#contact"
              className="btn-apple-solid"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Request an AV Proposal &rarr;
            </motion.a>
            <motion.a
              href="#services"
              className="btn-apple-translucent"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Explore 10 AV Activities
            </motion.a>
            <motion.a
              href="#projects"
              className="btn-apple-translucent"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              View 15 Projects
            </motion.a>
          </motion.div>

          {/* 4 Apple Stat Pills */}
          <motion.div variants={itemVariants} className="hero-apple-stats-grid">
            {SITE_DATA.hero.stats.map((stat, idx) => (
              <motion.div
                key={idx}
                className="hero-stat-pill-card"
                whileHover={{ y: -3, borderColor: 'rgba(255, 255, 255, 0.2)' }}
                transition={{ duration: 0.25 }}
              >
                <div className="hero-stat-pill-val">{stat.value}</div>
                <div className="hero-stat-pill-lbl">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Single Framed Hero Image with 24px Rounded Corners & Motion Entrance */}
          <motion.div
            variants={itemVariants}
            className="hero-apple-media-frame"
          >
            <div className="hero-media-wrapper-relative">
              <img
                src={SITE_DATA.hero.image}
                alt={SITE_DATA.hero.imageAlt}
                loading="eager"
              />
              <div className="hero-media-status-pill">
                <span className="chip-dot-green pulse-dot"></span>
                <span>COMMISSIONED AV AUDITORIUM · DUBAI, UAE</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
