const nodemailer = require('nodemailer');

const sendEmail = async (to, message, subject = 'EduTok Notification') => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "elhariri2023@gmail.com",
        pass: "lttnqczgtkdgidhx"
      },
      logger: true,
      debug: true
    });

    console.log("EMAIL_USER:", "elhariri2023@gmail.com");

    await transporter.sendMail({
      from: `"EduTok" <${"elhariri2023@gmail.com"}>`,
      to,
      subject,
      text: message
    });
  } catch (err) {
    console.error('Email send error:', err);
    throw new Error('Failed to send email');
  }
};

module.exports = sendEmail;