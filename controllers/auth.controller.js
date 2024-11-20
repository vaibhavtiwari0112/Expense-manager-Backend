const AuthService = require("../services/auth.service");
const GoogleAuthService = require("../services/googleAuth.service");
const verifyEmailService = require("../services/verifyEmail.service");

const AuthController = {
  async register(req, res) {
    try {
      const user = await AuthService.register(req.body);
      res.status(201).json({
        message: "User registered successfully",
        data: user,
      });
    } catch (error) {
      console.log("register error:", error);
      res.status(400).json({
        message: error.message,
      });
    }
  },

  async login(req, res) {
    try {
      const { user, token } = await AuthService.login(req.body);
      res.status(200).json({
        message: "Login successful",
        data: { user, token },
      });
    } catch (error) {
      console.log("login error:", error);
      res.status(401).json({
        message: error.message,
      });
    }
  },
  async googleLogin(req, res) {
    try {
      const { user, token } = await GoogleAuthService(req , res);
      res.status(200).json({
        message: "Login successful",
        data: { user, token },
      });
    } catch (error) {
      console.log("login error:", error);
      res.status(401).json({
        message: error.message,
      });
    }
  },

   async sendVerificationEmail(req, res) {
    const { email = 'vaibhav45tiwari@gmail.com'} = req.body;
  console.log(req.body);
    try {
      const result = await verifyEmailService.sendVerificationEmail(email);
      res.status(200).json({ success: true, message: "Verification email sent", result });
    } catch (error) {
      console.error("Error sending verification email:", error);
      res.status(500).json({ success: false, message: "Failed to send verification email" });
    }
  },

  async resendOTP(req, res) {
    const { email = 'vaibhav45tiwari@gmail.com'} = req.body;
    try {
      const result = await verifyEmailService.resendOTP(email);
      res.status(200).json({ success: true, message: "Verification email sent", result });
    } catch (error) {
      console.error("Error sending verification email:", error);
      res.status(500).json({ success: false, message: "Failed to send verification email" });
    }
  },

   async verifyOTP(req, res) {
    const { email, otp } = req.body;
  
    try {
      const isVerified = await verifyEmailService.verifyOTP(email, otp);
      if (isVerified) {
        res.status(200).json({ success: true, message: "Email verified successfully" });
      } else {
        res.status(400).json({ success: false, message: "Invalid OTP" });
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      res.status(500).json({ success: false, message: "Verification failed" });
    }
  },
};

module.exports = AuthController;
