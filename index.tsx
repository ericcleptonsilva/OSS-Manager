import "./index.css";
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { initializeParse } from './services/parseService';

// Garante inicialização do Parse antes da montagem da árvore React
try {
  initializeParse();
} catch (e) {
  console.warn('[Parse Init Warning]', e);
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
