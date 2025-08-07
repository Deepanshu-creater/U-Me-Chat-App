import { Rocket, X, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import './spfform.css';

export function StartProjectForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [spfFormData, setSpfFormData] = useState({
    name: '',
    email: '',
    projectType: '',
    budget: '',
    timeline: '',
    description: ''
  });

  const spfHandleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const spfHandleChange = (e) => {
    setSpfFormData({
      ...spfFormData,
      [e.target.name]: e.target.value
    });
  };

  if (isSubmitted) {
    return (
      <div className="spf-success-container">
        <CheckCircle size={48} color="#6a21a5" />
        <h3 className="spf-success-title">Thank you!</h3>
        <p className="spf-success-message">
          We've received your project details and will contact you within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <div className="spf-form-container">
      <div className="spf-form-header">
        <Rocket size={24} color="#6a21a5" />
        <h3 className="spf-form-title">Start a Project</h3>
      </div>
      
      <form onSubmit={spfHandleSubmit} className="spf-form">
        <div className="spf-form-group">
          <label htmlFor="spf-name" className="spf-form-label">Name</label>
          <input
            id="spf-name"
            type="text"
            name="name"
            value={spfFormData.name}
            onChange={spfHandleChange}
            className="spf-form-input"
            required
          />
        </div>
        
        <div className="spf-form-group">
          <label htmlFor="spf-email" className="spf-form-label">Email</label>
          <input
            id="spf-email"
            type="email"
            name="email"
            value={spfFormData.email}
            onChange={spfHandleChange}
            className="spf-form-input"
            required
          />
        </div>
        
        <div className="spf-form-group">
          <label htmlFor="spf-projectType" className="spf-form-label">Project Type</label>
          <select
            id="spf-projectType"
            name="projectType"
            value={spfFormData.projectType}
            onChange={spfHandleChange}
            className="spf-form-select"
            required
          >
            <option value="">Select...</option>
            <option value="web">Web Application</option>
            <option value="mobile">Mobile App</option>
            <option value="desktop">Desktop Software</option>
          </select>
        </div>
        
        <div className="spf-form-row">
          <div className="spf-form-group spf-form-col">
            <label htmlFor="spf-budget" className="spf-form-label">Budget Range</label>
            <select
              id="spf-budget"
              name="budget"
              value={spfFormData.budget}
              onChange={spfHandleChange}
              className="spf-form-select"
            >
              <option value="">Select...</option>
              <option value="1-5k">$1,000 - $5,000</option>
              <option value="5-15k">$5,000 - $15,000</option>
              <option value="15k+">$15,000+</option>
            </select>
          </div>
          
          <div className="spf-form-group spf-form-col">
            <label htmlFor="spf-timeline" className="spf-form-label">Timeline</label>
            <select
              id="spf-timeline"
              name="timeline"
              value={spfFormData.timeline}
              onChange={spfHandleChange}
              className="spf-form-select"
            >
              <option value="">Select...</option>
              <option value="1-3m">1-3 Months</option>
              <option value="3-6m">3-6 Months</option>
              <option value="6m+">6+ Months</option>
            </select>
          </div>
        </div>
        
        <div className="spf-form-group">
          <label htmlFor="spf-description" className="spf-form-label">Project Description</label>
          <textarea
            id="spf-description"
            name="description"
            value={spfFormData.description}
            onChange={spfHandleChange}
            className="spf-form-textarea"
            rows={5}
            required
          />
        </div>
        
        <button type="submit" className="spf-submit-btn">
          Submit Project Request
        </button>
      </form>
    </div>
  );
}