import { GraduationCap, X, Send } from 'lucide-react';
import { useState } from 'react';
import './askexpert.css';

export function AskExpertWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const aewSendMessage = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: 'aew-user' }]);
      setInput('');
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          text: "Thanks for your question! Our team will respond shortly.", 
          sender: 'aew-agent' 
        }]);
      }, 1000);
    }
  };

  return (
    <div className="aew-container">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="aew-toggle-btn"
        >
          <GraduationCap size={20} />
          <span>Ask an Expert</span>
        </button>
      ) : (
        <div className="aew-chat-window">
          <div className="aew-chat-header">
            <h3 className="aew-chat-title">Live Support</h3>
            <button 
              className="aew-close-btn"
              onClick={() => setIsOpen(false)}
            >
              <X size={18} />
            </button>
          </div>
          
          <div className="aew-messages-container">
            {messages.length === 0 && (
              <div className="aew-welcome-msg">
                <p>Hi there! How can we help you today?</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`aew-message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>
          
          <div className="aew-input-area">
            <input
              className="aew-text-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              onKeyPress={(e) => e.key === 'Enter' && aewSendMessage()}
            />
            <button 
              className="aew-send-btn"
              onClick={aewSendMessage}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}