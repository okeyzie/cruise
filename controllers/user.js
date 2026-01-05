const userModel = require("../models/user");
const bcrypt = require("bcrypt");
const e = require("cors");
const html = require('../middleware/signUp');
const { forgethtml } = require('../middleware/forgetPassword');
const jwt = require("jsonwebtoken");
const { sendMail } = require('../middleware/email');
const axios = require('axios');

const nodemailer = require("nodemailer");
const {registerOTP} = require("../middleware/otpmail");



exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, number, password, confirmPassword } = req.body;

    // let response;

    // Check if user exists
    const existingEmail = await userModel.findOne({ email: email.toLowerCase() });
    const existingNumber = await userModel.findOne({ number });

    if (existingEmail || existingNumber) {
        return res.status(400).json({
            message: "User with that email or phone number already exists",
        })
    }

    // Hash password
    const saltRounds = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, saltRounds);
    // const otp = Math.round(Math.random() * 10000).toString().padStart(6, "0");
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    
    const newUser = await userModel({
      firstName, 
      lastName,
      email: email.toLowerCase(),
      number,
      password: hashPassword,
      confirmPassword,
      otp: otp,
      otpExpiredAt: Date.now() + 1000 *120,

    });

      const detail = {
      email: newUser.email,
      subject: 'Email Verification',
      html: registerOTP(newUser.otp, `${newUser.firstName.split(' ')[0]}`)
    };
    

    await sendMail(detail)
    await newUser.save();

    let info= {
        firstName: newUser.firstName,
        email: newUser.email
    }

    res.status(201).json({
      message: `Registration successful ${email}`,
      data: info
    });

  } catch (error) {
    res.status(500).json({ 
        message: "Error creating user",
        error: error.message });
  }
};


exports.verifyOtp = async (req, res) => {
  try {
    const { otp, email } = req.body;
    const user = await userModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (Date.now() > user.otpExpiredAt) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    if (otp !== user.otp) {
      return res.status(400).json({
        message: "Invalid otp",
      });
    }

    Object.assign(user, { isVerified: true, otp: null, otpExpiredAt: null });
    await user.save();
    res.status(200).json({
      message: "User verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error verifying user: ",
      error: error.message,
    });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const otp = Math.round(Math.random() * 1e6)
      .toString()
      .padStart(6, "0");
    Object.assign(user, { otp: otp, otpExpiredAt: Date.now() + 1000 * 540 });

      const detail = {
      email: user.email,
      subject: "Resend: Email Verification",
      html: registerOTP(user.otp, `${user.firstName.split(" ")[0]}`),
    };    await sendMail(detail);
    await user.save();
    res.status(200).json({
      message: "Otp sent, kindly check your email",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error resending otp",
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
    const updates = req.body;
    const user = await userModel
      .findByIdAndUpdate(id, updates, { new: true })
      .select("-password"); 
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User updated successfully", user });
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  } 
};

// Login with Email & Password
exports.loginWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body;

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
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loginWithMobile = async (req, res) => {
  try {
    const { number, password } = req.body;

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
        number: user.number
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
