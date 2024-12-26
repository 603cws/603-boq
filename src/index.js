import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import BOQ from './Pages/boq';
import App from './ProductPage';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* <BOQ /> */}
    <App />
  </React.StrictMode>
);

