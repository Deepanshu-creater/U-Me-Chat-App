import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  User,
  MessageCircle,
  Tag,
  Upload,
  X
} from 'lucide-react';
import './support.css';

const ContactSupport = ({ onNavigateBack, onNavigateHome }) => {
  const [csFormData, setCsFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    priority: 'medium',
    message: '',
    attachments: []
  });
  const [csIsSubmitting, setCsIsSubmitting] = useState(false);
  const [csSubmitted, setCsSubmitted] = useState(false);
  const [csErrors, setCsErrors] = useState({});

  const csCategories = [
    { value: 'technical', label: 'Technical Issue' },
    { value: 'billing', label: 'Billing & Payments' },
    { value: 'account', label: 'Account Management' },
    { value: 'translation', label: 'Translation Problems' },
    { value: 'video-calls', label: 'Video Call Issues' },
    { value: 'feature-request', label: 'Feature Request' },
    { value: 'bug-report', label: 'Bug Report' },
    { value: 'other', label: 'Other' }
  ];

  const csPriorities = [
    { value: 'low', label: 'Low', color: '#10B981', description: 'General questions' },
    { value: 'medium', label: 'Medium', color: '#F59E0B', description: 'Standard support' },
    { value: 'high', label: 'High', color: '#EF4444', description: 'Urgent issues' },
    { value: 'critical', label: 'Critical', color: '#DC2626', description: 'App not working' }
  ];

  const csSupportChannels = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get detailed help via email',
      responseTime: '24 hours',
      availability: 'Always available'
    },
    {
      icon: MessageSquare,
      title: 'Live Chat',
      description: 'Chat with our support team',
      responseTime: '5 minutes',
      availability: 'Mon-Fri, 9AM-6PM'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Speak directly with an expert',
      responseTime: 'Immediate',
      availability: 'Mon-Fri, 9AM-6PM'
    }
  ];

  const csHandleInputChange = (e) => {
    const { name, value } = e.target;
    setCsFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (csErrors[name]) {
      setCsErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const csHandleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 5 * 1024 * 1024;
    const allowedTypes = ['image/', 'application/pdf', 'text/', 'video/'];
    
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        alert(`${file.name} is too large. Maximum size is 5MB.`);
        return false;
      }
      
      if (!allowedTypes.some(type => file.type.startsWith(type))) {
        alert(`${file.name} is not a supported file type.`);
        return false;
      }
      
      return true;
    });

    setCsFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles].slice(0, 3)
    }));
  };

  const csRemoveAttachment = (index) => {
    setCsFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const csValidateForm = () => {
    const newErrors = {};
    
    if (!csFormData.name.trim()) newErrors.name = 'Name is required';
    if (!csFormData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(csFormData.email)) newErrors.email = 'Email is invalid';
    if (!csFormData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!csFormData.category) newErrors.category = 'Category is required';
    if (!csFormData.message.trim()) newErrors.message = 'Message is required';
    else if (csFormData.message.trim().length < 10) newErrors.message = 'Message must be at least 10 characters';

    setCsErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const csHandleSubmit = async (e) => {
    e.preventDefault();
    
    if (!csValidateForm()) return;
    
    setCsIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setCsSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting your request. Please try again.');
    } finally {
      setCsIsSubmitting(false);
    }
  };

  if (csSubmitted) {
    return (
      <div className="cs-container">
        <div className="cs-success-container">
          <div className="cs-success-icon">
            <CheckCircle size={64} />
          </div>
          <h2 className="cs-success-title">Support Request Submitted!</h2>
          <p className="cs-success-message">
            Thank you for contacting us. We've received your support request and will get back to you within 24 hours.
          </p>
          <div className="cs-success-details">
            <div className="cs-response-time">
              <strong>Expected Response:</strong> Within 24 hours
            </div>
          </div>
          <div className="cs-success-actions">
            <button className="cs-primary-btn" onClick={onNavigateHome}>
              Back to Home
            </button>
            <button className="cs-secondary-btn" onClick={() => setCsSubmitted(false)}>
              Submit Another Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cs-container">
      <div className="cs-content-wrapper">
        {/* Header */}
        <div className="cs-header">
          <button className="cs-back-btn" onClick={onNavigateBack}>
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="cs-header-content">
            <h1 className="cs-title">Contact Support</h1>
            <p className="cs-subtitle">Get help from our expert support team</p>
          </div>
        </div>

        <div className="cs-main-content">
          {/* Support Channels */}
          <div className="cs-channels-section">
            <h3 className="cs-section-title">Choose Your Preferred Support Channel</h3>
            <div className="cs-channels-grid">
              {csSupportChannels.map((channel, index) => {
                const Icon = channel.icon;
                return (
                  <div key={index} className="cs-channel-card">
                    <div className="cs-channel-icon">
                      <Icon size={24} />
                    </div>
                    <h4 className="cs-channel-title">{channel.title}</h4>
                    <p className="cs-channel-desc">{channel.description}</p>
                    <div className="cs-channel-meta">
                      <div className="cs-response-time">
                        <Clock size={16} />
                        Response: {channel.responseTime}
                      </div>
                      <div className="cs-availability">
                        {channel.availability}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Support Form */}
          <div className="cs-form-section">
            <h3 className="cs-section-title">Submit a Support Request</h3>
            <div className="cs-form-container">
              <div className="cs-form-row">
                <div className="cs-form-group">
                  <label htmlFor="cs-name" className="cs-form-label">
                    <User size={16} />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="cs-name"
                    name="name"
                    value={csFormData.name}
                    onChange={csHandleInputChange}
                    placeholder="Enter your full name"
                    className={`cs-form-input ${csErrors.name ? 'cs-error' : ''}`}
                  />
                  {csErrors.name && <span className="cs-error-msg">{csErrors.name}</span>}
                </div>

                <div className="cs-form-group">
                  <label htmlFor="cs-email" className="cs-form-label">
                    <Mail size={16} />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="cs-email"
                    name="email"
                    value={csFormData.email}
                    onChange={csHandleInputChange}
                    placeholder="Enter your email address"
                    className={`cs-form-input ${csErrors.email ? 'cs-error' : ''}`}
                  />
                  {csErrors.email && <span className="cs-error-msg">{csErrors.email}</span>}
                </div>
              </div>

              <div className="cs-form-group">
                <label htmlFor="cs-subject" className="cs-form-label">
                  <MessageCircle size={16} />
                  Subject *
                </label>
                <input
                  type="text"
                  id="cs-subject"
                  name="subject"
                  value={csFormData.subject}
                  onChange={csHandleInputChange}
                  placeholder="Brief description of your issue"
                  className={`cs-form-input ${csErrors.subject ? 'cs-error' : ''}`}
                />
                {csErrors.subject && <span className="cs-error-msg">{csErrors.subject}</span>}
              </div>

              <div className="cs-form-row">
                <div className="cs-form-group">
                  <label htmlFor="cs-category" className="cs-form-label">
                    <Tag size={16} />
                    Category *
                  </label>
                  <select
                    id="cs-category"
                    name="category"
                    value={csFormData.category}
                    onChange={csHandleInputChange}
                    className={`cs-form-select ${csErrors.category ? 'cs-error' : ''}`}
                  >
                    <option value="">Select a category</option>
                    {csCategories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  {csErrors.category && <span className="cs-error-msg">{csErrors.category}</span>}
                </div>

                <div className="cs-form-group">
                  <label className="cs-form-label">Priority Level</label>
                  <div className="cs-priority-options">
                    {csPriorities.map(priority => (
                      <label key={priority.value} className="cs-priority-option">
                        <input
                          type="radio"
                          name="priority"
                          value={priority.value}
                          checked={csFormData.priority === priority.value}
                          onChange={csHandleInputChange}
                        />
                        <span 
                          className="cs-priority-indicator"
                          style={{ backgroundColor: priority.color }}
                        ></span>
                        <div>
                          <div className="cs-priority-label">{priority.label}</div>
                          <div className="cs-priority-desc">{priority.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="cs-form-group">
                <label htmlFor="cs-message" className="cs-form-label">
                  <MessageSquare size={16} />
                  Detailed Message *
                </label>
                <textarea
                  id="cs-message"
                  name="message"
                  rows="6"
                  value={csFormData.message}
                  onChange={csHandleInputChange}
                  placeholder="Please provide as much detail as possible about your issue..."
                  className={`cs-form-textarea ${csErrors.message ? 'cs-error' : ''}`}
                ></textarea>
                {csErrors.message && <span className="cs-error-msg">{csErrors.message}</span>}
                <div className="cs-char-count">
                  {csFormData.message.length}/1000 characters
                </div>
              </div>

              {/* File Upload */}
              <div className="cs-form-group">
                <label className="cs-form-label">
                  <Upload size={16} />
                  Attachments (Optional)
                </label>
                <div className="cs-file-upload">
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.txt,.doc,.docx"
                    onChange={csHandleFileUpload}
                    className="cs-file-input"
                    id="cs-file-upload"
                  />
                  <label htmlFor="cs-file-upload" className="cs-file-label">
                    <Upload size={24} />
                    <span>Drop files here or click to browse</span>
                    <small>Max 3 files, 5MB each (Images, PDF, Documents)</small>
                  </label>
                </div>
                
                {csFormData.attachments.length > 0 && (
                  <div className="cs-attachments-list">
                    {csFormData.attachments.map((file, index) => (
                      <div key={index} className="cs-attachment-item">
                        <span className="cs-file-name">{file.name}</span>
                        <span className="cs-file-size">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                        <button
                          type="button"
                          onClick={() => csRemoveAttachment(index)}
                          className="cs-remove-attachment"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="cs-form-actions">
                <button
                  type="button"
                  className="cs-primary-btn cs-large-btn"
                  disabled={csIsSubmitting}
                  onClick={csHandleSubmit}
                >
                  {csIsSubmitting ? 'Submitting...' : 'Submit Support Request'}
                </button>
                <button
                  type="button"
                  className="cs-secondary-btn cs-large-btn"
                  onClick={onNavigateHome}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSupport;