import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './index.css';

// Polyfill for crypto.randomUUID and guard against non-fatal ServiceWorker unhandled rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = (reason?.message || reason?.stack || String(reason) || '').toLowerCase();
    if (msg.includes('serviceworker') || msg.includes('service worker') || msg.includes('failed to update')) {
      console.warn('[Handled non-fatal ServiceWorker rejection]:', reason);
      event.preventDefault();
    }
  });

  if (!window.crypto) {
    (window as any).crypto = {} as any;
  }
  if (!window.crypto.randomUUID) {
    (window.crypto as any).randomUUID = function() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
