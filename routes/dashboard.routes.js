const express = require("express");
const DashboardController = require("../controllers/dashboard.controller");
const authenticate = require("../middleware/authMiddleware");
const sessionMiddleware = require("../middleware/sessionMiddleware");

const router = express.Router();

router.get("/", authenticate, DashboardController.getDashboardData);
router.post('/sendTransactionReport',authenticate, DashboardController.sendTransactionReport);

module.exports = router;