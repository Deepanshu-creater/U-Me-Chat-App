import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { User, Phone, Video, Upload, Trash2, Paperclip } from "lucide-react";
import axios from "axios";
import "./chat.css";

export default function ChatApp() {
  /* ====================== Setup & State ====================== */
  const SOCKET_URL = "http://localhost:3001";
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
  const [language, setLanguage] = useState(localStorage.getItem("language") || "en");

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
      const response = await axios.post("http://localhost:3001/translate", {
        text: msg.text,
        sourceLang: senderLang,
        targetLang: userLang
      });
      console.log("Translation result:", response.data);
      msg.translated = response.data.translated || msg.text;
    } catch (error) {
      console.error("Translation failed:", error);
      msg.translated = msg.text;
    }
  }

  setChats((prev) => ({
    ...prev,
    [other]: [...(prev[other] || []), msg]
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

      const storedActive = localStorage.getItem("activeUser");
      if (storedActive) {
        setActive(storedActive);
        socket.current.emit("get_chat_history", { with: storedActive });
      }
    }

    return () => {
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


  /* ========================= Render ========================= */
  const msgs = chats[active] || [];

  return (
    <div className="chat-app-layout">
      {/* ------------------------------ Sidebar ------------------------------ */}
      <aside className="chat-app-sidebar">
        {/* Profile Section - Top */}
        <div className="chat-app-profile-section">
          <div className="chat-app-profile-header">
            <div className="chat-app-profile-avatar-container">
              <div 
                className="chat-app-profile-avatar chat-app-clickable" 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
            
              <div className="chat-app-avatar-fallback">
               {currentUser?.charAt(0).toUpperCase()}
              </div>
                
              </div>
            </div>
            <h2 className="chat-app-username-large">{currentUser}</h2>
          </div>

          {showProfileMenu && (
            <div className="chat-app-profile-actions">
              <button className="chat-app-profile-action-btn" >
                <Upload size={16} /> Upload Photo
              </button>
              {profileImages[currentUser] && (
                <button className="chat-app-profile-action-btn chat-app-remove" >
                  <Trash2 size={16} /> Remove Photo
                </button>
              )}
            </div>
          )}
        </div>

        <div className="chat-app-sidebar-content">
          {/* Search bar */}
          <input
            className="chat-app-search"
            placeholder="Search user…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          
          <div className="chat-app-user-list">
            {/* Recent chats when search is empty */}
            {!search.trim() && !!Object.keys(chats).length && (
              <ul className="chat-app-people">
                {Object.keys(chats)
                  .filter((key) => Array.isArray(chats[key]) && chats[key].length > 0)
                  .sort((a, b) => {
                    const lastA = chats[a][chats[a].length - 1];
                    const lastB = chats[b][chats[b].length - 1];
                    return new Date(lastB.time) - new Date(lastA.time);
                  })
                  .map((username) => (
                    <li
                      key={username}
                      className={username === active ? "chat-app-active" : ""}
                      onClick={() => {
                        setActive(username);
                        socket.current.emit("get_chat_history", { with: username });
                        localStorage.setItem("activeUser", username);
                      }}
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
                          {chats[username][chats[username].length - 1]?.text.slice(0, 30)}
                        </div>
                      </div>
                      <div className="chat-app-action-buttons">
                        <button className="chat-app-icon-button">
                          <Phone size={18} />
                        </button>
                        <button className="chat-app-icon-button">
                          <Video size={18} />
                        </button>
                      </div>
                    </li>
                  ))}
              </ul>
            )}

            {/* Search results list */}
            <ul className="chat-app-people">
              {people.length ? (
                people.map((user) => {
                  const username = user.username;
                  const alreadyChatted = !!chats[username];

                  return (
                    <li
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
                        <button className="chat-app-icon-button">
                          <Phone size={18} />
                        </button>
                        <button className="chat-app-icon-button">
                          <Video size={18} />
                        </button>
                      </div>
                    </li>
                  );
                })
              ) : (
                search.trim() && (
                  <li className="chat-app-no-results">No users found</li>
                )
              )}
            </ul>
          </div>
        </div>
        
        <div className="chat-app-language-picker">
  <label htmlFor="language-select">🌐 Language:</label>
  <select
    id="language-select"
    value={language}
    onChange={handleLanguageChange}
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
  </select>
</div>
        
        <div className="chat-app-name-corner">U&Me</div>
        
        <input 
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
         
        />
      </aside>

      {/* ---------------------------- Chat section ---------------------------- */}
      <main className="chat-app-main">
        {/* Header */}
        <header className="chat-app-header">
          <div className="chat-app-header-user">
            {active && (
              <div className="chat-app-header-avatar">
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
              </div>
            )}
            <div className="chat-app-header-username">{active || "Select a user"}</div>
          </div>
          <div className="chat-app-header-actions">
            {active && (
              <>
                <button className="chat-app-header-call-btn">
                  <Phone size={18} />
                </button>
                <button className="chat-app-header-call-btn">
                  <Video size={18} />
                </button>
              </>
            )}
            <span className={`chat-app-status ${isConnected ? "chat-app-on" : "chat-app-off"}`}></span>
          </div>
        </header>

        {/* Message list */}
        <section className="chat-app-messages">
          {msgs.map((m, i) => (
            <div key={i} className={`chat-app-bubble ${m.self ? "chat-app-sent" : "chat-app-recv"}`}>
              <span className="chat-app-text">{m.translated || m.text}</span>
              {m.translated && <div className="chat-app-original">(Original: {m.text})</div>}
              <span className="chat-app-time">
                {new Date(m.time).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </span>
            </div>
          ))}
          {typing[active] && <div className="chat-app-typing">Typing…</div>}
        </section>

        {/* Input */}
        <form className="chat-app-input" onSubmit={sendMessage}>
          <button 
           type="button" 
           className="chat-app-attach-btn"
           onClick={() => fileInputRef.current?.click()}
           disabled={!active}
          >
          <Paperclip size={20} />
          </button>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleTyping}
            placeholder={active ? "Type a message…" : "Choose someone first"}
            disabled={!active}
          />
          <button disabled={!active}>Send</button>
          {isSent && <span className="chat-app-sent-indicator">✓</span>}
        </form>
      </main>
    </div>
  );
}