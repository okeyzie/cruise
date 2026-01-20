const userModel = require("../models/user");
const bcrypt = require("bcrypt");
const e = require("cors");
const html = require('../middleware/signUp');
const { forgethtml } = require('../middleware/forgetPassword');
const jwt = require("jsonwebtoken");
const { sendMail } = require('../middleware/email');
const axios = require('axios');
const cloudinary = require('../config/cloudinary');
const nodemailer = require("nodemailer");
const {registerOTP} = require("../middleware/otpmail");
const fs = require('fs');
const { profile } = require("console");
const { object } = require("joi");


exports.register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      number,
      password,
      confirmPassword,
      rememberMe,
    } = req.body;

    const file = req.file;

    // Validate passwords
    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({
      $or: [{ email: email.toLowerCase() }, { number }],
    });

    if (existingUser) {
      if (file?.path) fs.unlinkSync(file.path);
      return res.status(400).json({
        message: "User with that email or phone number already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    let profilePicture = {
      public_id: null,
      url: null,
    };

    // Upload profile picture if provided
    if (file && file.path) {
      const uploadResponse = await cloudinary.uploader.upload(file.path, {
        folder: "CruiseApp/users",
      });

      profilePicture = {
        public_id: uploadResponse.public_id,
        url: uploadResponse.secure_url,
      };

      fs.unlinkSync(file.path);
    }

    // Create user
    const newUser = new userModel({
      firstName,
      lastName,
      email: email.toLowerCase(),
      number,
      password: hashedPassword,
      rememberMe: rememberMe ?? false,
      otp,
      otpExpiredAt: Date.now() + 1000 * 120, // 2 minutes
      profilePicture,
    });

    await newUser.save();

    // Send verification email
    await sendMail({
      email: newUser.email,
      subject: "Email Verification",
      html: registerOTP(newUser.otp, newUser.firstName.split(" ")[0]),
    });

    return res.status(201).json({
      message: "Registration successful",
      data: {
        firstName: newUser.firstName,
        email: newUser.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error creating user",
      error: error.message,
    });
  }
};


exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await userModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({ message: "Account already verified" });
    }

    // Check OTP
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check OTP expiration
    if (Date.now() > user.otpExpiredAt) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    //  VERIFY USER
    user.isVerified = true;
    user.otp = null;
    user.otpExpiredAt = null;

    await user.save();

    return res.status(200).json({
      message: "Account verified successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "OTP verification failed",
      error: error.message,
    });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await userModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Already verified
    if (user.isVerified) {
      return res.status(400).json({
        message: "Account already verified",
      });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpiredAt = Date.now() + 1000 * 120; // 2 minutes

      const detail = {
      email: user.email,
      subject: "Resend: Email Verification",
      html: registerOTP(user.otp, `${user.firstName.split(" ")[0]}`),
    };    
    
    await sendMail(detail);
    await user.save();

    return res.status(200).json({
      message: "OTP resent, kindly check your email",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to resend OTP",
      error: error.message,
    });
  }
};

// get user by id
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } 
};

// delete user by id
exports.deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//update user
exports.updateUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, number } = req.body;
    const file = req.file;

    // Find existing user
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let profilePicture = user.profilePicture;

    // If a new file is uploaded
    if (file && file.path) {
      // Delete old image from Cloudinary (if exists)
      if (user.profilePicture?.public_id) {
        await cloudinary.uploader.destroy(user.profilePicture.public_id);
      }

      // Upload new image
      const uploadResponse = await cloudinary.uploader.upload(file.path, {
        folder: "CruiseApp/users",
      });

      // Remove file from local storage
      fs.unlinkSync(file.path);

      profilePicture = {
        public_id: uploadResponse.public_id,
        url: uploadResponse.secure_url,
      };
    }

    // Update user
    const updatedUser = await userModel
      .findByIdAndUpdate(
        id,
        {
          firstName: firstName ?? user.firstName,
          lastName: lastName ?? user.lastName,
          email: email ? email.toLowerCase() : user.email,
          number: number ?? user.number,
          profilePicture,
        },
        { new: true }
      )
      .select("-password");

    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Login with Email & Password
exports.loginWithEmail = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    const user = await userModel.findOne({ email : email.toLowerCase().trim()});
    if (!user)
      return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    // if (!user.isVerified) {
    //   return res.status(403).json({ message: "Please verify your email to login" });
    // }

    const payload = {
      id: user._id,
      email: user.email,
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
    user.token = token;
    await user.save();

    res.status(200).json({
      message: "Login successful",
      data :{
        user: user.firstName,
        email: user.email,
        rememberMe: user.rememberMe
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loginWithMobile = async (req, res) => {
  try {
    const { number, password, rememberMe } = req.body;

    const user = await userModel.findOne({ number });
    if (!user)
      return res.status(401).json({ message: "Invalid credentials" });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    // if (!user.isVerified){
    //   return res.status(403).json({ message: "Please verify your mobile number to login" });
    // }
    const payload = {
      id: user._id,
      number: user.number,

    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" }); 
    user.token = token;
    await user.save();


    res.status(200).json({
      message: "Login successful",
      data :{
        user: user.firstName,
        number: user.number,
        rememberMe: user.rememberMe
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;  
    const checkEmail = await userModel.findOne({ email: email.toLowerCase() }); 

    if ( !checkEmail) { 
      return res.status(404).json({
        message: 'Invalid email address'
      });
    }
    const token = jwt.sign({ id: checkEmail._id }, process.env.JWT_SECRET, { expiresIn: "2m" }); 

    await userModel.findByIdAndUpdate(checkEmail._id, { token }); 

    const subject = "Password Reset Request"; 

    const link = `${req.protocol}://${req.get("host")}/api/v1/reset/${checkEmail._id}`; 
    
    const message = `Dear ${checkEmail.fullName}, please click the following link to reset your password: ${link}. This link will expire in 1 hour. If you did not request a password reset, please ignore this email.`;
    await sendMail({ 
      to: email,
      subject,
      text: message,
      html: forgethtml(link, checkEmail.email) 
    });
    res.status(200).json({ 
      message: 'Password reset email sent'
    });
  }
    catch (error) {
      res.status(500).json({
        message: 'internal server error' + error.message,
        error: error.message
      });
    }
};
