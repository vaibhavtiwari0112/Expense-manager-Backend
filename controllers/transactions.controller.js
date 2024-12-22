const TransactionsService = require("../services/transactions.service");

const TransactionsController = {
  async createTransaction(req, res) {
    const userId = req.user.id;
    const { amount, description, currency, type } = req.body;

    try {
      const transaction = await TransactionsService.createTransaction(
        userId,
        amount,
        description,
        currency,
        type
      );
      res.status(201).json({
        message: "Transaction created successfully",
        data: transaction,
      });
    } catch (error) {
      res.status(500).json({
        message: "An error occurred while creating the transaction",
        error: error.message,
      });
    }
  },

  async getTransactions(req, res) {
    const userId = req.user.id;
    const { page = 0, itemsPerPage = 5, type } = req.query;

    try {
      const transactions = await TransactionsService.getTransactions(
        userId,
        parseInt(page),
        parseInt(itemsPerPage),
        type
      );
      res.status(200).json({
        message: "Transactions retrieved successfully",
        data: transactions,
      });
    } catch (error) {
      res.status(500).json({
        message: "An error occurred while retrieving transactions",
        error: error.message,
      });
    }
  },
};

module.exports = TransactionsController;
