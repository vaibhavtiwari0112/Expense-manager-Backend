const prisma = require("../prismaClient");

const TransactionsService = {
  async createTransaction(
    userId,
    amount,
    description,
    currency = "INR",
    type,
    createdAt
  ) {
    try {
      const createdTransaction = await prisma.$transaction(async (prisma) => {
        // Step 1: Create the transaction
        const transaction = await prisma.transaction.create({
          data: {
            userId,
            amount,
            description,
            currency,
            type,
            createdAt,
          },
        });

        // Step 2: Conditionally create records in Savings, Expenses, or Investments table
        if (type === "expense") {
          await prisma.expenses.create({
            data: {
              transactionId: transaction.id,
              amount,
              description,
              currency,
              createdAt,
            },
          });
        } else if (type === "investment") {
          await prisma.investments.create({
            data: {
              transactionId: transaction.id,
              amount,
              description,
              currency,
              createdAt,
            },
          });
        }

        return transaction;
      });

      return createdTransaction;
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }
  },

  async getTransactions(userId, page = 0, itemsPerPage = 10, type = "") {
    try {
      if (isNaN(userId)) {
        console.error("Invalid userId:", userId);
        return [];
      }

      let transactions = [];

      // Determine the type and fetch from the corresponding table
      if (type === "expenses") {
        transactions = await prisma.expenses.findMany({
          where: { transaction: { userId } },
          skip: page * itemsPerPage,
          take: itemsPerPage,
          include: { transaction: true }, // Include the associated transaction details
        });
      } else if (type === "investments") {
        transactions = await prisma.investments.findMany({
          where: { transaction: { userId } },
          skip: page * itemsPerPage,
          take: itemsPerPage,
          include: { transaction: true }, // Include the associated transaction details
        });
      } else if (type === "savings") {
        transactions = await prisma.savings.findMany({
          where: { userId },
          skip: page * itemsPerPage,
          take: itemsPerPage,
          include: { transaction: true }, // Include the associated transaction details
        });
      } else {
        // Default: Fetch from the main transactions table
        transactions = await prisma.transaction.findMany({
          where: { userId },
          skip: page * itemsPerPage,
          take: itemsPerPage,
        });
      }

      return transactions;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  },
};

module.exports = TransactionsService;
