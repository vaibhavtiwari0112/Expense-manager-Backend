const express = require("express");
const authRoutes = require("./routes/auth.routes");
const savingsRoutes = require("./routes/savings.routes");
const transactionRoutes = require("./routes/transactions.routes");
const userRoutes = require("./routes/user.routes");
const { configDotenv } = require("dotenv");
const cors = require("cors");
const multer = require("multer");
const MonthlyReportJob = require("./monthlyReport");
const SalaryUpdateJob = require("./services/salaryUpdateJob.service.js");

const app = express();

configDotenv();

const upload = multer({
  limits: { fileSize: 2 * 1024 * 1024 },
}).single("profileImage");

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

app.use("/auth", authRoutes);
app.use("/savings", savingsRoutes);
app.use("/transactions", transactionRoutes);
app.use("/user", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

(async () => {
  try {
    await SalaryUpdateJob.updateSalaries();
    await MonthlyReportJob.sendMonthlyReports();
  } catch (error) {
    console.error("Error running jobs:", error);
  }
})();

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error.message);
});
