import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import '@fontsource/tiro-devanagari-hindi/400.css';
import '@fontsource/mukta/400.css';
import '@fontsource/mukta/500.css';
import '@fontsource/mukta/600.css';
import '@fontsource/mukta/700.css';
import './styles/app.css';
import './styles/view.css';
import './styles/details.css';
import App from './App';

// Offline support for the museum kiosk; updates apply automatically.
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
