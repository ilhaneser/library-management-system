import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './App.css'; // Make sure App.css is imported here
import App from './App';
import reportWebVitals from './reportWebVitals';

// Create a root first, then render
const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


reportWebVitals();