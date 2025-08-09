import React, { useState } from 'react';
import { User, Mail, Lock, ArrowRight, Smartphone, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './register.css';
import axios from 'axios';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const SOCKET_URL = "https://u-me-chat-app.onrender.com";
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;

    // Update form data
    const updatedFormData = {
      ...formData,
      [id]: value,
    };
    setFormData(updatedFormData);

    // === Username validation ===
    if (id === 'username') {
      const hasNumber = /\d/.test(value);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
      if (!hasNumber || !hasSpecialChar) {
        setErrors((prev) => ({
          ...prev,
          username: 'Username must include at least one number and one special character',
        }));
      } else {
        setErrors((prev) => ({ ...prev, username: null }));
      }
    }

    // === Password confirmation validation ===
    if (id === 'password' || id === 'confirmPassword') {
      if (
        updatedFormData.password &&
        updatedFormData.confirmPassword &&
        updatedFormData.password !== updatedFormData.confirmPassword
      ) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: 'Check entered password again',
        }));
      } else {
        setErrors((prev) => ({ ...prev, confirmPassword: null }));
      }
    }

    // === Clear other field‑specific errors ===
    if (errors[id] && id !== 'confirmPassword' && id !== 'username') {
      setErrors((prev) => ({ ...prev, [id]: null }));
    }
  };

const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 1. MOVE VALIDATION TO THE TOP (before API call)
    const newErrors = {};
    if (!formData.username) {
      newErrors.username = 'Required';
    } else {
      const hasNumber = /\d/.test(formData.username);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.username);
      if (!hasNumber || !hasSpecialChar) {
        newErrors.username =
          'Username must include at least one number and one special character';
      }
    }
    if (!formData.email) newErrors.email = 'Required';
    if (!formData.phone) newErrors.phone = 'Required';
    if (!formData.password) newErrors.password = 'Required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Required';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Check entered password again';
    }

    setErrors(newErrors);

    // 2. ONLY PROCEED IF NO VALIDATION ERRORS
    if (Object.keys(newErrors).length > 0) {
      setIsSubmitting(false);
      return; // ✅ Stop here if validation fails
    }

    // 3. API CALL ONLY RUNS IF VALIDATION PASSES
    try {
      axios.post(`${SOCKET_URL}/register`, formData)
        .then(response => {
          console.log("Registration successful:", response.data);
          localStorage.setItem("username", response.data.user.username);
          navigate('/login'); // ✅ Navigate to chat on success
        })
        .catch(error => {
          console.error("Registration error:", error);
          setIsSubmitting(false); // ✅ Reset loading state on error

          if (error.response && error.response.data && error.response.data.message) {
            const message = error.response.data.message;
            setErrors({ general: message }); // ✅ Set general error instead of overwriting specific fields
            alert(message);
          } else {
            alert("Something went wrong. Please try again.");
          }
        });
    } catch (error) {
      console.error("Unexpected error:", error);
      setIsSubmitting(false);
      alert("Unexpected error occurred.");
    }
};

  return (
    <div className="register-container">
      <div className="register-header">
        <div className="register-logo">
          <User size={44} />
        </div>
        <h1>Create Account</h1>
        <p>Join our community today</p>
      </div>

      <form className="register-form" onSubmit={handleSubmit}>
        <div className="name-fields">
          {/* Username field */}
          <div className={`form-group ${errors.username ? 'error' : ''}`}>
            <label htmlFor="username">Username</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input
                type="text"
                id="username"
                placeholder="John@123"
                value={formData.username}
                onChange={handleChange}
                style={{ color: 'black' }}
              />
            </div>
            {errors.username && (
              <span className="error-message">{errors.username}</span>
            )}
          </div>
        </div>

        <div className={`form-group ${errors.email ? 'error' : ''}`}>
          <label htmlFor="email">Email</label>
          <div className="input-wrapper">
            <Mail size={18} className="input-icon" />
            <input
              type="email"
              id="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              style={{ color: 'black' }}
            />
          </div>
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className={`form-group ${errors.phone ? 'error' : ''}`}>
          <label htmlFor="phone">Phone Number</label>
          <div className="input-wrapper">
            <Smartphone size={18} className="input-icon" />
            <input
              type="tel"
              id="phone"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={handleChange}
              style={{ color: 'black' }}
            />
          </div>
          {errors.phone && <span className="error-message">{errors.phone}</span>}
        </div>

        <div className="password-fields">
          <div className={`form-group ${errors.password ? 'error' : ''}`}>
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                style={{ color: 'black' }}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <div className={`form-group ${errors.confirmPassword ? 'error' : ''}`}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                style={{ color: 'black' }}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}
          </div>
        </div>

        <div className="terms-agreement">
          <input type="checkbox" id="terms" required />
          <label htmlFor="terms">
            I agree to the <a href="#">Terms</a> and{' '}
            <a href="#">Privacy Policy</a>
          </label>
        </div>

        <button type="submit" className="register-button" disabled={isSubmitting}>
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
          <ArrowRight size={20} />
        </button>
      </form>

      <div className="login-redirect">
        Already have an account?{' '}
        <button onClick={() => navigate('/login')}>Sign In</button>
      </div>
    </div>
  );
}