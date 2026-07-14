/**
 * Shared Google Maps JavaScript API loader.
 * Prevents duplicate <script> injection when navigating between pages
 * that all need the Maps API (MapPage, DonorDashboard, NgoDashboard).
 *
 * Usage:
 *   import { loadGoogleMaps } from '../utils/googleMapsLoader';
 *   await loadGoogleMaps();  // safe to call multiple times
 */

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

let loadPromise = null; // Singleton promise — only one load ever runs

export function loadGoogleMaps(libraries = 'places,geometry') {
  // Already loaded
  if (window.google && window.google.maps) {
    return Promise.resolve();
  }

  // Load already in-flight — return the same promise
  if (loadPromise) {
    return loadPromise;
  }

  // Remove any stale/failed script tags before injecting a new one
  const existing = document.querySelector('script[src*="maps.googleapis.com"]');
  if (existing) {
    existing.remove();
  }

  loadPromise = new Promise((resolve, reject) => {
    if (!GOOGLE_MAPS_KEY) {
      loadPromise = null;
      return reject(new Error('VITE_GOOGLE_MAPS_API_KEY is not set in .env'));
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=${libraries}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loadPromise = null; // Allow retry on error
      reject(new Error('Failed to load Google Maps script. Check your API key and enabled APIs.'));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}
