import { Lightbulb, X, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import './safform.css';

export function SuggestFeatureForm({ onClose }) {
  const [sffIsSubmitted, setSffIsSubmitted] = useState(false);
  const [sffFormData, setSffFormData] = useState({
    title: '',
    description: '',
    category: '',
    benefit: '', // New field
    complexity: 'medium', // New field
    email: ''
  });
  const [sffErrors, setSffErrors] = useState({});

  const sffHandleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = {};
    if (!sffFormData.title.trim()) errors.title = 'Title is required';
    if (!sffFormData.description.trim()) errors.description = 'Description is required';
    if (!sffFormData.category) errors.category = 'Category is required';
    if (!sffFormData.benefit) errors.benefit = 'Please select expected benefit'; // New validation
    if (sffFormData.email && !/\S+@\S+\.\S+/.test(sffFormData.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    setSffErrors(errors);
    
    if (Object.keys(errors).length === 0) {
      setSffIsSubmitted(true);
      console.log('Feature suggestion submitted:', sffFormData);
    }
  };

  // New options for additional fields
  const benefitOptions = [
    { value: 'efficiency', label: 'Improved Efficiency' },
    { value: 'engagement', label: 'User Engagement' },
    { value: 'revenue', label: 'Revenue Growth' },
    { value: 'retention', label: 'Customer Retention' },
    { value: 'experience', label: 'Better User Experience' }
  ];

  const complexityOptions = [
    { value: 'low', label: 'Low', color: '#10B981' },
    { value: 'medium', label: 'Medium', color: '#F59E0B' },
    { value: 'high', label: 'High', color: '#EF4444' }
  ];

  if (sffIsSubmitted) {
    return (
      <div className="sff-success-container">
        <CheckCircle size={48} color="#6a21a5" />
        <h3 className="sff-success-title">Feature Submitted!</h3>
        <p className="sff-success-message">
          Thank you for your suggestion. Our product team will review it shortly.
        </p>
        <div className="sff-success-actions">
          <button className="sff-primary-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sff-container">
      <div className="sff-header">
        <Lightbulb size={24} color="#6a21a5" />
        <h3 className="sff-title">Suggest a Feature</h3>
        {onClose && (
          <button className="sff-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        )}
      </div>
      
      <form onSubmit={sffHandleSubmit} className="sff-form">
        <div className="sff-form-group">
          <label htmlFor="sff-featureTitle" className="sff-form-label">
            Feature Title *
          </label>
          <input
            id="sff-featureTitle"
            type="text"
            name="title"
            value={sffFormData.title}
            onChange={(e) => setSffFormData({...sffFormData, title: e.target.value})}
            className={`sff-form-input ${sffErrors.title ? 'sff-error' : ''}`}
            placeholder="Brief descriptive title"
          />
          {sffErrors.title && <span className="sff-error-message">{sffErrors.title}</span>}
        </div>
        
        <div className="sff-form-group">
          <label htmlFor="sff-featureDesc" className="sff-form-label">
            Detailed Description *
          </label>
          <textarea
            id="sff-featureDesc"
            name="description"
            value={sffFormData.description}
            onChange={(e) => setSffFormData({...sffFormData, description: e.target.value})}
            className={`sff-form-textarea ${sffErrors.description ? 'sff-error' : ''}`}
            rows={5}
            placeholder="Explain how this feature would work and why it's valuable..."
          />
          {sffErrors.description && <span className="sff-error-message">{sffErrors.description}</span>}
        </div>
        
        <div className="sff-form-row">
          <div className="sff-form-group">
            <label htmlFor="sff-featureCategory" className="sff-form-label">
              Category *
            </label>
            <select
              id="sff-featureCategory"
              name="category"
              value={sffFormData.category}
              onChange={(e) => setSffFormData({...sffFormData, category: e.target.value})}
              className={`sff-form-select ${sffErrors.category ? 'sff-error' : ''}`}
            >
              <option value="">Select category...</option>
              <option value="ui">User Interface</option>
              <option value="functionality">Functionality</option>
              <option value="integration">Integration</option>
              <option value="performance">Performance</option>
              <option value="accessibility">Accessibility</option>
              <option value="other">Other</option>
            </select>
            {sffErrors.category && <span className="sff-error-message">{sffErrors.category}</span>}
          </div>
          
          {/* NEW FIELD: Expected Benefit */}
          <div className="sff-form-group">
            <label htmlFor="sff-benefit" className="sff-form-label">
              Expected Benefit *
            </label>
            <select
              id="sff-benefit"
              name="benefit"
              value={sffFormData.benefit}
              onChange={(e) => setSffFormData({...sffFormData, benefit: e.target.value})}
              className={`sff-form-select ${sffErrors.benefit ? 'sff-error' : ''}`}
            >
              <option value="">Select benefit...</option>
              {benefitOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {sffErrors.benefit && <span className="sff-error-message">{sffErrors.benefit}</span>}
          </div>
        </div>
        
        {/* NEW FIELD: Estimated Complexity */}
        <div className="sff-form-group">
          <label className="sff-form-label">
            Estimated Complexity
          </label>
          <div className="sff-complexity-options">
            {complexityOptions.map(option => (
              <label key={option.value} className="sff-complexity-option">
                <input
                  type="radio"
                  name="complexity"
                  value={option.value}
                  checked={sffFormData.complexity === option.value}
                  onChange={() => setSffFormData({...sffFormData, complexity: option.value})}
                />
                <span 
                  className="sff-complexity-indicator"
                  style={{ backgroundColor: option.color }}
                ></span>
                {option.label}
              </label>
            ))}
          </div>
        </div>
        
        <div className="sff-form-group">
          <label htmlFor="sff-email" className="sff-form-label">
            Your Email
          </label>
          <input
            id="sff-email"
            type="email"
            name="email"
            value={sffFormData.email}
            onChange={(e) => setSffFormData({...sffFormData, email: e.target.value})}
            className={`sff-form-input ${sffErrors.email ? 'sff-error' : ''}`}
            placeholder="For follow-up questions"
          />
          {sffErrors.email && <span className="sff-error-message">{sffErrors.email}</span>}
        </div>
        
        <div className="sff-form-footer">
          <button type="submit" className="sff-submit-btn">
            Submit Feature Idea
          </button>
        </div>
      </form>
    </div>
  );
}