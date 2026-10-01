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
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (path.includes('/white') || search.includes('white')) {
        try {
          localStorage.setItem('malas_theme_user_set', 'white');
          localStorage.removeItem('malas_theme');
        } catch {}
        return 'white';
      }
    }
    try {
      const saved = localStorage.getItem('malas_theme_user_set');
      if (saved === 'white' || saved === 'dark') return saved;
      // Remove legacy dev auto-seed
      localStorage.removeItem('malas_theme');
    } catch {
      // ignore localStorage errors
    }
    return 'white';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('malas_theme_user_set', theme);
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
