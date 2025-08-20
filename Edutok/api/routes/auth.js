const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const sendEmail = require('../utils/sendEmail');
const authMiddleware = require('../middleware/auth');

// -------------------- SIGNUP --------------------
router.post('/signup', async (req, res) => {
  const { name, email, password, preferences } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already in use' });

    const password_hash = await bcrypt.hash(password, 12);

    const otp = crypto.randomInt(100000, 999999).toString();
    const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 min

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
    console.error(err);
    res.status(500).json({ error: 'Signup failed. Please try again.' });
  }
});

// -------------------- VERIFY OTP --------------------
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || user.is_verified) {
      return res.status(400).json({ error: 'Invalid request' });
    }

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
    console.error(err);
    res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
});

// -------------------- RESEND OTP --------------------
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    if (user.is_verified) {
      return res.status(400).json({ error: 'Account already verified' });
    }

    // Generate a new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp_code = otp;
    user.otp_expires_at = expiresAt;
    await user.save();

    await sendEmail(
      user.email,
      `Your new EduTok verification code is: ${otp}`
    );

    res.json({ message: 'A new code has been sent to your email' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to resend code' });
  }
});

// -------------------- LOGIN --------------------
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

    const expiresInEnv = process.env.JWT_EXPIRES_IN;
    const expiresIn = /^\d+$/.test(expiresInEnv) ? parseInt(expiresInEnv) : (expiresInEnv || '7d');

    const token = jwt.sign(
      { user_id: user._id, role: user.role, is_admin: user.is_admin },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_admin: user.is_admin
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// -------------------- GET PROFILE --------------------
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password_hash -otp_code -otp_expires_at");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("Get profile error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// -------------------- UPDATE PROFILE --------------------
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, bio, preferences } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, bio, preferences },
      { new: true, runValidators: true }
    ).select("-password_hash -otp_code -otp_expires_at");

    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    res.json(updatedUser);
  } catch (err) {
    console.error("Update profile error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// -------------------- FORGOT PASSWORD --------------------
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const otp = crypto.randomInt(100000, 999999).toString();
    const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    user.otp_code = otp;
    user.otp_expires_at = otp_expires_at;
    await user.save();

    await sendEmail(email, `Your EduTok password reset code: ${otp}`);

    res.json({ message: 'Reset code sent to your email' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Forgot password failed. Please try again.' });
  }
});

// -------------------- RESET PASSWORD --------------------
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });

    if (user.otp_code !== otp || Date.now() > new Date(user.otp_expires_at)) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    user.password_hash = await bcrypt.hash(newPassword, 12);
    user.otp_code = undefined;
    user.otp_expires_at = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Reset password failed. Please try again.' });
  }
});

// -------------------- CURRENT USER (/me) --------------------
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password_hash -otp_code -otp_expires_at');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error("Get me error:", err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
