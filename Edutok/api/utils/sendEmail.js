const nodemailer = require('nodemailer');

const sendEmail = async (to, message, subject = 'EduTok Notification') => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"EduTok" <${process.env.EMAIL_USER}>`,
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

// ✅  Add to .env
// EMAIL_USER=youremail@gmail.com
// EMAIL_PASS=your_app_password