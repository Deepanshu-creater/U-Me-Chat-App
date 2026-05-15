import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, User, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './login.css';
import axios from 'axios';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    axios.post( 'https://u-me-chat-app.onrender.com/login'||'http://localhost:3001/login', formData)
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

  return (
    <div className="login-container">
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
    <input
      type="text"
      id="username"
      placeholder="YourUsername@123"
      value={formData.username}
      onChange={handleChange}
     />
    </div>
    {errors.username && <span className="error-message">{errors.username}</span>}
    </div>

        <div className={`form-group ${errors.password ? 'error' : ''}`}>
          <label htmlFor="password">Password</label>
          <div className="input-wrapper">
            <Lock size={18} className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
            <button 
              type="button" 
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <span className="error-message">{errors.password}</span>}
        </div>

        <div className="form-options">
          <label className="remember-me">
            <input type="checkbox" id="remember" />
            <span>Remember me</span>
          </label>
          <button type="button" className="forgot-password">
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
    </div>
  );
}