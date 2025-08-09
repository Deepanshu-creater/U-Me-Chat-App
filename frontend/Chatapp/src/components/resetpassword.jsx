import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import axios from 'axios';
import './login.css';

export default function ResetPassword() {
  const SOCKET_URL = "https://u-me-chat-app.onrender.com"
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Add validation
  if (!newPassword || !confirmPassword) {
    setErrors({ form: 'Please fill in all fields' });
    return;
  }

  if (newPassword !== confirmPassword) {
    setErrors({ form: 'Passwords do not match' });
    return;
  }

  try {
    const response = await axios.post(`${SOCKET_URL}/reset-password`, {
      token: searchParams.get('token'), // Make sure token is properly passed
      newPassword // Match backend expected field name
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log("Reset successful:", response.data);
    navigate('/login');
  } catch (error) {
    console.error("Reset error:", error.response?.data || error.message);
    setErrors({
      form: error.response?.data?.message || 'Failed to reset password'
    });
  }
};
  if (success) {
    return (
      <div className="login-container">
        <div className="reset-success">
          <CheckCircle size={48} color="#4BB543" />
          <h2>Password Reset Successful</h2>
          <p>Your password has been updated successfully.</p>
          <p>You will be redirected to the login page shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-header">
        <div className="login-logo">
          <Lock size={44} />
        </div>
        <h1>Set New Password</h1>
        <p>Create a new password for your account</p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        {errors.form && <div className="error-message">{errors.form}</div>}

        <div className={`form-group ${errors.newPassword ? 'error' : ''}`}>
          <label htmlFor="newPassword">New Password</label>
          <div className="input-wrapper">
            <Lock size={18} className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              id="newPassword"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button 
              type="button" 
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.newPassword && <span className="error-message">{errors.newPassword}</span>}
        </div>

        <div className={`form-group ${errors.confirmPassword ? 'error' : ''}`}>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <div className="input-wrapper">
            <Lock size={18} className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              id="confirmPassword"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
        </div>

        <button type="submit" className="login-button" disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}