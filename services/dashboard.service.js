
const prisma = require("../prismaClient"); 

const DashboardService = {
  async getDashboardData(userId) {
    const expenses = await prisma.expense.findMany({ where: { userId } });
    const savings = await prisma.saving.findMany({ where: { userId } });
    const investments = await prisma.investment.findMany({ where: { userId } });

    return { expenses, savings, investments };
  },
};

module.exports = DashboardService;
