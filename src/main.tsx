import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

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
