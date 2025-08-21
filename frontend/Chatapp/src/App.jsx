import React, { useState, useEffect, useRef, } from 'react';
import { 
  MessageSquare, 
  Globe, 
  Video, 
  Users, 
  Shield, 
  Smartphone, 
  Zap,
  Star,
  ArrowRight,
  Play,
  CheckCircle,
  Menu,
  X,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  CreditCard,
  Award,
  Info,
  Moon,
  Sun,
  GraduationCap, 
  Rocket, 
  Lightbulb,
  Plus, Minus, HelpCircle
} from 'lucide-react';
import './App.css';
import { useNavigate } from 'react-router-dom';
import { AskExpertWidget } from './components/askexpert';
import ContactSupport from './components/support';
import InfoPage from './components/Infopage';
export default function App() {


  const navigate = useNavigate();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [visibleMessages, setVisibleMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [openItems, setOpenItems] = useState(new Set());
  const [activeComponent, setActiveComponent] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [infoSection, setInfoSection] = useState(null);
  // Refs for smooth scrolling
  const featuresRef = useRef(null);
  const aboutRef = useRef(null);
  const pricingRef = useRef(null);
  const contactRef = useRef(null);
  


  useEffect(() => {
  if (darkMode) {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
}, [darkMode]);
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 6);
    }, 3000);
    return () => clearInterval(interval);
  }, []);


  // Smooth scroll function
  const smoothScroll = (ref) => {
    setIsMenuOpen(false);
    window.scrollTo({
      top: ref.current.offsetTop - 80,
      behavior: 'smooth'
    });
  };


  // Chat animation effect
  useEffect(() => {
    const messages = [
      { id: 1, type: 'received', text: '¡Hola! ¿Cómo estás?', translation: 'Hello! How are you?', delay: 1000 },
      { id: 2, type: 'sent', text: "I'm great! Thanks for asking 😊", delay: 3500 },
      { id: 3, type: 'received', text: '¡Perfecto! Me alegro mucho', translation: 'Perfect! I\'m so glad', delay: 6000 },
      { id: 4, type: 'sent', text: 'The translation feature is amazing! 🚀', delay: 8500 },
      { id: 5, type: 'received', text: '¡Sí! Es increíble hablar sin barreras', translation: 'Yes! It\'s incredible to talk without barriers', delay: 11000 }
    ];


    let timeouts = [];


    const showMessages = () => {
      messages.forEach((message) => {
        const timeoutId = setTimeout(() => {
          if (message.type === 'received') {
            setIsTyping(true);
            const typingTimeout = setTimeout(() => {
              setIsTyping(false);
              setVisibleMessages(prev => [...prev, message]);
            }, 1500);
            timeouts.push(typingTimeout);
          } else {
            setVisibleMessages(prev => [...prev, message]);
          }
        }, message.delay);
        timeouts.push(timeoutId);
      });


      const resetTimeout = setTimeout(() => {
        setVisibleMessages([]);
        setIsTyping(false);
        setTimeout(showMessages, 1000);
      }, 14000);


      timeouts.push(resetTimeout);
    };


    showMessages();


    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);


  const features = [
    {
      icon: Globe,
      title: "Real-time Translation",
      description: "Instantly translate messages in 100+ languages with AI-powered accuracy",
      color: "#4F46E5"
    },
    {
      icon: Video,
      title: "4K Video Calls",
      description:"Crystal-clear video calls with adaptive bandwidth for low latency",
      color: "#059669"
    },
    {
      icon: MessageSquare,
      title: "Smart Messaging",
      description: "Rich media sharing, voice messages, and intelligent message organization",
      color: "#DC2626"
    },
    {
      icon: Users,
      title: "Fast file sharing",
      description: "Share files up to 10MB instantly with secure cloud storage integration",
      color: "#7C3AED"
    },
    {
      icon: Shield,
      title: "Military-grade Security",
      description: "End-to-end encryption with zero-knowledge architecture for maximum privacy",
      color: "#EA580C"
    },
    {
      icon: Zap,
      title: "Lightning Speed",
      description: "Sub-second message delivery worldwide with 99.99% uptime guarantee",
      color: "#0891B2"
    }
  ];
    // Toggle FAQ item
const toggleFaqItem = (index) => {
  const newOpenItems = new Set(openItems);
  if (newOpenItems.has(index)) {
    newOpenItems.delete(index);
  } else {
    newOpenItems.add(index);
  }
  setOpenItems(newOpenItems);
};


  const handleContactSupport = () => {
    setCurrentPage('support');
  };


  const handleNavigateBack = () => {
    setCurrentPage('home');
  };


  const handleNavigateHome = () => {
    setCurrentPage('home');
  };


  const handleNavigateToInfo = (section) => {
  setInfoSection(section);
  setCurrentPage('info');
};


const handleNavigateBackFromInfo = () => {
  setCurrentPage('home');
  setInfoSection(null);
};
  // Conditional rendering
   if (currentPage === 'support') {
    return (
      <ContactSupport 
        onNavigateBack={handleNavigateBack}
        onNavigateHome={handleNavigateHome}
      />
    );
  }
  if (currentPage === 'info') {
  return (
    <InfoPage 
      section={infoSection}
      onNavigateBack={handleNavigateBackFromInfo}
      onNavigateHome={handleNavigateHome}
    />
  );
}
  const faqData = [
    {
      question: "How does the real-time translation feature work?",
      answer: "Our AI-powered translation engine processes messages instantly in over 100 languages. When you send a message, it's automatically translated for the recipient and displayed in their preferred language, while maintaining context and cultural nuances."
    },
    {
      question: "Is U&Me free to use?",
      answer: "U&Me offers a free tier with basic messaging, video calls, and translation for up to 50 messages per day. Our premium plans unlock unlimited messaging, HD video calls, file sharing up to 10MB, and advanced features like group translation and priority support."
    },
    {
      question: "How secure are my conversations?",
      answer: "We use military-grade end-to-end encryption for all communications. Your messages are encrypted on your device before being sent and can only be decrypted by the intended recipient. We follow a zero-knowledge architecture, meaning even we cannot access your messages."
    },
    {
      question: "Can I use U&Me on multiple devices?",
      answer: "Yes! U&Me synchronizes seamlessly across all your devices - smartphone, tablet, desktop, and web. Your conversations, contacts, and settings are automatically synced in real-time while maintaining end-to-end encryption."
    },
    {
      question: "What video call quality can I expect?",
      answer: "U&Me supports up to 4K video calls with adaptive bandwidth technology. The app automatically adjusts quality based on your internet connection to ensure smooth, low-latency communication. Group video calls support up to 50 participants."
    },
    {
      question: "How accurate is the translation feature?",
      answer: "Our AI translation achieves 95%+ accuracy for major languages and continuously learns from context to improve over time. It handles idioms, slang, and cultural expressions while maintaining the original message's tone and intent."
    },
    {
      question: "Can I translate group conversations?",
      answer: "Absolutely! In group chats, each member can set their preferred language, and all messages are automatically translated for everyone. This creates a truly multilingual conversation experience where language barriers disappear."
    },
    {
      question: "What file types can I share?",
      answer: "You can share images, videos, documents (PDF, DOC, XLS, PPT), audio files, and more. Free users can share files up to 2MB, while premium users can share files up to 10MB with cloud storage integration for larger files."
    },
    {
      question: "How do I report inappropriate content?",
      answer: "We take safety seriously. You can report any inappropriate content by long-pressing on any message and selecting 'Report'. Our AI moderation system and human reviewers investigate all reports within 24 hours and take appropriate action."
    },
    {
      question: "Can I backup my chat history?",
      answer: "Yes, premium users can enable automatic cloud backup of their chat history. Backups are encrypted and can be restored when switching devices. You can also export specific conversations as encrypted files for local storage."
    }
  ];
  const stats = [
    { number: "50M+", label: "Active Users" },
    { number: "185+", label: "Countries" },
    { number: "99.99%", label: "Uptime" },
    { number: "500ms", label: "Avg Response" }
  ];


  const testimonials = [
    {
  name: "Rohit Mehra",
  role: "CEO, BharatTech Solutions",
  avatar: "RM",
  rating: 5,
  text: "U&Me transformed how our team collaborates across cities. The real-time translation feature is truly a game-changer!"
},
{
  name: "Ananya Iyer",
  role: "Design Lead, Kreative Studio",
  avatar: "AI",
  rating: 5,
  text: "The video quality is outstanding, and the interface feels so natural to use. Easily the best communication tool we've used."
},
{
  name: "Siddharth Verma",
  role: "Founder, Innovana Startups",
  avatar: "SV",
  rating: 5,
  text: "It's the perfect blend of speed and security. We can now discuss sensitive ideas with full confidence."
}


  ];
  const transport = () => {
    navigate('/login');}


      const renderComponent = () => {
    switch(activeComponent) {
      case 'AskExpertWidget':
        return <AskExpertWidget onClose={() => setActiveComponent(null)} />;
      default:
        return null;
    }
  };
const contactMethods = [
  {
    icon: GraduationCap,
    title: "Ask an Expert",
    detail: "Chat live with our support team for instant help",
    action: () => setActiveComponent('AskExpertWidget'), // Will render the chat widget
    type: 'component' // Indicates this renders a component
  },
  {
    icon: Rocket,
    title: "Start a Project",
    detail: "Get a customized quote for your project needs",
    action: () => navigate('/start-project'), // Will render StartProjectForm
    type: 'route' // Indicates this uses React Router navigation
  },
  {
    icon: MessageSquare,
    title: "Send Feedback",
    detail: "Help us improve by sharing your experience",
    action: () => navigate('/feedback'), // Your existing feedback form
    type: 'route'
  },
  {
    icon: Lightbulb,
    title: "Suggest a Feature",
    detail: "Vote on or propose new features for U&Me",
    action: () => navigate('/suggest-feature'), // Will render SuggestFeatureForm
    type: 'route'
  }
];


  return (
    <div className="app">
      {/* Navigation */}
      <nav className={`navbar ${scrollY > 50 ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <div className="logo">
            <MessageSquare size={28} />
            <span>U&Me</span>
          </div>
          
          <div className={`nav-menu ${isMenuOpen ? 'active' : ''} `}>
            <button 
  className="theme-toggle"
  onClick={() => setDarkMode(!darkMode)}
>
  <div className="theme-icon">
    {darkMode ? <Moon size={16} /> : <Sun size={16} />}
  </div>
</button>
            <a href="#" onClick={() => smoothScroll(featuresRef)}>Home</a>
            <a href="#features" onClick={() => smoothScroll(featuresRef)}>Features</a>
            <a href="#about" onClick={() => smoothScroll(aboutRef)}>About</a>
            <a href="#contact" onClick={() => smoothScroll(contactRef)}>Contact</a>
            <a href="#faq" onClick={() => smoothScroll(faqRef)}>FAQ</a>
            <button className="nav-cta" onClick={()=>navigate('/register')}>Get Started</button>
          </div>


          <button 
            className="menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>


      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content"> 
            <h1 className="hero-title">
              Connect Globally,
              <span className="gradient-text"> Chat Locally</span>
            </h1>
            
            <p className="hero-description">
              Experience the future of communication with real-time translation, 
              4K video calls, and military-grade security. Break down language 
              barriers and connect with anyone, anywhere.
            </p>


            <div className="hero-actions">
              <button className="primary-btn" onClick={() => navigate('/register')}>
                <Play size={20} />
                Start Now
              </button>
              <button className="secondary-btn" onClick={() => navigate('/download')}>
                <Smartphone size={20} />
                Download App
              </button>
            </div>


            <div className="hero-stats">
              {stats.map((stat, index) => (
                <div key={index} className="stat-item">
                  <div className="stat-number">{stat.number}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>


          <div className="hero-visual">
            <div className="phone-mockup">
              <div className="screen">
                <div className="newchat-interface">
                  <div className="newchat-header">
                    <div className="contact-info">
                      <div className="avatar">DS</div>
                      <div>
                        <div className="contact-name">Deepanshu Sharma</div>
                        <div className="contact-status">Online</div>
                      </div>
                    </div>
                    <Video size={20} className="video-icon" />
                  </div>
                  
                  <div className="messages">
                    {visibleMessages.map((message) => (
                      <div key={message.id} className={`message ${message.type} fade-in`}>
                        <div className="message-text">{message.text}</div>
                        {message.translation && (
                          <div className="translation">{message.translation}</div>
                        )}
                      </div>
                    ))}
                    {isTyping && (
                      <div className="message received typing">
                        <div className="message-text">
                          <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section className="features" id="features" ref={featuresRef}>
        <div className="container">
          <div className="section-header">
            <h2>Powerful Features for Modern Communication</h2>
            <p>Everything you need to stay connected with your team and loved ones</p>
          </div>


          <div className="features-grid">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className={`feature-card ${activeFeature === index ? 'active' : ''}`}
                  style={{ '--accent-color': feature.color }}
                >
                  <div className="feature-icon">
                    <Icon size={32} />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                  <div className="feature-arrow">
                    <ArrowRight size={20} onClick={transport}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* About Section */}
      <section className="about" id="about" ref={aboutRef}>
        <div className="container">
          <div className="section-header">
            <h2>About U&Me</h2>
            <p>Our mission to connect the world through seamless communication</p>
          </div>


          <div className="about-content">
            <div className="about-text">
              <h3>Breaking Language Barriers Since 2022</h3>
              <p>
                U&Me was founded with a simple goal: to make communication effortless 
                regardless of language or location. Our AI-powered platform removes 
                the friction from global conversations.
              </p>
              <p>
                With offices in 5 countries and users in over 180, we're proud to be 
                building the most inclusive communication platform on the planet.
              </p>
              <div className="about-stats">
                <div className="stat">
                  <div className="stat-number">5</div>
                  <div className="stat-label">Global Offices</div>
                </div>
                <div className="stat">
                  <div className="stat-number">180+</div>
                  <div className="stat-label">Countries Served</div>
                </div>
                <div className="stat">
                  <div className="stat-number">99%</div>
                  <div className="stat-label">Customer Satisfaction</div>
                </div>
              </div>
            </div>
            <div className="about-image">
              <div className="image-placeholder">
                <div className="globe-animation">
                  <Globe size={120} />
                  <div className="connection-dots">
                    {[...Array(12)].map((_, i) => (
                      <div key={i} className="dot" style={{ 
                        transform: `rotate(${i * 30}deg) translateY(-100px)`
                      }}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <h2>Loved by millions worldwide</h2>
            <p>See what our users have to say about U&Me</p>
          </div>


          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-header">
                  <div className="avatar-large">{testimonial.avatar}</div>
                  <div className="testimonial-info">
                    <h4>{testimonial.name}</h4>
                    <p>{testimonial.role}</p>
                  </div>
                  <div className="rating">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Contact Section */}
      <section className="contact" id="contact" ref={contactRef}>
        <div className="container">
          <div className="section-header">
            <h2>Get In Touch</h2>
            <p>We'd love to hear from you. Contact us anytime.</p>
          </div>


          <div className="contact-content">
            <div className="contact-methods">
              {contactMethods.map((method, index) => {
                const Icon = method.icon;
                return (
                  <a 
                    key={index} 
                    onClick={method.action} 
                    className="contact-card"
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{cursor: 'pointer'}}
                  >
                    <div className="contact-icon">
                      <Icon size={32} />
                    </div>
                    <h3>{method.title}</h3>
                    <p>{method.detail}</p>
                  </a>
                );
              })}
            </div>
          </div>
          {activeComponent && renderComponent()}
        </div>
      </section>
      {/* FAQ Section */}
   <section className="faq" id="faq" >
  <div className="container">
    <div className="section-header">
      <div className="faq-icon">
        <HelpCircle size={48} />
      </div>
      <h2>Frequently Asked Questions</h2>
      <p>Everything you need to know about U&Me</p>
    </div>


    <div className="faq-container">
      <div className="faq-list">
        {faqData.map((item, index) => (
          <div 
            key={index} 
            className={`faq-item ${openItems.has(index) ? 'active' : ''}`}
          >
            <button 
              className="faq-question"
              onClick={() => toggleFaqItem(index)}
              aria-expanded={openItems.has(index)}
            >
              <span className="question-text">{item.question}</span>
              <div className="faq-icon-toggle">
                {openItems.has(index) ? 
                  <Minus size={20} /> : 
                  <Plus size={20} />
                }
              </div>
            </button>
            
            <div className={`faq-answer ${openItems.has(index) ? 'expanded' : ''}`}>
              <div className="faq-answer-content">
                <p>{item.answer}</p>
              </div>
            </div>
          </div>
        ))}
      </div>


      <div className="faq-support">
        <div className="support-card">
          <h3>Still have questions?</h3>
          <p>Our support team is here to help you get the most out of U&Me.</p>
          <div className="support-actions">
            <button className="primary-btn" onClick={handleContactSupport}>
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="logo">
                <MessageSquare size={28} />
                <span>U&Me</span>
              </div>
              <p>Connecting the world through seamless communication</p>
            </div>
            
           <div className="footer-links">
  <div className="link-group">
    <h4>Product</h4>
    <a href="#features" onClick={() => smoothScroll(featuresRef)}>Features</a>
    <a href="#pricing" onClick={() => handleNavigateToInfo('pricing')}>Pricing</a>
    <a href="#" onClick={() => handleNavigateToInfo('security')}>Security</a>
    <a href="#" onClick={() => handleNavigateToInfo('integrations')}>Integrations</a>
  </div>
  <div className="link-group">
    <h4>Company</h4>
    <a href="#about" onClick={() => smoothScroll(aboutRef)}>About</a>
    <a href="#" onClick={() => handleNavigateToInfo('careers')}>Careers</a>
    <a href="#" onClick={() => handleNavigateToInfo('press')}>Press</a>
    <a href="#contact" onClick={handleContactSupport}>Contact</a>
  </div>
  <div className="link-group">
    <h4>Support</h4>
    <a href="#" onClick={() => handleNavigateToInfo('help-center')}>Help Center</a>
    <a href="#" onClick={() => handleNavigateToInfo('community')}>Community</a>
    <a href="#" onClick={() => handleNavigateToInfo('api-docs')}>API Docs</a>
    <a href="#" onClick={() => handleNavigateToInfo('status')}>Status</a>
  </div>
</div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2025 U&Me. All rights reserved.</p>
            <div className="footer-social">
              <a href="#" aria-label="Twitter">
                <MessageSquare size={20} />
              </a>
              <a href="#" aria-label="LinkedIn">
                <Users size={20} />
              </a>
              <a href="#" aria-label="GitHub">
                <Globe size={20} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}