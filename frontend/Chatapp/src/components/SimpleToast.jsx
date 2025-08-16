// components/SimpleToast.js
import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import './SimpleToast.css';

export const SimpleToast = ({ message, type, progress, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (type !== 'progress') {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [type, onClose]);

  if (!visible) return null;

  return (
    <div className={`simple-toast ${type}`}>
      <div className="toast-content">
        {type === 'success' && <CheckCircle size={20} />}
        {type === 'error' && <XCircle size={20} />}
        {type === 'progress' && <Loader2 size={20} className="spin" />}
        <span>{message}</span>
      </div>
      {type === 'progress' && (
        <div className="progress-bar">
          <div className="progress" style={{ width: `${progress}%` }}></div>
        </div>
      )}
    </div>
  );
};