const express = require("express");
const AuthController = require("../controllers/auth.controller");
const { isAuthenticated } = require("../middleware/authMiddleware"); 

const router = express.Router();


router.post("/signup", AuthController.register);
router.post("/login", AuthController.login);
router.post("/google", AuthController.googleLogin);
router.post("/verify-email", AuthController.verifyOTP)
router.post("/send", AuthController.sendVerificationEmail);
router.post("/resend-otp", AuthController.resendOTP);


module.exports = router;
