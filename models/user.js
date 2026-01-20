const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { 
        type: String, 
        required: true ,
        trim: true
    },
    lastName: { 
        type: String, 
        required: true,
        trim: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      required: true
      
    },
    number: {
      type: String,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    confirmPassword: {
      type: String,
      required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    token: {
        type: String,
        default: null
    },
    otp: {
    type: String,
    default: null
    },
    otpExpiredAt: {
    type: Number,
    default: null
    },
    rememberMe: {
        type: Boolean,
        default: false
    },
    profilePicture: {
      public_id: { type: String, default: null },
      url: { type: String, default: null }
    }
    
  },
  { timestamps: true }
);

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;