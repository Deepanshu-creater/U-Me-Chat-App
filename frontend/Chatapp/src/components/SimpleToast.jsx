// components/SimpleToast.js
import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import './SimpleToast.css';

// Circular Progress Component
const CircularProgress = ({ progress }) => {
  const radius = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="simple-toast-progress-container">
      <svg className="simple-toast-progress-svg" viewBox="0 0 24 24">
        <circle
          cx="12"
          cy="12"
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="2"
        />
        <circle
          cx="12"
          cy="12"
          r={radius}
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-300 ease-out"
        />
      </svg>
      <div className="simple-toast-spin">
        <Loader2 size={12} />
      </div>
    </div>
  );
};

export const SimpleToast = ({ message, type, progress = 0, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Add body class to prevent scrolling
    document.body.classList.add('simple-toast-active');
    
    // Show toast after brief delay for animation
    const showTimer = setTimeout(() => {
      setVisible(true);
    }, 50);

    // Auto-close for non-progress toasts
    let autoCloseTimer;
    if (type !== 'progress') {
      autoCloseTimer = setTimeout(() => {
        handleClose();
      }, 3000);
    }

    return () => {
      clearTimeout(showTimer);
      if (autoCloseTimer) clearTimeout(autoCloseTimer);
      document.body.classList.remove('simple-toast-active');
    };
  }, [type]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      document.body.classList.remove('simple-toast-active');
      onClose();
    }, 300);
  };

  const handleOverlayClick = (e) => {
    // Only close if clicking the overlay, not the toast itself
    if (e.target === e.currentTarget && type !== 'progress') {
      handleClose();
    }
  };

  return (
    <>
      {/* Full Screen Overlay */}
      <div 
        className={`simple-toast-overlay ${visible ? 'visible' : 'hidden'}`}
        onClick={handleOverlayClick}
      >
        {/* Toast Content */}
        <div className={`simple-toast-root ${type} ${visible ? 'visible' : 'hidden'}`}>
          <div className="simple-toast-content">
            <div className="simple-toast-icon">
              {type === 'success' && <CheckCircle size={20} />}
              {type === 'error' && <XCircle size={20} />}
              {type === 'progress' && <Loader2 size={20} className="simple-toast-spin" />}
            </div>
            <span className="simple-toast-message">{message}</span>
          </div>
          
          {/* Circular Progress positioned at bottom-right of toast */}
          {type === 'progress' && <CircularProgress progress={progress} />}

          {type === 'progress' && (
            <div className="simple-toast-progress-section">
              <div className="simple-toast-progress-info">
                <span className="simple-toast-progress-label">Progress</span>
                <span className="simple-toast-progress-percentage">{progress}%</span>
              </div>
              <div className="simple-toast-progress-bar">
                <div 
                  className="simple-toast-progress-fill" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};