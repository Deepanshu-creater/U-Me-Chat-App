const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  from: { 
    type: String, 
    required: true 
  },
  to: { 
    type: String, 
    required: true 
  },
  text: { 
    type: String, 
    required: false // Not required for file messages
  },
  time: { 
    type: String, 
    required: true 
  },
  delivered: { 
    type: Boolean, 
    default: false 
  },
  lang: { 
    type: String, 
    default: "en" 
  },
  type: { 
    type: String, 
    enum: ["text", "file"], 
    default: "text" 
  },
  // File-specific fields
  fileUrl: { 
    type: String, 
    required: false 
  },
  fileName: { 
    type: String, 
    required: false 
  },
  fileSize: { 
    type: Number, 
    required: false 
  },
  fileType: { 
    type: String, 
    required: false 
  },
  format: { 
    type: String, 
    required: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const MessageModel = mongoose.model("Messagestore", messageSchema);
module.exports = MessageModel;