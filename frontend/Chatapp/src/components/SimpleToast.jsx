// components/SimpleToast.js
import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import './SimpleToast.css';

const CircularProgress = ({ progress }) => {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="simple-toast-progress-container">
      <svg className="simple-toast-progress-svg" viewBox="0 0 40 40">
        <circle
          cx="20"
          cy="20"
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="3"
        />
        <circle
          cx="20"
          cy="20"
          r={radius}
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <Loader2 size={16} className="simple-toast-spin" />
    </div>
  );
};

export const SimpleToast = ({ message, type, progress, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (type !== 'progress') {
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => onClose(), 300);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [type, onClose]);

  if (!visible) return null;

  return (
    <div className={`simple-toast-root ${type} ${visible ? 'visible' : 'hidden'}`}>
      <div className="simple-toast-content">
        {type === 'success' && <CheckCircle size={20} className="simple-toast-icon" />}
        {type === 'error' && <XCircle size={20} className="simple-toast-icon" />}
        {type === 'progress' && <CircularProgress progress={progress} />}
        <span className="simple-toast-message">{message}</span>
      </div>
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
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};