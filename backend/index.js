/* ======================== *
 *     IMPORT MODULES      *
 * ======================== */
const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
require("dotenv").config();


/* ======================== *
 *      CONTROLLERS        *
 * ======================== */
const registerUser = require("./controller");
const loginUser = require("./controller");
const forgotPassword = require("./controller");
const resetPassword = require("./controller");

/* ======================== *
 *         MODELS          *
 * ======================== */

const Appmodel = require("./schema");         // User model
const MessageModel = require("./msgschema");  // Message model
const translationLimitMiddleware = require("./translationmiddleware");
const authmiddleware = require('./authmiddleware');

/* ======================== *
 *    CLOUDINARY CONFIG    *
 * ======================== */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ======================== *
 *       APP SETUP         *
 * ======================== */
const app = express();
const server = http.createServer(app);
app.use(cors());
app.use(express.json());
// Multer setup for file uploads (memory storage)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

/* ======================== *
 *      AUTH ROUTES        *
 * ======================== */
app.post("/register", registerUser.registerUser);
app.post("/login", loginUser.loginUser);
app.post("/forgot-password", forgotPassword.forgotPassword);
app.post("/reset-password", resetPassword.resetPassword);

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
/* ======================== *
 *     TRANSLATION ROUTE   *
 * ======================== */
app.post("/translate", authmiddleware, translationLimitMiddleware , async (req, res) => {
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
      const username = req.user.username;
       await Appmodel.updateOne(
        { username: req.user.username },
        { $inc: { translationCount: 1 } }
      );
      return res.json({ 
        translated: data.responseData.translatedText,
        confidence: data.responseData.match || 0
      }
      );    
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

/* ======================== *
 *    CLOUDINARY ROUTES    *
 * ======================== */
// Add this with your other routes
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const isProfileImage = req.body.isProfileImage === 'true';
    const username = req.body.username;
    const targetUser = req.body.targetUser;

    // Convert buffer to base64 for Cloudinary
    const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // Upload to Cloudinary
    const uploadOptions = {
      folder: isProfileImage ? `profile_images/${username}` : `chat_files/${username}_${targetUser}`,
      resource_type: 'auto'
    };

    const result = await cloudinary.uploader.upload(fileStr, uploadOptions);

    // If profile image, update user record
    if (isProfileImage) {
      await Appmodel.findOneAndUpdate(
        { username },
        { 
          profileImage: result.secure_url,
          profileImagePublicId: result.public_id 
        }
      );

      // Broadcast profile update
      io.emit('profile_updated', {
        username: username,
        imageUrl: result.secure_url
      });
    }

    res.json({
      url: result.secure_url,
      public_id: result.public_id,
      resourceType: result.resource_type,
      format: result.format,
      bytes: result.bytes,
      originalFilename: result.original_filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});
// Upload profile image
// Modify /upload-profile to just handle metadata
app.post("/upload-profile", async (req, res) => {
  try {
    const { username, imageUrl } = req.body;
    
    await Appmodel.findOneAndUpdate(
      { username },
      { profileImage: imageUrl },
      { upsert: true }
    );

    io.emit('profile_updated', { username, imageUrl });
    res.json({ success: true });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Remove profile image
app.delete("/remove-profile/:username", async (req, res) => {
  try {
    const { username } = req.params;

    // Get user's current profile data
    const user = await Appmodel.findOne({ username });
    
    if (user && user.profileImagePublicId) {
      // Delete image from Cloudinary
      try {
        await cloudinary.uploader.destroy(user.profileImagePublicId);
      } catch (cloudinaryError) {
        console.error("Cloudinary deletion error:", cloudinaryError);
        // Continue even if Cloudinary deletion fails
      }
    }

    // Remove profile image from database
    await Appmodel.findOneAndUpdate(
      { username },
      { 
        $unset: { 
          profileImage: 1, 
          profileImagePublicId: 1 
        } 
      }
    );

    console.log(`Profile image removed for user: ${username}`);
    res.json({ success: true, message: "Profile image removed successfully" });
  } catch (error) {
    console.error("Remove profile error:", error);
    res.status(500).json({ error: "Failed to remove profile image" });
  }
});

// Get all profile images
app.get("/profile-images", async (req, res) => {
  try {
    const users = await Appmodel.find(
      { profileImage: { $exists: true, $ne: null } },
      { username: 1, profileImage: 1, _id: 0 }
    );

    const profileImages = {};
    users.forEach(user => {
      profileImages[user.username] = user.profileImage;
    });

    res.json(profileImages);
  } catch (error) {
    console.error("Get profile images error:", error);
    res.status(500).json({ error: "Failed to fetch profile images" });
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

  // Store username in socket object for easy access
  socket.username = username;
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
        type: msg.type,
        fileUrl: msg.fileUrl,
        fileName: msg.fileName,
        fileSize: msg.fileSize,
        fileType: msg.fileType,
        format: msg.format,
        self: false
      });

      await MessageModel.findByIdAndUpdate(msg._id, { delivered: true });
    }
  } catch (e) {
    console.error("Error delivering offline messages:", e);
  }

  /* ---- 2. Private message handler ---- */
  socket.on("private_message", async ({ to, text, lang }) => {
    if (!text?.trim()) return;

    const currentTime = new Date().toISOString();
    const payload = {
      from: username,
      to,
      text: text.trim(),
      time: currentTime,
      lang: lang || "en",
      type: "text",
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
          type: "text",
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
        type: "text",
        self: true
      });

    } catch (error) {
      console.error("Error handling private message:", error);
      socket.emit("message_error", { error: "Failed to send message" });
    }
  });

  /* ---- 2.1. File message handler ---- */

socket.on("file_message", async (fileData) => {
  const { to, fileUrl, fileName, fileSize, fileType, format, time, lang } = fileData;

  if (!fileUrl || !to) return;

  const payload = {
    from: username,
    to,
    text: "", // Add empty text field
    type: "file",
    fileUrl,
    fileName,
    fileSize,
    fileType,
    format,
    time,
    lang: lang || "en",
    delivered: false,
    createdAt: new Date()
  };

  try {
    const saved = await MessageModel.create(payload);
    console.log("File message saved:", saved);

    const targetId = users[to];

    if (targetId) {
      io.to(targetId).emit("file_message", {
        from: username,
        to,
        text: "",
        type: "file",
        fileUrl,
        fileName,
        fileSize,
        fileType,
        format,
        time,
        lang: lang || "en",
        self: false
      });

      await MessageModel.findByIdAndUpdate(saved._id, { delivered: true });
      console.log(`File message delivered to online user ${to}`);
    } else {
      console.log(`User ${to} is offline, file message saved for later delivery`);
    }

    socket.emit("file_message", {
      from: username,
      to,
      text: "",
      type: "file",
      fileUrl,
      fileName,
      fileSize,
      fileType,
      format,
      time,
      lang: lang || "en",
      self: true
    });

  } catch (error) {
    console.error("Error handling file message:", error);
    socket.emit("message_error", { error: "Failed to send file" });
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
        type: msg.type || "text",
        fileUrl: msg.fileUrl,
        fileName: msg.fileName,
        fileSize: msg.fileSize,
        fileType: msg.fileType,
        format: msg.format,
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

  /* ---- 6. Profile update broadcast ---- */
  socket.on('profile_updated', ({ username: updatedUsername, imageUrl }) => {
    console.log(`User ${updatedUsername} updated profile image`);
    
    // Broadcast to all connected users except sender
    socket.broadcast.emit('profile_updated', { 
      username: updatedUsername, 
      imageUrl: imageUrl 
    });
  });

  /* ========================================== *
   *        WEBRTC CALLING FEATURE             *
   * ========================================== */
  
  // Handle incoming call offer
  socket.on('webrtc_offer', ({ to, offer, type }) => {
    console.log(`Call offer from ${username} to ${to} (type: ${type})`);
    
    const targetSocketId = users[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit('webrtc_offer', {
        from: username,
        offer,
        type
      });
      console.log(`Call offer forwarded to ${to}`);
    } else {
      // Target user is offline
      socket.emit('call_error', { 
        error: 'User is offline',
        targetUser: to 
      });
      console.log(`Cannot forward call - ${to} is offline`);
    }
  });

  // Handle call answer
  socket.on('webrtc_answer', ({ to, answer }) => {
    console.log(`Call answer from ${username} to ${to}`);
    
    const targetSocketId = users[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit('webrtc_answer', {
        from: username,
        answer
      });
      console.log(`Call answer forwarded to ${to}`);
    }
  });

  // Handle ICE candidates
  socket.on('webrtc_ice_candidate', ({ to, candidate }) => {
    console.log(`ICE candidate from ${username} to ${to}`);
    
    const targetSocketId = users[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit('webrtc_ice_candidate', {
        from: username,
        candidate
      });
    }
  });

  // Handle call rejection
  socket.on('webrtc_reject_call', ({ to }) => {
    console.log(`Call rejected by ${username}, notifying ${to}`);
    
    const targetSocketId = users[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit('webrtc_reject_call', {
        from: username
      });
    }
  });

  // Handle call end
  socket.on('webrtc_end_call', ({ to }) => {
    console.log(`Call ended by ${username}, notifying ${to}`);
    
    const targetSocketId = users[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit('webrtc_end_call', {
        from: username
      });
    }
  });

  // Handle call busy (when user is already in a call)
  socket.on('webrtc_call_busy', ({ to }) => {
    console.log(`${username} is busy, notifying ${to}`);
    
    const targetSocketId = users[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit('webrtc_call_busy', {
        from: username
      });
    }
  });

  /* ---- 7. Disconnect cleanup ---- */
  socket.on("disconnect", () => {
    console.log(`${username} disconnected`);
    
    // Notify other users if this user was in a call
    Object.keys(users).forEach(otherUsername => {
      if (otherUsername !== username) {
        const otherSocketId = users[otherUsername];
        if (otherSocketId) {
          io.to(otherSocketId).emit('user_disconnected', {
            username: username
          });
        }
      }
    });
    
    delete users[username];
  });
});

/* ============================ *
 *   CONNECT TO MONGODB & RUN  *
 * ============================ */
mongoose.connect(process.env.DBURL).then(() => {
    console.log("Connected to MongoDB");
    server.listen(3001, () => console.log("Server running on port 3001"));
  })
  .catch(err => console.error("MongoDB connection error:", err));