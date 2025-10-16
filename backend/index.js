const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const {sendNotification} = require("./firebaseAdmin");
const { v2: cloudinary } = require("cloudinary");
const axios = require("axios");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ======================== *
 *       APP SETUP         *
 * ======================== */
const app = express();
const server = http.createServer(app);
const corsOptions = {
  origin: 'https://u-me-chat-app.vercel.app', // No trailing slash here
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,  // If your frontend sends cookies or auth headers
};
app.use(cors(corsOptions));
app.use(express.json());

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
const Appmodel = require("./schema");       // User model
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

// Multer setup for file uploads (memory storage)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

//*Calling*//
// VideoSDK-specific token generator
async function generateVideoSDKToken(roomId, username) {
  if (!process.env.VIDEOSDK_SECRET) {
    throw new Error('VIDEOSDK_SECRET is not configured');
  }

  const payload = {
    apikey: process.env.VIDEOSDK_API_KEY,
    permissions: [
      `allow_join:${roomId}`,
      `allow_mod:${roomId}`
    ],
    version: 2,
    roles: ['ADMIN'],  // Or ['VIEWER'] for guests
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7)  // 7 days
  };

  const token = jwt.sign(payload, process.env.VIDEOSDK_SECRET, { 
    algorithm: 'HS256' 
  });

  console.log(`Generated VideoSDK token for room ${roomId} and user ${username}`);
  return token;
}

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
 *    VIDEO SDK ROUTES     *
 * ======================== */
app.post("/create-meeting", async (req, res) => {
  try {
    const { username, targetUser, isVideo = true } = req.body;

    if (!username || !targetUser) {
      return res.status(400).json({ error: "Username and target user are required" });
    }

    console.log('Creating VideoSDK room...');
console.log('API Key set?', !!process.env.VIDEOSDK_API_KEY ? 'Yes' : 'NO - CHECK ENV!');
console.log('Full headers:', {
  Authorization: `Bearer ${process.env.VIDEOSDK_API_KEY ? '[REDACTED]' : 'MISSING'}`,
  'Content-Type': 'application/json'
});
  // Generate JWT first (this is your VideoSDK authentication token)
const jwtToken = jwt.sign(
  {
    apikey: process.env.VIDEOSDK_API_KEY,
    permissions: ['allow_join', 'allow_mod'],
    version: 2,
  },
  process.env.VIDEOSDK_SECRET,
  { expiresIn: '2h' }
);

const videoSdkResponse = await axios.post(
  'https://api.videosdk.live/v2/rooms',
  {},
  {
    headers: {
      'Authorization': `Bearer ${jwtToken}`,
      'Content-Type': 'application/json'
    }
  }
);


    const roomData = videoSdkResponse.data;
    const roomId = roomData.roomId;

    // Generate token using the helper
    const token = await generateVideoSDKToken(roomId, username);

    // Construct meeting URL
    const meetingUrl = `https://app.videosdk.live/meeting/${roomId}?token=${token}&name=${encodeURIComponent(username)}`;

    res.json({
      meetingId: roomId,
      token: token,
      meetingUrl: meetingUrl,
      message: "Meeting created successfully"
    });

  } catch (error) {
    console.error("Error creating meeting:", error.response?.data || error.message || error);
    res.status(500).json({ error: "Failed to create meeting" });
  }
});
/* ======================== *
 *    CLOUDINARY ROUTES    *
 * ======================== */
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

//Notification-setup//
app.post("/save-token", async (req, res) => {
  try {
    const { token, username, deviceId } = req.body;
    
    if (!token || !username) {
      return res.status(400).send("Token and username are required");
    }

    // Find the user
    const user = await Appmodel.findOne({ username });
    
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Check if token already exists for this user
    const existingToken = user.fcmTokens.find(t => t.token === token);
    
    if (existingToken) {
      // Update existing token if needed
      existingToken.active = true;
      existingToken.createdAt = new Date();
      if (deviceId) existingToken.deviceId = deviceId;
    } else {
      // Add new token
      user.fcmTokens.push({
        token,
        deviceId: deviceId || 'unknown',
        active: true
      });
    }

    // Save the user document
    await user.save();

    res.status(200).json({
      message: "Token saved successfully",
      totalTokens: user.fcmTokens.length
    });
    
  } catch (error) {
    console.error("Error saving token:", error);
    res.status(500).send("Error saving token: " + error.message);
  }
});

// Send Notification (example API)
app.post("/send-notification", async (req, res) => {
  try {
    const { token, title, body } = req.body;
    await sendNotification(token, { title, body });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
   *        VIDEO SDK CALLING FEATURE          *
   * ========================================== */
  
  // Handle call invitation
  socket.on('videosdk_call_invite', ({ to, meetingId, meetingUrl, type }) => {
    console.log(`Call invite from ${username} to ${to} (type: ${type})`);
    
    const targetSocketId = users[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit('videosdk_call_invite', {
        from: username,
        meetingId,
        meetingUrl,
        type
      });
      console.log(`Call invite forwarded to ${to}`);
    } else {
      // Target user is offline
      socket.emit('call_error', { 
        error: 'User is offline',
        targetUser: to 
      });
      console.log(`Cannot forward call - ${to} is offline`);
    }
  });

  // Handle call rejection
  socket.on('videosdk_call_reject', ({ to, meetingId }) => {
    console.log(`Call rejected by ${username}, notifying ${to}`);
    
    const targetSocketId = users[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit('videosdk_call_reject', {
        from: username,
        meetingId
      });
    }
  });

  // Handle call end
  socket.on('videosdk_call_end', ({ to, meetingId }) => {
    console.log(`Call ended by ${username}, notifying ${to}`);
    
    const targetSocketId = users[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit('videosdk_call_end', {
        from: username,
        meetingId
      });
    }
  });

  // Handle call busy (when user is already in a call)
  socket.on('videosdk_call_busy', ({ to, meetingId }) => {
    console.log(`${username} is busy, notifying ${to}`);
    
    const targetSocketId = users[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit('videosdk_call_busy', {
        from: username,
        meetingId
      });
    }
  });

  /* ---- 7. Disconnect cleanup ---- */
  socket.on("disconnect", () => {
    console.log(`${username} disconnected`);
    delete users[username];
  });
});

/* ============================ *
 *   CONNECT TO MONGODB & RUN  *
 * ============================ */
const PORT = process.env.PORT || 3001;

mongoose.connect(process.env.DBURL)
  .then(() => {
    console.log("✅ Connected to MongoDB");

    server.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error(" MongoDB connection error:", err);
    process.exit(1); // Exit if DB connection fails
  });