import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import BOQ from './Pages/boq';
import App from './ProductPage';
import { GrandTotalProvider } from "./GrandTotalContext"; // Import your context provider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GrandTotalProvider>
      {/* <BOQ /> */}
      <App />
    </GrandTotalProvider>
  </React.StrictMode>
);
