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

const jwt = require('jsonwebtoken');

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    if (!user.is_verified) {
      return res.status(403).json({ error: 'Please verify your email before logging in' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign(
      {
        user_id: user._id,
        role: user.role,
        is_admin: user.is_admin
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        is_admin: user.is_admin
      }
    });

  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Edit Profile route
router.put('/profile', authMiddleware, async (req, res) => {
  const { name, bio, preferences } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, bio, preferences },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Forgot Password Route
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Email not found' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpire = Date.now() + 10 * 60 * 1000; // 10 min

    user.reset_password_token = resetTokenHash;
    user.reset_password_expires = resetTokenExpire;
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${email}`;
    await sendEmail(email, `Reset your EduTok password using this link: ${resetLink}`);

    res.status(200).json({ message: 'Password reset link sent to your email' });
  } catch (err) {
    res.status(500).json({ error: 'Could not send reset link' });
  }
});

// Reset Password Route
router.post('/reset-password', async (req, res) => {
  const { email, token, newPassword } = req.body;

  try {
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      email,
      reset_password_token: resetTokenHash,
      reset_password_expires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ error: 'Invalid or expired reset token' });

    user.password_hash = await bcrypt.hash(newPassword, 12);
    user.reset_password_token = undefined;
    user.reset_password_expires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Password reset failed' });
  }
});


module.exports = router;