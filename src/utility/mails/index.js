const nodemailer = require("nodemailer");
const constants = require("../../constants");

// GO AND LEARN ON SWITCH STATEMENT
const sendEmail = async (option, type) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  let subject;

  if (constants.mailTypes.passwordReset === type) {
    subject = option.subject;
  } else if (constants.mailTypes.verifyEmail === type) {
    subject = option.subject;
  } else if (constants.mailTypes.setPassword === type) {
    subject = option.subject;
  }

  const emailOptions = {
    from: "TECHWARE SERVICES<mabel@techware.ng>",
    to: option.to,
    subject,
  };

  if (!option.message) {
    emailOptions.text = option.message;
  } else {
    emailOptions.html = option.message;
  }

  try {
    const info = await transporter.sendMail(emailOptions);
    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Failed to send email: ", error);
    throw error;
  }
};

module.exports = sendEmail;
