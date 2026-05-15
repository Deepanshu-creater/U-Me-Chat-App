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
  Info
} from 'lucide-react';
import './App.css';
import { useNavigate } from 'react-router-dom';
export default function App() {


const navigate = useNavigate();

useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) {
    navigate("/chat");
  }
}, [navigate]);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [visibleMessages, setVisibleMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  // Refs for smooth scrolling
  const featuresRef = useRef(null);
  const aboutRef = useRef(null);
  const pricingRef = useRef(null);
  const contactRef = useRef(null);

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
      description: "Crystal-clear video calls with up to 100 participants and screen sharing",
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
      title: "Team Spaces",
      description: "Dedicated workspaces for teams with channels, threads, and file management",
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


  const stats = [
    { number: "50M+", label: "Active Users" },
    { number: "180+", label: "Countries" },
    { number: "99.99%", label: "Uptime" },
    { number: "500ms", label: "Avg Response" }
  ];

  const testimonials = [
    {
      name: "Alex Chen",
      role: "CEO, TechFlow",
      avatar: "AC",
      rating: 5,
      text: "U&Me revolutionized our global communication. The translation feature is absolutely game-changing!"
    },
    {
      name: "Maria Rodriguez",
      role: "Design Lead, Pixel Co",
      avatar: "MR",
      rating: 5,
      text: "The video quality is incredible, and the interface is so intuitive. Best chat app we've ever used."
    },
    {
      name: "James Wilson",
      role: "Startup Founder",
      avatar: "JW",
      rating: 5,
      text: "Security and speed combined perfectly. Our sensitive discussions are safe and lightning-fast."
    }
  ];

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Us",
      detail: "support@uandme.app",
      action: "mailto:support@uandme.app"
    },
    {
      icon: Phone,
      title: "Call Us",
      detail: "+1 (555) 123-4567",
      action: "tel:+15551234567"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      detail: "123 Tech Street, Silicon Valley",
      action: "https://maps.google.com"
    },
    {
      icon: DollarSign,
      title: "Sales Inquiry",
      detail: "Know about our production value",
      action: "https://uandme.app/sales"
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
          
          <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <a href="#features" onClick={() => smoothScroll(featuresRef)}>Features</a>
            <a href="#about" onClick={() => smoothScroll(aboutRef)}>About</a>
            <a href="#contact" onClick={() => smoothScroll(contactRef)}>Contact</a>
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
            <div className="hero-badge">
              <Star size={16} />
              <span>Rated #1 Chat App 2025</span>
            </div>
            
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
                    <ArrowRight size={20} />
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
                    href={method.action} 
                    className="contact-card"
                    target="_blank" 
                    rel="noopener noreferrer"
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

            <form className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input type="text" id="name" placeholder="Your name" required />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" placeholder="your@email.com" required />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea id="message" rows="5" placeholder="Your message..." required></textarea>
              </div>
              <button type="submit" className="primary-btn">
                Send Message
                <ArrowRight size={20} />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to transform your communication?</h2>
            <p>Join millions of users who have already made the switch to U&Me</p>
            <div className="cta-actions">
              <button className="primary-btn large">
                Get Started Free
                <ArrowRight size={20} />
              </button>
              <div className="cta-features">
                <div className="cta-feature">
                  <CheckCircle size={16} />
                  <span>Free 30-day trial</span>
                </div>
                <div className="cta-feature">
                  <CheckCircle size={16} />
                  <span>No credit card required</span>
                </div>
                <div className="cta-feature">
                  <CheckCircle size={16} />
                  <span>Cancel anytime</span>
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
                <a href="#pricing" onClick={() => smoothScroll(pricingRef)}>Pricing</a>
                <a href="#">Security</a>
                <a href="#">Integrations</a>
              </div>
              <div className="link-group">
                <h4>Company</h4>
                <a href="#about" onClick={() => smoothScroll(aboutRef)}>About</a>
                <a href="#">Careers</a>
                <a href="#">Press</a>
                <a href="#contact" onClick={() => smoothScroll(contactRef)}>Contact</a>
              </div>
              <div className="link-group">
                <h4>Support</h4>
                <a href="#">Help Center</a>
                <a href="#">Community</a>
                <a href="#">API Docs</a>
                <a href="#">Status</a>
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