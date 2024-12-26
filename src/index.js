import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import BOQ from './Pages/boq';
import SideBar from './Components/SideBar';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* <BOQ /> */}
    <SideBar />
  </React.StrictMode>
);

