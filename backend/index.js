/* ======================== *
 *     IMPORT MODULES      *
 * ======================== */
const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

/* ======================== *
 *      CONTROLLERS        *
 * ======================== */
const registerUser = require("./controller");
const loginUser = require("./controller");

/* ======================== *
 *         MODELS          *
 * ======================== */
const Appmodel = require("./schema");         // User model
const MessageModel = require("./msgschema");  // Message model

/* ======================== *
 *       APP SETUP         *
 * ======================== */
const app = express();
const server = http.createServer(app);
app.use(cors());
app.use(express.json());

/* ======================== *
 *      AUTH ROUTES        *
 * ======================== */
app.post("/register", registerUser.registerUser);
app.post("/login", loginUser.loginUser);


/* ============================ *
 *      USER SEARCH ROUTE      *
 * ============================ */
app.get("/users", async (req, res) => {
  try {
    const searchTerm = req.query.search || "";
    if (!searchTerm.trim()) return res.json([]);

    const regex = new RegExp(searchTerm.trim(), "i");
    const list = await Appmodel
      .find({ username: regex })
      .select("username -_id")
      .limit(20);

    console.log(`Search for "${searchTerm}" returned:`, list);
    res.json(list);
  } catch (e) {
    console.error("User search error:", e);
    res.status(500).json({ error: "Server error" });
  }
});


/* ============================ *
 *         SOCKET.IO           *
 * ============================ */
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

const users = {}; // { username: socket.id }

io.on("connection", async (socket) => {
  const username = socket.handshake.query.username;
  if (!username) {
    console.log("No username provided, disconnecting");
    return socket.disconnect();
  }

  users[username] = socket.id;
  console.log(`${username} connected (${socket.id})`);

  /* ---- 1. Deliver undelivered messages ---- */
  try {
    const undelivered = await MessageModel.find({ to: username, delivered: false });
    console.log(`Found ${undelivered.length} undelivered messages for ${username}`);

    for (const msg of undelivered) {
      socket.emit("private_message", {
        from: msg.from,
        to: msg.to,
        text: msg.text,
        time: msg.time,
        self: false
      });

      await MessageModel.findByIdAndUpdate(msg._id, { delivered: true });
    }
  } catch (e) {
    console.error("Error delivering offline messages:", e);
  }

  /* ---- 2. Private message handler ---- */
  socket.on("private_message", async ({ to, text,lang }) => {
    if (!text?.trim()) return;

    const currentTime = new Date().toISOString();
    const payload = {
      from: username,
      to,
      text: text.trim(),
      time: currentTime,
      lang : lang || "en",
      delivered: false,
      createdAt: new Date()
    };

    try {
      const saved = await MessageModel.create(payload);
      console.log("Message saved:", saved);

      const targetId = users[to];

      if (targetId) {
        io.to(targetId).emit("private_message", {
          from: username,
          to,
          text: text.trim(),
          time: currentTime,
          lang: lang || "en",
          self: false
        });

        await MessageModel.findByIdAndUpdate(saved._id, { delivered: true });
        console.log(`Message delivered to online user ${to}`);
      } else {
        console.log(`User ${to} is offline, message saved for later delivery`);
      }

      socket.emit("private_message", {
        from: username,
        to,
        text: text.trim(),
        time: currentTime,
        lang: lang || "en",
        self: true
      });

    } catch (error) {
      console.error("Error handling private message:", error);
      socket.emit("message_error", { error: "Failed to send message" });
    }
  });

  /* ---- 3. Typing indicators ---- */
  socket.on("typing", ({ to }) => {
    const targetId = users[to];
    if (targetId) {
      io.to(targetId).emit("typing", { from: username });
    }
  });

  socket.on("stopTyping", ({ to }) => {
    const targetId = users[to];
    if (targetId) {
      io.to(targetId).emit("stopTyping", { from: username });
    }
  });

  /* ---- 4. Get chat history ---- */
  socket.on("get_chat_history", async ({ with: otherUser }) => {
    try {
      const messages = await MessageModel
        .find({
          $or: [
            { from: username, to: otherUser },
            { from: otherUser, to: username }
          ]
        })
        .sort({ createdAt: 1 })
        .limit(50);

      const formattedMessages = messages.map(msg => ({
        from: msg.from,
        to: msg.to,
        text: msg.text,
        time: msg.time,
        self: msg.from === username
      }));

      socket.emit("chat_history", { with: otherUser, messages: formattedMessages });
    } catch (error) {
      console.error("Error fetching chat history:", error);
      socket.emit("chat_history_error", { error: "Failed to fetch chat history" });
    }
  });
  /* ---- 5. Language update ---- */
    socket.on('language_update', ({ username: updatedUsername, language }) => {
    console.log(`User ${updatedUsername} updated language to ${language}`);
    
    // Broadcast to all connected users (including the sender)
    io.emit('language_update', { 
      username: updatedUsername, 
      language: language 
    });
  });
  /* ---- 6. Disconnect cleanup ---- */
  socket.on("disconnect", () => {
    console.log(`${username} disconnected`);
    delete users[username];
  });
});

 /* -----7. Translation feature--------- */
 // Backend route for MyMemory API translation
app.post("/translate", async (req, res) => {
  const { text, sourceLang, targetLang } = req.body;

  if (!text || !sourceLang || !targetLang) {
    return res.status(400).json({ error: "Missing required fields: text, sourceLang, targetLang" });
  }

  // Skip translation if source and target are the same
  if (sourceLang === targetLang) {
    return res.json({ translated: text });
  }

  try {
    const langPair = `${sourceLang}|${targetLang}`;
    const encodedText = encodeURIComponent(text);
    const apiUrl = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${langPair}`;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "User-Agent": "U&Me/1.0"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // MyMemory API returns translation in responseData.translatedText
    if (data.responseData && data.responseData.translatedText) {
      return res.json({ 
        translated: data.responseData.translatedText,
        confidence: data.responseData.match || 0
      });
    } else {
      // Fallback to original text if translation fails
      return res.json({ translated: text });
    }
  } catch (error) {
    console.error("Translation error:", error);
    // Return original text on error instead of failing
    return res.json({ translated: text });
  }
});
 

/* ============================ *
 *   CONNECT TO MONGODB & RUN  *
 * ============================ */
mongoose.connect(process.env.DBURL)
  .then(() => {
    console.log("Connected to MongoDB");
    server.listen(3001, () => console.log("Server running on port 3001"));
  })
  .catch(err => console.error("MongoDB connection error:", err));
