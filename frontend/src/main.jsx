// main.jsx

// --- Imports ---
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './pages/App';
import InvoiceDetails from './pages/InvoiceDetails';
import './styles/index.css';

// --- Mount App to DOM ---

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/invoice/:groupId" element={<InvoiceDetails />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
