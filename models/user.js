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
      trim: true
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
        isVerifed: {
        type: Boolean,
        default: false
    },
    token: {
        type: String,
        default: null
    },
    otp: {
    type: String
     },
    otpExpiredAt: {
    type: Number
    },
    rememberMe: {
        type: Boolean,
        default: false
    },
  },
  { timestamps: true }
);

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;