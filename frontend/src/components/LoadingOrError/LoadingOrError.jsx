// LoadingOrError.jsx

import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoadingOrError.css';

function LoadingOrError({ loading, error, showBackButton = false }) {
  const navigate = useNavigate();

  // Randomly pick a loading message only once when component mounts
  const loadingMessages = [
    "Fetching awesome insights...",
    "Crunching numbers and brewing coffee ☕...",
    "Almost there... Just a few more seconds!",
    "Preparing your dashboard...",
    "Loading magic ✨... Please wait!"
  ];
  
  const randomMessage = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * loadingMessages.length);
    return loadingMessages[randomIndex];
  }, []); 

  if (loading) {
    return (
      <div className="loading-error-wrapper">
        <div className="loading-spinner" />
        <p className="loading-message">{randomMessage}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-error-wrapper">
        <p className="error-message">{error}</p>
        {showBackButton && (
          <button className="back-button" onClick={() => navigate('/')}>
            ← Back
          </button>
        )}
      </div>
    );
  }

  return null;
}

export default LoadingOrError;
