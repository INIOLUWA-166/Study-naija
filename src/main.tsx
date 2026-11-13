import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Register PWA Service Worker for offline app shell & personalized study path caching
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      window.dispatchEvent(new CustomEvent('studynaija_sw_status', {
        detail: { registered: true, active: Boolean(registration?.active) }
      }));
    },
    onOfflineReady() {
      window.dispatchEvent(new CustomEvent('studynaija_sw_status', {
        detail: { registered: true, offlineReady: true }
      }));
    },
    onRegisterError(error) {
      console.warn('StudyNaija Service Worker registration notice:', error);
    }
  });
}

// Global Crash Immunity Protocol: Prevent any uncaught promise rejection or error from crashing the UI
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    console.warn('StudyNaija CrashGuard: Intercepted unhandled promise rejection:', event.reason);
    // Prevent default browser crash behavior
    event.preventDefault();
  });

  window.addEventListener('error', (event) => {
    // Suppress benign cross-origin or script loading glitches from bubbling to crash
    if (event.message?.includes('ResizeObserver') || event.message?.includes('Script error')) {
      event.preventDefault();
      return;
    }
    console.warn('StudyNaija CrashGuard: Intercepted window error:', event.error || event.message);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
