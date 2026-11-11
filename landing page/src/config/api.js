/**
 * Centralized API configuration for Malas Electronics Landing Page
 * In production on Vercel, set VITE_API_BASE_URL in your Vercel Project Settings
 * Example: https://your-admin-backend.onrender.com/api
 */
export const API_BASE = (
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000/api'
    : '/api')
);

