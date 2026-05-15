const mongoose = require("mongoose");
const messageSchema = new mongoose.Schema({
  from:       { type: String, required: true },
  to:         { type: String, required: true },
  text:       { type: String, required: true },
  time:       { type: String, required: true },
  delivered:  { type: Boolean, default: false }
});

const MessageModel = mongoose.model("Message", messageSchema);
module.exports = MessageModel;