const SavingsService = require("../services/savings.service");
const InvestmentsService = require("../services/investments.service");
const ExpensesService = require("../services/transactions.service");
const verificationService = require("../services/verifyEmail.service");

const DashboardController = {
  async getDashboardData(req, res) {
    const userId = req.user.id;

    try {
      const savings = await SavingsService.getSavings(userId);
      const investments = await InvestmentsService.getInvestments(userId);
      const expenses = await ExpensesService.getExpenses(userId);

      res.status(200).json({
        message: "Dashboard data retrieved successfully",
        data: {
          savings,
          investments,
          expenses,
        },
      });
    } catch (error) {
      res.status(500).json({
        message: "An error occurred while retrieving dashboard data",
        error: error.message,
      });
    }
  },

  async sendTransactionReport(req, res) {
    const { userId } = req.body;
    try {
      if (userId) {
        const result = await verificationService.sendReport(userId);
        res
          .status(200)
          .json({ success: true, message: "Report email sent", result });
      }
    } catch (error) {
      console.error("Error sending Report email:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send Report email",
        error: error.message,
      });
    }
  },
};

module.exports = DashboardController;
