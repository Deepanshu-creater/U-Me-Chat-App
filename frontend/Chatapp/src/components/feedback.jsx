import React from 'react';
import { MessageSquare, X, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './feedback.css';

const FeedbackForm = () => {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    alert('Thank you for your feedback!');
    navigate('/'); // Redirect to home after submission
  };

  return (
    <div className="feedback-container">
      <h1 className="feedback-title">Share Your Feedback</h1>
      <p className="feedback-subtitle">We'd love to hear your thoughts about our service</p>
      
      <form className="feedback-form" onSubmit={handleSubmit}>
        <div className="feedback-form-group">
          <label htmlFor="feedback-name">Your Name</label>
          <input 
            type="text" 
            id="feedback-name" 
            placeholder="Enter your name" 
            required 
          />
        </div>
        
        <div className="feedback-form-group">
          <label htmlFor="feedback-email">Email Address</label>
          <input 
            type="email" 
            id="feedback-email" 
            placeholder="Enter your email" 
            required 
          />
        </div>
        
        <div className="feedback-form-group">
          <label>How would you rate your experience?</label>
          <div className="feedback-rating-options">
            {[1, 2, 3, 4, 5].map((rating) => (
              <label key={rating} className="feedback-rating-option">
                <input 
                  type="radio" 
                  name="feedback-rating" 
                  value={rating} 
                  required 
                />
                <span>{rating} {rating === 1 ? 'Star' : 'Stars'}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="feedback-form-group">
          <label htmlFor="feedback-message">Your Feedback</label>
          <textarea 
            id="feedback-message" 
            rows="5" 
            placeholder="Share your experience with us..." 
            required
          ></textarea>
        </div>
        
        <div className="feedback-form-group feedback-checkbox-group">
          <input type="checkbox" id="feedback-contact-permission" />
          <label htmlFor="feedback-contact-permission">
            I agree to be contacted for follow-up questions
          </label>
        </div>
        
        <button type="submit" className="feedback-submit-btn">
          Submit Feedback
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;