const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/user');
const sendEmail = require('../utils/sendEmail');

// Signup Route
router.post('/signup', async (req, res) => {
  const { name, email, password, preferences } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already in use' });

    const password_hash = await bcrypt.hash(password, 12);
    const otp = crypto.randomInt(100000, 999999).toString();
    const otp_expires_at = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    const user = await User.create({
      name,
      email,
      password_hash,
      preferences,
      otp_code: otp,
      otp_expires_at,
    });

    await sendEmail(email, `Your EduTok verification code is: ${otp}`);
    res.status(201).json({ message: 'OTP sent to email' });

  } catch (err) {
    res.status(500).json({ error: 'Signup failed' });
  }
});

// OTP Verification Route
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || user.is_verified) return res.status(400).json({ error: 'Invalid request' });

    const now = new Date();
    if (user.otp_code !== otp || now > user.otp_expires_at) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    user.is_verified = true;
    user.otp_code = undefined;
    user.otp_expires_at = undefined;
    await user.save();

    res.status(200).json({ message: 'Account verified successfully' });

  } catch (err) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

module.exports = router;
