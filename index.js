const express = require("express");
const authRoutes = require("./routes/auth.routes");
const savingsRoutes = require("./routes/savings.routes");
const transactionRoutes = require("./routes/transactions.routes");
const userRoutes = require("./routes/user.routes");
const { configDotenv } = require("dotenv");
const cors = require("cors");
const multer = require("multer");

const app = express();

configDotenv();

const upload = multer({
  limits: { fileSize: 2 * 1024 * 1024 },
}).single("profileImage");

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Routes
app.use("/auth", authRoutes);
app.use("/savings", savingsRoutes);
app.use("/transactions", transactionRoutes);

// User routes: include the file upload middleware for routes handling file uploads
app.put("/user/:id", upload, userRoutes); // Apply 'upload' middleware to update user route

app.use("/user", userRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error.message);
});
