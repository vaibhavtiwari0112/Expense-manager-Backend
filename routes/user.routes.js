const express = require("express");
const UserController = require("../controllers/user.controller");
const authenticate = require("../middleware/authMiddleware.js");

const router = express.Router();

router.get("/:id", authenticate, UserController.getUser);
router.put("/:id", authenticate, UserController.updateUser);

module.exports = router;
