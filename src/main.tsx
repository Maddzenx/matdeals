import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { validateEnv } from './utils/env';

// Validate environment variables
try {
  validateEnv();
} catch (error) {
  console.error('Environment validation failed:', error);
  // You might want to show a user-friendly error message here
  // or handle the error in a different way
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
