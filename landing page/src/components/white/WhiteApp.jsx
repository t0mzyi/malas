import React from 'react';
import App from '../../App';

/**
 * WhiteApp renders the exact same flagship landing page in White (Light) mode.
 * All 15 luxury projects with 3D flip card specs, 10 AV activities, brand marquee,
 * engineering process roadmap, standards, and consultation engine are identical to dark mode.
 */
export default function WhiteApp() {
  return <App initialTheme="white" />;
}
