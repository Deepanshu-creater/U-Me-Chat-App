import React, { useState } from 'react';
import { Download, Clock } from 'lucide-react';
import './download.css';

export default function DownloadPage() {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadClick = () => {
    setIsDownloading(true);
    // Simulate download process
    setTimeout(() => {
      setIsDownloading(false);
    }, 3000);
  };

  return (
    <div className="download-container">
      <div className="download-card">
        <h1>U&Me App Download</h1>
        <p>Get the latest version of our communication platform</p>
        
        <div className="download-status">
          {isDownloading ? (
            <div className="progress-message">
              <Clock className="progress-icon" />
              <span>Currently Under Progress</span>
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
            </div>
          ) : (
            <button className="download-btn" onClick={handleDownloadClick}>
              <Download className="download-icon" />
              Download Now
            </button>
          )}
        </div>

        <div className="version-info">
          <h3>Coming Soon</h3>
          <ul>
            <li>Version 2.0 with enhanced features</li>
            <li>Improved translation accuracy</li>
            <li>Faster video calling</li>
          </ul>
        </div>
      </div>
    </div>
  );
}