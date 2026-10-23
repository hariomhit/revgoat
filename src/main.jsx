import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import './index.css';

// Global Anti-Crash Protectors & Stale Cache Purger
if (typeof window !== 'undefined') {
  // Purge any stale Service Worker caches so users never load old crash guard screens
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    }).catch(() => {});
  }

  if ('caches' in window) {
    caches.keys().then((keys) => {
      keys.forEach((key) => caches.delete(key));
    }).catch(() => {});
  }

  // Catch unhandled promises & runtime errors without breaking the app
  window.addEventListener('unhandledrejection', (event) => {
    console.warn('[RevGOAT Guard] Suppressed unhandled rejection:', event.reason);
    event.preventDefault();
  });

  window.addEventListener('error', (event) => {
    console.warn('[RevGOAT Guard] Intercepted window error:', event.message || event.error);
    event.preventDefault();
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
