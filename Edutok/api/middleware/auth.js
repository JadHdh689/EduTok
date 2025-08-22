// middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // ✅ Check for Authorization header
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Attach user to request
    req.user = { id: decoded.id };

    next();
  } catch (err) {
    console.error('JWT verification failed:', err);
    return res.status(401).json({ error: 'Invalid token' });
  }
};
