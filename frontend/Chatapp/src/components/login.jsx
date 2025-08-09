import React, { useState } from 'react';
import { ChevronLeft, Mail, Lock, ArrowRight, User, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './login.css';
import axios from 'axios';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const SOCKET_URL = "https://u-me-chat-app.onrender.com";
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors(prev => ({ ...prev, [id]: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Client-side validation FIRST
    const newErrors = {};
    if (!formData.username) newErrors.username = 'Required';
    if (!formData.password) newErrors.password = 'Required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    
    // Make API call only if validation passes
    axios.post(`${SOCKET_URL}/login`, formData)
      .then(response => {
        console.log("Login successful:", response.data);

        // ✅ Save username & token to localStorage
        localStorage.setItem("username", response.data.user.username);
        localStorage.setItem("token", response.data.token);

        setTimeout(() => {
          setIsSubmitting(false);
          navigate('/chat', { state: { username: response.data.user.username } });  // After saving username
        }, 1500);
      })
      .catch(error => {
        console.error("Error logging in:", error);
        setIsSubmitting(false);

        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          setErrors({ username: error.response.data.message });
        } else {
          setErrors({ username: 'Invalid username or password' });
        }
      });
  };

  const handleForgotPassword = async (e) => {
  e.preventDefault();
  
  // Add validation for empty username
  if (!formData.username.trim()) {
    setErrors({ username: 'Username is required for password reset' });
    return;
  }

  setIsSubmitting(true);
  setErrors({});

  try {
    const response = await axios.post(`${SOCKET_URL}/forgot-password`, {
      username: formData.username
    });
    
    if (response.data.message === 'User not found') {  // Check backend response
      alert('Username not found. Please check and try again.');
      return;
    }
    
    setResetSent(true);
  } catch (error) {
    if (error.response?.data?.message === 'User not found') {
      alert('Username not found. Please check and try again.');
    } else {
      alert('Failed to send reset link. Please try again later.');
    }
    setErrors({
      reset: error.response?.data?.message || 'Failed to send reset email'
    });
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="login-container">
      {!forgotPasswordMode ? (
        <>
          <div className="login-header">
            <div className="login-logo">
              <User size={44} />
            </div>
            <h1>Welcome Back</h1>
            <p>Sign in to your account</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className={`form-group ${errors.username ? 'error' : ''}`}> 
              <label htmlFor="username">Username</label> 
              <div className="input-wrapper"> 
                <User size={18} className="input-icon" /> 
                <input type="text" 
                id="username"
                placeholder="YourUsername@123" 
                value={formData.username} onChange={handleChange} 
                style={{ color: 'black' }}
                />
                 </div> {errors.username && <span className="error-message">
                  {errors.username}</span>} 
                  </div>
                  <div className={`form-group ${errors.password ? 'error' : ''}`}> 
                    <label htmlFor="password">
                      Password
                      </label>
                     <div className="input-wrapper">
                       <Lock size={18} className="input-icon" /> 
                     <input 
                     type={showPassword ? "text" : "password"} 
                     id="password" placeholder="••••••••" 
                     value={formData.password} 
                     style={{ color: 'black' }}
                     onChange={handleChange} /> 
                     <button type="button" 
                     className="password-toggle" 
                     onClick={() => setShowPassword(!showPassword)} 
                     >
                       {showPassword ? <EyeOff size={18} /> 
                     : <Eye size={18} />}
                      </button> </div> {errors.password && <span className="error-message">{errors.password}</span>} </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" id="remember" />
                <span>Remember me</span>
              </label>
              <button 
                type="button" 
                className="forgot-password"
               onClick={() => setForgotPasswordMode(true)}
              >
                Forgot password?
              </button>
            </div>

            <button type="submit" className="login-button" disabled={isSubmitting}>
              {isSubmitting ? 'Signing In...' : 'Sign In'}
              <ArrowRight size={20} />
            </button>
          </form>

          <div className="register-redirect">
            Don't have an account? <button onClick={() => navigate('/register')}>Sign Up</button>
          </div>
        </>
      ) : (
        // THIS WAS THE MISSING BRACKET - Changed from ":" to "("
        <>
          <button 
            className="back-button"
            onClick={() => {
              setForgotPasswordMode(false);
              setResetSent(false);
              setResetEmail('');
              setErrors({});
            }}
          >
            <ChevronLeft size={20} /> Back to login
          </button>

          <div className="login-header">
            <div className="login-logo">
              <Lock size={44} />
            </div>
            <h1>Reset Password</h1>
            <p>Enter your username to receive a reset link</p>
          </div>

          {!resetSent ? (
            <form className="login-form" onSubmit={handleForgotPassword}>
              <div className={`form-group ${errors.username ? 'error' : ''}`}>
                <label htmlFor="username">Username</label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    id="username"
                    placeholder="Your username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
                {errors.username && (
                  <span className="error-message">
                    {errors.username === 'Required' 
                      ? 'Username is required' 
                      : errors.username}
                  </span>
                )}
              </div>

              <button 
                type="submit" 
                className="login-button" 
                disabled={!formData.username.trim() || isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                <ArrowRight size={20} />
              </button>
            </form>
          ) : (
            <div className="reset-sent-message">
              <CheckCircle size={48} color="#4BB543" style={{marginBottom: '1rem'}} />
              <p>If the username exists, we've sent a password reset link.</p>
              <p>Please check your email and follow the instructions.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}