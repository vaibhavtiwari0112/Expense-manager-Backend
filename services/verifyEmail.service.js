const path = require("path");
const ejs = require("ejs");
const sendGrid = require("@sendgrid/mail");
const fs = require("fs");
require("jspdf-autotable");
const prisma = require("../prismaClient");
const { default: jsPDF } = require("jspdf");

sendGrid.setApiKey(process.env.SENDGRID_API_KEY);

const otpStorage = new Map();

exports.sendVerificationEmail = async (email) => {
  try {
    if (!email) {
      throw new Error("Email address is required to send a verification email");
    }
    console.log(`Verification email`, email);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStorage.set(email, otp);

    const emailTemplatePath = path.join(
      __dirname,
      "../templates/verificationEmail.ejs"
    );
    const emailTemplate = await ejs.renderFile(emailTemplatePath, {
      email,
      otp,
    });

    console.log("Rendered Email Template:", emailTemplate);

    const mailOptions = {
      to: email,
      from: "vaibhavtiwari0128@gmail.com",
      subject: "Verify Your Email",
      html: emailTemplate,
    };

    console.log("Mail Options:", mailOptions);

    await sendGrid.send(mailOptions);
    console.log(`Verification email sent to ${email}`);

    return { email };
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Unable to send verification email");
  }
};

exports.verifyOTP = async (email, otp) => {
  const storedOtp = otpStorage.get(email);

  if (storedOtp === otp) {
    otpStorage.delete(email);
    return true;
  }
  return false;
};

exports.resendOTP = async (email) => {
  if (!email) throw new Error("Email address is required to resend OTP");

  if (!otpStorage.has(email)) {
    console.log("OTP not found for email:", email);
    return await this.sendVerificationEmail(email);
  }

  const { otp } = otpStorage.get(email);
  console.log("Resending existing OTP:", otp);

  return await this.sendVerificationEmail(email);
};

exports.sendReport = async (userId) => {
  try {
    if (!userId) {
      throw new Error("Email and user ID are required to send the report.");
    }

    const userIdInt = parseInt(userId, 10);

    const user = await prisma.user.findUnique({
      where: { id: userIdInt },
      select: { email: true },
    });

    if (!user) {
      throw new Error("User not found.");
    }

    const email = user.email;

    const transactions = await prisma.transaction.findMany({
      where: { userId: userIdInt },
    });

    if (transactions.length === 0) {
      throw new Error("No transactions found for the user.");
    }

    const currentDate = new Date().toLocaleDateString();

    const emailTemplatePath = path.join(
      __dirname,
      "templates",
      "../../templates/transactionReportEmail.ejs"
    );
    const emailTemplate = fs.readFileSync(emailTemplatePath, "utf-8");

    const htmlContent = ejs.render(emailTemplate, {
      transactions,
      currentDate,
    });

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Expense Tracker - Transaction Report", 14, 20);

    doc.setFontSize(12);
    doc.text(`Report Date: ${currentDate}`, 14, 30);

    const tableColumn = ["Date", "Description", "Amount (Rs.)", "Type"];
    const tableRows = transactions.map((transaction) => [
      new Date(transaction.createdAt).toLocaleDateString(),
      transaction.description || "No description",
      `Rs.${transaction.amount}`,
      transaction.type,
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: "grid",
      headStyles: { fillColor: [75, 0, 130], textColor: [255, 255, 255] },
    });

    const pdfBuffer = doc.output("arraybuffer");

    const mailOptions = {
      to: email,
      from: "vaibhavtiwari0128@gmail.com",
      subject: "Your Transaction Report",
      html: htmlContent,
      attachments: [
        {
          content: Buffer.from(pdfBuffer).toString("base64"),
          filename: `Transaction_Report_${currentDate.replace(/\//g, "-")}.pdf`,
          type: "application/pdf",
          disposition: "attachment",
        },
      ],
    };

    await sendGrid.send(mailOptions);
    console.log(`Transaction report sent to ${email}`);

    return { message: "Transaction report sent successfully!" };
  } catch (error) {
    console.error("Error sending transaction report:", error);
    throw new Error("Unable to send transaction report.");
  }
};
