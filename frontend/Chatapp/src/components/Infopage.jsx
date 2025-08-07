import React, { useEffect, useRef, useState } from 'react';
import { 
  ArrowLeft, 
  Shield, 
  Puzzle, 
  DollarSign, 
  Users, 
  Briefcase, 
  Newspaper, 
  HelpCircle, 
  MessageSquare, 
  Globe, 
  Code, 
  Activity,
  CheckCircle,
  Star,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Download,
  Book,
  Zap,
  Award,
  Target,
  Lightbulb,
  Rocket,
  Heart
} from 'lucide-react';
import './Infopage.css';

const InfoPage = ({ section, onNavigateBack, onNavigateHome }) => {
  const [activeSection, setActiveSection] = useState(section || 'security');
  
  // Refs for each section
  const securityRef = useRef(null);
  const integrationsRef = useRef(null);
  const pricingRef = useRef(null);
  const careersRef = useRef(null);
  const pressRef = useRef(null);
  const helpCenterRef = useRef(null);
  const communityRef = useRef(null);
  const apiDocsRef = useRef(null);
  const statusRef = useRef(null);

  const sections = {
    security: securityRef,
    integrations: integrationsRef,
    pricing: pricingRef,
    careers: careersRef,
    press: pressRef,
    'help-center': helpCenterRef,
    community: communityRef,
    'api-docs': apiDocsRef,
    status: statusRef
  };

  // Auto-scroll to selected section
  useEffect(() => {
    if (section && sections[section]) {
      setTimeout(() => {
        sections[section].current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  }, [section]);

  const scrollToSection = (sectionName) => {
    setActiveSection(sectionName);
    sections[sectionName]?.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  const integrationsList = [
    { name: 'Slack', icon: '💬', description: 'Seamlessly integrate U&Me with your Slack workspace' },
    { name: 'Microsoft Teams', icon: '👥', description: 'Connect with Teams for unified communication' },
    { name: 'Zoom', icon: '📹', description: 'Enhanced video calling with Zoom integration' },
    { name: 'Google Workspace', icon: '📧', description: 'Sync with Gmail, Calendar, and Drive' },
    { name: 'Salesforce', icon: '☁️', description: 'Customer communication directly from Salesforce' },
    { name: 'Trello', icon: '📋', description: 'Project collaboration with Trello boards' },
    { name: 'GitHub', icon: '🐙', description: 'Developer notifications and code discussions' },
    { name: 'Jira', icon: '🎯', description: 'Issue tracking and project management' }
  ];

  const pricingPlans = [
    {
      name: 'Free',
      price: '₹0',
      period: 'forever',
      features: [
        '5 translations',
        'Basic translation (5 languages)',
        '1:1 video calls',    
        'Community support'
      ],
      popular: false
    },
    {
      name: 'Pro',
      price: '₹10',
      period: 'per month',
      features: [
        'Unlimited messages',
        '100+ language translation',
        'HD video calls',
        '10MB file sharing',
        'Priority support',
        'Advanced encryption',
        'Custom themes'
      ],
      popular: true
    },
  ];

  const jobOpenings = [
    {
      title: 'Senior React Developer',
      department: 'Engineering',
      location: 'Gurugram, India',
      type: 'Full-time',
      experience: '3-5 years'
    },
    {
      title: 'AI/ML Engineer',
      department: 'AI Research',
      location: 'Bangalore, India',
      type: 'Full-time',
      experience: '2-4 years'
    },
    {
      title: 'Product Manager',
      department: 'Product',
      location: 'Mumbai, India',
      type: 'Full-time',
      experience: '4-6 years'
    },
    {
      title: 'UX Designer',
      department: 'Design',
      location: 'Delhi, India',
      type: 'Full-time',
      experience: '2-4 years'
    }
  ];

  const pressReleases = [
    {
      title: 'U&Me Reaches 50 Million Users Worldwide',
      date: '2025-01-15',
      excerpt: 'Global communication platform celebrates major milestone with enhanced AI translation features.'
    },
    {
      title: 'U&Me Launches Advanced AI Translation for Regional Languages',
      date: '2024-12-10',
      excerpt: 'New update includes support for 20 additional Indian regional languages with 95% accuracy.'
    },
    {
      title: 'U&Me Raises $100M in Series C Funding',
      date: '2024-11-22',
      excerpt: 'Investment will accelerate global expansion and AI research initiatives.'
    }
  ];

  return (
    <div className="infopage-container">
      {/* Navigation Header */}
      <div className="infopage-header">
        <div className="infopage-nav">
          <button onClick={onNavigateBack} className="infopage-back-btn">
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="infopage-logo" onClick={onNavigateHome}>
            <MessageSquare size={28} />
            <span>U&Me</span>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="infopage-nav-menu">
        <div className="infopage-nav-container">
          <div className="infopage-nav-section">
            <h4>Product</h4>
            <button 
              onClick={() => scrollToSection('security')}
              className={activeSection === 'security' ? 'infopage-nav-item active' : 'infopage-nav-item'}
            >
              <Shield size={16} />
              Security
            </button>
            <button 
              onClick={() => scrollToSection('integrations')}
              className={activeSection === 'integrations' ? 'infopage-nav-item active' : 'infopage-nav-item'}
            >
              <Puzzle size={16} />
              Integrations
            </button>
            <button 
              onClick={() => scrollToSection('pricing')}
              className={activeSection === 'pricing' ? 'infopage-nav-item active' : 'infopage-nav-item'}
            >
              <DollarSign size={16} />
              Pricing
            </button>
          </div>

          <div className="infopage-nav-section">
            <h4>Company</h4>
            <button 
              onClick={() => scrollToSection('careers')}
              className={activeSection === 'careers' ? 'infopage-nav-item active' : 'infopage-nav-item'}
            >
              <Briefcase size={16} />
              Careers
            </button>
            <button 
              onClick={() => scrollToSection('press')}
              className={activeSection === 'press' ? 'infopage-nav-item active' : 'infopage-nav-item'}
            >
              <Newspaper size={16} />
              Press
            </button>
          </div>

          <div className="infopage-nav-section">
            <h4>Support</h4>
            <button 
              onClick={() => scrollToSection('help-center')}
              className={activeSection === 'help-center' ? 'infopage-nav-item active' : 'infopage-nav-item'}
            >
              <HelpCircle size={16} />
              Help Center
            </button>
            <button 
              onClick={() => scrollToSection('community')}
              className={activeSection === 'community' ? 'infopage-nav-item active' : 'infopage-nav-item'}
            >
              <Users size={16} />
              Community
            </button>
            <button 
              onClick={() => scrollToSection('api-docs')}
              className={activeSection === 'api-docs' ? 'infopage-nav-item active' : 'infopage-nav-item'}
            >
              <Code size={16} />
              API Docs
            </button>
            <button 
              onClick={() => scrollToSection('status')}
              className={activeSection === 'status' ? 'infopage-nav-item active' : 'infopage-nav-item'}
            >
              <Activity size={16} />
              Status
            </button>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="infopage-content">
        
        {/* Security Section */}
        <section ref={securityRef} className="infopage-section" id="security">
          <div className="infopage-section-header">
            <Shield size={48} className="infopage-section-icon" />
            <h1>Security & Privacy</h1>
            <p>Your privacy and security are our top priorities</p>
          </div>

          <div className="infopage-security-grid">
            <div className="infopage-security-card">
              <div className="infopage-card-icon">
                <Shield size={32} />
              </div>
              <h3>End-to-End Encryption</h3>
              <p>All messages are encrypted using AES-256 encryption before leaving your device. Only the intended recipient can decrypt and read your messages.</p>
            </div>

            <div className="infopage-security-card">
              <div className="infopage-card-icon">
                <Target size={32} />
              </div>
              <h3>Zero-Knowledge Architecture</h3>
              <p>We cannot access your messages, calls, or files. Even if compelled by law enforcement, we have no access to your private communications.</p>
            </div>

            <div className="infopage-security-card">
              <div className="infopage-card-icon">
                <Award size={32} />
              </div>
              <h3>SOC 2 Compliant</h3>
              <p>Independently audited security controls ensuring the highest standards of data protection and operational security.</p>
            </div>

            <div className="infopage-security-card">
              <div className="infopage-card-icon">
                <Zap size={32} />
              </div>
              <h3>Perfect Forward Secrecy</h3>
              <p>Unique encryption keys for each conversation ensure that past communications remain secure even if future keys are compromised.</p>
            </div>
          </div>

          <div className="infopage-security-details">
            <h3>Security Certifications</h3>
            <div className="infopage-cert-list">
              <div className="infopage-cert-item">
                <CheckCircle size={20} />
                <span>ISO 27001 Certified</span>
              </div>
              <div className="infopage-cert-item">
                <CheckCircle size={20} />
                <span>SOC 2 Type II Compliant</span>
              </div>
              <div className="infopage-cert-item">
                <CheckCircle size={20} />
                <span>GDPR Compliant</span>
              </div>
              <div className="infopage-cert-item">
                <CheckCircle size={20} />
                <span>HIPAA Ready</span>
              </div>
            </div>
          </div>
        </section>

        {/* Integrations Section */}
        <section ref={integrationsRef} className="infopage-section" id="integrations">
          <div className="infopage-section-header">
            <Puzzle size={48} className="infopage-section-icon" />
            <h1>Integrations</h1>
            <p>Connect U&Me with your favorite tools and services</p>
          </div>

          <div className="infopage-integrations-grid">
            {integrationsList.map((integration, index) => (
              <div key={index} className="infopage-integration-card">
                <div className="infopage-integration-icon">{integration.icon}</div>
                <h3>{integration.name}</h3>
                <p>{integration.description}</p>
                <button className="infopage-integration-btn">Connect</button>
              </div>
            ))}
          </div>

          <div className="infopage-api-info">
            <h3>Custom Integrations</h3>
            <p>Need a custom integration? Our robust API allows you to build custom connections with any service. Check out our API documentation to get started.</p>
            <button className="infopage-primary-btn">
              <Code size={20} />
              View API Docs
            </button>
          </div>
        </section>

        {/* Pricing Section */}
        <section ref={pricingRef} className="infopage-section" id="pricing">
          <div className="infopage-section-header">
            <DollarSign size={48} className="infopage-section-icon" />
            <h1>Pricing Plans</h1>
            <p>Choose the perfect plan for your communication needs</p>
          </div>

          <div className="infopage-pricing-grid">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`infopage-pricing-card ${plan.popular ? 'popular' : ''}`}>
                {plan.popular && <div className="infopage-popular-badge">Most Popular</div>}
                <div className="infopage-pricing-header">
                  <h3>{plan.name}</h3>
                  <div className="infopage-price">
                    <span className="infopage-currency">{plan.price}</span>
                    <span className="infopage-period">/{plan.period}</span>
                  </div>
                </div>
                <ul className="infopage-features-list">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="infopage-feature-item">
                      <CheckCircle size={16} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className={`infopage-plan-btn ${plan.popular ? 'primary' : 'secondary'}`}>
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Careers Section */}
        <section ref={careersRef} className="infopage-section" id="careers">
          <div className="infopage-section-header">
            <Briefcase size={48} className="infopage-section-icon" />
            <h1>Careers</h1>
            <p>Join our mission to connect the world through seamless communication</p>
          </div>

          <div className="infopage-careers-intro">
            <h3>Why Work at U&Me?</h3>
            <div className="infopage-benefits-grid">
              <div className="infopage-benefit-card">
                <Heart size={24} />
                <h4>Meaningful Work</h4>
                <p>Build products that connect millions of people worldwide</p>
              </div>
              <div className="infopage-benefit-card">
                <Rocket size={24} />
                <h4>Fast Growth</h4>
                <p>Grow your career in a rapidly expanding global company</p>
              </div>
              <div className="infopage-benefit-card">
                <Users size={24} />
                <h4>Amazing Team</h4>
                <p>Work with talented individuals from diverse backgrounds</p>
              </div>
              <div className="infopage-benefit-card">
                <Globe size={24} />
                <h4>Remote First</h4>
                <p>Flexible work arrangements with global collaboration</p>
              </div>
            </div>
          </div>

          <div className="infopage-job-listings">
            <h3>Open Positions</h3>
            {jobOpenings.map((job, index) => (
              <div key={index} className="infopage-job-card">
                <div className="infopage-job-info">
                  <h4>{job.title}</h4>
                  <div className="infopage-job-meta">
                    <span className="infopage-department">{job.department}</span>
                    <span className="infopage-location">
                      <MapPin size={14} />
                      {job.location}
                    </span>
                    <span className="infopage-type">{job.type}</span>
                    <span className="infopage-experience">{job.experience}</span>
                  </div>
                </div>
                <button className="infopage-apply-btn">Apply Now</button>
              </div>
            ))}
          </div>
        </section>

        {/* Press Section */}
        <section ref={pressRef} className="infopage-section" id="press">
          <div className="infopage-section-header">
            <Newspaper size={48} className="infopage-section-icon" />
            <h1>Press & Media</h1>
            <p>Latest news and updates from U&Me</p>
          </div>

          <div className="infopage-press-releases">
            <h3>Recent Press Releases</h3>
            {pressReleases.map((release, index) => (
              <div key={index} className="infopage-press-card">
                <div className="infopage-press-date">
                  <Calendar size={16} />
                  {new Date(release.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <h4>{release.title}</h4>
                <p>{release.excerpt}</p>
                <button className="infopage-read-more">Read More</button>
              </div>
            ))}
          </div>

          <div className="infopage-media-contact">
            <h3>Media Contact</h3>
            <div className="infopage-contact-info">
              <div className="infopage-contact-item">
                <Mail size={20} />
                <span>press@u-and-me.com</span>
              </div>
              <div className="infopage-contact-item">
                <Phone size={20} />
                <span>+91 124 456 7890</span>
              </div>
            </div>
          </div>
        </section>

        {/* Help Center Section */}
        <section ref={helpCenterRef} className="infopage-section" id="help-center">
          <div className="infopage-section-header">
            <HelpCircle size={48} className="infopage-section-icon" />
            <h1>Help Center</h1>
            <p>Find answers to your questions and get the help you need</p>
          </div>

          <div className="infopage-help-categories">
            <div className="infopage-help-category">
              <Book size={32} />
              <h3>Getting Started</h3>
              <p>Learn the basics of using U&Me</p>
              <ul>
                <li>Creating your account</li>
                <li>Setting up your profile</li>
                <li>Adding contacts</li>
                <li>Your first conversation</li>
              </ul>
            </div>

            <div className="infopage-help-category">
              <MessageSquare size={32} />
              <h3>Messaging & Calls</h3>
              <p>Master communication features</p>
              <ul>
                <li>Sending messages and media</li>
                <li>Using translation features</li>
                <li>Making video calls</li>
                <li>Group conversations</li>
              </ul>
            </div>

            <div className="infopage-help-category">
              <Shield size={32} />
              <h3>Privacy & Security</h3>
              <p>Keep your account secure</p>
              <ul>
                <li>Privacy settings</li>
                <li>Two-factor authentication</li>
                <li>Blocking and reporting</li>
                <li>Data management</li>
              </ul>
            </div>

            <div className="infopage-help-category">
              <Zap size={32} />
              <h3>Troubleshooting</h3>
              <p>Solve common issues</p>
              <ul>
                <li>Connection problems</li>
                <li>Audio/video issues</li>
                <li>App crashes</li>
                <li>Performance optimization</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Community Section */}
        <section ref={communityRef} className="infopage-section" id="community">
          <div className="infopage-section-header">
            <Users size={48} className="infopage-section-icon" />
            <h1>Community</h1>
            <p>Connect with other U&Me users and get support from the community</p>
          </div>

          <div className="infopage-community-platforms">
            <div className="infopage-community-card">
              <MessageSquare size={40} />
              <h3>Discord Server</h3>
              <p>Join our active Discord community for real-time discussions and support</p>
              <div className="infopage-community-stats">
                <span>25K+ Members</span>
                <span>Active 24/7</span>
              </div>
              <button className="infopage-join-btn">Join Discord</button>
            </div>

            <div className="infopage-community-card">
              <Globe size={40} />
              <h3>Reddit Community</h3>
              <p>Share tips, ask questions, and connect with U&Me users on Reddit</p>
              <div className="infopage-community-stats">
                <span>15K+ Members</span>
                <span>Daily Posts</span>
              </div>
              <button className="infopage-join-btn">Join Reddit</button>
            </div>

            <div className="infopage-community-card">
              <Code size={40} />
              <h3>Developer Forum</h3>
              <p>Technical discussions and API support for developers</p>
              <div className="infopage-community-stats">
                <span>5K+ Developers</span>
                <span>API Support</span>
              </div>
              <button className="infopage-join-btn">Join Forum</button>
            </div>
          </div>

          <div className="infopage-community-guidelines">
            <h3>Community Guidelines</h3>
            <div className="infopage-guidelines-list">
              <div className="infopage-guideline-item">
                <CheckCircle size={20} />
                <span>Be respectful and kind to all community members</span>
              </div>
              <div className="infopage-guideline-item">
                <CheckCircle size={20} />
                <span>No spam, self-promotion, or off-topic content</span>
              </div>
              <div className="infopage-guideline-item">
                <CheckCircle size={20} />
                <span>Use appropriate channels for different types of discussions</span>
              </div>
              <div className="infopage-guideline-item">
                <CheckCircle size={20} />
                <span>Help others and share your knowledge</span>
              </div>
            </div>
          </div>
        </section>

        {/* API Docs Section */}
       <section ref={apiDocsRef} className="infopage-section" id="api-docs">
  <div className="infopage-section-header">
    <Code size={48} className="infopage-section-icon" />
    <h1>API Documentation</h1>
    <p>Build powerful integrations with the U&Me API</p>
  </div>

  <div className="infopage-api-overview">
    <div className="infopage-api-card">
      <h3>RESTful API</h3>
      <p>Simple, predictable REST API with JSON responses</p>
    </div>

    <div className="infopage-api-card">
      <h3>WebSocket Support</h3>
      <p>Real-time communication for live features</p>
    </div>

    <div className="infopage-api-card">
      <h3>Translation Engine</h3>
      <p>Powered by MyMemory API</p>
      <div className="infopage-sdk-list">
        <span>200+ languages</span>
        <span>Neural MT</span>
        <span>Glossary support</span>
      </div>
    </div>
  </div>

  <div className="infopage-api-features">
    <h3>API Features</h3>
    <div className="infopage-api-feature-grid">
      {/* ... other feature cards ... */}
      <div className="infopage-api-feature">
        <Globe size={24} />
        <h4>Translation API</h4>
        <p>Powered by MyMemory - World's Largest Translation Memory</p>
        <div className="api-credits">
          <span className="api-tag">Supports 200+ languages</span>
          <span className="api-tag">Neural MT</span>
          <span className="api-tag">Glossary support</span>
        </div>
      </div>
      {/* ... other feature cards ... */}
    </div>
  </div>

  {/* New MyMemory API Specific Section */}
  <div className="infopage-api-translation">
    <h3>MyMemory Translation API</h3>
    <div className="api-provider-info">
      <div className="provider-logo">
        <img src="https://mymemory.translated.net/img/logos/mymemory-logo.png" alt="MyMemory" />
        <span>Integrated Translation Service</span>
      </div>
      <p className="provider-description">
        We utilize MyMemory, the world's largest Translation Memory, to power our translation features. 
        MyMemory combines machine translation with human-verified translations from professional translators.
      </p>
    </div>

    <div className="translation-api-docs">
      <div className="translation-api-method">
        <div className="api-method-header">
          <span className="api-method-badge post">POST</span>
          <code>/v1/translate</code>
          <span className="api-rate-limit">Rate limited: 1000 requests/day</span>
        </div>
        
        <div className="api-method-details">
          <div className="api-params">
            <h5>MyMemory Integration Details</h5>
            <div className="api-specs">
              <div className="spec-item">
                <h6>Base Endpoint</h6>
                <code>https://api.mymemory.translated.net/get</code>
              </div>
              <div className="spec-item">
                <h6>Authentication</h6>
                <p>API Key required for full features (included in our service)</p>
              </div>
              <div className="spec-item">
                <h6>Limitations</h6>
                <ul>
                  <li>Max 500 characters per request</li>
                  <li>Commercial use requires MyMemory PRO</li>
                  <li>Daily request limits apply</li>
                </ul>
              </div>
              <div className="spec-item">
                <h6>Supported Formats</h6>
                <p>JSON, XML (JSON recommended)</p>
              </div>
            </div>

            <h5>Parameters</h5>
            <table>
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Type</th>
                  <th>Required</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>q</td>
                  <td>string</td>
                  <td>Yes</td>
                  <td>Text to translate (URL encoded)</td>
                </tr>
                <tr>
                  <td>langpair</td>
                  <td>string</td>
                  <td>Yes</td>
                  <td>en|es (source|target language codes)</td>
                </tr>
                <tr>
                  <td>key</td>
                  <td>string</td>
                  <td>No</td>
                  <td>API key for extended limits</td>
                </tr>
                <tr>
                  <td>mt</td>
                  <td>boolean</td>
                  <td>No</td>
                  <td>Enable machine translation (default: 1)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="api-example">
            <h5>Direct MyMemory Example</h5>
            <pre>
              <code>{`// Basic request format
GET https://api.mymemory.translated.net/get?q=Hello World&langpair=en|es

// With API key
GET https://api.mymemory.translated.net/get
  ?q=Hello World
  &langpair=en|es
  &key=YOUR_API_KEY`}</code>
            </pre>

            <h5>Example Response</h5>
            <pre>
              <code>{`{
  "responseData": {
    "translatedText": "Hola Mundo",
    "match": 1
  },
  "quotaFinished": false,
  "responseStatus": 200,
  "matches": [
    {
      "id": "1",
      "segment": "Hello World",
      "translation": "Hola Mundo",
      "quality": "74",
      "reference": null,
      "match": 1
    }
  ]
}`}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div className="api-credits-footer">
    <p>
      Translation services powered by <a href="https://mymemory.translated.net" target="_blank" rel="noopener noreferrer">MyMemory API</a>.
      For commercial use or higher volumes, consider <a href="https://mymemory.translated.net/doc/licence.php" target="_blank" rel="noopener noreferrer">MyMemory PRO</a>.
    </p>
  </div>
</section>

        {/* Status Section */}
        <section ref={statusRef} className="infopage-section" id="status">
          <div className="infopage-section-header">
            <Activity size={48} className="infopage-section-icon" />
            <h1>System Status</h1>
            <p>Real-time status of U&Me services and infrastructure</p>
          </div>

          <div className="infopage-status-overview">
            <div className="infopage-status-card operational">
              <div className="infopage-status-indicator"></div>
              <h3>All Systems Operational</h3>
              <p>All services are running normally</p>
            </div>
          </div>

          <div className="infopage-services-status">
            <h3>Service Status</h3>
            <div className="infopage-service-list">
              <div className="infopage-service-item">
                <div className="infopage-service-info">
                  <span className="infopage-service-name">Messaging Service</span>
                  <span className="infopage-service-uptime">99.99% uptime</span>
                </div>
                <div className="infopage-status-badge operational">Operational</div>
              </div>
              
              <div className="infopage-service-item">
                <div className="infopage-service-info">
                  <span className="infopage-service-name">Video Calling</span>
                  <span className="infopage-service-uptime">99.98% uptime</span>
                </div>
                <div className="infopage-status-badge operational">Operational</div>
              </div>
              
              <div className="infopage-service-item">
                <div className="infopage-service-info">
                  <span className="infopage-service-name">Translation API</span>
                  <span className="infopage-service-uptime">99.97% uptime</span>
                </div>
                <div className="infopage-status-badge operational">Operational</div>
              </div>
              
              <div className="infopage-service-item">
                <div className="infopage-service-info">
                  <span className="infopage-service-name">File Sharing</span>
                  <span className="infopage-service-uptime">99.99% uptime</span>
                </div>
                <div className="infopage-status-badge operational">Operational</div>
              </div>
              
              <div className="infopage-service-item">
                <div className="infopage-service-info">
                  <span className="infopage-service-name">Push Notifications</span>
                  <span className="infopage-service-uptime">99.96% uptime</span>
                </div>
                <div className="infopage-status-badge operational">Operational</div>
              </div>
            </div>
          </div>

          <div className="infopage-incident-history">
            <h3>Recent Incidents</h3>
            <div className="infopage-incident-item">
              <div className="infopage-incident-date">Jan 20, 2025</div>
              <div className="infopage-incident-info">
                <h4>Resolved: Brief messaging delay in EU region</h4>
                <p>Users experienced 2-3 second delays in message delivery. Issue resolved in 15 minutes.</p>
              </div>
            </div>
            
            <div className="infopage-incident-item">
              <div className="infopage-incident-date">Jan 15, 2025</div>
              <div className="infopage-incident-info">
                <h4>Resolved: Translation service intermittent issues</h4>
                <p>Some users experienced translation failures. All services restored within 30 minutes.</p>
              </div>
            </div>
          </div>

          <div className="infopage-status-subscribe">
            <h3>Stay Updated</h3>
            <p>Subscribe to get notified about service status updates</p>
            <div className="infopage-subscribe-form">
              <input type="email" placeholder="Enter your email" className="infopage-email-input" />
              <button className="infopage-subscribe-btn">Subscribe</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default InfoPage;