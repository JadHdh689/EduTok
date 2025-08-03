const nodemailer = require('nodemailer');

const sendEmail = async (to, message) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,     // your Gmail address
      pass: process.env.EMAIL_PASS      // app-specific password (not your Gmail password)
    }
  });

  await transporter.sendMail({
    from: `"EduTok" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'EduTok Email Verification',
    text: message
  });
};

module.exports = sendEmail;

// ✅  Add to .env
// EMAIL_USER=youremail@gmail.com
// EMAIL_PASS=your_app_password