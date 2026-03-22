import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import './styles/cards.css';
import './utils/cheats.js';
import App from './App.jsx';

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Remove the HTML splash screen once React has rendered
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    if (window.__removeSplash) window.__removeSplash();
  });
});
