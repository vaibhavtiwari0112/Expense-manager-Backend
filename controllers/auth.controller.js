const AuthService = require("../services/auth.service");

const AuthController = {
  async register(req, res) {
    try {
      console.log("Register request body:", req.body); // Log the incoming request body
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
      console.log("Login request body:", req.body); // Log the incoming request body
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
};

module.exports = AuthController;
