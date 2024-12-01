const GoogleAuthService = require("../services/googleAuth.service");

const GoogleAuthController = {
  async redirect(req, res) {
    try {
      const redirectUrl = await GoogleAuthService.googleAuthRedirect();
      res.redirect(redirectUrl);
    } catch (error) {
      console.error("Google Auth Redirect Error:", error);
      res.status(500).json({ message: "Failed to redirect to Google Login" });
    }
  },

  async callback(req, res) {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ message: "Authorization code is required" });
    }

    try {
      const { user, token } = await GoogleAuthService.googleCallback(code);
      const frontendUrl = `http://localhost:5173/dashboard?token=${token}`;
      res.redirect(frontendUrl);
    } catch (error) {
      console.error("Google Auth Callback Error:", error);
      res.status(500).json({ message: "Failed to authenticate with Google" });
    }
  },
};

module.exports = GoogleAuthController;
