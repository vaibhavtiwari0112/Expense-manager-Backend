const prisma = require("../prismaClient");

const SalaryUpdateJob = {
  async updateSalaries() {
    try {
      const currentDate = new Date();

      // Fetch users whose salary date is on or before the current date
      const users = await prisma.user.findMany({
        where: {
          salaryDate: {
            lte: currentDate,
          },
        },
      });

      for (const user of users) {
        const salaryDay = new Date(user.salaryDate).getDate();
        const nextSalaryDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          salaryDay
        );

        const daysInNextMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 2,
          0
        ).getDate();

        if (salaryDay > daysInNextMonth) {
          nextSalaryDate.setDate(daysInNextMonth);
        }

        const firstDayOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );
        const lastDayOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0
        );

        const totalExpenses = await prisma.transaction.aggregate({
          _sum: { amount: true },
          where: {
            userId: user.id,
            type: "expense", // Filter for expenses
            createdAt: {
              gte: firstDayOfMonth,
              lte: lastDayOfMonth,
            },
          },
        });

        // Calculate total investments for the current month
        const totalInvestments = await prisma.transaction.aggregate({
          _sum: { amount: true },
          where: {
            userId: user.id,
            type: "investment", // Filter for investments
            createdAt: {
              gte: firstDayOfMonth,
              lte: lastDayOfMonth,
            },
          },
        });

        const totalExpensesAmount = totalExpenses._sum.amount || 0;
        const totalInvestmentsAmount = totalInvestments._sum.amount || 0;

        // Calculate remaining salary
        const remainingSalary = Math.max(
          user.salary - (totalExpensesAmount + totalInvestmentsAmount),
          0
        );

        // Create a transaction entry for the savings
        const savingsTransaction = await prisma.transaction.create({
          data: {
            userId: user.id,
            amount: remainingSalary,
            type: "saving", // Type for savings
            description: "Salary savings for the month",
            currency: "INR",
            createdAt: new Date(),
          },
        });

        console.log("Savings transaction created:", savingsTransaction);

        // Create a savings entry for the user
        const savingsEntry = await prisma.savings.create({
          data: {
            amount: remainingSalary,
            description: "Remaining salary for the month",
            currency: "INR",
            type: "saving",
            createdAt: new Date(),
            user: {
              connect: { id: user.id }, // Ensure the savings is linked to the correct user
            },
            transaction: {
              connect: { id: savingsTransaction.id }, // Link the created transaction to savings entry
            },
          },
        });

        console.log("Savings updated:", savingsEntry);

        // Update the user's salary date to the next month
        await prisma.user.update({
          where: { id: user.id },
          data: {
            salaryDate: nextSalaryDate,
          },
        });

        console.log(
          `Salary updated for user ${
            user.id
          }: Remaining Salary = ${remainingSalary}, Next Salary Date = ${nextSalaryDate.toISOString()}`
        );
      }
    } catch (error) {
      console.error("Error updating salaries:", error.message, error.stack);
    }
  },
};

module.exports = SalaryUpdateJob;
