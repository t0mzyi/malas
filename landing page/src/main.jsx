import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const isWhitePath = 
  typeof window !== 'undefined' && 
  (window.location.pathname.toLowerCase().includes('/white') || window.location.search.toLowerCase().includes('white'));

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App initialTheme={isWhitePath ? 'white' : undefined} />
  </React.StrictMode>
);
