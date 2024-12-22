const express = require("express");
const AuthController = require("../controllers/auth.controller");

const router = express.Router();

router.post("/signup", AuthController.register);
router.post("/login", AuthController.login);

// router.get("/google/callback", GoogleAuthController.callback);
// router.get("/google", GoogleAuthController.redirect);

router.post("/verify-email", AuthController.verifyOTP);
router.post("/send", AuthController.sendVerificationEmail);
router.post("/resend-otp", AuthController.resendOTP);

module.exports = router;
