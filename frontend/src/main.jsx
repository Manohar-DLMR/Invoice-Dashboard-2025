// main.jsx

// --- Imports ---
import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/index.css';
import LoadingOrError from './components/LoadingOrError/LoadingOrError';

// Lazy load the pages
const App = lazy(() => import('./pages/App'));
const InvoiceDetails = lazy(() => import('./pages/InvoiceDetails'));

// --- Mount App to DOM ---

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Suspense fallback={<LoadingOrError loading={true} />}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/invoice/:groupId" element={<InvoiceDetails />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>
);