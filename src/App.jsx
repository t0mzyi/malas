import React, { useEffect } from 'react';
import FloatingNav from './components/FloatingNav';
import HeroSection from './components/HeroSection';
import BrandCarousel from './components/BrandCarousel';
import ServicesSection from './components/ServicesSection';
import AboutSection from './components/AboutSection';
import ProcessSection from './components/ProcessSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';

export default function App() {
  useEffect(() => {
    // Subtle section entrance via IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    const sections = document.querySelectorAll('.fade-in-section');
    sections.forEach((sec) => observer.observe(sec));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="site-wrapper">
      <FloatingNav />
      <main id="main-content">
        <HeroSection />
        <BrandCarousel />
        <div className="fade-in-section">
          <ServicesSection />
        </div>
        <div className="fade-in-section">
          <AboutSection />
        </div>
        <div className="fade-in-section">
          <ProcessSection />
        </div>
        <div className="fade-in-section">
          <ContactSection />
        </div>
      </main>
      <Footer />
    </div>
  );
}
