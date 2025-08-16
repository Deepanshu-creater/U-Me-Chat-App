import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import "./SimpleToast.css";

export const SimpleToast = ({ message, type = "info", progress, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    document.body.classList.add("simple-toast-active");

    return () => {
      document.body.classList.remove("simple-toast-active");
    };
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <>
      {/* Overlay div - separate from toast */}
      <div className={`simple-toast-overlay ${visible ? "visible" : ""}`} />
      
      {/* Toast content */}
      <div className={`simple-toast-root ${type} ${visible ? "visible" : "hidden"}`}>
        <div className="simple-toast-content">
          <div className="simple-toast-icon">
            {type === "success" && <CheckCircle size={20} />}
            {type === "error" && <XCircle size={20} />}
            {type === "progress" && <Loader2 className="simple-toast-spin" size={20} />}
          </div>
          <div className="simple-toast-message">{message}</div>
        </div>

        {type === "progress" && (
          <div className="simple-toast-progress-section">
            <div className="simple-toast-progress-info">
              <span className="simple-toast-progress-label">In Progress</span>
              <span className="simple-toast-progress-percentage">{progress || 0}%</span>
            </div>
            <div className="simple-toast-progress-bar">
              <div
                className="simple-toast-progress-fill"
                style={{ width: `${progress || 0}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};