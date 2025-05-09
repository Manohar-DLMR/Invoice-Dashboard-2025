// Spinner.jsx
import React from 'react';
import './Spinner.css';

function Spinner({ size = 40 }) {
  return (
    <div className="spinner-container">
      <div className="spinner" style={{ width: size, height: size }} />
    </div>
  );
}

export default Spinner;
