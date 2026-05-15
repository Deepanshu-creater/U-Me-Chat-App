const mongoose = require("mongoose");
<<<<<<< HEAD
const messageSchema = new mongoose.Schema({
  from:       { type: String, required: true },
  to:         { type: String, required: true },
  text:       { type: String, required: true },
  time:       { type: String, required: true },
  delivered:  { type: Boolean, default: false }
});

const MessageModel = mongoose.model("Message", messageSchema);
=======

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
>>>>>>> f71df190e18281f2f16661fb65e5d89f76e6c66b
module.exports = MessageModel;