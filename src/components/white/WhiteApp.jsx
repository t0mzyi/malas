import React from 'react';
import '../../styles/white-theme.css';
import WhiteHeader from './WhiteHeader';
import WhiteHeroSection from './WhiteHeroSection';
import WhiteBrandCarousel from './WhiteBrandCarousel';
import WhiteServicesSection from './WhiteServicesSection';
import WhiteProjectsSection from './WhiteProjectsSection';
import WhiteAboutSection from './WhiteAboutSection';
import WhiteContactSection from './WhiteContactSection';
import WhiteFooter from './WhiteFooter';

export default function WhiteApp() {
  return (
    <div className="white-theme">
      <WhiteHeader />
      <main id="white-main">
        <WhiteHeroSection />
        <WhiteBrandCarousel />
        <WhiteServicesSection />
        <WhiteProjectsSection />
        <WhiteAboutSection />
        <WhiteContactSection />
      </main>
      <WhiteFooter />
    </div>
  );
}
