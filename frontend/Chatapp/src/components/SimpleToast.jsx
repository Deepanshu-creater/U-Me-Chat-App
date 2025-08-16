// components/SimpleToast.js
import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import './SimpleToast.css';

const CircularProgress = ({ progress }) => {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="circular-progress-container">
      <svg className="circular-progress" viewBox="0 0 40 40">
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
          className="progress-circle"
        />
      </svg>
      <div className="progress-icon">
        <Loader2 size={16} className="spin" />
      </div>
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
    <div className={`simple-toast ${type} ${visible ? 'visible' : 'hidden'}`}>
      <div className="toast-content">
        {type === 'success' && <CheckCircle size={20} />}
        {type === 'error' && <XCircle size={20} />}
        {type === 'progress' && <CircularProgress progress={progress} />}
        <span>{message}</span>
      </div>
      {type === 'progress' && (
        <div className="progress-section">
          <div className="progress-info">
            <span className="progress-label">Progress</span>
            <span className="progress-percentage">{progress}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}
    </div>
  );
};