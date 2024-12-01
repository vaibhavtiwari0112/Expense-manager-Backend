const path = require('path');
const ejs = require('ejs');
const sendGrid = require('@sendgrid/mail');

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

    const emailTemplatePath = path.join(__dirname, '../templates/verificationEmail.ejs');
    const emailTemplate = await ejs.renderFile(emailTemplatePath, { email, otp });

    console.log("Rendered Email Template:", emailTemplate);

    const mailOptions = {
      to: email, 
      from: 'vaibhavtiwari0128@gmail.com',
      subject: 'Verify Your Email',
      html: emailTemplate,
    };

    console.log("Mail Options:", mailOptions);

    await sendGrid.send(mailOptions);
    console.log(`Verification email sent to ${email}`);

    return { email };
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Unable to send verification email',error);
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
    console.log('OTP not found for email:', email);
    return await this.sendVerificationEmail(email); 
  }

  const { otp } = otpStorage.get(email);
  console.log('Resending existing OTP:', otp);

  return await this.sendVerificationEmail(email);
};
