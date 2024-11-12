const prisma = require("../prismaClient");

const TransactionsService = {
  async createTransaction(userId, amount, description, currency, type) {
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        amount,
        description,
        currency,
        type, 
      },
    });
    return transaction;
  },

  async getTransactions(userId, page, itemsPerPage) {
    try {
      
      if (isNaN(userId)) {
        console.error("Invalid userId:", userId);
        return [];
      }  
      const transactions = await prisma.transaction.findMany({
        where: { userId }, 
        skip: page * itemsPerPage,
        take: itemsPerPage,   
      });
      return transactions;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  }
  
  
  }
module.exports = TransactionsService;
