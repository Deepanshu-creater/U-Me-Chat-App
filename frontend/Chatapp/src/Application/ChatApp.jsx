import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { User, Phone, Video, Upload, Trash2, Paperclip, PhoneOff, VideoOff, Mic, MicOff, FileText, X,Image as ImageIcon, File } from "lucide-react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { requestForToken, onMessageListener } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";
import "./chat.css";

export default function ChatApp() {
  /* ====================== Setup & State ====================== */
  const SOCKET_URL = "https://u-me-chat-app.onrender.com";
  const currentUser = localStorage.getItem("username");
  const socket = useRef(null);

  const [isConnected, setIsConnected] = useState(false);
  const [people, setPeople] = useState([]);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("");
  const [chats, setChats] = useState({});
  const [typing, setTyping] = useState({});
  const [message, setMessage] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [profileImages, setProfileImages] = useState({});
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const fileInputRef = useRef(null);
  const profileInputRef = useRef(null);
  const [language, setLanguage] = useState(localStorage.getItem("language") || "en");
  const [theme, setTheme] = useState(localStorage.getItem('chatTheme') || 'dark');
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Upload states
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Voice Input States
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);

  // VideoSDK States
  const [isInCall, setIsInCall] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callStatus, setCallStatus] = useState('');
  const [meetingId, setMeetingId] = useState(null);
  const [meetingUrl, setMeetingUrl] = useState(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const bubbleVariants = {
    sent: {
      opacity: 0,
      x: 100,
      transition: { duration: 0 }
    },
    animate: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 500, damping: 30 }
    }
  };

  const profileMenuVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 }
  };

  const callOverlayVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 }
  };

  const pulseRing = {
    scale: [1, 1.2, 1],
    opacity: [0.5, 0],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  /* ====================== Theme toggling ====================== */
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('chatTheme', newTheme);
  };

  /* ====================== Cloudinary Upload Functions ====================== */
  const uploadFileToBackend = async (file, isProfileImage = false) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('isProfileImage', isProfileImage.toString());
    formData.append('username', currentUser);
    formData.append('targetUser', active || '');

    try {
      const response = await axios.post(
        `${SOCKET_URL}/api/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress);
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Upload failed');
    }
  };

  // Handle profile image upload
  const handleProfileImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setIsUploadingProfile(true);
    setUploadProgress(0);

    try {
      const result = await uploadFileToBackend(file, true);
      
      setProfileImages(prev => ({
        ...prev,
        [currentUser]: result.url
      }));

      await axios.post(`${SOCKET_URL}/upload-profile`, {
        username: currentUser,
        imageUrl: result.url,
        publicId: result.publicId
      });

      socket.current.emit('profile_updated', {
        username: currentUser,
        imageUrl: result.url
      });

      setShowProfileMenu(false);
      toast.success('Profile image updated successfully!');
    } catch (error) {
      console.error('Profile upload error:', error);
      toast.error('Failed to upload profile image');
    } finally {
      setIsUploadingProfile(false);
      setUploadProgress(0);
    }
  };

  // Handle file attachment upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !active) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size should be less than 10MB');
      return;
    }

    setIsUploadingFile(true);
    setUploadProgress(0);

    try {
      const result = await uploadFileToBackend(file, false);
      
      const fileMessage = {
        to: active,
        fileUrl: result.url,
        fileName: result.originalFilename || file.name,
        fileSize: result.bytes,
        fileType: result.resourceType,
        format: result.format,
        time: new Date().toISOString(),
        lang: language,
        text: ""
      };

      console.log("Sending file message:", fileMessage);

      socket.current.emit("file_message", fileMessage);
      
      toast.success('File uploaded and sent successfully!');
    } catch (error) {
      console.error('File upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setIsUploadingFile(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Remove profile image
  const handleRemoveProfileImage = async () => {
    try {
      await axios.delete(`${SOCKET_URL}/remove-profile/${currentUser}`);
      
      setProfileImages(prev => ({
        ...prev,
        [currentUser]: null
      }));

      socket.current.emit('profile_updated', {
        username: currentUser,
        imageUrl: null
      });

      setShowProfileMenu(false);
      toast.success('Profile image removed successfully!');
    } catch (error) {
      console.error('Remove profile error:', error);
      toast.error('Failed to remove profile image');
    }
  };

  // Load profile images on mount
  useEffect(() => {
    const loadProfileImages = async () => {
      try {
        const response = await axios.get(`${SOCKET_URL}/profile-images`);
        setProfileImages(response.data);
      } catch (error) {
        console.error('Failed to load profile images:', error);
      }
    };
    
    loadProfileImages();
  }, []);

  /************Notification-setup****************/
  useEffect(() => {
    const setupNotifications = async () => {
      if (!currentUser) {
        console.log("No user logged in, skipping notification setup");
        return;
      }

      try {
        const token = await requestForToken();
        if (!token) {
          console.log("No FCM token received");
          return;
        }

        console.log("FCM Token received:", token);
        console.log("Attempting to save token for user:", currentUser);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await axios.post(`${SOCKET_URL}/save-token`, {
          token,
          username: currentUser
        }, {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        clearTimeout(timeoutId);
        console.log("Token save successful:", response.data);
        
      } catch (error) {
        console.error("Token save ERROR:", error);
        
        if (error.code === 'ECONNABORTED') {
          console.error("Request timeout - server might be down");
        } else if (error.response) {
          console.error("Server error response:", error.response.status, error.response.data);
        } else if (error.request) {
          console.error("No response from server - check if backend is running");
          console.error("Request was made to:", error.config.url);
        } else {
          console.error("Unexpected error:", error.message);
        }
      }
    };

    setupNotifications();
  }, [currentUser, SOCKET_URL]);

  /* ====================== Voice Input Setup ====================== */
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setSpeechSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.maxAlternatives = 1;
      
      const speechLang = getSpeechLanguageCode(language);
      recognitionRef.current.lang = speechLang;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        
        setMessage(transcript);
        
        if (active && transcript.trim()) {
          handleTyping();
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone access to use voice typing.');
        } else if (event.error === 'no-speech') {
          console.log('No speech detected');
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, active]);

  const getSpeechLanguageCode = (langCode) => {
    const langMap = {
      'en': 'en-US',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'it': 'it-IT',
      'pt': 'pt-BR',
      'ru': 'ru-RU',
      'ja': 'ja-JP',
      'ko': 'ko-KR',
      'zh': 'zh-CN',
      'zh-TW': 'zh-TW',
      'hi': 'hi-IN',
      'ar': 'ar-SA',
      'tr': 'tr-TR',
      'pl': 'pl-PL',
      'nl': 'nl-NL',
      'sv': 'sv-SE',
      'da': 'da-DK',
      'no': 'nb-NO',
      'fi': 'fi-FI',
      'cs': 'cs-CZ',
      'hu': 'hu-HU',
      'ro': 'ro-RO',
      'bg': 'bg-BG',
      'hr': 'hr-HR',
      'sk': 'sk-SK',
      'sl': 'sl-SI',
      'et': 'et-EE',
      'lv': 'lv-LV',
      'lt': 'lt-LT',
      'el': 'el-GR',
      'he': 'he-IL',
      'th': 'th-TH',
      'vi': 'vi-VN',
      'id': 'id-ID',
      'ms': 'ms-MY',
      'uk': 'uk-UA',
      'ca': 'ca-ES',
      'fa': 'fa-IR',
      'ur': 'ur-PK',
      'bn': 'bn-BD',
      'ta': 'ta-IN',
      'te': 'te-IN',
      'ml': 'ml-IN',
      'kn': 'kn-IN',
      'mr': 'mr-IN',
      'gu': 'gu-IN',
      'pa': 'pa-IN',
      'ne': 'ne-NP',
      'si': 'si-LK',
      'my': 'my-MM',
      'km': 'km-KH',
      'lo': 'lo-LA',
      'ka': 'ka-GE',
      'am': 'am-ET',
      'sw': 'sw-KE',
      'zu': 'zu-ZA',
      'af': 'af-ZA'
    };
    
    return langMap[langCode] || 'en-US';
  };

  const toggleVoiceInput = () => {
    if (!speechSupported) {
      toast.error('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (!active) {
      toast.error('Please select a user to chat with first.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      const speechLang = getSpeechLanguageCode(language);
      recognitionRef.current.lang = speechLang;
      
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        setIsListening(false);
      }
    }
  };

  /* ====================== VideoSDK Integration ====================== */
const createMeeting = async (isVideo = true) => {
  if (!active) {
    toast.error('Please select a user to call');
    return;
  }

  if (isInCall) {
    toast.error('You are already in a call');
    return;
  }

  try {
    setCallStatus('Creating meeting...');
    setIsVideoCall(isVideo);

    const response = await axios.post(`${SOCKET_URL}/create-meeting`, {
      username: currentUser,
      targetUser: active,
      isVideo: isVideo
    });

    const { meetingId, token, meetingUrl } = response.data;
    
    setMeetingId(meetingId);
    setMeetingUrl(meetingUrl);
    setIsInCall(true);
    setCallStatus('Meeting created');

    // Notify the other user about the call
    socket.current.emit('videosdk_call_invite', {
      to: active,
      meetingId: meetingId,
      meetingUrl: meetingUrl,
      type: isVideo ? 'video' : 'audio',
      from: currentUser
    });

    // Open the meeting in a new tab
    window.open(meetingUrl, '_blank', 'width=1200,height=800');

  } catch (error) {
    console.error('Error creating meeting:', error);
    setCallStatus('Failed to create meeting');
    const errorMsg = error.response?.data?.error || 'Failed to start call (check server logs)';
    toast.error(errorMsg);
    cleanupCall();
  }
};

  const joinMeeting = (meetingUrl) => {
    window.open(meetingUrl, '_blank', 'width=1200,height=800');
    setIncomingCall(null);
    setIsInCall(true);
  };

  const rejectCall = () => {
    if (incomingCall) {
      socket.current.emit('videosdk_call_reject', {
        to: incomingCall.from,
        meetingId: incomingCall.meetingId
      });
    }
    setIncomingCall(null);
    setCallStatus('');
  };

  const endCall = () => {
    if (active && meetingId) {
      socket.current.emit('videosdk_call_end', {
        to: active,
        meetingId: meetingId
      });
    }
    cleanupCall();
  };

  const cleanupCall = () => {
    setIsInCall(false);
    setIsVideoCall(false);
    setIncomingCall(null);
    setCallStatus('');
    setMeetingId(null);
    setMeetingUrl(null);
  };

  /* ====================== Socket Setup ====================== */
  useEffect(() => {
    // Mobile detection
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    if (!socket.current) {
      socket.current = io(SOCKET_URL, {
        query: { username: currentUser },
        transports: ["websocket"],
      });

      socket.current.on("connect", () => setIsConnected(true));
      socket.current.on("disconnect", () => setIsConnected(false));

      socket.current.on("chat_history", ({ with: user, messages }) => {
        setChats((prev) => ({
          ...prev,
          [user]: messages
        }));
      });

      // Updated private_message handler with MyMemory API
      socket.current.on("private_message", async (msg) => {
        const other = msg.self ? msg.to : msg.from;

        const userLang = language;
        const senderLang = msg.lang || "en";

        console.log("--- Message Received ---");
        console.log("User's language:", userLang);
        console.log("Sender's language:", senderLang);
        console.log("Original message:", msg.text);

        // Translate if languages are different and message is not from self
        if (!msg.self && userLang !== senderLang) {
          try {
            console.log("Translating from", senderLang, "to", userLang);
            const response = await axios.post(`${SOCKET_URL}/translate`, {
              text: msg.text,
              sourceLang: senderLang,
              targetLang: userLang
            },
           { headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
            }});
            console.log("Translation result:", response.data);
            msg.translated = response.data.translated || msg.text;
          } catch (error) {
            if (error.response?.data?.limitReached) {
    toast.error(`${error.response.data.error}\n${error.response.data.upgradeMessage}`);
  } else {
    console.error("Translation failed:", error);
  }
            msg.translated = msg.text;
          }
        }

        setChats((prev) => ({
          ...prev,
          [other]: [...(prev[other] || []), msg]
        }));
      });

      // Handle file messages
      socket.current.on("file_message", (msg) => {
        const other = msg.self ? msg.to : msg.from;
        setChats((prev) => ({
          ...prev,
          [other]: [...(prev[other] || []), msg]
        }));
      });

      // Handle profile updates
      socket.current.on("profile_updated", ({ username, imageUrl }) => {
        setProfileImages(prev => ({
          ...prev,
          [username]: imageUrl
        }));
      });

      /*********Language updation connection btw user*************/
      socket.current.on("language_update", ({ username, language }) => {
        console.log(`User ${username} changed language to ${language}`);
        if (username === currentUser) {
          setLanguage(language);
          localStorage.setItem("language", language);
        }
      });

      socket.current.on("typing", ({ from }) =>
        setTyping((prev) => ({ ...prev, [from]: true }))
      );

      socket.current.on("stopTyping", ({ from }) =>
        setTyping((prev) => ({ ...prev, [from]: false }))
      );

      // VideoSDK Socket Events
      socket.current.on('videosdk_call_invite', ({ from, meetingId, meetingUrl, type }) => {
        console.log(`Call invite from ${from} (type: ${type})`);
        
        // Check if user is already in a call
        if (isInCall) {
          socket.current.emit('videosdk_call_busy', { 
            to: from,
            meetingId: meetingId
          });
          return;
        }

        setIncomingCall({
          from,
          meetingId,
          meetingUrl,
          type
        });
      });

      socket.current.on('videosdk_call_reject', ({ from, meetingId }) => {
        console.log(`Call rejected by ${from}`);
        setCallStatus('Call rejected');
        toast.info(`${from} rejected your call`);
        setTimeout(() => {
          cleanupCall();
        }, 2000);
      });

      socket.current.on('videosdk_call_end', ({ from, meetingId }) => {
        console.log(`Call ended by ${from}`);
        setCallStatus('Call ended');
        toast.info(`${from} ended the call`);
        setTimeout(() => {
          cleanupCall();
        }, 2000);
      });

      socket.current.on('videosdk_call_busy', ({ from, meetingId }) => {
        console.log(`${from} is busy`);
        setCallStatus('User is busy');
        toast.info(`${from} is busy in another call`);
        setTimeout(() => {
          cleanupCall();
        }, 2000);
      });

      const storedActive = localStorage.getItem("activeUser");
      if (storedActive) {
        setActive(storedActive);
        socket.current.emit("get_chat_history", { with: storedActive });
      }
    }

    return () => {
      cleanupCall();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.removeEventListener('resize', checkMobile);
    };
  }, [currentUser, language]);

  useEffect(() => {
    if (socket.current && socket.current.connected) {
      console.log("Emitting language update:", language);
      socket.current.emit("language_update", {
        username: currentUser,
        language: language
      });
    }
  }, [language, currentUser]);

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    console.log("User changed language to:", newLanguage);
    localStorage.setItem("language", newLanguage);
    
    // Update speech recognition language
    if (recognitionRef.current) {
      const speechLang = getSpeechLanguageCode(newLanguage);
      recognitionRef.current.lang = speechLang;
    }
    
    // Emit language update if socket is connected
    if (socket.current && socket.current.connected) {
      socket.current.emit("language_update", {
        username: currentUser,
        language: newLanguage
      });
    } else {
      console.error("Socket not connected yet");
    }
  };

  /* =================== Toggle theme useEffect =================== */
  useEffect(() => {
    document.querySelector('.chat-app-layout').className = 
      theme === 'light' 
        ? 'chat-app-layout light-theme' 
        : 'chat-app-layout';
  }, [theme]);

  /* =================== Single User Search Effect =================== */
  useEffect(() => {
    if (!search.trim()) {
      setPeople([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      fetch(`${SOCKET_URL}/users?search=${encodeURIComponent(search.trim())}`)
        .then((response) => response.json())
        .then((data) => {
          const results = Array.isArray(data) ? data : [];
          const newContacts = results.map(user =>
            typeof user === "object" ? user : { username: user }
          );
          setPeople([...newContacts]);
        })
        .catch(() => setPeople([]));
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search]);

  /* ======================== Send Message ======================== */
  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !active) return;
    console.log("Sending message in language:", language);
    const payload = {
      from: currentUser,
      to: active,
      text: message.trim(),
      time: new Date().toISOString(),
      lang: language,
    };

    socket.current.emit("private_message", payload);
    setMessage("");
    setIsSent(true);
    setTimeout(() => setIsSent(false), 1200);
  };

  /* ====================== Typing Indicator ====================== */
  const handleTyping = () => {
    if (!active) return;
    socket.current.emit("typing", { to: active });
    clearTimeout(handleTyping.timer);
    handleTyping.timer = setTimeout(() => {
      socket.current.emit("stopTyping", { to: active });
    }, 1000);
  };

  /* ====================== File Download Helper ====================== */
  const downloadFile = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ====================== Render File Message ====================== */
  const renderFileMessage = (msg) => {
    const isImage = msg.fileType === 'image';
    const fileIcon = isImage ? ImageIcon : File;
    const IconComponent = fileIcon;

     return (
      <div className="chat-app-file-message">
        <div className="chat-app-file-header">
          <IconComponent size={20} />
          <span className="chat-app-file-name">{msg.fileName}</span>
        </div>
        
        {isImage && (
          <div className="chat-app-file-preview">
            <img 
              src={msg.fileUrl} 
              alt={msg.fileName}
              style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px' }}
              onClick={() => window.open(msg.fileUrl, '_blank')}
            />
          </div>
        )}
        
        <div className="chat-app-file-actions">
          <button 
            className="chat-app-file-download"
            onClick={() => downloadFile(msg.fileUrl, msg.fileName)}
          >
            Download ({Math.round(msg.fileSize / 1024)} KB)
          </button>
        </div>
      </div>
    );
  };

  /* ========================= Render ========================= */
  const msgs = chats[active] || [];

  return (
    <motion.div 
      className={`chat-app-layout ${theme === 'light' ? 'light-theme' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ToastContainer 
        position={isMobile ? "top-right" : "top-center"}
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme === 'dark' ? 'dark' : 'light'}
        className="chat-app-toast-container"
      />

      {/* Hidden file inputs */}
      <input 
        ref={fileInputRef}
        type="file"
        accept="*/*"
        style={{ display: "none" }}
        onChange={handleFileUpload}
      />
      
      <input 
        ref={profileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleProfileImageUpload}
      />

      {isMobile && (
        <div className="chat-app-mobile-header">
          <button 
            className="chat-app-sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? "✕" : "☰"}
          </button>
        </div>
      )}

      {/* Upload Progress Overlay */}
      <AnimatePresence>
        {(isUploadingProfile || isUploadingFile) && (
          <motion.div 
            className="chat-app-upload-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="chat-app-upload-progress"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
            >
              <div className="chat-app-upload-spinner"></div>
              <p>
                {isUploadingProfile 
                  ? 'Uploading profile image...' 
                  : 'Uploading file...'}
              </p>
              <div className="chat-app-progress-bar">
                <motion.div 
                  className="chat-app-progress-fill" 
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p>{uploadProgress}%</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VideoSDK Call Overlay */}
      <AnimatePresence>
        {(isInCall || incomingCall) && (
          <motion.div 
            className="videosdk-call-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="videosdk-call-container"
              variants={callOverlayVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {/* Incoming Call */}
              {incomingCall && !isInCall && (
                <motion.div 
                  className="videosdk-incoming-call"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3>Incoming {incomingCall.type} call from {incomingCall.from}</h3>
                  <p className="videosdk-call-status">Click Join to enter the meeting</p>
                  <div className="videosdk-call-actions">
                    <motion.button 
                      className="videosdk-answer-btn"
                      onClick={() => joinMeeting(incomingCall.meetingUrl)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Video size={20} />
                      Join Meeting
                    </motion.button>
                    <motion.button 
                      className="videosdk-reject-btn"
                      onClick={rejectCall}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <PhoneOff size={20} />
                      Reject
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Active Call */}
              {isInCall && (
                <motion.div 
                  className="videosdk-active-call"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  <div className="videosdk-call-header">
                    <h3>{isVideoCall ? 'Video' : 'Audio'} call with {active}</h3>
                    <p className="videosdk-call-status">{callStatus}</p>
                    <p className="videosdk-meeting-id">Meeting ID: {meetingId}</p>
                  </div>

                  <div className="videosdk-call-info">
                    <p>Meeting is active in a separate window</p>
                    <div className="videosdk-call-actions">
                      <motion.button 
                        className="videosdk-action-btn"
                        onClick={() => window.open(meetingUrl, '_blank')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Reopen Meeting
                      </motion.button>
                      <motion.button 
                        className="videosdk-action-btn videosdk-end-call"
                        onClick={endCall}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        End Call
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------ Sidebar ------------------------------ */}
      {(!isMobile || sidebarOpen) && (
        <motion.aside 
          className={`chat-app-sidebar ${sidebarOpen ? 'active' : ''}`}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            ...(isMobile && {
              background: theme === 'dark' 
                ? 'rgba(51, 0, 102, 0.95)'
                : 'rgba(230, 204, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRight: theme === 'dark'
                ? '1px solid rgba(179, 136, 255, 0.2)'
                : '1px solid rgba(102, 0, 204, 0.1)',
              boxShadow: theme === 'dark'
                ? '0 0 20px rgba(179, 136, 255, 0.3)'
                : '0 0 20px rgba(102, 0, 204, 0.2)'
            })
          }}
        >
          {/* Profile Section - Top */}
          <div className="chat-app-profile-section">
            <div className="chat-app-profile-header">
              <div className="chat-app-profile-avatar-container">
                <motion.div 
                  className="chat-app-profile-avatar chat-app-clickable" 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {profileImages[currentUser] ? (
                    <img 
                      src={profileImages[currentUser]} 
                      alt={currentUser}
                      onError={() => setProfileImages(prev => ({ ...prev, [currentUser]: null }))}
                    />
                  ) : (
                    <div className="chat-app-avatar-fallback">
                      {currentUser?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </motion.div>
              </div>
              <h2 className="chat-app-username-large">{currentUser}</h2>
            </div>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div 
                  className="chat-app-profile-actions"
                  variants={profileMenuVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.button 
                    className="chat-app-profile-action-btn" 
                    onClick={() => profileInputRef.current?.click()}
                    disabled={isUploadingProfile}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="button-content">
                      <Upload size={16} />
                      {isUploadingProfile ? (
                        <div className="upload-status">
                          <span className="percentage">{uploadProgress}%</span>
                          <div className="progress-container">
                            <motion.div 
                              className="progress-bar"
                              initial={{ width: 0 }}
                              animate={{ width: `${uploadProgress}%` }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span>Upload Photo</span>
                      )}
                    </div>
                  </motion.button>
                  
                  {profileImages[currentUser] && (
                    <motion.button 
                      className="chat-app-profile-action-btn chat-app-remove" 
                      onClick={handleRemoveProfileImage}
                      disabled={isUploadingProfile}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Trash2 size={16} /> Remove Photo
                    </motion.button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="chat-app-sidebar-content">
            {/* Search bar */}
            <motion.input
              className="chat-app-search"
              placeholder="Search user…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              whileFocus={{ boxShadow: "0 0 0 2px rgba(100, 108, 255, 0.3)" }}
            />
            
            <div className="chat-app-user-list">
              {/* Recent chats when search is empty */}
              {!search.trim() && !!Object.keys(chats).length && (
                <motion.ul 
                  className="chat-app-people"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                >
                  {Object.keys(chats)
                    .filter((key) => Array.isArray(chats[key]) && chats[key].length > 0)
                    .sort((a, b) => {
                      const lastA = chats[a][chats[a].length - 1];
                      const lastB = chats[b][chats[b].length - 1];
                      return new Date(lastB.time) - new Date(lastA.time);
                    })
                    .map((username) => (
                      <motion.li
                        key={username}
                        className={username === active ? "chat-app-active" : ""}
                        onClick={() => {
                          setActive(username);
                          socket.current.emit("get_chat_history", { with: username });
                          localStorage.setItem("activeUser", username);
                          if (isMobile) setSidebarOpen(false);
                        }}
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="chat-app-user-avatar">
                          {profileImages[username] ? (
                            <img src={profileImages[username]} alt={username} />
                          ) : (
                            <User size={20} />
                          )}
                        </div>
                        <div className="chat-app-user-content">
                          <div className="chat-app-username">{username}</div>
                          <div className="chat-app-preview">
                            {chats[username][chats[username].length - 1]?.text?.slice(0, 30) || 
                             (chats[username][chats[username].length - 1]?.type === 'file' ? '📎 File' : '')}
                          </div>
                        </div>
                        <div className="chat-app-action-buttons">
                          <motion.button 
                            className="chat-app-icon-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isInCall) {
                                setActive(username);
                                createMeeting(false);
                              }
                            }}
                            disabled={isInCall}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Phone size={18} />
                          </motion.button>
                          <motion.button 
                            className="chat-app-icon-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isInCall) {
                                setActive(username);
                                createMeeting(true);
                              }
                            }}
                            disabled={isInCall}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Video size={18} />
                          </motion.button>
                        </div>
                      </motion.li>
                    ))}
                </motion.ul>
              )}

              {/* Search results list */}
              <motion.ul 
                className="chat-app-people"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {people.length ? (
                  people.map((user) => {
                    const username = user.username;
                    const alreadyChatted = !!chats[username];

                    return (
                      <motion.li
                        key={username}
                        className={`chat-app-person-item ${
                          username === active ? "chat-app-active" : ""
                        } ${alreadyChatted ? "chat-app-old-user" : ""}`}
                        onClick={() => {
                          setActive(username);
                          setSearch("");
                          setPeople([]);
                          localStorage.setItem("activeUser", username);
                          socket.current.emit("get_chat_history", { with: username });
                          if (isMobile) setSidebarOpen(false);
                        }}
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="chat-app-user-avatar">
                          {profileImages[username] ? (
                            <img src={profileImages[username]} alt={username} />
                          ) : (
                            <User size={20} />
                          )}
                        </div>
                        <div className="chat-app-user-content">
                          <div className="chat-app-username">
                            {username}
                            {alreadyChatted && (
                              <span className="chat-app-badge">(chatted)</span>
                            )}
                          </div>
                        </div>
                        <div className="chat-app-action-buttons">
                          <motion.button 
                            className="chat-app-icon-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isInCall) {
                                setActive(username);
                                createMeeting(false);
                              }
                            }}
                            disabled={isInCall}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Phone size={18} />
                          </motion.button>
                          <motion.button 
                            className="chat-app-icon-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isInCall) {
                                setActive(username);
                                createMeeting(true);
                              }
                            }}
                            disabled={isInCall}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Video size={18} />
                          </motion.button>
                        </div>
                      </motion.li>
                    );
                  })
                ) : (
                  search.trim() && (
                    <motion.li 
                      className="chat-app-no-results"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      No users found
                    </motion.li>
                  )
                )}
              </motion.ul>
            </div>
          </div>
          
          {/* Language Picker */}
          <div className="chat-app-language-picker">
            <label htmlFor="language-select">🌐 Language:</label>
            <motion.select
              id="language-select"
              value={language}
              onChange={handleLanguageChange}
              whileHover={{ scale: 1.02 }}
            >
              <option value="en">English</option>
              <option value="zh">Chinese (Simplified)</option>
              <option value="zh-TW">Chinese (Traditional)</option>
              <option value="hi">Hindi</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="it">Italian</option>
              <option value="pt">Portuguese</option>
              <option value="ru">Russian</option>
              <option value="ja">Japanese</option>
              <option value="ko">Korean</option>
              <option value="ar">Arabic</option>
              <option value="tr">Turkish</option>
              <option value="pl">Polish</option>
              <option value="nl">Dutch</option>
              <option value="sv">Swedish</option>
              <option value="da">Danish</option>
              <option value="no">Norwegian</option>
              <option value="fi">Finnish</option>
              <option value="cs">Czech</option>
              <option value="hu">Hungarian</option>
              <option value="ro">Romanian</option>
              <option value="bg">Bulgarian</option>
              <option value="hr">Croatian</option>
              <option value="sk">Slovak</option>
              <option value="sl">Slovenian</option>
              <option value="et">Estonian</option>
              <option value="lv">Latvian</option>
              <option value="lt">Lithuanian</option>
              <option value="mt">Maltese</option>
              <option value="el">Greek</option>
              <option value="he">Hebrew</option>
              <option value="th">Thai</option>
              <option value="vi">Vietnamese</option>
              <option value="id">Indonesian</option>
              <option value="ms">Malay</option>
              <option value="tl">Filipino</option>
              <option value="uk">Ukrainian</option>
              <option value="be">Belarusian</option>
              <option value="ca">Catalan</option>
              <option value="eu">Basque</option>
              <option value="gl">Galician</option>
              <option value="cy">Welsh</option>
              <option value="ga">Irish</option>
              <option value="is">Icelandic</option>
              <option value="mk">Macedonian</option>
              <option value="sq">Albanian</option>
              <option value="sr">Serbian</option>
              <option value="bs">Bosnian</option>
              <option value="mn">Mongolian</option>
              <option value="kk">Kazakh</option>
              <option value="ky">Kyrgyz</option>
              <option value="uz">Uzbek</option>
              <option value="tg">Tajik</option>
              <option value="az">Azerbaijani</option>
              <option value="hy">Armenian</option>
              <option value="ka">Georgian</option>
              <option value="fa">Persian</option>
              <option value="ur">Urdu</option>
              <option value="bn">Bengali</option>
              <option value="ta">Tamil</option>
              <option value="te">Telugu</option>
              <option value="ml">Malayalam</option>
              <option value="kn">Kannada</option>
              <option value="mr">Marathi</option>
              <option value="gu">Gujarati</option>
              <option value="pa">Punjabi</option>
              <option value="or">Odia</option>
              <option value="as">Assamese</option>
              <option value="ne">Nepali</option>
              <option value="si">Sinhala</option>
              <option value="my">Myanmar</option>
              <option value="km">Khmer</option>
              <option value="lo">Lao</option>
              <option value="ka">Georgian</option>
              <option value="am">Amharic</option>
              <option value="sw">Swahili</option>
              <option value="zu">Zulu</option>
              <option value="af">Afrikaans</option>
              <option value="xh">Xhosa</option>
              <option value="st">Sesotho</option>
              <option value="tn">Setswana</option>
              <option value="ss">Siswati</option>
              <option value="ts">Xitsonga</option>
              <option value="ve">Tshivenda</option>
              <option value="nso">Northern Sotho</option>
            </motion.select>
          </div>
          
          <motion.div 
            className="chat-app-name-corner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            U&Me
          </motion.div>
        </motion.aside>
      )}
      
      {isMobile && sidebarOpen && (
        <div 
          className="chat-app-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ---------------------------- Chat section ---------------------------- */}
      <motion.main 
        className="chat-app-main"
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Header */}
        {(!isMobile || !sidebarOpen) && (
          <header className="chat-app-header">
            <div className="chat-app-header-user">
              {active && (
                <motion.div 
                  className="chat-app-header-avatar"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                >
                  {profileImages[active] ? (
                    <img
                      src={profileImages[active]}
                      alt={active}
                      onError={() =>
                        setProfileImages((prev) => ({ ...prev, [active]: null }))
                      }
                    />
                  ) : (
                    <div className="chat-app-avatar-fallback">
                      {active.charAt(0).toUpperCase()}
                    </div>
                  )}
                </motion.div>
              )}
              <div className="chat-app-header-username">{active || "Select a user"}</div>
            </div>
            <div className="chat-app-header-actions">
              <motion.button 
                className="chat-app-theme-toggle"
                onClick={toggleTheme}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </motion.button>
              {active && (
                <>
                  <motion.button 
                    className="chat-app-icon-button"
                    onClick={() => createMeeting(false)}
                    disabled={isInCall}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Phone size={18} />
                  </motion.button>

                  <motion.button 
                    className="chat-app-icon-button"
                    onClick={() => createMeeting(true)}
                    disabled={isInCall}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Video size={18} />
                  </motion.button>
                </>
              )}
              <motion.span 
                className={`chat-app-status ${isConnected ? "chat-app-on" : "chat-app-off"}`}
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1.5,
                  ease: "easeInOut"
                }}
              ></motion.span>
            </div>
          </header>
        )}
        
        {/* Message list */}
        <section className="chat-app-messages">
          <AnimatePresence initial={false}>
            {msgs.map((m, i) => (
              <motion.div 
                key={i} 
                className={`chat-app-bubble ${m.self ? "chat-app-sent" : "chat-app-recv"}`}
                variants={bubbleVariants}
                initial="sent"
                animate="animate"
                exit={{ opacity: 0, x: m.self ? 100 : -100 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                {m.type === 'file' ? (
                  renderFileMessage(m)
                ) : (
                  <>
                    <span className="chat-app-text">{m.translated || m.text}</span>
                    {m.translated && <div className="chat-app-original">(Original: {m.text})</div>}
                  </>
                )}
                <span className="chat-app-time">
                  {new Date(m.time).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </motion.div>
            ))}
            {typing[active] && (
              <motion.div 
                className="chat-app-typing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="chat-app-typing-dots">
                  <motion.span 
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                  />
                  <motion.span 
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                  />
                  <motion.span 
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Input with Voice Button */}
        <motion.form 
          className="chat-app-input" 
          onSubmit={sendMessage}
          whileHover={{ boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}
        >
          <motion.button 
            type="button" 
            className="chat-app-attach-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={!active || isUploadingFile}
            title="Attach file"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Paperclip size={20} />
          </motion.button>
          
          {/* Voice Input Button */}
          {speechSupported && (
            <motion.button 
              type="button" 
              className={`chat-app-voice-btn ${isListening ? 'listening' : ''}`}
              onClick={toggleVoiceInput}
              disabled={!active}
              title={isListening ? 'Stop voice input' : 'Start voice input'}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Mic size={20} />
              {isListening && (
                <motion.div 
                  className="chat-app-pulse-ring"
                  animate={pulseRing}
                />
              )}
            </motion.button>
          )}
          
          <motion.input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleTyping}
            placeholder={active ? (isListening ? "Listening..." : "Type a message or use voice…") : "Choose someone first"}
            disabled={!active}
            whileFocus={{ boxShadow: "0 0 0 2px rgba(100, 108, 255, 0.3)" }}
          />
          <motion.button 
            disabled={!active || (!message.trim())}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Send
          </motion.button>
          {isSent && (
            <motion.span 
              className="chat-app-sent-indicator"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              ✓
            </motion.span>
          )}
        </motion.form> 
      </motion.main>
    </motion.div>
  );
}