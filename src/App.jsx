import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import BrandCarousel from './components/BrandCarousel';
import ServicesSection from './components/ServicesSection';
import ProjectsSection from './components/ProjectsSection';
import AboutSection from './components/AboutSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import WhiteApp from './components/white/WhiteApp';

export default function App() {
  const [isWhite, setIsWhite] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname.toLowerCase().startsWith('/white');
    }
    return false;
  });

  useEffect(() => {
    const handlePopState = () => {
      setIsWhite(window.location.pathname.toLowerCase().startsWith('/white'));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // When visiting /white, render the clean White Edition
  if (isWhite) {
    return <WhiteApp />;
  }

  // When visiting /, render the clean Apple Dark Style
  return (
    <div className="site-wrapper">
      <Header />
      <main id="main-content">
        <HeroSection />
        <BrandCarousel />
        <ServicesSection />
        <ProjectsSection />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
