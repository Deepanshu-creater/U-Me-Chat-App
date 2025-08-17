import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { User, Phone, Video, Upload, Trash2, Paperclip, PhoneOff, VideoOff, Mic, MicOff, FileText, X,Image as ImageIcon, File } from "lucide-react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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

// Add this useEffect for mobile detection
useEffect(() => {
  const checkMobile = () => {
    setIsMobile(window.innerWidth <= 768);
  };
  
  checkMobile();
  window.addEventListener('resize', checkMobile);
  return () => window.removeEventListener('resize', checkMobile);
}, []);
  
  // Upload states
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Voice Input States
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);

  // WebRTC States
  const [isInCall, setIsInCall] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callStatus, setCallStatus] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  
  // WebRTC Refs
  const peerConnection = useRef(null);
  const localStream = useRef(null);
  const remoteStream = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

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

const toggleMobileSidebar = () => {
  setIsMobileSidebarOpen(!isMobileSidebarOpen);
};

// Close mobile sidebar
const closeMobileSidebar = () => {
  setIsMobileSidebarOpen(false);
};

  /* ====================== Theme toggling ====================== */
  const toggleTheme = () => {
  const newTheme = theme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
  localStorage.setItem('chatTheme', newTheme);
};
  /* ====================== Cloudinary Upload Functions ====================== */
  
  // Upload file to Cloudinary
  // Replace the entire uploadToCloudinary function with:
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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');

      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setIsUploadingProfile(true);
    setUploadProgress(0);

    try {
      const result = await uploadFileToBackend(file, true);
      
      // Update profile image in state
      setProfileImages(prev => ({
        ...prev,
        [currentUser]: result.url
      }));

      // Save to backend
      await axios.post(`${SOCKET_URL}/upload-profile`, {
        username: currentUser,
        imageUrl: result.url,
        publicId: result.publicId
      });

      // Notify other users about profile update
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
  // Handle file attachment upload
const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file || !active) return;

  // Validate file size (10MB limit for general files)
  if (file.size > 10 * 1024 * 1024) {
     toast.error('File size should be less than 10MB');
    return;
  }

  setIsUploadingFile(true);
  setUploadProgress(0);

  try {
    const result = await uploadFileToBackend(file, false);
    
    // Create file message - make sure all fields are properly set
    const fileMessage = {
      to: active,
      fileUrl: result.url,
      fileName: result.originalFilename || file.name,
      fileSize: result.bytes,
      fileType: result.resourceType,
      format: result.format,
      time: new Date().toISOString(),
      lang: language,
      text: "" // Add empty text field to satisfy schema
    };

    console.log("Sending file message:", fileMessage); // Debug log

    // Send file message through socket
    socket.current.emit("file_message", fileMessage);
    
    toast.success('File uploaded and sent successfully!');
  } catch (error) {
    console.error('File upload error:', error);
    toast.error('Failed to upload file');
  } finally {
    setIsUploadingFile(false);
    setUploadProgress(0);
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }
};

  // Remove profile image
  const handleRemoveProfileImage = async () => {
    try {
      // Remove from backend
      await axios.delete(`${SOCKET_URL}/remove-profile/${currentUser}`);
      
      // Update state
      setProfileImages(prev => ({
        ...prev,
        [currentUser]: null
      }));

      // Notify other users
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

  /* ====================== Voice Input Setup ====================== */
  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setSpeechSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      // Configure speech recognition
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.maxAlternatives = 1;
      
      // Set language based on user's selected language
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
        
        // Update message with the transcript
        setMessage(transcript);
        
        // Trigger typing indicator
        if (active && transcript.trim()) {
          handleTyping();
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        // Show user-friendly error messages
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

  // Function to map app language codes to speech recognition language codes
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

  // Toggle voice input
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
      // Update language before starting
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

  /* ====================== WebRTC Configuration ====================== */
  const pcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' }
    ]
  };

  /* ====================== WebRTC Functions ====================== */
  const createPeerConnection = () => {
    peerConnection.current = new RTCPeerConnection(pcConfig);
    
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate && active) {
        socket.current.emit('webrtc_ice_candidate', {
          to: active,
          candidate: event.candidate
        });
      }
    };

    peerConnection.current.ontrack = (event) => {
      remoteStream.current = event.streams[0];
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    peerConnection.current.onconnectionstatechange = () => {
      const state = peerConnection.current.connectionState;
      console.log('Peer connection state:', state);
      switch (state) {
        case 'connected':
          setCallStatus('Connected');
          break;
        case 'disconnected':
        case 'failed':
          setCallStatus(state === 'failed' ? 'Call failed' : 'Call disconnected');
          setTimeout(cleanupCall, 2000);
          break;
        case 'closed':
          cleanupCall();
          break;
        default:
          // 'connecting' or 'new' can be handled if needed
          break;
      }
    };

    peerConnection.current.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', peerConnection.current.iceConnectionState);
    };

    // Add local stream tracks to peer connection
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => {
        peerConnection.current.addTrack(track, localStream.current);
      });
    }
  };

  const startCall = async (isVideo = false) => {
    try {
      setCallStatus('Connecting...');
      setIsVideoCall(isVideo);
      
      const constraints = {
        audio: true,
        video: isVideo
      };

      localStream.current = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream.current;
      }

      createPeerConnection();

      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);

      socket.current.emit('webrtc_offer', {
        to: active,
        offer: offer,
        type: isVideo ? 'video' : 'audio'
      });

      setIsInCall(true);
      setCallStatus('Calling...');
    } catch (error) {
      console.error('Error starting call:', error);
      setCallStatus('Failed to start call');
      toast.error('Failed to start call');
      setTimeout(() => setCallStatus(''), 3000);
    }
  };

const answerCall = async () => {
  try {
    setCallStatus('Connecting...');
    
    const constraints = {
      audio: true,
      video: incomingCall.type === 'video'
    };

    localStream.current = await navigator.mediaDevices.getUserMedia(constraints);
    
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream.current;
    }

    createPeerConnection();

    await peerConnection.current.setRemoteDescription(incomingCall.offer);
    
    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);

    socket.current.emit('webrtc_answer', {
      to: incomingCall.from,
      answer: answer
    });

    setIsInCall(true);
    setIsVideoCall(incomingCall.type === 'video');
    setIncomingCall(null);
  } catch (error) {
    console.error('Error answering call:', error);
    let msg = `Error answering call: ${error.message}`;
    if (error.name === 'NotReadableError') {
      msg = 'Camera or microphone is in use by another application. Please close it and retry.';
    }
    toast.error(msg);
    setCallStatus(''); // Explicitly clear status on failure
    rejectCall();
  }
};
  const rejectCall = () => {
    if (incomingCall) {
      socket.current.emit('webrtc_reject_call', {
        to: incomingCall.from
      });
    }
    setIncomingCall(null);
    setCallStatus('');
  };

  const endCall = () => {
    if (active) {
      socket.current.emit('webrtc_end_call', {
        to: active
      });
    }
    
    cleanupCall();
  };

  const cleanupCall = () => {
    // Stop all tracks
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
      localStream.current = null;
    }
    
    if (remoteStream.current) {
      remoteStream.current.getTracks().forEach(track => track.stop());
      remoteStream.current = null;
    }

    // Close peer connection
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    // Reset video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    // Reset states
    setIsInCall(false);
    setIsVideoCall(false);
    setIncomingCall(null);
    setCallStatus('');
    setIsMuted(false);
    setIsVideoEnabled(true);
  };

  const toggleMute = () => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream.current) {
      const videoTrack = localStream.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  /* ====================== Socket Setup ====================== */
  useEffect(() => {
    
    if (!socket.current) {
      socket.current = io(SOCKET_URL, {
        query: { username: currentUser },
        transports: ["websocket"],
      });

      socket.current.on("chat_history", ({ with: user, messages }) => {
        setChats((prev) => ({
          ...prev,
          [user]: messages
        }));
      });

      socket.current.on("disconnect", () => setIsConnected(false));

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
            if (error.response?.data?.limitReached) { // Check response.data directly
    toast.error(`${error.response.data.error}\n${error.response.data.upgradeMessage}`);
  }else {
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

      // WebRTC Socket Events
      socket.current.on('webrtc_offer', ({ from, offer, type }) => {
        setIncomingCall({
          from,
          offer,
          type
        });
      });

      socket.current.on('webrtc_answer', async ({ from, answer }) => {
        if (peerConnection.current) {
          await peerConnection.current.setRemoteDescription(answer);
        }
      });

      socket.current.on('webrtc_ice_candidate', ({ from, candidate }) => {
        if (peerConnection.current) {
          peerConnection.current.addIceCandidate(candidate);
        }
      });

      socket.current.on('webrtc_reject_call', () => {
        setCallStatus('Call rejected');
        setTimeout(() => {
          cleanupCall();
        }, 2000);
      });

      socket.current.on('webrtc_end_call', () => {
        cleanupCall();
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
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
    };
  }, [currentUser,language]);

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
  position="top-right"
  autoClose={5000}
  hideProgressBar={false}
  newestOnTop={false}
  closeOnClick
  rtl={false}
  pauseOnFocusLoss
  draggable
  pauseOnHover
  theme={theme === 'dark' ? 'dark' : 'light'}
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
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? "✕" : "☰"}
        </button>
        
        {/* Only show these controls when chat is active (not in sidebar) */}
        {!sidebarOpen && active && (
          <div className="chat-app-mobile-controls">
            <button onClick={toggleTheme}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button onClick={() => startCall(false)} disabled={isInCall}>
              <Phone size={18} />
            </button>
            <button onClick={() => startCall(true)} disabled={isInCall}>
              <Video size={18} />
            </button>
          </div>
        )}
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

      {/* WebRTC Call Overlay */}
      <AnimatePresence>
        {(isInCall || incomingCall) && (
          <motion.div 
            className="webrtc-call-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="webrtc-call-container"
              variants={callOverlayVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {/* Incoming Call */}
              {incomingCall && !isInCall && (
                <motion.div 
                  className="webrtc-incoming-call"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3>Incoming {incomingCall.type} call from {incomingCall.from}</h3>
                  <div className="webrtc-call-actions">
                    <motion.button 
                      className="webrtc-answer-btn"
                      onClick={answerCall}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Phone size={20} />
                      Answer
                    </motion.button>
                    <motion.button 
                      className="webrtc-reject-btn"
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
                  className="webrtc-active-call"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  <div className="webrtc-call-header">
                    <h3>{isVideoCall ? 'Video' : 'Audio'} call with {active}</h3>
                    <p className="webrtc-call-status">{callStatus}</p>
                  </div>

                  {isVideoCall && (
                    <div className="webrtc-video-container">
                      <motion.video 
                        ref={remoteVideoRef}
                        className="webrtc-remote-video"
                        autoPlay
                        playsInline
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      />
                      <motion.video 
                        ref={localVideoRef}
                        className="webrtc-local-video"
                        autoPlay
                        playsInline
                        muted
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                      />
                    </div>
                  )}

                  {!isVideoCall && (
                    <div className="webrtc-audio-call">
                      <motion.div 
                        className="webrtc-audio-avatar"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring" }}
                      >
                        {profileImages[active] ? (
                          <img src={profileImages[active]} alt={active} />
                        ) : (
                          <div className="webrtc-avatar-fallback">
                            {active?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </motion.div>
                      <audio ref={remoteVideoRef} autoPlay />
                      <audio ref={localVideoRef} autoPlay muted />
                    </div>
                  )}

                  <div className="webrtc-call-controls">
                    <motion.button 
                      className={`webrtc-control-btn ${isMuted ? 'muted' : ''}`}
                      onClick={toggleMute}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                    </motion.button>
                    
                    {isVideoCall && (
                      <motion.button 
                        className={`webrtc-control-btn ${!isVideoEnabled ? 'disabled' : ''}`}
                        onClick={toggleVideo}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                      </motion.button>
                    )}
                    
                    <motion.button 
                      className="webrtc-control-btn end-call"
                      onClick={endCall}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <PhoneOff size={20} />
                    </motion.button>
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
                              startCall(false);
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
                              startCall(true);
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
                              startCall(false);
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
                              startCall(true);
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
                  onClick={() => startCall(false)}
                  disabled={isInCall}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Phone size={18} />
                </motion.button>

                <motion.button 
                  className="chat-app-icon-button"
                  onClick={() => startCall(true)}
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
       <ToastContainer 
      position={isMobile ? "top-right" : "top-center"}
      className="chat-app-toast-container"
    />
    </motion.div>
  );
}