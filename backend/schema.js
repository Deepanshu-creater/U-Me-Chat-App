let mongoose = require("mongoose");

let userdata = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    match: /^(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).+$/, // at least one number & special char
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  resetToken: { 
    type: String,
    select: false  
  },
  resetTokenExpiry: { 
    type: Date,
    select: false
  },
  profileImage: {
    type: String,
    required: false
  },
  profileImagePublicId: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  translationCount: {
    type: Number,
    default: 0
  },
  paid: {
    type: Boolean,
    default: false
  },
  
  fcmTokens: [{
    token: {
      type: String,
      required: true
    },
    deviceId: {
      type: String,
      required: false // Optional: to identify different devices
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    active: {
      type: Boolean,
      default: true
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  translationCount: {
    type: Number,
    default: 0
  },
  paid: {
    type: Boolean,
    default: false
  },
}, { timestamps: true });  // Added timestamps for better tracking

let Appmodel = mongoose.model("userinformation", userdata);
module.exports = Appmodel;