import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import BrandCarousel from './components/BrandCarousel';
import ServicesSection from './components/ServicesSection';
import ProjectsSection from './components/ProjectsSection';
import ProcessSection from './components/ProcessSection';
import AboutSection from './components/AboutSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';

export default function App({ initialTheme }) {
  const [theme, setTheme] = useState(() => {
    if (initialTheme) return initialTheme;
    try {
      const saved = localStorage.getItem('malas_theme');
      if (saved === 'white' || saved === 'dark') return saved;
    } catch {
      // ignore localStorage errors
    }
    return 'white';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('malas_theme', theme);
    } catch {
      // ignore localStorage errors
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'white' ? 'dark' : 'white'));
  };

  return (
    <div 
      className={`site-wrapper ${theme === 'white' ? 'white-theme' : ''}`} 
      data-theme={theme}
    >
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <main id="main-content">
        <HeroSection />
        <BrandCarousel />
        <ServicesSection />
        <ProjectsSection />
        <ProcessSection />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
