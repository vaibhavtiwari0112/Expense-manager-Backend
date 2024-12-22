const prisma = require("../prismaClient");

const SalaryUpdateJob = {
  async updateSalaries() {
    try {
      // Get the current date
      const currentDate = new Date();

      // Fetch all users whose salaryDate has passed (salaryDate is earlier than today)
      const users = await prisma.user.findMany({
        where: {
          salaryDate: {
            lte: currentDate, // Salary date is today or earlier (to handle cases when the job runs late)
          },
        },
      });

      for (const user of users) {
        // Get the day of the month for the user's current salary date
        const salaryDay = new Date(user.salaryDate).getDate();

        // Calculate the next month's salary date (same day as current salary date)
        const nextSalaryDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          salaryDay
        );

        // Handle case where the salary day is the last day of the month (e.g., 31st)
        const daysInNextMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 2,
          0
        ).getDate();
        if (salaryDay > daysInNextMonth) {
          nextSalaryDate.setDate(daysInNextMonth); // Set to the last day of next month
        }

        // Calculate total expenses and investments for the user for the current month
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

        const totalExpenses = await prisma.expenses.aggregate({
          _sum: { amount: true },
          where: {
            transaction: {
              userId: user.id,
              createdAt: {
                gte: firstDayOfMonth,
                lte: lastDayOfMonth,
              },
            },
          },
        });

        const totalInvestments = await prisma.investments.aggregate({
          _sum: { amount: true },
          where: {
            transaction: {
              userId: user.id,
              createdAt: {
                gte: firstDayOfMonth,
                lte: lastDayOfMonth,
              },
            },
          },
        });

        const totalExpensesAmount = totalExpenses._sum.amount || 0;
        const totalInvestmentsAmount = totalInvestments._sum.amount || 0;

        // Calculate the remaining salary
        const remainingSalary =
          user.salary - (totalExpensesAmount + totalInvestmentsAmount);

        // Update the user's salary and set the next salary date
        await prisma.user.update({
          where: { id: user.id },
          data: {
            salary: remainingSalary,
            salaryDate: nextSalaryDate, // Update salary date to next month
          },
        });

        console.log(
          `Salary updated for user ${
            user.id
          }: Remaining Salary = ${remainingSalary}, Next Salary Date = ${nextSalaryDate.toISOString()}`
        );
      }
    } catch (error) {
      console.error("Error updating salaries:", error);
    }
  },
};

module.exports = SalaryUpdateJob;
