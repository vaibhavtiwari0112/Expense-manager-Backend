const prisma = require("./prismaClient");
const ReportService = require("./services/verifyEmail.service");
const cron = require("node-cron");

const MonthlyReportJob = {
  async sendMonthlyReports() {
    try {
      const currentDate = new Date();

      const users = await prisma.user.findMany({
        where: {
          salaryDate: {
            equals: currentDate.toISOString().split("T")[0],
          },
        },
        select: { id: true, email: true },
      });

      if (users.length === 0) {
        console.log("No users scheduled for a report today.");
        return;
      }

      console.log(`Sending reports to ${users.length} user(s)...`);

      // Send reports to each user
      for (const user of users) {
        try {
          await ReportService.sendReport(user.id);
          console.log(`Report sent successfully to user ID ${user.id}`);
        } catch (err) {
          console.error(
            `Failed to send report to user ID ${user.id}:`,
            err.message
          );
        }
      }
    } catch (error) {
      console.error("Error executing monthly report job:", error);
    }
  },
};

cron.schedule("0 0 * * *", async () => {
  console.log("Running Monthly Report Job...");
  await MonthlyReportJob.sendMonthlyReports();
});

module.exports = MonthlyReportJob;