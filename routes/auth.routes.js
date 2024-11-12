const express = require("express");
const AuthController = require("../controllers/auth.controller");
const { isAuthenticated } = require("../middleware/authMiddleware"); 

const router = express.Router();


router.post("/signup", AuthController.register);
router.post("/login", AuthController.login);


module.exports = router;
